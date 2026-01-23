import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  category: string;
  timestamp: string;
  time_of_day: string;
  day_of_week: string;
}

interface PatternResult {
  title: string;
  description: string;
  category: string;
  confidence: "strong" | "emerging" | "weak";
  occurrences: number;
  time_range: string;
  average_amount: number;
  trend: "increasing" | "stable" | "decreasing";
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

    console.log(`Detecting patterns for user: ${user.id}`);

    // Fetch user's transactions from the last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: transactions, error: txnError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("timestamp", ninetyDaysAgo.toISOString())
      .order("timestamp", { ascending: false });

    if (txnError) {
      console.error("Error fetching transactions:", txnError);
      throw txnError;
    }

    if (!transactions || transactions.length === 0) {
      return new Response(JSON.stringify({ patterns: [], message: "No transactions found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Analyze patterns
    const patterns = analyzePatterns(transactions as Transaction[]);

    // Store detected patterns
    for (const pattern of patterns) {
      const { error: insertError } = await supabase
        .from("spending_patterns")
        .upsert({
          user_id: user.id,
          title: pattern.title,
          description: pattern.description,
          category: pattern.category,
          confidence: pattern.confidence,
          occurrences: pattern.occurrences,
          time_range: pattern.time_range,
          average_amount: pattern.average_amount,
          trend: pattern.trend,
          last_updated: new Date().toISOString(),
        }, {
          onConflict: "user_id,title",
          ignoreDuplicates: false,
        });

      if (insertError) {
        console.error("Error inserting pattern:", insertError);
      }
    }

    console.log(`Detected ${patterns.length} patterns for user ${user.id}`);

    return new Response(JSON.stringify({ patterns, count: patterns.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Pattern detection error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function analyzePatterns(transactions: Transaction[]): PatternResult[] {
  const patterns: PatternResult[] = [];

  // Group by category
  const byCategory = groupBy(transactions, "category");
  
  // Analyze time-based patterns for each category
  for (const [category, txns] of Object.entries(byCategory)) {
    // Late night spending pattern
    const lateNightTxns = txns.filter(t => t.time_of_day === "late_night" || t.time_of_day === "evening");
    if (lateNightTxns.length >= 3) {
      const avgAmount = average(lateNightTxns.map(t => t.amount));
      patterns.push({
        title: `Late-night ${category}`,
        description: `You tend to spend on ${category} during late evenings. This might be linked to unwinding after work or late-night cravings.`,
        category,
        confidence: getConfidence(lateNightTxns.length),
        occurrences: lateNightTxns.length,
        time_range: "9 PM - 12 AM",
        average_amount: avgAmount,
        trend: calculateTrend(lateNightTxns),
      });
    }

    // Weekend pattern
    const weekendTxns = txns.filter(t => t.day_of_week === "saturday" || t.day_of_week === "sunday");
    if (weekendTxns.length >= 3) {
      const avgAmount = average(weekendTxns.map(t => t.amount));
      patterns.push({
        title: `Weekend ${category}`,
        description: `Your ${category} spending peaks on weekends. This might reflect social activities or personal time.`,
        category,
        confidence: getConfidence(weekendTxns.length),
        occurrences: weekendTxns.length,
        time_range: "Sat-Sun",
        average_amount: avgAmount,
        trend: calculateTrend(weekendTxns),
      });
    }

    // Morning routine pattern
    const morningTxns = txns.filter(t => t.time_of_day === "morning");
    if (morningTxns.length >= 5) {
      const avgAmount = average(morningTxns.map(t => t.amount));
      patterns.push({
        title: `Morning ${category} routine`,
        description: `You have a consistent morning ${category} habit. This seems to be part of your daily routine.`,
        category,
        confidence: getConfidence(morningTxns.length),
        occurrences: morningTxns.length,
        time_range: "6 AM - 12 PM",
        average_amount: avgAmount,
        trend: calculateTrend(morningTxns),
      });
    }
  }

  // Analyze merchant patterns
  const byMerchant = groupBy(transactions, "merchant");
  for (const [merchant, txns] of Object.entries(byMerchant)) {
    if (txns.length >= 4) {
      const avgAmount = average(txns.map(t => t.amount));
      patterns.push({
        title: `Regular at ${merchant}`,
        description: `You frequently visit ${merchant}. This has become one of your regular spots.`,
        category: txns[0].category,
        confidence: getConfidence(txns.length),
        occurrences: txns.length,
        time_range: "Last 90 days",
        average_amount: avgAmount,
        trend: calculateTrend(txns),
      });
    }
  }

  // Sort by confidence and occurrences
  return patterns.sort((a, b) => {
    const confOrder = { strong: 0, emerging: 1, weak: 2 };
    if (confOrder[a.confidence] !== confOrder[b.confidence]) {
      return confOrder[a.confidence] - confOrder[b.confidence];
    }
    return b.occurrences - a.occurrences;
  });
}

function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key]);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function getConfidence(occurrences: number): "strong" | "emerging" | "weak" {
  if (occurrences >= 6) return "strong";
  if (occurrences >= 3) return "emerging";
  return "weak";
}

function calculateTrend(transactions: Transaction[]): "increasing" | "stable" | "decreasing" {
  if (transactions.length < 3) return "stable";
  
  const sorted = [...transactions].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
  
  const firstAvg = average(firstHalf.map(t => t.amount));
  const secondAvg = average(secondHalf.map(t => t.amount));
  
  const change = (secondAvg - firstAvg) / firstAvg;
  
  if (change > 0.15) return "increasing";
  if (change < -0.15) return "decreasing";
  return "stable";
}
