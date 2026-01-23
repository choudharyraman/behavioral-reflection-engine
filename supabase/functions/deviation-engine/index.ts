import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Baseline {
  category: string;
  time_period: string;
  baseline_amount: number;
  baseline_count: number;
}

interface DeviationEvent {
  category: string;
  deviation_percentage: number;
  baseline_amount: number;
  current_amount: number;
  occurrence_count: number;
  time_period: string;
  narrative: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Running deviation engine for user: ${user.id}`);

    // Check user's notification preferences
    const { data: profile } = await supabase
      .from("profiles")
      .select("notification_preferences")
      .eq("user_id", user.id)
      .single();

    const prefs = profile?.notification_preferences || {
      weekly_digest: true,
      soft_nudges: false,
      sensitivity: "medium",
      muted_categories: [],
    };

    // Fetch transactions from current week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const { data: currentWeekTxns } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("timestamp", weekStart.toISOString());

    // Fetch baselines
    const { data: baselines } = await supabase
      .from("spending_baselines")
      .select("*")
      .eq("user_id", user.id);

    if (!baselines || baselines.length === 0) {
      // Calculate and store new baselines
      await calculateBaselines(supabase, user.id);
      return new Response(JSON.stringify({ 
        message: "Baselines calculated",
        deviations: [] 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for deviations
    const deviations: DeviationEvent[] = [];
    const categories = [...new Set(currentWeekTxns?.map(t => t.category) || [])];

    for (const category of categories) {
      if (prefs.muted_categories?.includes(category)) continue;

      const categoryTxns = currentWeekTxns?.filter(t => t.category === category) || [];
      const currentAmount = categoryTxns.reduce((sum, t) => sum + Number(t.amount), 0);
      const currentCount = categoryTxns.length;

      const baseline = baselines.find(b => b.category === category && b.time_period === "weekly");
      if (!baseline) continue;

      // Check if deviation exceeds threshold (50% for medium sensitivity)
      const thresholds = { low: 0.75, medium: 0.50, high: 0.25 };
      const threshold = thresholds[prefs.sensitivity as keyof typeof thresholds] || 0.50;

      const deviationPct = (currentAmount - baseline.baseline_amount) / baseline.baseline_amount;

      if (deviationPct >= threshold && currentCount >= 3) {
        // Check cooldown
        const { data: recentDeviation } = await supabase
          .from("deviation_events")
          .select("*")
          .eq("user_id", user.id)
          .eq("category", category)
          .gte("cooldown_until", new Date().toISOString())
          .limit(1);

        if (recentDeviation && recentDeviation.length > 0) {
          console.log(`Skipping ${category} deviation - in cooldown period`);
          continue;
        }

        const narrative = generateNarrative(category, deviationPct, currentCount, baseline);
        
        deviations.push({
          category,
          deviation_percentage: Math.round(deviationPct * 100),
          baseline_amount: baseline.baseline_amount,
          current_amount: currentAmount,
          occurrence_count: currentCount,
          time_period: "weekly",
          narrative,
        });
      }
    }

    // Store deviations and create notifications
    for (const deviation of deviations) {
      const { data: deviationRecord } = await supabase
        .from("deviation_events")
        .insert({
          user_id: user.id,
          ...deviation,
          cooldown_until: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 week cooldown
        })
        .select()
        .single();

      if (prefs.soft_nudges) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          type: "soft_nudge",
          title: "Noticed a change in your usual pattern",
          body: deviation.narrative,
          data: { deviation_id: deviationRecord?.id, category: deviation.category },
        });
      }
    }

    // Weekly digest logic
    if (prefs.weekly_digest && isMonday()) {
      await generateWeeklyDigest(supabase, user.id, deviations);
    }

    console.log(`Found ${deviations.length} deviations for user ${user.id}`);

    return new Response(JSON.stringify({ 
      deviations,
      count: deviations.length 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Deviation engine error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function calculateBaselines(supabase: any, userId: string) {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("timestamp", threeMonthsAgo.toISOString());

  if (!transactions || transactions.length === 0) return;

  const byCategory: Record<string, number[]> = {};
  
  transactions.forEach((t: any) => {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(Number(t.amount));
  });

  for (const [category, amounts] of Object.entries(byCategory)) {
    const weeklyAvg = amounts.reduce((a, b) => a + b, 0) / 12; // ~12 weeks in 3 months
    const weeklyCount = Math.round(amounts.length / 12);

    await supabase.from("spending_baselines").upsert({
      user_id: userId,
      category,
      time_period: "weekly",
      baseline_amount: Math.round(weeklyAvg),
      baseline_count: weeklyCount,
      calculated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id,category,time_period",
    });
  }
}

function generateNarrative(
  category: string,
  deviationPct: number,
  count: number,
  baseline: Baseline
): string {
  const pctStr = Math.round(deviationPct * 100);
  const narratives = [
    `This week, your ${category} spending is ${pctStr}% higher than your typical weeks, across ${count} transactions. It might be a one-off, or a new pattern. Want to take a look?`,
    `It looks like your ${category} spending changed this week—${count} transactions, about ${pctStr}% more than usual. Does this feel like a temporary shift?`,
    `We noticed your ${category} activity is higher than your baseline this week. This could reflect a change in routine, or just a busy week.`,
  ];
  
  return narratives[Math.floor(Math.random() * narratives.length)];
}

function isMonday(): boolean {
  return new Date().getDay() === 1;
}

async function generateWeeklyDigest(supabase: any, userId: string, deviations: DeviationEvent[]) {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  let summary = "Your weekly Spending Story is ready. ";
  
  if (deviations.length === 0) {
    summary += "No major pattern changes this week—your spending aligned with your usual rhythm.";
  } else {
    const categories = deviations.map(d => d.category).join(" and ");
    summary += `A couple of patterns changed this week, mainly in ${categories}.`;
  }

  await supabase.from("notifications").insert({
    user_id: userId,
    type: "weekly_digest",
    title: "Your Weekly Spending Story",
    body: summary,
    data: { deviation_count: deviations.length },
  });

  await supabase.from("weekly_checkins").insert({
    user_id: userId,
    week_start: weekStart.toISOString().split("T")[0],
    summary,
    category_changes: deviations.reduce((acc, d) => {
      acc[d.category] = { change: d.deviation_percentage, amount: d.current_amount };
      return acc;
    }, {} as Record<string, any>),
  });
}
