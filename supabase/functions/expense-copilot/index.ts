import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.5-flash";

interface CopilotRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  mode?: "chat" | "auto_insights";
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfPrevMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}

async function buildContext(supabase: any, userId: string) {
  const now = new Date();
  const thisMonth = startOfMonth(now);
  const lastMonth = startOfPrevMonth(now);

  const [profile, prefs, patterns, txns, baselines, deviations, emotions] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("copilot_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("spending_patterns")
        .select("*")
        .eq("user_id", userId)
        .order("occurrences", { ascending: false })
        .limit(8),
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .gte("timestamp", lastMonth.toISOString())
        .order("timestamp", { ascending: false })
        .limit(500),
      supabase.from("spending_baselines").select("*").eq("user_id", userId),
      supabase
        .from("deviation_events")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("emotion_tags")
        .select("tag")
        .eq("user_id", userId)
        .limit(30),
    ]);

  const allTxns = txns.data ?? [];
  const thisMonthTxns = allTxns.filter(
    (t: any) => new Date(t.timestamp) >= thisMonth,
  );
  const lastMonthTxns = allTxns.filter((t: any) => {
    const d = new Date(t.timestamp);
    return d >= lastMonth && d < thisMonth;
  });

  const sumBy = (arr: any[], key: string) =>
    arr.reduce((acc: Record<string, number>, t: any) => {
      acc[t[key]] = (acc[t[key]] ?? 0) + Number(t.amount);
      return acc;
    }, {});
  const totalsByCategoryThis = sumBy(thisMonthTxns, "category");
  const totalsByCategoryLast = sumBy(lastMonthTxns, "category");

  const totalThis = thisMonthTxns.reduce(
    (s: number, t: any) => s + Number(t.amount),
    0,
  );
  const totalLast = lastMonthTxns.reduce(
    (s: number, t: any) => s + Number(t.amount),
    0,
  );

  const spikes: string[] = [];
  for (const cat of Object.keys(totalsByCategoryThis)) {
    const cur = totalsByCategoryThis[cat];
    const prev = totalsByCategoryLast[cat] ?? 0;
    if (prev > 0 && cur > prev * 1.25) {
      const pct = Math.round(((cur - prev) / prev) * 100);
      spikes.push(`${cat}: +${pct}% (₹${cur.toFixed(0)} vs ₹${prev.toFixed(0)})`);
    } else if (prev === 0 && cur > 500) {
      spikes.push(`${cat}: new spending of ₹${cur.toFixed(0)}`);
    }
  }

  const emotionTags = [
    ...new Set((emotions.data ?? []).map((e: any) => e.tag)),
  ];

  return {
    profile: profile.data,
    prefs: prefs.data,
    patterns: patterns.data ?? [],
    baselines: baselines.data ?? [],
    deviations: deviations.data ?? [],
    totals: {
      thisMonth: totalThis,
      lastMonth: totalLast,
      byCategoryThisMonth: totalsByCategoryThis,
      byCategoryLastMonth: totalsByCategoryLast,
    },
    spikes,
    emotionTags,
    transactionCount: {
      thisMonth: thisMonthTxns.length,
      lastMonth: lastMonthTxns.length,
    },
  };
}

function buildSystemPrompt(ctx: any) {
  const p = ctx.prefs ?? {};
  const profile = ctx.profile ?? {};
  const currency = profile.currency || "INR";
  const symbol = currency === "INR" ? "₹" : currency;
  const salary = p.salary ?? profile.monthly_budget ?? null;
  const savingsGoal = p.savings_goal ?? profile.savings_goal ?? null;
  const preferences: string[] = Array.isArray(p.preferences)
    ? p.preferences
    : [];

  return `You are Smart Expense Copilot — a context-aware behavioral finance agent that helps the user understand spending and make better decisions.

CORE ROLE
- Move the user from passive tracking to active decisions.
- Answer concrete questions ("Where did I overspend this month?", "How can I save ${symbol}5,000 next month?").
- Surface spikes vs past behavior, suggest concrete optimizations.
- Remember user preferences and goals across the conversation.

TONE
- Warm, direct, decision-oriented. No moralizing. No "you should never spend on X".
- Be specific with numbers. Use ${symbol} as the currency symbol.
- Default to 2–5 short sentences. Use bullet points for lists of suggestions.
- When suggesting savings, ALWAYS respect stated preferences (e.g. if they prefer cutting subscriptions over food, suggest subscriptions first).

MEMORY TOOLS
You can save things you learn about the user by calling the save_preference tool:
- Their salary or income
- Their savings goal
- A free-form preference like "prefer cutting subscriptions over food", "willing to cut entertainment", "needs to keep transport budget"
- Use this whenever the user states a goal, income, or preference for the first time, OR updates an existing one.

USER MEMORY (current)
- Salary / monthly budget: ${salary ? symbol + salary : "unknown"}
- Savings goal: ${savingsGoal ? symbol + savingsGoal : "unknown"}
- Stated preferences: ${preferences.length ? preferences.join("; ") : "none yet"}
- Notes: ${p.notes ?? "none"}
- Common emotion tags: ${ctx.emotionTags.join(", ") || "none"}

THIS MONTH vs LAST MONTH
- Total this month: ${symbol}${ctx.totals.thisMonth.toFixed(0)} (${ctx.transactionCount.thisMonth} txns)
- Total last month: ${symbol}${ctx.totals.lastMonth.toFixed(0)} (${ctx.transactionCount.lastMonth} txns)
- By category this month: ${JSON.stringify(ctx.totals.byCategoryThisMonth)}
- By category last month: ${JSON.stringify(ctx.totals.byCategoryLastMonth)}
- Detected spikes (>25% above last month): ${ctx.spikes.length ? ctx.spikes.join("; ") : "none"}

DETECTED PATTERNS
${
    ctx.patterns
      .map(
        (p: any) =>
          `- ${p.title} (${p.category}, ${p.confidence}, ${p.occurrences} times, avg ${symbol}${p.average_amount}): ${p.description}`,
      )
      .join("\n") || "- none yet"
  }

RECENT DEVIATIONS
${
    ctx.deviations
      .map(
        (d: any) =>
          `- ${d.category} ${d.time_period}: ${d.deviation_percentage}% above baseline (${symbol}${d.current_amount} vs ${symbol}${d.baseline_amount})`,
      )
      .join("\n") || "- none"
  }

RULES
- Ground every claim in the data above. Never invent numbers.
- If asked "how do I save X", produce a concrete plan with category-by-category cuts that respects the user's stated preferences.
- If you don't know something, ask one clarifying question instead of guessing.`;
}

