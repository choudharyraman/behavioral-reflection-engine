import { Transaction } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { Zap, TrendingDown, Clock, Calendar, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface ImpulseBuysScreenProps {
  transactions: Transaction[];
  onBack: () => void;
}

export function ImpulseBuysScreen({ transactions, onBack }: ImpulseBuysScreenProps) {
  // Filter impulse buys (not recurring, amount < 1000, late night or weekends)
  const impulseBuys = transactions.filter(txn => {
    const isSmall = txn.amount < 1000;
    const isLateNight = txn.timeOfDay === 'late_night' || txn.timeOfDay === 'evening';
    const isWeekend = txn.dayOfWeek === 'saturday' || txn.dayOfWeek === 'sunday';
    return !txn.isRecurring && isSmall && (isLateNight || isWeekend);
  }).slice(0, 20);

  const totalImpulse = impulseBuys.reduce((sum, t) => sum + t.amount, 0);
  const avgAmount = impulseBuys.length > 0 ? totalImpulse / impulseBuys.length : 0;
  
  // Group by time of day
  const byTimeOfDay = impulseBuys.reduce((acc, txn) => {
    acc[txn.timeOfDay] = (acc[txn.timeOfDay] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const peakTime = Object.entries(byTimeOfDay).sort((a, b) => b[1] - a[1])[0]?.[0] || 'evening';

  return (
    <div className="flex flex-col min-h-full pb-28 px-5">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-4 py-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-11 w-11 rounded-2xl bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Impulse Buys</h1>
            <p className="text-sm text-muted-foreground font-medium">Unplanned purchases this month</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-[1.5rem] bg-card p-4 shadow-sm border border-border/50">
            <div className="h-10 w-10 rounded-xl bg-[hsl(var(--warning))]/15 flex items-center justify-center mb-2">
              <Zap className="h-5 w-5 text-[hsl(var(--warning))]" strokeWidth={2} />
            </div>
            <p className="text-2xl font-bold text-foreground">{impulseBuys.length}</p>
            <p className="text-xs text-muted-foreground font-medium">Total buys</p>
          </div>
          <div className="rounded-[1.5rem] bg-card p-4 shadow-sm border border-border/50">
            <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center mb-2">
              <TrendingDown className="h-5 w-5 text-primary" strokeWidth={2} />
            </div>
            <p className="text-2xl font-bold text-foreground">₹{avgAmount.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground font-medium">Avg amount</p>
          </div>
          <div className="rounded-[1.5rem] bg-card p-4 shadow-sm border border-border/50">
            <div className="h-10 w-10 rounded-xl bg-[hsl(var(--success))]/15 flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-[hsl(var(--success))]" strokeWidth={2} />
            </div>
            <p className="text-2xl font-bold text-foreground capitalize">{peakTime}</p>
            <p className="text-xs text-muted-foreground font-medium">Peak time</p>
          </div>
        </div>

        {/* Insight Card */}
        <div className="mt-6 rounded-[1.5rem] border-l-4 border-[hsl(var(--warning))] bg-card p-5 shadow-sm border-y border-r border-border/50">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-[hsl(var(--warning))]/15 flex items-center justify-center shrink-0">
              <Info className="h-5 w-5 text-[hsl(var(--warning))]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">Pattern Detected</p>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Most of your impulse purchases happen during {peakTime} hours. 
                Consider setting a "pause before purchase" reminder during this time.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Recent Impulse Buys</h2>
          {impulseBuys.map((txn, idx) => (
            <div
              key={txn.id}
              className="flex items-center gap-4 rounded-[1.5rem] bg-card p-4 shadow-sm border border-border/50 animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--warning))]/15">
                <Zap className="h-6 w-6 text-[hsl(var(--warning))]" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{txn.merchant}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mt-0.5">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>{format(txn.timestamp, 'MMM d')}</span>
                  <span className="text-border">•</span>
                  <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                  <span className="capitalize">{txn.timeOfDay}</span>
                </div>
              </div>
              <p className="text-base font-bold text-foreground">-₹{txn.amount}</p>
            </div>
          ))}

          {impulseBuys.length === 0 && (
            <div className="text-center py-16">
              <div className="h-20 w-20 rounded-[2rem] bg-secondary flex items-center justify-center mx-auto mb-5">
                <Zap className="h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} />
              </div>
              <p className="text-lg font-semibold text-muted-foreground">No impulse buys detected</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Great job staying mindful!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}