import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Sparkles,
  Loader2,
  Zap,
  RefreshCw,
  Bot,
  Brain,
  TrendingUp,
  Target,
  Wrench,
  CircleDot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tool?: string;
}

const suggestedQuestions = [
  { icon: TrendingUp, text: 'Where did I overspend this month?' },
  { icon: Target, text: 'How can I save ₹5,000 next month?' },
  { icon: Brain, text: 'What are my biggest spending leaks?' },
  { icon: Sparkles, text: 'Compare this month vs last month' },
];

const capabilities = [
  'Detects spending spikes vs your baseline',
  'Remembers your salary, goals & preferences',
  'Suggests concrete optimizations you’ll accept',
  'Cross-references patterns, emotions & merchants',
];

export function AskAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const callCopilot = async (
    convo: Message[],
    mode: 'chat' | 'auto_insights' = 'chat',
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('expense-copilot', {
        body: {
          mode,
          messages: convo.map(m => ({ role: m.role, content: m.content })),
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
      toast.error(err instanceof Error ? err.message : 'Agent is unavailable right now.');
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
      content: '⚡ Run auto-insights on my recent spending',
      timestamp: new Date(),
    };
    const next = [...messages, userMessage];
    setMessages(next);
    await callCopilot(next, 'auto_insights');
  };

  const handleClear = () => setMessages([]);

  return (
    <Card className="flex h-[640px] flex-col overflow-hidden border-border/60 bg-gradient-to-b from-card to-card/40 backdrop-blur">
      {/* Agent identity header */}
      <div className="shrink-0 border-b border-border/60 bg-gradient-to-r from-primary/5 via-card to-card px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(230_80%_65%)] shadow-lg shadow-primary/30">
                <Bot className="h-6 w-6 text-primary-foreground" strokeWidth={2.2} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-card" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Expense Agent</h3>
                <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-[10px] font-semibold">
                  <CircleDot className="h-2.5 w-2.5 text-emerald-500" /> Online
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Claude 3.5 Sonnet · context-aware · with memory
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAutoInsights}
              disabled={isLoading}
              className="gap-1.5 bg-gradient-to-br from-primary to-[hsl(230_80%_60%)] shadow-md"
            >
              <Zap className="h-3.5 w-3.5" /> Auto-insights
            </Button>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear} disabled={isLoading} title="New chat">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-md space-y-6 py-2">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-bold">Your spending decision engine</h4>
              <p className="mt-1.5 text-sm text-muted-foreground">
                I look across every transaction, pattern, and goal to help you act—not just track.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Wrench className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Capabilities
                </p>
              </div>
              <ul className="space-y-2">
                {capabilities.map((cap, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                    <CircleDot className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Try asking
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {suggestedQuestions.map(({ icon: Icon, text }) => (
                  <button
                    key={text}
                    onClick={() => handleSend(text)}
                    className="group flex items-start gap-2.5 rounded-xl border border-border/60 bg-card p-3 text-left text-sm transition hover:border-primary/40 hover:bg-primary/5"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="font-medium leading-snug">{text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map(message => (
              <MessageRow key={message.id} message={message} />
            ))}
            {isLoading && <ThinkingRow />}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-border/60 bg-card/80 px-4 py-3 backdrop-blur">
        <div className="flex items-end gap-2 rounded-2xl border border-border/60 bg-background p-2 shadow-sm focus-within:border-primary/40 focus-within:shadow-primary/10">
          <Textarea
            placeholder="Ask the agent about your spending… (Shift+Enter for newline)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="min-h-[44px] resize-none border-0 bg-transparent p-2 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-[hsl(230_80%_60%)] shadow-md"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-2 px-1 text-[10px] text-muted-foreground">
          Agent uses your transactions, baselines, and saved preferences. It can save new prefs when you mention them.
        </p>
      </div>
    </Card>
  );
}

function MessageRow({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm',
          isUser
            ? 'bg-muted text-foreground'
            : 'bg-gradient-to-br from-primary to-[hsl(230_80%_65%)] text-primary-foreground',
        )}
      >
        {isUser ? (
          <span className="text-xs font-bold">You</span>
        ) : (
          <Bot className="h-4 w-4" strokeWidth={2.2} />
        )}
      </div>
      <div className={cn('max-w-[80%] space-y-1', isUser ? 'items-end' : 'items-start')}>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-semibold">{isUser ? 'You' : 'Expense Agent'}</span>
          <span>·</span>
          <span>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'rounded-tr-sm bg-primary text-primary-foreground'
              : 'rounded-tl-sm border border-border/60 bg-card',
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

function ThinkingRow() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(230_80%_65%)] text-primary-foreground shadow-sm">
        <Bot className="h-4 w-4" strokeWidth={2.2} />
      </div>
      <div className="space-y-1">
        <div className="text-[11px] font-semibold text-muted-foreground">Expense Agent</div>
        <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-border/60 bg-card px-4 py-3">
          <Brain className="h-3.5 w-3.5 animate-pulse text-primary" />
          <span className="text-xs font-medium text-muted-foreground">
            Reading transactions, baselines & memory…
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