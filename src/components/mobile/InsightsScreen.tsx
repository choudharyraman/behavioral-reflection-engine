import { InsightCard as InsightCardType } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { 
  Lightbulb, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface InsightsScreenProps {
  insights: InsightCardType[];
  onBack: () => void;
  onFeedback: (id: string, feedback: 'accurate' | 'not_quite') => void;
}

const confidenceConfig = {
  strong: { label: 'High confidence', className: 'bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30' },
  emerging: { label: 'Emerging', className: 'bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30' },
  weak: { label: 'New pattern', className: 'bg-secondary text-secondary-foreground border-border' },
};

type FilterType = 'all' | 'strong' | 'emerging' | 'actionable';

export function InsightsScreen({ insights, onBack, onFeedback }: InsightsScreenProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  
  const filteredInsights = insights.filter(insight => {
    if (filter === 'all') return true;
    if (filter === 'actionable') return insight.actionable;
    return insight.pattern.confidence === filter;
  });

  const unreviewedCount = insights.filter(i => !i.userFeedback).length;
  const accurateCount = insights.filter(i => i.userFeedback === 'accurate').length;

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
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Insights</h1>
            <p className="text-sm text-muted-foreground font-medium">AI-detected spending patterns</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
            <span className="text-xs font-bold text-primary">{unreviewedCount} new</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="rounded-[1.5rem] bg-card p-5 shadow-sm border border-border/50">
            <p className="text-3xl font-bold text-foreground">{insights.length}</p>
            <p className="text-sm text-muted-foreground font-medium">Total insights</p>
          </div>
          <div className="rounded-[1.5rem] bg-card p-5 shadow-sm border border-border/50">
            <p className="text-3xl font-bold text-[hsl(var(--success))]">{accurateCount}</p>
            <p className="text-sm text-muted-foreground font-medium">Confirmed accurate</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
          {(['all', 'strong', 'emerging', 'actionable'] as FilterType[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full text-sm font-semibold shrink-0 h-10 px-4 border-2",
                filter === f 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" 
                  : "border-border"
              )}
            >
              {f === 'all' && 'All'}
              {f === 'strong' && 'High Confidence'}
              {f === 'emerging' && 'Emerging'}
              {f === 'actionable' && 'Has Action'}
            </Button>
          ))}
        </div>

        {/* Insights List */}
        <div className="mt-5 space-y-4">
          {filteredInsights.map((insight, idx) => {
            const TrendIcon = insight.pattern.trend === 'increasing' ? TrendingUp :
                              insight.pattern.trend === 'decreasing' ? TrendingDown : Minus;
            const config = confidenceConfig[insight.pattern.confidence];
            
            return (
              <div
                key={insight.id}
                className={cn(
                  "rounded-[1.5rem] bg-card p-5 shadow-sm border border-border/50 animate-fade-in transition-all",
                  insight.userFeedback && "opacity-70"
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
                    <Lightbulb className="h-6 w-6 text-primary" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-foreground">{insight.title}</h3>
                      <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-bold", config.className)}>
                        {config.label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {insight.narrative}
                    </p>
                    
                    {/* Pattern details */}
                    <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-bold text-foreground">₹{insight.pattern.averageAmount}</span>
                      <span className="text-border">•</span>
                      <span className="font-medium">{insight.pattern.timeRange}</span>
                      <span className="text-border">•</span>
                      <span className="flex items-center gap-1">
                        <TrendIcon className={cn(
                          "h-4 w-4",
                          insight.pattern.trend === 'increasing' && "text-destructive",
                          insight.pattern.trend === 'decreasing' && "text-[hsl(var(--success))]"
                        )} strokeWidth={2.5} />
                        <span className="capitalize font-medium">{insight.pattern.trend}</span>
                      </span>
                    </div>

                    {/* Action suggestion */}
                    {insight.actionable && (
                      <div className="mt-4 rounded-2xl bg-primary/10 p-4">
                        <p className="text-sm font-semibold text-primary">💡 Consider reviewing this pattern</p>
                      </div>
                    )}

                    {/* Feedback buttons */}
                    {!insight.userFeedback ? (
                      <div className="mt-4 flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onFeedback(insight.id, 'accurate')}
                          className="flex-1 h-11 rounded-full text-sm font-semibold border-2 hover:bg-[hsl(var(--success))]/10 hover:border-[hsl(var(--success))]/30 hover:text-[hsl(var(--success))]"
                        >
                          <ThumbsUp className="mr-2 h-4 w-4" strokeWidth={2} />
                          Accurate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onFeedback(insight.id, 'not_quite')}
                          className="flex-1 h-11 rounded-full text-sm font-semibold border-2"
                        >
                          <ThumbsDown className="mr-2 h-4 w-4" strokeWidth={2} />
                          Not quite
                        </Button>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-muted-foreground font-medium">
                        ✓ Marked as {insight.userFeedback === 'accurate' ? 'accurate' : 'needs refinement'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredInsights.length === 0 && (
            <div className="text-center py-16">
              <div className="h-20 w-20 rounded-[2rem] bg-secondary flex items-center justify-center mx-auto mb-5">
                <Lightbulb className="h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} />
              </div>
              <p className="text-lg font-semibold text-muted-foreground">No insights match this filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}