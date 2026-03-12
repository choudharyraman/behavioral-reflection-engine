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
        "relative overflow-hidden rounded-2xl p-5 transition-all duration-300",
        variant === 'primary' 
          ? "bg-gradient-to-br from-primary to-[hsl(230_80%_65%)] shadow-lg" 
          : "neu-raised neu-card-hover",
        onClick && "cursor-pointer active:scale-[0.98]"
      )}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            variant === 'primary' 
              ? "bg-primary-foreground/20" 
              : "neu-inset-sm"
          )}>
            <Icon className={cn("h-6 w-6", variant === 'primary' ? "text-primary-foreground" : "text-primary")} strokeWidth={2} />
          </div>
          
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
              variant === 'primary'
                ? "bg-primary-foreground/20 text-primary-foreground" 
                : isPositive 
                  ? "text-destructive bg-destructive/10" 
                  : "text-[hsl(var(--success))] bg-[hsl(var(--success))]/10"
            )}>
              {isPositive ? <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} /> : <TrendingDown className="h-3.5 w-3.5" strokeWidth={2.5} />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        
        <div className="mt-5">
          <p className={cn("text-3xl font-extrabold tracking-tight", variant === 'primary' ? "text-primary-foreground" : "text-foreground")}>
            {value}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className={cn("text-sm font-semibold", variant === 'primary' ? "text-primary-foreground/90" : "text-muted-foreground")}>{title}</p>
              {subtitle && <p className={cn("text-xs font-medium", variant === 'primary' ? "text-primary-foreground/70" : "text-muted-foreground/80")}>{subtitle}</p>}
            </div>
            {onClick && <ChevronRight className={cn("h-5 w-5", variant === 'primary' ? "text-primary-foreground/70" : "text-muted-foreground")} strokeWidth={2} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, value, label, onClick }: { 
  icon: typeof Target; value: string; label: string; color?: string; onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className={cn("flex items-center gap-3 rounded-2xl p-4 neu-raised-sm neu-card-hover", onClick && "cursor-pointer active:scale-[0.98]")}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl neu-inset-sm">
        <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
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

export function QuickStats({ onNavigate, totalSpent = 38700, impulseCount = 12, patternCount = 4, insightCount = 3 }: QuickStatsProps) {
  return (
    <div className="px-5">
      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        <QuickStat title="Total Spent" value={`₹${(totalSpent / 1000).toFixed(1)}K`} subtitle="This month" change={8} icon={Wallet} variant="primary" onClick={() => onNavigate?.('transactions')} />
        <QuickStat title="Impulse Buys" value={String(impulseCount)} subtitle="transactions" change={-15} icon={Zap} variant="secondary" onClick={() => onNavigate?.('impulse')} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        <MiniStat icon={Target} value={String(patternCount)} label="Active Patterns" onClick={() => onNavigate?.('patterns')} />
        <MiniStat icon={Lightbulb} value={String(insightCount)} label="New Insights" onClick={() => onNavigate?.('insights')} />
      </div>
    </div>
  );
}
