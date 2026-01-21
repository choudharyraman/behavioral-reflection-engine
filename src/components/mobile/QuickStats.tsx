import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, Zap, Target, Lightbulb } from 'lucide-react';

interface QuickStatProps {
  title: string;
  value: string;
  change?: number;
  icon: typeof Wallet;
  gradient: string;
}

function QuickStat({ title, value, change, icon: Icon, gradient }: QuickStatProps) {
  const isPositive = change && change > 0;
  
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-4",
      gradient
    )}>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/20 backdrop-blur-sm">
            <Icon className="h-5 w-5 text-primary-foreground" />
          </div>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium backdrop-blur-sm",
              isPositive 
                ? "bg-destructive/20 text-destructive-foreground" 
                : "bg-background/20 text-primary-foreground"
            )}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-3xl font-bold text-primary-foreground">{value}</p>
          <p className="mt-1 text-sm text-primary-foreground/80">{title}</p>
        </div>
      </div>
      
      {/* Decorative circles */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-background/10" />
      <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-background/5" />
    </div>
  );
}

export function QuickStats() {
  return (
    <div className="px-4">
      <div className="grid grid-cols-2 gap-3">
        <QuickStat
          title="Total Spent"
          value="₹38.7K"
          change={8}
          icon={Wallet}
          gradient="bg-gradient-to-br from-primary to-primary/80"
        />
        <QuickStat
          title="Impulse Buys"
          value="12"
          change={-15}
          icon={Zap}
          gradient="bg-gradient-to-br from-[hsl(var(--category-entertainment))] to-[hsl(var(--category-shopping))]"
        />
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--success))]/10">
            <Target className="h-5 w-5 text-[hsl(var(--success))]" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">4</p>
            <p className="text-xs text-muted-foreground">Active Patterns</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">3</p>
            <p className="text-xs text-muted-foreground">New Insights</p>
          </div>
        </div>
      </div>
    </div>
  );
}
