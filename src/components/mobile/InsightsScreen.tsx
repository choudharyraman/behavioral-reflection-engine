import { InsightCard as InsightCardType } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { Lightbulb, ArrowLeft, TrendingUp, TrendingDown, Minus, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface InsightsScreenProps { insights: InsightCardType[]; onBack: () => void; onFeedback: (id: string, feedback: 'accurate' | 'not_quite') => void; }

const confidenceConfig = {
  strong: { label: 'High confidence', className: 'bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]' },
  emerging: { label: 'Emerging', className: 'bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]' },
  weak: { label: 'New pattern', className: 'neu-inset-sm text-muted-foreground' },
};
type FilterType = 'all' | 'strong' | 'emerging' | 'actionable';

export function InsightsScreen({ insights, onBack, onFeedback }: InsightsScreenProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const filteredInsights = insights.filter(insight => { if (filter === 'all') return true; if (filter === 'actionable') return insight.actionable; return insight.pattern.confidence === filter; });
  const unreviewedCount = insights.filter(i => !i.userFeedback).length;
  const accurateCount = insights.filter(i => i.userFeedback === 'accurate').length;

  return (
    <div className="flex flex-col min-h-full pb-28 px-5">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-4 py-5">
          <button onClick={onBack} className="h-11 w-11 rounded-xl neu-button flex items-center justify-center"><ArrowLeft className="h-5 w-5" strokeWidth={2} /></button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Insights</h1>
            <p className="text-sm text-muted-foreground font-medium">AI-detected spending patterns</p>
          </div>
          <div className="flex items-center gap-2 rounded-full px-3 py-1.5 neu-raised-sm">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
            <span className="text-xs font-bold text-primary">{unreviewedCount} new</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="rounded-2xl p-5 neu-raised"><p className="text-3xl font-bold text-foreground">{insights.length}</p><p className="text-sm text-muted-foreground font-medium">Total insights</p></div>
          <div className="rounded-2xl p-5 neu-raised"><p className="text-3xl font-bold text-[hsl(var(--success))]">{accurateCount}</p><p className="text-sm text-muted-foreground font-medium">Confirmed accurate</p></div>
        </div>

        <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
          {(['all', 'strong', 'emerging', 'actionable'] as FilterType[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("shrink-0 rounded-xl text-sm font-semibold h-10 px-4 transition-all", filter === f ? "bg-primary text-primary-foreground shadow-md" : "neu-button")}>
              {f === 'all' && 'All'}{f === 'strong' && 'High Confidence'}{f === 'emerging' && 'Emerging'}{f === 'actionable' && 'Has Action'}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          {filteredInsights.map((insight, idx) => {
            const TrendIcon = insight.pattern.trend === 'increasing' ? TrendingUp : insight.pattern.trend === 'decreasing' ? TrendingDown : Minus;
            const config = confidenceConfig[insight.pattern.confidence];
            return (
              <div key={insight.id} className={cn("rounded-2xl p-5 neu-raised-sm animate-fade-in transition-all", insight.userFeedback && "opacity-70")} style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl neu-inset-sm"><Lightbulb className="h-6 w-6 text-primary" strokeWidth={2} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-foreground">{insight.title}</h3>
                      <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold", config.className)}>{config.label}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{insight.narrative}</p>
                    <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-bold text-foreground">₹{insight.pattern.averageAmount}</span><span>•</span><span className="font-medium">{insight.pattern.timeRange}</span><span>•</span>
                      <span className="flex items-center gap-1">
                        <TrendIcon className={cn("h-4 w-4", insight.pattern.trend === 'increasing' && "text-destructive", insight.pattern.trend === 'decreasing' && "text-[hsl(var(--success))]")} strokeWidth={2.5} />
                        <span className="capitalize font-medium">{insight.pattern.trend}</span>
                      </span>
                    </div>
                    {insight.actionable && <div className="mt-4 rounded-xl p-4 neu-inset-sm"><p className="text-sm font-semibold text-primary">💡 Consider reviewing this pattern</p></div>}
                    {!insight.userFeedback ? (
                      <div className="mt-4 flex gap-3">
                        <button onClick={() => onFeedback(insight.id, 'accurate')} className="flex-1 h-11 rounded-xl text-sm font-semibold neu-button flex items-center justify-center gap-2 hover:text-[hsl(var(--success))]"><ThumbsUp className="h-4 w-4" strokeWidth={2} /> Accurate</button>
                        <button onClick={() => onFeedback(insight.id, 'not_quite')} className="flex-1 h-11 rounded-xl text-sm font-semibold neu-button flex items-center justify-center gap-2"><ThumbsDown className="h-4 w-4" strokeWidth={2} /> Not quite</button>
                      </div>
                    ) : <p className="mt-4 text-sm text-muted-foreground font-medium">✓ Marked as {insight.userFeedback === 'accurate' ? 'accurate' : 'needs refinement'}</p>}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredInsights.length === 0 && (
            <div className="text-center py-16"><div className="h-20 w-20 rounded-2xl neu-raised flex items-center justify-center mx-auto mb-5"><Lightbulb className="h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} /></div><p className="text-lg font-semibold text-muted-foreground">No insights match this filter</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
