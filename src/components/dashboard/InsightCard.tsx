import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ThumbsUp, 
  ThumbsDown, 
  ChevronRight, 
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
  Info
} from 'lucide-react';
import { InsightCard as InsightCardType } from '@/types/transaction';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  insight: InsightCardType;
  onFeedback: (id: string, feedback: 'accurate' | 'not_quite') => void;
  onExpand: (id: string) => void;
}

const confidenceConfig = {
  strong: { 
    label: 'Recurring pattern', 
    className: 'bg-[hsl(var(--confidence-strong))] text-[hsl(var(--success-foreground))]' 
  },
  emerging: { 
    label: 'Emerging pattern', 
    className: 'bg-[hsl(var(--confidence-emerging))] text-[hsl(var(--warning-foreground))]' 
  },
  weak: { 
    label: 'Possible pattern', 
    className: 'bg-[hsl(var(--confidence-weak))] text-foreground' 
  },
};

const trendIcons = {
  increasing: TrendingUp,
  stable: Minus,
  decreasing: TrendingDown,
};

export function InsightCard({ insight, onFeedback, onExpand }: InsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const confidence = confidenceConfig[insight.pattern.confidence];
  const TrendIcon = trendIcons[insight.pattern.trend];

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Lightbulb className="h-4 w-4 text-primary" />
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
          <Badge className={cn('text-xs', confidence.className)}>
            {confidence.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {insight.narrative}
        </p>

        {isExpanded && (
          <div className="mt-4 space-y-3 rounded-lg bg-muted/30 p-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Occurrences</span>
              <span className="font-medium text-foreground">{insight.pattern.occurrences} times</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Time range</span>
              <span className="font-medium text-foreground">{insight.pattern.timeRange}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Average amount</span>
              <span className="font-medium text-foreground">₹{insight.pattern.averageAmount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Trend</span>
              <div className="flex items-center gap-1">
                <TrendIcon className={cn(
                  "h-4 w-4",
                  insight.pattern.trend === 'increasing' && "text-destructive",
                  insight.pattern.trend === 'decreasing' && "text-[hsl(var(--success))]",
                  insight.pattern.trend === 'stable' && "text-muted-foreground"
                )} />
                <span className="font-medium capitalize text-foreground">{insight.pattern.trend}</span>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 w-full text-primary hover:text-primary"
              onClick={() => onExpand(insight.id)}
            >
              <Info className="mr-2 h-4 w-4" />
              How we detected this
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/50 pt-3">
        <div className="flex gap-2">
          <Button
            variant={insight.userFeedback === 'accurate' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFeedback(insight.id, 'accurate')}
            className="h-8"
          >
            <ThumbsUp className="mr-1 h-3 w-3" />
            Yes, that's me
          </Button>
          <Button
            variant={insight.userFeedback === 'not_quite' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFeedback(insight.id, 'not_quite')}
            className="h-8"
          >
            <ThumbsDown className="mr-1 h-3 w-3" />
            Not quite
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8"
        >
          {isExpanded ? 'Less' : 'More'}
          <ChevronRight className={cn(
            "ml-1 h-4 w-4 transition-transform",
            isExpanded && "rotate-90"
          )} />
        </Button>
      </CardFooter>
    </Card>
  );
}
