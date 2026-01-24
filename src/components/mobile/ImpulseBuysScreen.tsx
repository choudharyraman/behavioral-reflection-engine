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
    <div className="flex flex-col min-h-full pb-24 px-4 sm:px-5 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-10 w-10 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Impulse Buys</h1>
            <p className="text-sm text-muted-foreground">Unplanned purchases this month</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <Zap className="h-5 w-5 text-[hsl(var(--warning))] mb-2" />
            <p className="text-2xl font-bold text-foreground">{impulseBuys.length}</p>
            <p className="text-xs text-muted-foreground">Total buys</p>
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <TrendingDown className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">₹{avgAmount.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Avg amount</p>
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <Clock className="h-5 w-5 text-[hsl(var(--success))] mb-2" />
            <p className="text-2xl font-bold text-foreground capitalize">{peakTime}</p>
            <p className="text-xs text-muted-foreground">Peak time</p>
          </div>
        </div>

        {/* Insight Card */}
        <div className="mt-6 rounded-2xl border-l-4 border-[hsl(var(--warning))] bg-card p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-[hsl(var(--warning))] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Pattern Detected</p>
              <p className="text-sm text-muted-foreground mt-1">
                Most of your impulse purchases happen during {peakTime} hours. 
                Consider setting a "pause before purchase" reminder during this time.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Recent Impulse Buys</h2>
          {impulseBuys.map((txn, idx) => (
            <div
              key={txn.id}
              className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--warning))]/10">
                <Zap className="h-5 w-5 text-[hsl(var(--warning))]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{txn.merchant}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{format(txn.timestamp, 'MMM d')}</span>
                  <span className="text-border">•</span>
                  <Clock className="h-3 w-3" />
                  <span className="capitalize">{txn.timeOfDay}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-foreground">-₹{txn.amount}</p>
            </div>
          ))}

          {impulseBuys.length === 0 && (
            <div className="text-center py-12">
              <Zap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No impulse buys detected</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Great job staying mindful!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
