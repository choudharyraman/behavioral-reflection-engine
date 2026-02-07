import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, Zap, Target, Lightbulb, ChevronRight } from 'lucide-react';

interface QuickStatProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  icon: typeof Wallet;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

function QuickStat({ title, value, subtitle, change, icon: Icon, variant = 'primary', onClick }: QuickStatProps) {
  const isPositive = change && change > 0;
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] p-5 transition-all duration-300 card-hover",
        variant === 'primary' 
          ? "bg-gradient-to-br from-primary via-primary to-[hsl(290_70%_55%)] shadow-lg shadow-primary/25" 
          : "bg-card shadow-md border border-border/50",
        onClick && "cursor-pointer active:scale-[0.98]"
      )}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            variant === 'primary' 
              ? "bg-primary-foreground/20 backdrop-blur-sm" 
              : "bg-primary/10"
          )}>
            <Icon className={cn(
              "h-6 w-6",
              variant === 'primary' ? "text-primary-foreground" : "text-primary"
            )} strokeWidth={2} />
          </div>
          
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
              variant === 'primary'
                ? "bg-primary-foreground/20 text-primary-foreground" 
                : isPositive 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
            )}>
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" strokeWidth={2.5} />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        
        <div className="mt-5">
          <p className={cn(
            "text-3xl font-bold tracking-tight",
            variant === 'primary' ? "text-primary-foreground" : "text-foreground"
          )}>
            {value}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className={cn(
                "text-sm font-semibold",
                variant === 'primary' ? "text-primary-foreground/90" : "text-muted-foreground"
              )}>
                {title}
              </p>
              {subtitle && (
                <p className={cn(
                  "text-xs font-medium",
                  variant === 'primary' ? "text-primary-foreground/70" : "text-muted-foreground/80"
                )}>
                  {subtitle}
                </p>
              )}
            </div>
            {onClick && (
              <ChevronRight className={cn(
                "h-5 w-5",
                variant === 'primary' ? "text-primary-foreground/70" : "text-muted-foreground"
              )} strokeWidth={2} />
            )}
          </div>
        </div>
      </div>
      
      {/* M3 Decorative elements */}
      {variant === 'primary' && (
        <>
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary-foreground/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-primary-foreground/5 blur-xl" />
        </>
      )}
    </div>
  );
}

function MiniStat({ icon: Icon, value, label, color, onClick }: { 
  icon: typeof Target; 
  value: string; 
  label: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-[1.5rem] bg-card p-4 shadow-sm border border-border/50 card-hover",
        onClick && "cursor-pointer active:scale-[0.98]"
      )}
    >
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", color)}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="flex-1">
        <p className="text-xl font-bold text-foreground tracking-tight">{value}</p>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      {onClick && <ChevronRight className="h-5 w-5 text-muted-foreground" strokeWidth={2} />}
    </div>
  );
}

interface QuickStatsProps {
  onNavigate?: (tab: string) => void;
  totalSpent?: number;
  impulseCount?: number;
  patternCount?: number;
  insightCount?: number;
}

export function QuickStats({ 
  onNavigate,
  totalSpent = 38700,
  impulseCount = 12,
  patternCount = 4,
  insightCount = 3
}: QuickStatsProps) {
  return (
    <div className="px-5">
      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        <QuickStat
          title="Total Spent"
          value={`₹${(totalSpent / 1000).toFixed(1)}K`}
          subtitle="This month"
          change={8}
          icon={Wallet}
          variant="primary"
          onClick={() => onNavigate?.('transactions')}
        />
        <QuickStat
          title="Impulse Buys"
          value={String(impulseCount)}
          subtitle="transactions"
          change={-15}
          icon={Zap}
          variant="secondary"
          onClick={() => onNavigate?.('impulse')}
        />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        <MiniStat
          icon={Target}
          value={String(patternCount)}
          label="Active Patterns"
          color="bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]"
          onClick={() => onNavigate?.('patterns')}
        />
        <MiniStat
          icon={Lightbulb}
          value={String(insightCount)}
          label="New Insights"
          color="bg-primary/15 text-primary"
          onClick={() => onNavigate?.('insights')}
        />
      </div>
    </div>
  );
}