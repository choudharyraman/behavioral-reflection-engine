import { useState, useRef } from 'react';
import { InsightCard as InsightCardType } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface InsightCarouselProps {
  insights: InsightCardType[];
  onFeedback: (id: string, feedback: 'accurate' | 'not_quite') => void;
}

const confidenceConfig = {
  strong: { 
    label: 'Recurring', 
    className: 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]' 
  },
  emerging: { 
    label: 'Emerging', 
    className: 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]' 
  },
  weak: { 
    label: 'New', 
    className: 'bg-muted text-muted-foreground' 
  },
};

export function InsightCarousel({ insights, onFeedback }: InsightCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const visibleInsights = insights.filter(i => !i.dismissed);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth * 0.85;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setCurrentIndex(Math.min(newIndex, visibleInsights.length - 1));
  };

  if (visibleInsights.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-lg font-semibold text-foreground">Latest Insights</h2>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {visibleInsights.length} new
        </Badge>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {visibleInsights.map((insight) => {
          const confidence = confidenceConfig[insight.pattern.confidence];
          const TrendIcon = insight.pattern.trend === 'increasing' ? TrendingUp : 
                           insight.pattern.trend === 'decreasing' ? TrendingDown : Minus;
          
          return (
            <div
              key={insight.id}
              className="w-[85%] flex-shrink-0 snap-center rounded-2xl bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{insight.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(insight.createdAt).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </p>
                  </div>
                </div>
                <Badge className={cn('text-[10px]', confidence.className)}>
                  {confidence.label}
                </Badge>
              </div>
              
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {insight.narrative}
              </p>
              
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">₹{insight.pattern.averageAmount}</span>
                <span>avg</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <TrendIcon className={cn(
                    "h-3 w-3",
                    insight.pattern.trend === 'increasing' && "text-destructive",
                    insight.pattern.trend === 'decreasing' && "text-[hsl(var(--success))]"
                  )} />
                  {insight.pattern.trend}
                </span>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant={insight.userFeedback === 'accurate' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onFeedback(insight.id, 'accurate')}
                  className="flex-1 h-9 rounded-xl"
                >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  That's me
                </Button>
                <Button
                  variant={insight.userFeedback === 'not_quite' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onFeedback(insight.id, 'not_quite')}
                  className="flex-1 h-9 rounded-xl"
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
        <div className="flex justify-center gap-1.5">
          {visibleInsights.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                idx === currentIndex 
                  ? "w-6 bg-primary" 
                  : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
