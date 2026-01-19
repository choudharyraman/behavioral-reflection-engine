import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  "Why did I overspend last week?",
  "What are my biggest spending habits?",
  "When do I tend to impulse buy?",
  "How has my spending changed this month?",
];

export function AskAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
          "Last week, you made 8 food delivery orders—6 of them between 9-11 PM. This is higher than your usual 3-4 orders per week. It also coincided with the week before your salary date, when you tend to have less cash available for cooking supplies. Would you like to add a context tag to these transactions?",
        "What are my biggest spending habits?": 
          "Based on the last 3 months, your top spending patterns are:\n\n1. **Late-night food delivery** (₹4,560/month) - You order food after 9 PM on 60% of weekdays\n2. **Weekend shopping** (₹3,200/month) - Shopping transactions peak on Saturdays\n3. **Morning coffee ritual** (₹720/month) - Consistent coffee purchases on Tuesday and Thursday mornings\n\nWould you like to explore any of these patterns further?",
        "When do I tend to impulse buy?": 
          "We noticed impulse buying clusters in these situations:\n\n• **Late weekday evenings** (9-11 PM) - Often food delivery after work\n• **First week after salary** - Entertainment and shopping spikes\n• **Weekends** - Multiple small shopping transactions in quick succession\n\nYour impulse transactions are typically under ₹500 and happen within 20-30 minute windows.",
        "How has my spending changed this month?": 
          "Compared to last month:\n\n📈 **Increased**: Entertainment (+23%), Food delivery (+15%)\n📉 **Decreased**: Shopping (-12%), Transport (-5%)\n➡️ **Stable**: Bills, Health\n\nThe entertainment increase coincides with new streaming subscriptions. Food delivery increased particularly in the late-night hours.",
      };

      const aiMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: responses[messageText] || 
          "I can help you understand your spending patterns better. Based on your transaction history, I can identify when you tend to spend more, what triggers certain purchases, and how your habits have evolved over time. What would you like to know?",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card className="flex h-[600px] flex-col">
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-primary" />
          Ask About Your Spending
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Have a conversation about your spending patterns
        </p>
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
