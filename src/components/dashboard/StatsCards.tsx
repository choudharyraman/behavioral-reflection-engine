import { Card, CardContent } from '@/components/ui/card';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: typeof Wallet;
  iconColor: string;
}

function StatCard({ title, value, change, icon: Icon, iconColor }: StatCardProps) {
  const isPositive = change && change > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
            {change !== undefined && (
              <div className={cn(
                "mt-1 flex items-center gap-1 text-xs",
                isPositive ? "text-destructive" : "text-[hsl(var(--success))]"
              )}>
                <TrendIcon className="h-3 w-3" />
                <span>{Math.abs(change)}% vs last month</span>
              </div>
            )}
          </div>
          <div className={cn("rounded-lg p-2", iconColor)}>
            <Icon className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Spent"
        value="₹38,700"
        change={8}
        icon={Wallet}
        iconColor="bg-primary"
      />
      <StatCard
        title="Active Patterns"
        value="4"
        icon={Target}
        iconColor="bg-[hsl(var(--category-shopping))]"
      />
      <StatCard
        title="Impulse Purchases"
        value="12"
        change={-15}
        icon={Zap}
        iconColor="bg-[hsl(var(--category-entertainment))]"
      />
      <StatCard
        title="Insights This Week"
        value="3"
        icon={TrendingUp}
        iconColor="bg-[hsl(var(--success))]"
      />
    </div>
  );
}
