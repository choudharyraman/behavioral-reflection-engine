import { useState, useRef } from 'react';
import { InsightCard as InsightCardType } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InsightCarouselProps {
  insights: InsightCardType[];
  onFeedback: (id: string, feedback: 'accurate' | 'not_quite') => void;
}

const confidenceConfig = {
  strong: { 
    label: 'Recurring', 
    className: 'bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30' 
  },
  emerging: { 
    label: 'Emerging', 
    className: 'bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30' 
  },
  weak: { 
    label: 'New', 
    className: 'bg-secondary text-secondary-foreground border-border' 
  },
};

export function InsightCarousel({ insights, onFeedback }: InsightCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const visibleInsights = insights.filter(i => !i.dismissed);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth * 0.88;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setCurrentIndex(Math.min(newIndex, visibleInsights.length - 1));
  };

  if (visibleInsights.length === 0) return null;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between px-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">Your Insights</h2>
          <p className="text-sm text-muted-foreground font-medium">Patterns we noticed</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
          <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
          <span className="text-xs font-bold text-primary">{visibleInsights.length} new</span>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide"
        onScroll={handleScroll}
      >
        {visibleInsights.map((insight, idx) => {
          const confidence = confidenceConfig[insight.pattern.confidence];
          const TrendIcon = insight.pattern.trend === 'increasing' ? TrendingUp : 
                           insight.pattern.trend === 'decreasing' ? TrendingDown : Minus;
          
          return (
            <div
              key={insight.id}
              className={cn(
                "w-[85%] flex-shrink-0 snap-center rounded-[1.75rem] bg-card p-5 shadow-md border border-border/50 transition-all duration-500 card-hover",
                idx === currentIndex && "shadow-lg"
              )}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">{insight.title}</h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {new Date(insight.createdAt).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  'rounded-full border px-3 py-1 text-[11px] font-bold',
                  confidence.className
                )}>
                  {confidence.label}
                </span>
              </div>
              
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {insight.narrative}
              </p>
              
              {/* Stats row - M3 Surface container */}
              <div className="mt-4 flex items-center gap-4 rounded-2xl bg-secondary/50 px-4 py-3">
                <div>
                  <p className="text-xl font-bold text-foreground">₹{insight.pattern.averageAmount}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Avg Amount</p>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <TrendIcon className={cn(
                    "h-5 w-5",
                    insight.pattern.trend === 'increasing' && "text-destructive",
                    insight.pattern.trend === 'decreasing' && "text-[hsl(var(--success))]",
                    insight.pattern.trend === 'stable' && "text-muted-foreground"
                  )} strokeWidth={2.5} />
                  <div>
                    <p className="text-sm font-bold text-foreground capitalize">{insight.pattern.trend}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Trend</p>
                  </div>
                </div>
              </div>
              
              {/* M3 Feedback buttons */}
              <div className="mt-4 flex items-center gap-3">
                <Button
                  variant={insight.userFeedback === 'accurate' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onFeedback(insight.id, 'accurate')}
                  className={cn(
                    "flex-1 h-12 rounded-full font-semibold transition-all duration-300",
                    insight.userFeedback === 'accurate' 
                      ? "bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90" 
                      : "border-2 border-border hover:bg-[hsl(var(--success))]/10 hover:text-[hsl(var(--success))] hover:border-[hsl(var(--success))]/30"
                  )}
                >
                  <ThumbsUp className="mr-2 h-4 w-4" strokeWidth={2} />
                  That's me
                </Button>
                <Button
                  variant={insight.userFeedback === 'not_quite' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onFeedback(insight.id, 'not_quite')}
                  className="flex-1 h-12 rounded-full font-semibold border-2 border-border transition-all duration-300"
                >
                  <ThumbsDown className="mr-2 h-4 w-4" strokeWidth={2} />
                  Not quite
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* M3 Pagination pills */}
      {visibleInsights.length > 1 && (
        <div className="flex justify-center gap-2">
          {visibleInsights.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (scrollRef.current) {
                  const cardWidth = scrollRef.current.offsetWidth * 0.88;
                  scrollRef.current.scrollTo({ left: cardWidth * idx, behavior: 'smooth' });
                }
              }}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                idx === currentIndex 
                  ? "w-8 bg-primary" 
                  : "w-2.5 bg-muted-foreground/20 hover:bg-muted-foreground/40"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}