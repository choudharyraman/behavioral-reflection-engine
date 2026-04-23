import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Sparkles, Loader2, Zap, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  "Where did I overspend this month?",
  "How can I save ₹5,000 next month?",
  "What are my biggest spending leaks?",
  "Compare this month vs last month",
];

export function AskAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      const aiMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: data?.reply ?? "Sorry, I couldn't generate a response.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Copilot error', err);
      toast.error(err instanceof Error ? err.message : 'Copilot is unavailable right now.');
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
    <Card className="flex h-[600px] flex-col">
      <CardHeader className="shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-primary" />
              Smart Expense Copilot
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Context-aware decisions, powered by Claude
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAutoInsights} disabled={isLoading}>
              <Zap className="h-4 w-4 mr-1.5" /> Auto-insights
            </Button>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear} disabled={isLoading}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 font-medium text-foreground">
                Ask me anything about your spending
              </h3>
              <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                I can help you understand patterns, find insights, and reflect on your financial behavior.
              </p>
              
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedQuestions.map((question) => (
                  <Button
                    key={question}
                    variant="outline"
                    size="sm"
                    className="h-auto whitespace-normal text-left"
                    onClick={() => handleSend(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-foreground'
                  )}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Analyzing your patterns...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="mt-4 shrink-0 border-t border-border pt-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask about your spending patterns..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="min-h-[60px] resize-none"
            />
            <Button 
              onClick={() => handleSend()} 
              disabled={!input.trim() || isLoading}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
