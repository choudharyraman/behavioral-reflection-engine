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
  TrendingDown,
  ArrowRight
} from 'lucide-react';

interface CategoryGridProps {
  data: CategoryBreakdown[];
}

const categoryConfig: Record<TransactionCategory, { 
  icon: typeof Utensils; 
  gradient: string;
  bgLight: string;
  label: string;
}> = {
  food: { 
    icon: Utensils, 
    gradient: 'from-[hsl(var(--category-food))] to-[hsl(var(--category-food))]/80',
    bgLight: 'bg-[hsl(var(--category-food))]/10',
    label: 'Food'
  },
  transport: { 
    icon: Car, 
    gradient: 'from-[hsl(var(--category-transport))] to-[hsl(var(--category-transport))]/80',
    bgLight: 'bg-[hsl(var(--category-transport))]/10',
    label: 'Transport'
  },
  shopping: { 
    icon: ShoppingBag, 
    gradient: 'from-[hsl(var(--category-shopping))] to-[hsl(var(--category-shopping))]/80',
    bgLight: 'bg-[hsl(var(--category-shopping))]/10',
    label: 'Shopping'
  },
  entertainment: { 
    icon: Film, 
    gradient: 'from-[hsl(var(--category-entertainment))] to-[hsl(var(--category-entertainment))]/80',
    bgLight: 'bg-[hsl(var(--category-entertainment))]/10',
    label: 'Entertainment'
  },
  bills: { 
    icon: Receipt, 
    gradient: 'from-[hsl(var(--category-bills))] to-[hsl(var(--category-bills))]/80',
    bgLight: 'bg-[hsl(var(--category-bills))]/10',
    label: 'Bills'
  },
  health: { 
    icon: Heart, 
    gradient: 'from-[hsl(var(--category-health))] to-[hsl(var(--category-health))]/80',
    bgLight: 'bg-[hsl(var(--category-health))]/10',
    label: 'Health'
  },
  other: { 
    icon: Receipt, 
    gradient: 'from-muted to-muted/80',
    bgLight: 'bg-muted/50',
    label: 'Other'
  },
};

export function CategoryGrid({ data }: CategoryGridProps) {
  const total = data.reduce((sum, item) => sum + item.total, 0);
  
  return (
    <div className="space-y-4 px-4 sm:px-5 lg:px-8 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">Categories</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Where your money goes</p>
        </div>
        <button className="flex items-center gap-1 text-xs sm:text-sm font-medium text-primary hover:underline transition-all">
          View all
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>
      
      {/* Visual breakdown bar */}
      <div className="flex h-3 sm:h-4 overflow-hidden rounded-full bg-muted/30 shadow-inner">
        {data.map((item, idx) => (
          <div
            key={item.category}
            className={cn(
              "h-full bg-gradient-to-r transition-all duration-500 cursor-pointer hover:opacity-80",
              categoryConfig[item.category].gradient,
              idx === 0 && "rounded-l-full",
              idx === data.length - 1 && "rounded-r-full"
            )}
            style={{ 
              width: `${item.percentage}%`,
              animationDelay: `${idx * 100}ms`
            }}
          />
        ))}
      </div>
      
      {/* Category grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {data.slice(0, 6).map((item, idx) => {
          const config = categoryConfig[item.category];
          const Icon = config.icon;
          const isPositive = item.trend > 0;
          
          return (
            <div
              key={item.category}
              className="flex flex-col items-center rounded-3xl bg-card p-4 shadow-sm card-hover animate-scale-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm",
                config.gradient
              )}>
                <Icon className="h-5 w-5 text-primary-foreground" strokeWidth={1.5} />
              </div>
              <p className="mt-3 text-xs font-medium text-muted-foreground">{config.label}</p>
              <p className="text-base font-bold text-foreground tracking-tight">
                ₹{(item.total / 1000).toFixed(1)}K
              </p>
              <div className={cn(
                "mt-1 flex items-center gap-0.5 text-[10px] font-medium",
                isPositive ? "text-destructive" : "text-[hsl(var(--success))]",
                item.trend === 0 && "text-muted-foreground"
              )}>
                {item.trend !== 0 && (
                  <>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(item.trend)}%
                  </>
                )}
                {item.trend === 0 && <span className="text-muted-foreground">—</span>}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Total card */}
      <div className="flex items-center justify-between rounded-3xl bg-card/80 px-5 py-4 shadow-sm">
        <span className="text-sm font-medium text-muted-foreground">Total This Month</span>
        <span className="text-2xl font-bold text-foreground tracking-tight">
          ₹{total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
