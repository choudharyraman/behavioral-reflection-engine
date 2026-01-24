import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, Loader2, Mic, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  error?: boolean;
}

const suggestedQuestions = [
  "Why did I overspend last week?",
  "What are my biggest habits?",
  "When do I impulse buy?",
  "How has my spending changed?",
  "What triggers my late-night orders?",
  "Which days do I spend the most?",
];

export function MobileAskAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (question?: string) => {
    const messageText = question || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { 
          message: messageText,
          conversationHistory 
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const aiMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: data.response || "I couldn't generate a response. Please try again.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
        error: true,
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  const handleRetry = (messageIndex: number) => {
    // Find the user message before the error
    const userMessage = messages[messageIndex - 1];
    if (userMessage?.role === 'user') {
      // Remove error message and retry
      setMessages(prev => prev.slice(0, messageIndex));
      handleSend(userMessage.content);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-5 lg:px-8 py-6 space-y-4"
      >
        <div className="max-w-2xl mx-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 animate-fade-in">
            <div className="relative">
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br from-primary/20 to-primary/10 mb-5 sm:mb-6">
                <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-primary" strokeWidth={1.5} />
              </div>
              <div className="absolute -inset-4 rounded-[2.5rem] bg-primary/5 blur-xl -z-10" />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
              Ask me anything
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xs leading-relaxed">
              I can help you understand patterns, find insights, and reflect on your spending behavior.
            </p>
            
            <div className="mt-8 sm:mt-10 w-full max-w-sm space-y-3">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Try asking
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedQuestions.map((question, idx) => (
                  <Button
                    key={question}
                    variant="outline"
                    className="h-auto py-2 px-3 rounded-full text-xs border-border/50 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all animate-fade-in active:scale-[0.98]"
                    style={{ animationDelay: `${idx * 100}ms` }}
                    onClick={() => handleSend(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Clear chat button */}
            <div className="flex justify-center mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="mr-1.5 h-3 w-3" />
                Clear chat
              </Button>
            </div>
            
            {messages.map((message, idx) => (
              <div
                key={message.id}
                className={cn(
                  "flex animate-fade-in",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div
                  className={cn(
                    "max-w-[90%] sm:max-w-[85%] rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-3.5",
                    message.role === 'user'
                      ? 'bg-foreground text-background rounded-br-lg'
                      : message.error 
                        ? 'bg-destructive/10 text-destructive rounded-bl-lg'
                        : 'bg-card text-foreground rounded-bl-lg shadow-sm'
                  )}
                >
                  {message.error && (
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">Error</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-sm sm:text-[15px] leading-relaxed">{message.content}</p>
                  {message.error && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRetry(idx)}
                      className="mt-2 text-xs"
                    >
                      <RefreshCw className="mr-1.5 h-3 w-3" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-center gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl bg-card px-4 sm:px-5 py-3 sm:py-4 shadow-sm">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">Analyzing your patterns...</span>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Input area - Fixed at bottom */}
      <div className="sticky bottom-20 glass border-t border-border/50 px-4 sm:px-5 lg:px-8 py-3 sm:py-4 safe-area-inset-bottom">
        <div className="flex items-center gap-2 sm:gap-3 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Input
              placeholder="Ask about your spending..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
              className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-card border-0 pr-10 sm:pr-12 text-sm sm:text-base shadow-sm"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl hover:bg-primary/10"
            >
              <Mic className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" strokeWidth={1.5} />
            </Button>
          </div>
          <Button 
            onClick={() => handleSend()} 
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-foreground hover:bg-foreground/90 shadow-md shrink-0 active:scale-95 transition-transform"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
