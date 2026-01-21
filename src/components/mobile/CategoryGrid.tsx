import { CategoryBreakdown, TransactionCategory } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Film, 
  Receipt, 
  Heart,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface CategoryGridProps {
  data: CategoryBreakdown[];
}

const categoryConfig: Record<TransactionCategory, { 
  icon: typeof Utensils; 
  gradient: string;
  label: string;
}> = {
  food: { 
    icon: Utensils, 
    gradient: 'from-[hsl(var(--category-food))] to-[hsl(var(--category-food))]/80',
    label: 'Food'
  },
  transport: { 
    icon: Car, 
    gradient: 'from-[hsl(var(--category-transport))] to-[hsl(var(--category-transport))]/80',
    label: 'Transport'
  },
  shopping: { 
    icon: ShoppingBag, 
    gradient: 'from-[hsl(var(--category-shopping))] to-[hsl(var(--category-shopping))]/80',
    label: 'Shopping'
  },
  entertainment: { 
    icon: Film, 
    gradient: 'from-[hsl(var(--category-entertainment))] to-[hsl(var(--category-entertainment))]/80',
    label: 'Fun'
  },
  bills: { 
    icon: Receipt, 
    gradient: 'from-[hsl(var(--category-bills))] to-[hsl(var(--category-bills))]/80',
    label: 'Bills'
  },
  health: { 
    icon: Heart, 
    gradient: 'from-[hsl(var(--category-health))] to-[hsl(var(--category-health))]/80',
    label: 'Health'
  },
  other: { 
    icon: Receipt, 
    gradient: 'from-muted to-muted/80',
    label: 'Other'
  },
};

export function CategoryGrid({ data }: CategoryGridProps) {
  const total = data.reduce((sum, item) => sum + item.total, 0);
  
  return (
    <div className="space-y-3 px-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Spending Categories</h2>
        <span className="text-sm text-muted-foreground">This month</span>
      </div>
      
      {/* Visual breakdown bar */}
      <div className="flex h-3 overflow-hidden rounded-full bg-muted/30">
        {data.map((item) => (
          <div
            key={item.category}
            className={cn("h-full bg-gradient-to-r", categoryConfig[item.category].gradient)}
            style={{ width: `${item.percentage}%` }}
          />
        ))}
      </div>
      
      {/* Category grid */}
      <div className="grid grid-cols-3 gap-2">
        {data.slice(0, 6).map((item) => {
          const config = categoryConfig[item.category];
          const Icon = config.icon;
          const isPositive = item.trend > 0;
          
          return (
            <div
              key={item.category}
              className="flex flex-col items-center rounded-2xl bg-card p-3 shadow-sm"
            >
              <div className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br",
                config.gradient
              )}>
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="mt-2 text-xs font-medium text-foreground">{config.label}</p>
              <p className="text-sm font-bold text-foreground">
                ₹{(item.total / 1000).toFixed(1)}K
              </p>
              <div className={cn(
                "flex items-center gap-0.5 text-[10px]",
                isPositive ? "text-destructive" : "text-[hsl(var(--success))]",
                item.trend === 0 && "text-muted-foreground"
              )}>
                {item.trend !== 0 && (
                  <>
                    {isPositive ? (
                      <TrendingUp className="h-2.5 w-2.5" />
                    ) : (
                      <TrendingDown className="h-2.5 w-2.5" />
                    )}
                    {Math.abs(item.trend)}%
                  </>
                )}
                {item.trend === 0 && <span>—</span>}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Total */}
      <div className="flex items-center justify-between rounded-2xl bg-card/50 px-4 py-3">
        <span className="text-sm text-muted-foreground">Total This Month</span>
        <span className="text-xl font-bold text-foreground">₹{total.toLocaleString()}</span>
      </div>
    </div>
  );
}
