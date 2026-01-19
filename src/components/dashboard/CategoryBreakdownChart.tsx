import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  PieChart
} from 'lucide-react';

interface CategoryBreakdownChartProps {
  data: CategoryBreakdown[];
}

const categoryConfig: Record<TransactionCategory, { 
  icon: typeof Utensils; 
  color: string;
  bgColor: string;
  label: string;
}> = {
  food: { 
    icon: Utensils, 
    color: 'text-[hsl(var(--category-food))]',
    bgColor: 'bg-[hsl(var(--category-food))]',
    label: 'Food & Dining'
  },
  transport: { 
    icon: Car, 
    color: 'text-[hsl(var(--category-transport))]',
    bgColor: 'bg-[hsl(var(--category-transport))]',
    label: 'Transport'
  },
  shopping: { 
    icon: ShoppingBag, 
    color: 'text-[hsl(var(--category-shopping))]',
    bgColor: 'bg-[hsl(var(--category-shopping))]',
    label: 'Shopping'
  },
  entertainment: { 
    icon: Film, 
    color: 'text-[hsl(var(--category-entertainment))]',
    bgColor: 'bg-[hsl(var(--category-entertainment))]',
    label: 'Entertainment'
  },
  bills: { 
    icon: Receipt, 
    color: 'text-[hsl(var(--category-bills))]',
    bgColor: 'bg-[hsl(var(--category-bills))]',
    label: 'Bills & Utilities'
  },
  health: { 
    icon: Heart, 
    color: 'text-[hsl(var(--category-health))]',
    bgColor: 'bg-[hsl(var(--category-health))]',
    label: 'Health'
  },
  other: { 
    icon: Receipt, 
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    label: 'Other'
  },
};

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  const total = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PieChart className="h-5 w-5 text-primary" />
          Spending by Category
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          This month's breakdown
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual bar chart */}
        <div className="flex h-4 overflow-hidden rounded-full bg-muted/30">
          {data.map((item) => (
            <div
              key={item.category}
              className={cn("h-full transition-all", categoryConfig[item.category].bgColor)}
              style={{ width: `${item.percentage}%` }}
              title={`${categoryConfig[item.category].label}: ${item.percentage}%`}
            />
          ))}
        </div>

        {/* Category list */}
        <div className="space-y-3">
          {data.map((item) => {
            const config = categoryConfig[item.category];
            const Icon = config.icon;
            const isPositive = item.trend > 0;
            const TrendIcon = isPositive ? TrendingUp : TrendingDown;

            return (
              <div
                key={item.category}
                className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    config.bgColor
                  )}>
                    <Icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{config.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.transactionCount} transactions
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    ₹{item.total.toLocaleString()}
                  </p>
                  <div className={cn(
                    "flex items-center justify-end gap-1 text-xs",
                    isPositive ? "text-destructive" : "text-[hsl(var(--success))]",
                    item.trend === 0 && "text-muted-foreground"
                  )}>
                    {item.trend !== 0 && (
                      <>
                        <TrendIcon className="h-3 w-3" />
                        <span>{Math.abs(item.trend)}%</span>
                      </>
                    )}
                    {item.trend === 0 && <span>No change</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-medium text-muted-foreground">Total Spending</span>
          <span className="text-xl font-bold text-foreground">
            ₹{total.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
