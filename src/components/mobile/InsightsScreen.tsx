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
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface InsightsScreenProps {
  insights: InsightCardType[];
  onBack: () => void;
  onFeedback: (id: string, feedback: 'accurate' | 'not_quite') => void;
}

const confidenceConfig = {
  strong: { label: 'High confidence', className: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20' },
  emerging: { label: 'Emerging', className: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20' },
  weak: { label: 'New pattern', className: 'bg-muted text-muted-foreground border-border' },
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
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Insights</h1>
            <p className="text-sm text-muted-foreground">AI-detected spending patterns</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">{unreviewedCount} new</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <p className="text-2xl font-bold text-foreground">{insights.length}</p>
            <p className="text-xs text-muted-foreground">Total insights</p>
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <p className="text-2xl font-bold text-[hsl(var(--success))]">{accurateCount}</p>
            <p className="text-xs text-muted-foreground">Confirmed accurate</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
          {(['all', 'strong', 'emerging', 'actionable'] as FilterType[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full text-xs shrink-0",
                filter === f && "bg-foreground text-background"
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
        <div className="mt-4 space-y-3">
          {filteredInsights.map((insight, idx) => {
            const TrendIcon = insight.pattern.trend === 'increasing' ? TrendingUp :
                              insight.pattern.trend === 'decreasing' ? TrendingDown : Minus;
            const config = confidenceConfig[insight.pattern.confidence];
            
            return (
              <div
                key={insight.id}
                className={cn(
                  "rounded-2xl bg-card p-4 shadow-sm animate-fade-in transition-all",
                  insight.userFeedback && "opacity-70"
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
                      <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", config.className)}>
                        {config.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {insight.narrative}
                    </p>
                    
                    {/* Pattern details */}
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">₹{insight.pattern.averageAmount}</span>
                      <span className="text-border">•</span>
                      <span>{insight.pattern.timeRange}</span>
                      <span className="text-border">•</span>
                      <span className="flex items-center gap-1">
                        <TrendIcon className={cn(
                          "h-3 w-3",
                          insight.pattern.trend === 'increasing' && "text-destructive",
                          insight.pattern.trend === 'decreasing' && "text-[hsl(var(--success))]"
                        )} />
                        <span className="capitalize">{insight.pattern.trend}</span>
                      </span>
                    </div>

                    {/* Action suggestion */}
                    {insight.actionable && (
                      <div className="mt-3 rounded-xl bg-primary/5 p-3">
                        <p className="text-xs font-medium text-primary">💡 Consider reviewing this pattern</p>
                      </div>
                    )}

                    {/* Feedback buttons */}
                    {!insight.userFeedback ? (
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onFeedback(insight.id, 'accurate')}
                          className="flex-1 h-9 rounded-xl text-xs"
                        >
                          <ThumbsUp className="mr-1.5 h-3.5 w-3.5" />
                          Accurate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onFeedback(insight.id, 'not_quite')}
                          className="flex-1 h-9 rounded-xl text-xs"
                        >
                          <ThumbsDown className="mr-1.5 h-3.5 w-3.5" />
                          Not quite
                        </Button>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-muted-foreground">
                        ✓ Marked as {insight.userFeedback === 'accurate' ? 'accurate' : 'needs refinement'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredInsights.length === 0 && (
            <div className="text-center py-12">
              <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No insights match this filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
