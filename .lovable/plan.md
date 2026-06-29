Replace Claude 3.5 with Lovable AI Gateway for faster, lower-latency responses in the Expense Agent.

Recommended model: `google/gemini-3.5-flash` — optimized for fast agentic workflows with tool calling, significantly lower latency than Claude 3.5 while maintaining strong reasoning for financial analysis.

Alternative: `google/gemini-3-flash-preview` if you prefer the proven default.

---

## Technical Changes

### 1. Edge Function: `supabase/functions/expense-copilot/index.ts`
- Replace direct Anthropic `fetch` with Lovable AI Gateway via `@ai-sdk/openai-compatible`.
- Use `streamText` + `tool` from the AI SDK for the tool-calling loop (replacing the 3-round Anthropic raw-loop).
- Convert `save_preference` tool from Anthropic's `input_schema` format to AI SDK `zod` schema.
- Keep all existing logic: `buildContext`, `buildSystemPrompt`, `applyPreferenceTool`, auto-insights mode, CORS, JWT validation.
- Remove `ANTHROPIC_API_KEY` dependency entirely.

### 2. UI Copy Update
- In `src/components/dashboard/AskAI.tsx` and `src/components/mobile/MobileAskAI.tsx`, update the agent subtitle from "Claude 3.5 · with memory" to "Gemini 3.5 · with memory" (or whichever model is selected).

### 3. No client changes needed
- The frontend already sends `{ mode, messages }` and expects `{ reply, spikes, totals }` — this contract stays identical.

---

## Outcome
Expense Agent responses become noticeably faster. No more Anthropic credit dependency. Tool-calling and memory behavior remain the same.