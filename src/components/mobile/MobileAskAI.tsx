import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, Loader2, Mic, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
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

// SSE streaming chat function
async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Array<{ role: string; content: string }>;
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`;

  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (resp.status === 429) {
      onError("Rate limit exceeded. Please try again later.");
      return;
    }
    if (resp.status === 402) {
      onError("Usage limit reached. Please check your account.");
      return;
    }
    if (!resp.ok || !resp.body) {
      const errorData = await resp.json().catch(() => ({}));
      onError(errorData.error || "Failed to get AI response");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (error) {
    console.error("Stream error:", error);
    onError(error instanceof Error ? error.message : "Connection error");
  }
}

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

    // Build conversation history
    const conversationHistory = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    let assistantContent = "";

    const updateAssistantMessage = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && !last.error) {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, {
          id: `msg-${Date.now()}`,
          role: 'assistant' as const,
          content: assistantContent,
          timestamp: new Date(),
        }];
      });
    };

    try {
      await streamChat({
        messages: [...conversationHistory, { role: 'user', content: messageText }],
        onDelta: (chunk) => updateAssistantMessage(chunk),
        onDone: () => setIsLoading(false),
        onError: (errorMsg) => {
          const errorMessage: Message = {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: errorMsg,
            timestamp: new Date(),
            error: true,
          };
          setMessages(prev => [...prev, errorMessage]);
          setIsLoading(false);
          toast.error('Failed to get AI response');
        },
      });
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
        error: true,
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      toast.error('Failed to get AI response');
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  const handleRetry = (messageIndex: number) => {
    const userMessage = messages[messageIndex - 1];
    if (userMessage?.role === 'user') {
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

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-center gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl bg-card px-4 sm:px-5 py-3 sm:py-4 shadow-sm">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">Thinking...</span>
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
