import { useState, useRef } from 'react';
import { InsightCard as InsightCardType } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { ThumbsUp, ThumbsDown, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface InsightCarouselProps {
  insights: InsightCardType[];
  onFeedback: (id: string, feedback: 'accurate' | 'not_quite') => void;
}

const confidenceConfig = {
  strong: { label: 'Recurring', className: 'bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]' },
  emerging: { label: 'Emerging', className: 'bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]' },
  weak: { label: 'New', className: 'neu-inset-sm text-muted-foreground' },
};

export function InsightCarousel({ insights, onFeedback }: InsightCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const visibleInsights = insights.filter(i => !i.dismissed);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const cardWidth = container.offsetWidth * 0.88;
    const newIndex = Math.round(container.scrollLeft / cardWidth);
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
        <div className="flex items-center gap-2 rounded-full px-3 py-1.5 neu-raised-sm">
          <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
          <span className="text-xs font-bold text-primary">{visibleInsights.length} new</span>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide" onScroll={handleScroll}>
        {visibleInsights.map((insight, idx) => {
          const confidence = confidenceConfig[insight.pattern.confidence];
          const TrendIcon = insight.pattern.trend === 'increasing' ? TrendingUp : insight.pattern.trend === 'decreasing' ? TrendingDown : Minus;
          
          return (
            <div
              key={insight.id}
              className={cn("w-[85%] flex-shrink-0 snap-center rounded-2xl p-5 transition-all duration-500 neu-raised neu-card-hover", idx === currentIndex && "shadow-lg")}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl neu-inset-sm">
                    <Sparkles className="h-6 w-6 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">{insight.title}</h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {new Date(insight.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <span className={cn('rounded-full px-3 py-1 text-[11px] font-bold', confidence.className)}>
                  {confidence.label}
                </span>
              </div>
              
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">{insight.narrative}</p>
              
              {/* Stats row */}
              <div className="mt-4 flex items-center gap-4 rounded-xl px-4 py-3 neu-inset-sm">
                <div>
                  <p className="text-xl font-bold text-foreground">₹{insight.pattern.averageAmount}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Avg Amount</p>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <TrendIcon className={cn("h-5 w-5",
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
              
              {/* Feedback buttons */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => onFeedback(insight.id, 'accurate')}
                  className={cn(
                    "flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                    insight.userFeedback === 'accurate' 
                      ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]" 
                      : "neu-button"
                  )}
                >
                  <ThumbsUp className="h-4 w-4" strokeWidth={2} />
                  That's me
                </button>
                <button
                  onClick={() => onFeedback(insight.id, 'not_quite')}
                  className={cn(
                    "flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                    insight.userFeedback === 'not_quite' ? "neu-inset" : "neu-button"
                  )}
                >
                  <ThumbsDown className="h-4 w-4" strokeWidth={2} />
                  Not quite
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Pagination */}
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
                idx === currentIndex ? "w-8 bg-primary" : "w-2.5 bg-muted-foreground/20"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
