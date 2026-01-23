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
    const { messages, context } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userContext = "";

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;

      if (userId) {
        // Fetch user's spending context
        const [patterns, recentTxns, emotionTags] = await Promise.all([
          supabase.from("spending_patterns").select("*").eq("user_id", userId).limit(5),
          supabase.from("transactions").select("*").eq("user_id", userId).order("timestamp", { ascending: false }).limit(20),
          supabase.from("emotion_tags").select("tag").eq("user_id", userId).limit(10),
        ]);

        if (patterns.data?.length) {
          userContext += `\n\nUser's detected spending patterns:\n${patterns.data.map(p => 
            `- ${p.title}: ${p.description} (${p.confidence} confidence, ₹${p.average_amount} avg)`
          ).join("\n")}`;
        }

        if (recentTxns.data?.length) {
          const totalRecent = recentTxns.data.reduce((sum, t) => sum + Number(t.amount), 0);
          const categories = [...new Set(recentTxns.data.map(t => t.category))];
          userContext += `\n\nRecent activity: ${recentTxns.data.length} transactions totaling ₹${totalRecent} across ${categories.join(", ")}`;
        }

        if (emotionTags.data?.length) {
          const tags = [...new Set(emotionTags.data.map(t => t.tag))];
          userContext += `\n\nUser's emotion tags: ${tags.join(", ")}`;
        }
      }
    }

    console.log("Processing chat request for user:", userId || "anonymous");

    const systemPrompt = `You are a warm, curious behavioral finance assistant for a spending reflection app. Your role is to help users understand their spending patterns and reflect on their relationship with money.

IMPORTANT GUIDELINES:
1. Use tentative, non-judgmental language: "It looks like...", "You tend to...", "This might suggest..."
2. NEVER give financial advice, budgeting tips, or tell users to spend less
3. NEVER use words like "overspending", "bad", "should", "must", or "mistake"
4. Focus on reflection and self-awareness, not optimization
5. Be curious about patterns, not prescriptive about solutions
6. If asked about overspending, reframe as "spending more than usual" and ask about context
7. Acknowledge emotions and life circumstances that affect spending
8. Keep responses concise (2-4 sentences) unless the user asks for more detail

${userContext ? `USER CONTEXT (use this to personalize responses):${userContext}` : ""}

Example good responses:
- "It looks like your food delivery spending peaks on Friday evenings. This might be connected to unwinding after the work week."
- "Your transport costs seem higher in weeks when you work late. Does this reflect a change in your routine?"
- "I notice you tagged several purchases as 'celebration'. It sounds like an eventful month!"

Example bad responses (NEVER DO THIS):
- "You should cut back on ordering food."
- "This is overspending on entertainment."
- "To save money, try cooking at home."`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please check your account." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Chat AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
