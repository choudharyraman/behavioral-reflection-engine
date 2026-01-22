import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, Loader2, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  "Why did I overspend last week?",
  "What are my biggest habits?",
  "When do I impulse buy?",
  "How has my spending changed?",
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
    if (!messageText) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        "Why did I overspend last week?": 
          "Last week, you made 8 food delivery orders—6 between 9-11 PM. This is higher than usual. It coincided with the week before salary date. Would you like to add context tags?",
        "What are my biggest habits?": 
          "Your top patterns:\n\n1. **Late-night delivery** (₹4,560/month)\n2. **Weekend shopping** (₹3,200/month)\n3. **Morning coffee** (₹720/month)",
        "When do I impulse buy?": 
          "Impulse buying happens:\n\n• Late evenings (9-11 PM)\n• First week after salary\n• Weekends\n\nTypically under ₹500.",
        "How has my spending changed?": 
          "This month:\n\n📈 Entertainment +23%\n📈 Food delivery +15%\n📉 Shopping -12%\n📉 Transport -5%",
      };

      const aiMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: responses[messageText] || 
          "I can help you understand your spending patterns. What would you like to know?",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
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
              I can help you understand patterns, find insights, and reflect on your spending.
            </p>
            
            <div className="mt-8 sm:mt-10 w-full max-w-sm space-y-3">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Try asking
              </p>
              <div className="flex flex-col gap-2">
                {suggestedQuestions.map((question, idx) => (
                  <Button
                    key={question}
                    variant="outline"
                    className="h-auto py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-left justify-start border-border/50 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all animate-fade-in active:scale-[0.98]"
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
          messages.map((message, idx) => (
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
                    : 'bg-card text-foreground rounded-bl-lg shadow-sm'
                )}
              >
                <p className="whitespace-pre-wrap text-sm sm:text-[15px] leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
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
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
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
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
