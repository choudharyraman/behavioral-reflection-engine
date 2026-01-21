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
  Minus,
  ChevronRight,
  Sparkles
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
  strong: { 
    label: 'Strong', 
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

export function MobilePatternList({ patterns, onPatternClick }: MobilePatternListProps) {
  return (
    <div className="space-y-4 px-5 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">Patterns</h2>
          <p className="text-sm text-muted-foreground">Behaviors we've detected</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">{patterns.length} found</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {patterns.map((pattern, idx) => {
          const Icon = categoryIcons[pattern.category];
          const TrendIcon = pattern.trend === 'increasing' ? TrendingUp : 
                           pattern.trend === 'decreasing' ? TrendingDown : Minus;
          const badge = confidenceBadges[pattern.confidence];
          
          return (
            <div
              key={pattern.id}
              onClick={() => onPatternClick(pattern)}
              className="group flex items-center gap-4 rounded-3xl bg-card p-4 shadow-sm transition-all duration-300 card-hover animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm",
                categoryGradients[pattern.category]
              )}>
                <Icon className="h-6 w-6 text-primary-foreground" strokeWidth={1.5} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate tracking-tight">{pattern.title}</h3>
                  <span className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    badge.className
                  )}>
                    {badge.label}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                  {pattern.description}
                </p>
                
                {/* Stats row */}
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">₹{pattern.averageAmount}</span>
                  <span className="text-border">•</span>
                  <span>{pattern.timeRange}</span>
                  <span className="text-border">•</span>
                  <span className="flex items-center gap-1">
                    <TrendIcon className={cn(
                      "h-3 w-3",
                      pattern.trend === 'increasing' && "text-destructive",
                      pattern.trend === 'decreasing' && "text-[hsl(var(--success))]"
                    )} strokeWidth={2} />
                    <span className="capitalize">{pattern.trend}</span>
                  </span>
                </div>
              </div>
              
              <ChevronRight className="h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
