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
        "relative overflow-hidden rounded-3xl p-5 transition-all duration-300 card-hover",
        variant === 'primary' 
          ? "bg-gradient-to-br from-primary via-primary to-[hsl(260_80%_60%)] shadow-lg" 
          : "bg-card shadow-md",
        onClick && "cursor-pointer active:scale-[0.98]"
      )}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl",
            variant === 'primary' 
              ? "bg-primary-foreground/20 backdrop-blur-sm" 
              : "bg-primary/10"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              variant === 'primary' ? "text-primary-foreground" : "text-primary"
            )} strokeWidth={1.5} />
          </div>
          
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
              variant === 'primary'
                ? isPositive 
                  ? "bg-primary-foreground/20 text-primary-foreground" 
                  : "bg-primary-foreground/20 text-primary-foreground"
                : isPositive 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
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
        
        <div className="mt-4">
          <p className={cn(
            "text-3xl font-bold tracking-tight",
            variant === 'primary' ? "text-primary-foreground" : "text-foreground"
          )}>
            {value}
          </p>
          <div className="flex items-center justify-between mt-1">
            <div>
              <p className={cn(
                "text-sm font-medium",
                variant === 'primary' ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {title}
              </p>
              {subtitle && (
                <p className={cn(
                  "text-xs",
                  variant === 'primary' ? "text-primary-foreground/60" : "text-muted-foreground/80"
                )}>
                  {subtitle}
                </p>
              )}
            </div>
            {onClick && (
              <ChevronRight className={cn(
                "h-4 w-4",
                variant === 'primary' ? "text-primary-foreground/60" : "text-muted-foreground"
              )} />
            )}
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      {variant === 'primary' && (
        <>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-foreground/10 blur-2xl" />
          <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-primary-foreground/5 blur-xl" />
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
        "flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm card-hover",
        onClick && "cursor-pointer active:scale-[0.98]"
      )}
    >
      <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", color)}>
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <p className="text-lg font-bold text-foreground tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      {onClick && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
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
    <div className="px-4 sm:px-5 lg:px-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
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
      
      <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
        <MiniStat
          icon={Target}
          value={String(patternCount)}
          label="Active Patterns"
          color="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
          onClick={() => onNavigate?.('patterns')}
        />
        <MiniStat
          icon={Lightbulb}
          value={String(insightCount)}
          label="New Insights"
          color="bg-primary/10 text-primary"
          onClick={() => onNavigate?.('insights')}
        />
      </div>
    </div>
  );
}
