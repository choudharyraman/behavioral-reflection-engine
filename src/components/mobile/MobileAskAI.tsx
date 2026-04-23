import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, Loader2, Mic, RefreshCw, AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  error?: boolean;
}

const suggestedQuestions = [
  "Where did I overspend this month?",
  "How can I save ₹5,000 next month?",
  "Biggest spending leaks?",
  "This month vs last month",
  "Cut subscriptions, not food",
  "What's my income? (set salary)",
];

export function MobileAskAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const callCopilot = async (convo: Message[], mode: 'chat' | 'auto_insights') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('expense-copilot', {
        body: {
          mode,
          messages: convo
            .filter(m => !m.error)
            .map(m => ({ role: m.role, content: m.content })),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: data?.reply ?? "Sorry, I couldn't generate a response.",
        timestamp: new Date(),
      }]);
    } catch (err) {
      console.error('Copilot error', err);
      const msg = err instanceof Error ? err.message : 'Copilot is unavailable right now.';
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: msg,
        timestamp: new Date(),
        error: true,
      }]);
      toast.error('Failed to get copilot response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (question?: string) => {
    const messageText = question || input.trim();
    if (!messageText || isLoading) return;
    const userMessage: Message = { id: `msg-${Date.now()}`, role: 'user', content: messageText, timestamp: new Date() };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput('');
    await callCopilot(next, 'chat');
  };

  const handleAutoInsights = async () => {
    if (isLoading) return;
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: '⚡ Run auto-insights',
      timestamp: new Date(),
    };
    const next = [...messages, userMessage];
    setMessages(next);
    await callCopilot(next, 'auto_insights');
  };

  const handleClearChat = () => { setMessages([]); toast.success('Chat cleared'); };
  const handleRetry = (messageIndex: number) => {
    const userMessage = messages[messageIndex - 1];
    if (userMessage?.role === 'user') { setMessages(prev => prev.slice(0, messageIndex)); handleSend(userMessage.content); }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        <div className="max-w-2xl mx-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 animate-fade-in">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl neu-raised mb-6">
              <Sparkles className="h-12 w-12 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Smart Expense Copilot</h2>
            <p className="mt-3 text-base text-muted-foreground max-w-xs leading-relaxed">
              Your decision engine for spending. Ask anything, or run auto-insights.
            </p>
            <button
              onClick={handleAutoInsights}
              className="mt-6 h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center gap-2 active:scale-[0.98] shadow-lg"
            >
              <Zap className="h-5 w-5" /> Run auto-insights
            </button>
            <div className="mt-10 w-full max-w-sm space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Try asking</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={question}
                    className="h-auto py-2.5 px-4 rounded-xl text-sm font-semibold neu-button animate-fade-in active:scale-[0.98]"
                    style={{ animationDelay: `${idx * 100}ms` }}
                    onClick={() => handleSend(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-5">
              <button onClick={handleClearChat} className="text-sm font-semibold text-muted-foreground hover:text-foreground rounded-xl px-4 py-2 neu-button flex items-center gap-2">
                <RefreshCw className="h-4 w-4" /> Clear chat
              </button>
            </div>
            {messages.map((message, idx) => (
              <div key={message.id} className={cn("flex animate-fade-in", message.role === 'user' ? 'justify-end' : 'justify-start')} style={{ animationDelay: `${idx * 50}ms` }}>
                <div className={cn("max-w-[85%] rounded-2xl px-5 py-4",
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-lg'
                    : message.error
                      ? 'bg-destructive/10 text-destructive rounded-bl-lg'
                      : 'neu-raised rounded-bl-lg'
                )}>
                  {message.error && (
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4" strokeWidth={2} />
                      <span className="text-xs font-bold">Error</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
                  {message.error && (
                    <button onClick={() => handleRetry(idx)} className="mt-2 text-xs font-semibold flex items-center gap-1.5">
                      <RefreshCw className="h-3 w-3" /> Retry
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-center gap-3 rounded-2xl px-5 py-4 neu-raised">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Thinking...</span>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Input area */}
      <div className="sticky bottom-20 bg-background px-5 py-4 safe-area-inset-bottom">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Input
              placeholder="Ask about your spending..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              disabled={isLoading}
              className="h-14 rounded-2xl border-0 pr-12 text-base font-medium neu-inset"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl neu-button flex items-center justify-center">
              <Mic className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
            </button>
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-lg flex items-center justify-center shrink-0 active:scale-95 transition-transform disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