const SAVE_PREFERENCE_TOOL = {
  type: "function",
  function: {
    name: "save_preference",
    description:
      "Persist a fact you just learned about the user (salary, savings goal, or a free-form behavioral preference like 'prefer cutting subscriptions over food'). Call whenever the user states or updates one of these.",
    parameters: {
      type: "object",
      properties: {
        salary: {
          type: "number",
          description: "Monthly take-home salary in user's currency.",
        },
        savings_goal: {
          type: "number",
          description: "Monthly savings goal in user's currency.",
        },
        preference: {
          type: "string",
          description:
            "A short behavioral preference, e.g. 'prefer cutting subscriptions over food'.",
        },
        notes: {
          type: "string",
          description: "Any other free-form note worth remembering.",
        },
      },
    },
  },
};

async function applyPreferenceTool(
  supabase: any,
  userId: string,
  input: any,
) {
  const { data: existing } = await supabase
    .from("copilot_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const prefList: string[] = Array.isArray(existing?.preferences)
    ? existing.preferences
    : [];
  if (input.preference && !prefList.includes(input.preference)) {
    prefList.push(input.preference);
  }

  const payload: any = {
    user_id: userId,
    salary: input.salary ?? existing?.salary ?? null,
    savings_goal: input.savings_goal ?? existing?.savings_goal ?? null,
    preferences: prefList,
    notes: input.notes ?? existing?.notes ?? null,
  };

  if (existing) {
    await supabase
      .from("copilot_preferences")
      .update(payload)
      .eq("user_id", userId);
  } else {
    await supabase.from("copilot_preferences").insert(payload);
  }
  return { saved: true };
}

async function callModel(
  apiKey: string,
  systemPrompt: string,
  messages: any[],
) {
  const resp = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1200,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      tools: [SAVE_PREFERENCE_TOOL],
    }),
  });
  return resp;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: claimsErr } =
      await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub as string;

    const admin = createClient(supabaseUrl, serviceKey);
    const body = (await req.json()) as CopilotRequest;
    const mode = body.mode ?? "chat";

    const ctx = await buildContext(admin, userId);
    const systemPrompt = buildSystemPrompt(ctx);

    let messages = body.messages ?? [];
    if (mode === "auto_insights") {
      messages = [
        {
          role: "user",
          content:
            "Run an auto-insight pass. Identify the 2–3 most important spending spikes or pattern shifts vs last month, then propose ONE concrete optimization that respects my stated preferences. Be specific with amounts.",
        },
      ];
    }

    // Tool loop: up to 3 rounds
    let finalMessage: any = null;
    let workingMessages = messages.slice();
    for (let round = 0; round < 3; round++) {
      const resp = await callModel(lovableKey, systemPrompt, workingMessages);
      if (!resp.ok) {
        const t = await resp.text();
        console.error("AI gateway error", resp.status, t);
        if (resp.status === 402) {
          return new Response(
            JSON.stringify({
              error:
                "AI usage credits exhausted. Add credits in your workspace billing settings.",
            }),
            {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
        if (resp.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit. Try again shortly." }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
        return new Response(
          JSON.stringify({ error: "AI provider error" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const data = await resp.json();
      const message = data.choices?.[0]?.message;
      if (!message) {
        return new Response(
          JSON.stringify({ error: "Invalid AI response format" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const toolCalls = message.tool_calls ?? [];
      if (toolCalls.length === 0) {
        finalMessage = message;
        break;
      }

      // Append assistant message with tool_calls
      workingMessages.push({
        role: "assistant",
        content: message.content,
        tool_calls: toolCalls,
      });

      // Execute tools and append results
      const toolResults: any[] = [];
      for (const t of toolCalls) {
        if (t.function?.name === "save_preference") {
          let parsedInput: any = {};
          try {
            parsedInput = JSON.parse(t.function.arguments || "{}");
          } catch {
            parsedInput = {};
          }
          const result = await applyPreferenceTool(admin, userId, parsedInput);
          toolResults.push({
            role: "tool",
            tool_call_id: t.id,
            content: JSON.stringify(result),
          });
        } else {
          toolResults.push({
            role: "tool",
            tool_call_id: t.id,
            content: JSON.stringify({ error: "unknown tool" }),
          });
        }
      }
      workingMessages.push(...toolResults);
      finalMessage = message;
    }

    const text = finalMessage?.content || "Sorry, I couldn't generate a response.";

    return new Response(
      JSON.stringify({
        reply: text,
        spikes: ctx.spikes,
        totals: ctx.totals,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Copilot error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
