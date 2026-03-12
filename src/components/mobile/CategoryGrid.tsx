import { CategoryBreakdown, TransactionCategory } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { Utensils, Car, ShoppingBag, Film, Receipt, Heart, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface CategoryGridProps {
  data: CategoryBreakdown[];
}

const categoryConfig: Record<TransactionCategory, { icon: typeof Utensils; gradient: string; label: string }> = {
  food: { icon: Utensils, gradient: 'from-[hsl(var(--category-food))] to-[hsl(var(--category-food))]/80', label: 'Food' },
  transport: { icon: Car, gradient: 'from-[hsl(var(--category-transport))] to-[hsl(var(--category-transport))]/80', label: 'Transport' },
  shopping: { icon: ShoppingBag, gradient: 'from-[hsl(var(--category-shopping))] to-[hsl(var(--category-shopping))]/80', label: 'Shopping' },
  entertainment: { icon: Film, gradient: 'from-[hsl(var(--category-entertainment))] to-[hsl(var(--category-entertainment))]/80', label: 'Entertainment' },
  bills: { icon: Receipt, gradient: 'from-[hsl(var(--category-bills))] to-[hsl(var(--category-bills))]/80', label: 'Bills' },
  health: { icon: Heart, gradient: 'from-[hsl(var(--category-health))] to-[hsl(var(--category-health))]/80', label: 'Health' },
  other: { icon: Receipt, gradient: 'from-muted to-muted/80', label: 'Other' },
};

export function CategoryGrid({ data }: CategoryGridProps) {
  const total = data.reduce((sum, item) => sum + item.total, 0);
  
  return (
    <div className="space-y-5 px-5 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Categories</h2>
          <p className="text-sm text-muted-foreground font-medium">Where your money goes</p>
        </div>
        <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline transition-all">
          View all <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
      
      {/* Progress bar - neumorphic inset */}
      <div className="flex h-4 overflow-hidden rounded-full neu-inset-sm">
        {data.map((item, idx) => (
          <div
            key={item.category}
            className={cn("h-full bg-gradient-to-r transition-all duration-500", categoryConfig[item.category].gradient, idx === 0 && "rounded-l-full", idx === data.length - 1 && "rounded-r-full")}
            style={{ width: `${item.percentage}%` }}
          />
        ))}
      </div>
      
      {/* Category cards */}
      <div className="grid grid-cols-3 gap-3">
        {data.slice(0, 6).map((item, idx) => {
          const config = categoryConfig[item.category];
          const Icon = config.icon;
          const isPositive = item.trend > 0;
          
          return (
            <div
              key={item.category}
              className="flex flex-col items-center rounded-2xl p-4 neu-raised-sm neu-card-hover animate-scale-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm", config.gradient)}>
                <Icon className="h-6 w-6 text-primary-foreground" strokeWidth={2} />
              </div>
              <p className="mt-3 text-xs font-semibold text-muted-foreground">{config.label}</p>
              <p className="text-lg font-bold text-foreground tracking-tight">₹{(item.total / 1000).toFixed(1)}K</p>
              <div className={cn("mt-1.5 flex items-center gap-1 text-[11px] font-bold",
                isPositive ? "text-destructive" : "text-[hsl(var(--success))]",
                item.trend === 0 && "text-muted-foreground"
              )}>
                {item.trend !== 0 && (
                  <>
                    {isPositive ? <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} /> : <TrendingDown className="h-3.5 w-3.5" strokeWidth={2.5} />}
                    {Math.abs(item.trend)}%
                  </>
                )}
                {item.trend === 0 && <span>—</span>}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Total card */}
      <div className="flex items-center justify-between rounded-2xl px-6 py-5 neu-raised-sm">
        <span className="text-base font-semibold text-muted-foreground">Total This Month</span>
        <span className="text-2xl font-bold text-foreground tracking-tight">₹{total.toLocaleString()}</span>
      </div>
    </div>
  );
}
