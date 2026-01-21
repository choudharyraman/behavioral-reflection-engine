import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Sparkles, Loader2, Mic } from 'lucide-react';
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
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 mb-6">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Ask me anything
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              I can help you understand patterns, find insights, and reflect on your spending.
            </p>
            
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {suggestedQuestions.map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  className="h-auto py-2 px-3 rounded-xl text-xs whitespace-normal text-left"
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
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-card text-foreground rounded-bl-md shadow-sm'
                )}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Analyzing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input area - Fixed at bottom */}
      <div className="sticky bottom-20 bg-background border-t border-border px-4 py-3 safe-area-inset-bottom">
        <div className="flex items-center gap-2">
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
              className="h-12 rounded-xl bg-card border-0 pr-12"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
            >
              <Mic className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
          <Button 
            onClick={() => handleSend()} 
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-12 w-12 rounded-xl shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
