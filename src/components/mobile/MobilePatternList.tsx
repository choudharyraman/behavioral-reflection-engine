import { SpendingPattern, TransactionCategory } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Film, 
  Receipt, 
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight
} from 'lucide-react';

interface MobilePatternListProps {
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

const categoryGradients: Record<TransactionCategory, string> = {
  food: 'from-[hsl(var(--category-food))] to-[hsl(var(--category-food))]/80',
  transport: 'from-[hsl(var(--category-transport))] to-[hsl(var(--category-transport))]/80',
  shopping: 'from-[hsl(var(--category-shopping))] to-[hsl(var(--category-shopping))]/80',
  entertainment: 'from-[hsl(var(--category-entertainment))] to-[hsl(var(--category-entertainment))]/80',
  bills: 'from-[hsl(var(--category-bills))] to-[hsl(var(--category-bills))]/80',
  health: 'from-[hsl(var(--category-health))] to-[hsl(var(--category-health))]/80',
  other: 'from-muted to-muted/80',
};

const confidenceBadges = {
  strong: { label: 'Strong', variant: 'default' as const, className: 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]' },
  emerging: { label: 'Emerging', variant: 'secondary' as const, className: 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]' },
  weak: { label: 'New', variant: 'outline' as const, className: '' },
};

export function MobilePatternList({ patterns, onPatternClick }: MobilePatternListProps) {
  return (
    <div className="space-y-3 px-4 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Detected Patterns</h2>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {patterns.length} found
        </Badge>
      </div>
      
      <div className="space-y-3">
        {patterns.map((pattern) => {
          const Icon = categoryIcons[pattern.category];
          const TrendIcon = pattern.trend === 'increasing' ? TrendingUp : 
                           pattern.trend === 'decreasing' ? TrendingDown : Minus;
          const badge = confidenceBadges[pattern.confidence];
          
          return (
            <div
              key={pattern.id}
              onClick={() => onPatternClick(pattern)}
              className="group flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm transition-all active:scale-[0.98]"
            >
              <div className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br",
                categoryGradients[pattern.category]
              )}>
                <Icon className="h-6 w-6 text-primary-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground truncate">{pattern.title}</h3>
                  <Badge className={cn("text-[10px] shrink-0", badge.className)}>
                    {badge.label}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                  {pattern.description}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">₹{pattern.averageAmount}</span>
                  <span>•</span>
                  <span>{pattern.timeRange}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <TrendIcon className={cn(
                      "h-3 w-3",
                      pattern.trend === 'increasing' && "text-destructive",
                      pattern.trend === 'decreasing' && "text-[hsl(var(--success))]"
                    )} />
                    {pattern.trend}
                  </span>
                </div>
              </div>
              
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
