import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SpendingPattern, TransactionCategory } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Film, 
  Receipt, 
  Heart,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface PatternTimelineProps {
  patterns: SpendingPattern[];
  onPatternClick: (pattern: SpendingPattern) => void;
}

const categoryIcons: Record<TransactionCategory, typeof Utensils> = {
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  entertainment: Film,
  bills: Receipt,
  health: Heart,
  other: Receipt,
};

const categoryColors: Record<TransactionCategory, string> = {
  food: 'bg-[hsl(var(--category-food))]',
  transport: 'bg-[hsl(var(--category-transport))]',
  shopping: 'bg-[hsl(var(--category-shopping))]',
  entertainment: 'bg-[hsl(var(--category-entertainment))]',
  bills: 'bg-[hsl(var(--category-bills))]',
  health: 'bg-[hsl(var(--category-health))]',
  other: 'bg-muted',
};

const confidenceBadges = {
  strong: { label: '6+ occurrences', variant: 'default' as const },
  emerging: { label: '3-5 occurrences', variant: 'secondary' as const },
  weak: { label: 'New signal', variant: 'outline' as const },
};

export function PatternTimeline({ patterns, onPatternClick }: PatternTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Detected Patterns
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 h-full w-0.5 bg-border" />

          {patterns.map((pattern, index) => {
            const Icon = categoryIcons[pattern.category];
            const TrendIcon = pattern.trend === 'increasing' ? TrendingUp : 
                             pattern.trend === 'decreasing' ? TrendingDown : Minus;
            
            return (
              <div
                key={pattern.id}
                className="group relative flex cursor-pointer gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
                onClick={() => onPatternClick(pattern)}
              >
                {/* Timeline dot */}
                <div className={cn(
                  "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  categoryColors[pattern.category]
                )}>
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {pattern.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {pattern.description}
                      </p>
                    </div>
                    <Badge variant={confidenceBadges[pattern.confidence].variant}>
                      {confidenceBadges[pattern.confidence].label}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="font-medium text-foreground">₹{pattern.averageAmount}</span>
                      avg
                    </span>
                    <span>•</span>
                    <span>{pattern.timeRange}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <TrendIcon className={cn(
                        "h-3 w-3",
                        pattern.trend === 'increasing' && "text-destructive",
                        pattern.trend === 'decreasing' && "text-[hsl(var(--success))]",
                        pattern.trend === 'stable' && "text-muted-foreground"
                      )} />
                      {pattern.trend}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
