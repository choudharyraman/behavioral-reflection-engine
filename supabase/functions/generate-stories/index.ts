import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
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

    console.log(`Generating stories for user: ${user.id}`);

    // Fetch patterns and transactions
    const { data: patterns } = await supabase
      .from("spending_patterns")
      .select("*")
      .eq("user_id", user.id)
      .in("confidence", ["strong", "emerging"])
      .order("occurrences", { ascending: false })
      .limit(5);

    const { data: emotionTags } = await supabase
      .from("emotion_tags")
      .select("*, transactions(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!patterns || patterns.length === 0) {
      return new Response(JSON.stringify({ 
        stories: [],
        message: "Not enough patterns detected yet" 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate AI-powered stories using Lovable AI
    const stories = [];

    for (const pattern of patterns.slice(0, 3)) {
      const emotionContext = emotionTags
        ?.filter(et => et.transactions?.category === pattern.category)
        .map(et => et.tag)
        .slice(0, 5) || [];

      const prompt = `You are a behavioral finance analyst creating a short, reflective "Moment That Matters" story about a spending pattern. 

Pattern details:
- Title: ${pattern.title}
- Description: ${pattern.description}
- Category: ${pattern.category}
- Occurrences: ${pattern.occurrences} times in last 90 days
- Average amount: ₹${pattern.average_amount}
- Trend: ${pattern.trend}
- Time range: ${pattern.time_range}
${emotionContext.length > 0 ? `- Emotion tags on related transactions: ${emotionContext.join(", ")}` : ""}

Write a 2-3 sentence narrative using tentative language ("It looks like...", "You tend to...", "This might suggest..."). 
Focus on reflection, not judgment. Be curious and warm.
Do NOT give advice or mention budgets.`;

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are a warm, non-judgmental behavioral finance analyst who helps people reflect on their spending patterns." },
              { role: "user", content: prompt }
            ],
            max_tokens: 200,
          }),
        });

        if (!aiResponse.ok) {
          console.error("AI response error:", await aiResponse.text());
          continue;
        }

        const aiData = await aiResponse.json();
        const narrative = aiData.choices?.[0]?.message?.content || pattern.description;

        const story = {
          user_id: user.id,
          title: pattern.title,
          narrative: narrative.trim(),
          pattern_type: pattern.category,
          heatmap_data: generateMiniHeatmap(pattern),
          created_at: new Date().toISOString(),
        };

        const { data: insertedStory, error: insertError } = await supabase
          .from("moment_stories")
          .insert(story)
          .select()
          .single();

        if (!insertError && insertedStory) {
          stories.push(insertedStory);
        }
      } catch (aiError) {
        console.error("AI generation error:", aiError);
      }
    }

    console.log(`Generated ${stories.length} stories for user ${user.id}`);

    return new Response(JSON.stringify({ stories, count: stories.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Story generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateMiniHeatmap(pattern: { time_range: string; category: string }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const heatmap: Record<string, number> = {};
  
  days.forEach(day => {
    // Simulate higher activity based on pattern
    const isWeekend = day === "Sat" || day === "Sun";
    const baseValue = Math.random() * 3;
    const modifier = pattern.time_range.includes("Sat") && isWeekend ? 2 : 1;
    heatmap[day] = Math.round(baseValue * modifier);
  });
  
  return heatmap;
}
