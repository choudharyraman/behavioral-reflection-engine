import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Send,
  Sparkles,
  Loader2,
  RefreshCw,
  AlertCircle,
  Zap,
  Bot,
  Brain,
  TrendingUp,
  Target,
  Wrench,
  CircleDot,
} from 'lucide-react';
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
  { icon: TrendingUp, text: 'Where did I overspend this month?' },
  { icon: Target, text: 'How can I save ₹5,000 next month?' },
  { icon: Brain, text: 'My biggest spending leaks?' },
  { icon: Sparkles, text: 'This month vs last month' },
];

const capabilities = [
  'Detects spikes vs your baseline',
  'Remembers salary, goals & preferences',
  'Suggests concrete optimizations',
];

export function MobileAskAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

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
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: data?.reply ?? "Sorry, I couldn't generate a response.",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error('Copilot error', err);
      const msg = err instanceof Error ? err.message : 'Agent is unavailable right now.';
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: msg,
          timestamp: new Date(),
          error: true,
        },
      ]);
      toast.error('Failed to get agent response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (question?: string) => {
    const messageText = question || input.trim();
    if (!messageText || isLoading) return;
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
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

  const handleClearChat = () => {
    setMessages([]);
    toast.success('New chat started');
  };

  const handleRetry = (messageIndex: number) => {
    const userMessage = messages[messageIndex - 1];
    if (userMessage?.role === 'user') {
      setMessages(prev => prev.slice(0, messageIndex));
      handleSend(userMessage.content);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Agent identity bar */}
      <div className="shrink-0 px-5 pt-4 pb-3">
        <div className="rounded-2xl neu-raised-sm bg-gradient-to-r from-primary/8 via-background to-background p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(230_80%_65%)] shadow-lg shadow-primary/30">
                  <Bot className="h-6 w-6 text-primary-foreground" strokeWidth={2.2} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight">Expense Agent</h2>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] font-medium text-muted-foreground">
                  Claude 3.5 · with memory
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="flex h-9 w-9 items-center justify-center rounded-xl neu-button"
                aria-label="New chat"
              >
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="mx-auto max-w-2xl">
          {messages.length === 0 ? (
            <div className="space-y-5 py-2 animate-fade-in">
              <div className="rounded-2xl neu-flat p-5">
                <h3 className="text-lg font-bold">Your spending decision engine</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  I read every transaction, pattern, and goal to help you act—not just track.
                </p>
              </div>

              <div className="rounded-2xl neu-inset-sm p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Wrench className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Capabilities
                  </p>
                </div>
                <ul className="space-y-2">
                  {capabilities.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CircleDot className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleAutoInsights}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-[hsl(230_80%_60%)] py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/30 active:scale-[0.98]"
              >
                <Zap className="h-5 w-5" /> Run auto-insights
              </button>

              <div>
                <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Try asking
                </p>
                <div className="space-y-2">
                  {suggestedQuestions.map(({ icon: Icon, text }, idx) => (
                    <button
                      key={text}
                      onClick={() => handleSend(text)}
                      className="flex w-full items-center gap-3 rounded-2xl neu-button px-4 py-3 text-left text-sm font-semibold animate-fade-in active:scale-[0.98]"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-primary" />
                      <span>{text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {messages.map((message, idx) => (
                <MessageRow
                  key={message.id}
                  message={message}
                  onRetry={() => handleRetry(idx)}
                />
              ))}
              {isLoading && <ThinkingRow />}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="sticky bottom-20 bg-background px-5 py-3 safe-area-inset-bottom">
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-2xl neu-inset p-2">
          <Input
            placeholder="Ask the agent…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
            className="h-11 flex-1 border-0 bg-transparent text-base font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button
            onClick={handleAutoInsights}
            disabled={isLoading}
            title="Auto-insights"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl neu-button text-primary disabled:opacity-50"
          >
            <Zap className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(230_80%_60%)] text-primary-foreground shadow-md disabled:opacity-50 active:scale-95"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageRow({
  message,
  onRetry,
}: {
  message: Message;
  onRetry: () => void;
}) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex gap-2.5 animate-fade-in', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm',
          isUser
            ? 'bg-muted text-foreground'
            : message.error
              ? 'bg-destructive/15 text-destructive'
              : 'bg-gradient-to-br from-primary to-[hsl(230_80%_65%)] text-primary-foreground',
        )}
      >
        {isUser ? (
          <span className="text-[11px] font-bold">You</span>
        ) : message.error ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" strokeWidth={2.2} />
        )}
      </div>
      <div className={cn('max-w-[82%]', isUser && 'items-end text-right')}>
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
          <span>{isUser ? 'You' : message.error ? 'Error' : 'Expense Agent'}</span>
          <span>·</span>
          <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-[14px] leading-relaxed',
            isUser
              ? 'rounded-tr-sm bg-primary text-primary-foreground'
              : message.error
                ? 'rounded-tl-sm bg-destructive/10 text-destructive'
                : 'rounded-tl-sm neu-raised-sm',
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          {message.error && (
            <button
              onClick={onRetry}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold underline-offset-2 hover:underline"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ThinkingRow() {
  return (
    <div className="flex gap-2.5 animate-fade-in">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(230_80%_65%)] text-primary-foreground shadow-sm">
        <Bot className="h-4 w-4" strokeWidth={2.2} />
      </div>
      <div>
        <div className="mb-1 text-[10px] font-semibold text-muted-foreground">Expense Agent</div>
        <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm neu-raised-sm px-4 py-3">
          <Brain className="h-3.5 w-3.5 animate-pulse text-primary" />
          <span className="text-xs font-medium text-muted-foreground">
            Reading patterns & memory…
          </span>
          <div className="ml-1 flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '150ms' }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}