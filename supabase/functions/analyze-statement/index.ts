import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentText } = await req.json();
    
    if (!documentText || typeof documentText !== 'string') {
      return new Response(
        JSON.stringify({ error: "Document text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a financial behavioral analyst AI that specializes in analyzing bank statements and spending documents. Your task is to:

1. Extract transaction data from the provided document text
2. Identify spending patterns (temporal, behavioral, contextual)
3. Generate insights using non-judgmental, speculative language

IMPORTANT GUIDELINES:
- Use language like "It looks like...", "You tend to...", "This might suggest...", "We noticed..."
- NEVER use "You are...", "You always...", "This proves...", "You must..."
- Identify patterns with confidence levels: Strong (6+ occurrences), Emerging (3-5), Weak (1-2)
- Focus on actionable insights that help users understand their spending behavior

Return your analysis as a valid JSON object with this exact structure:
{
  "summary": {
    "totalTransactions": number,
    "totalSpent": number,
    "dateRange": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
    "topCategories": [{ "name": string, "amount": number, "percentage": number }]
  },
  "patterns": [
    {
      "id": string,
      "title": string,
      "description": string,
      "confidence": "strong" | "emerging" | "weak",
      "category": string,
      "occurrences": number,
      "averageAmount": number,
      "timeRange": string,
      "trend": "increasing" | "stable" | "decreasing"
    }
  ],
  "insights": [
    {
      "id": string,
      "title": string,
      "description": string,
      "confidence": "strong" | "emerging" | "weak",
      "category": string,
      "actionable": string
    }
  ],
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": string,
      "amount": number,
      "category": string
    }
  ]
}

If you cannot parse transaction data from the document, still provide what analysis you can and note any limitations in the insights.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please analyze the following bank statement/spending document and provide behavioral insights:\n\n${documentText}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    // Try to extract JSON from the response
    let analysisResult;
    try {
      // Try to find JSON in the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      const jsonStr = jsonMatch[1] || content;
      analysisResult = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Return a structured error response
      analysisResult = {
        summary: {
          totalTransactions: 0,
          totalSpent: 0,
          dateRange: { start: "", end: "" },
          topCategories: []
        },
        patterns: [],
        insights: [{
          id: "parse-error",
          title: "Analysis Complete",
          description: content,
          confidence: "emerging",
          category: "general",
          actionable: "Please upload a clearer document for more detailed analysis."
        }],
        transactions: [],
        rawAnalysis: content
      };
    }

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-statement:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
