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
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InsightCarouselProps {
  insights: InsightCardType[];
  onFeedback: (id: string, feedback: 'accurate' | 'not_quite') => void;
}

const confidenceConfig = {
  strong: { 
    label: 'Recurring', 
    className: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20' 
  },
  emerging: { 
    label: 'Emerging', 
    className: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20' 
  },
  weak: { 
    label: 'New', 
    className: 'bg-muted text-muted-foreground border-border' 
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
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between px-5">
        <div>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">Your Insights</h2>
          <p className="text-sm text-muted-foreground">Patterns we noticed</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">{visibleInsights.length} new</span>
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
                "w-[88%] flex-shrink-0 snap-center rounded-3xl bg-card p-5 shadow-md transition-all duration-500 card-hover",
                idx === currentIndex && "shadow-lg"
              )}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground tracking-tight">{insight.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(insight.createdAt).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  'rounded-full border px-2.5 py-1 text-[10px] font-medium',
                  confidence.className
                )}>
                  {confidence.label}
                </span>
              </div>
              
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {insight.narrative}
              </p>
              
              {/* Stats row */}
              <div className="mt-4 flex items-center gap-4 rounded-2xl bg-muted/50 px-4 py-3">
                <div>
                  <p className="text-lg font-bold text-foreground">₹{insight.pattern.averageAmount}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Amount</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <TrendIcon className={cn(
                    "h-4 w-4",
                    insight.pattern.trend === 'increasing' && "text-destructive",
                    insight.pattern.trend === 'decreasing' && "text-[hsl(var(--success))]",
                    insight.pattern.trend === 'stable' && "text-muted-foreground"
                  )} />
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">{insight.pattern.trend}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Trend</p>
                  </div>
                </div>
              </div>
              
              {/* Feedback buttons */}
              <div className="mt-4 flex items-center gap-3">
                <Button
                  variant={insight.userFeedback === 'accurate' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onFeedback(insight.id, 'accurate')}
                  className={cn(
                    "flex-1 h-11 rounded-2xl font-medium transition-all duration-300",
                    insight.userFeedback === 'accurate' 
                      ? "bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90" 
                      : "border-border hover:bg-[hsl(var(--success))]/10 hover:text-[hsl(var(--success))] hover:border-[hsl(var(--success))]/30"
                  )}
                >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  That's me
                </Button>
                <Button
                  variant={insight.userFeedback === 'not_quite' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onFeedback(insight.id, 'not_quite')}
                  className="flex-1 h-11 rounded-2xl font-medium border-border transition-all duration-300"
                >
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  Not quite
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Pagination dots */}
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
                "h-2 rounded-full transition-all duration-300",
                idx === currentIndex 
                  ? "w-8 bg-primary" 
                  : "w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
