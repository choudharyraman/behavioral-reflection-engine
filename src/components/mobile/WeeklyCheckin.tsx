import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  Check,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export interface WeeklyCheckinData {
  id: string;
  weekStart: Date;
  summary: string;
  categoryChanges: Record<string, { change: number; amount: number }>;
  userResponse?: string;
  userNote?: string;
}

interface WeeklyCheckinProps {
  checkin: WeeklyCheckinData | null;
  onRespond: (response: string, note?: string) => void;
  onDismiss: () => void;
}

const quickResponses = [
  { id: 'busy', label: 'Busy week', emoji: '🏃' },
  { id: 'family', label: 'Family in town', emoji: '👨‍👩‍👧' },
  { id: 'oneoff', label: 'Just a one-off', emoji: '✨' },
  { id: 'planned', label: 'Planned expense', emoji: '📅' },
  { id: 'mood', label: 'Needed a pick-me-up', emoji: '💆' },
];

export function WeeklyCheckin({ checkin, onRespond, onDismiss }: WeeklyCheckinProps) {
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [showNote, setShowNote] = useState(false);

  if (!checkin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[hsl(var(--success))]/10 mb-6">
          <Check className="h-10 w-10 text-[hsl(var(--success))]" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">You're all caught up!</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          No check-in needed right now. We'll let you know when there's something to reflect on.
        </p>
      </div>
    );
  }

  const handleSubmit = () => {
    if (selectedResponse) {
      onRespond(selectedResponse, customNote || undefined);
    }
  };

  const hasChanges = Object.keys(checkin.categoryChanges).length > 0;
  const increasedCategories = Object.entries(checkin.categoryChanges).filter(([_, d]) => d.change > 0);
  const decreasedCategories = Object.entries(checkin.categoryChanges).filter(([_, d]) => d.change < 0);

  return (
    <div className="px-4 sm:px-5 lg:px-8 pb-24 max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Weekly Check-in</h2>
          <p className="text-xs text-muted-foreground">
            Week of {new Date(checkin.weekStart).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short' 
            })}
          </p>
        </div>
      </div>

      {/* Summary card */}
      <div className="rounded-3xl bg-card p-5 shadow-sm">
        <p className="text-base text-foreground leading-relaxed">
          {checkin.summary}
        </p>

        {/* Category changes */}
        {hasChanges && (
          <div className="mt-5 space-y-3">
            {increasedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {increasedCategories.map(([cat, data]) => (
                  <div 
                    key={cat}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-destructive/10"
                  >
                    <TrendingUp className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium capitalize text-destructive">{cat}</span>
                    <span className="text-sm text-destructive/70">+{data.change}%</span>
                  </div>
                ))}
              </div>
            )}
            
            {decreasedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {decreasedCategories.map(([cat, data]) => (
                  <div 
                    key={cat}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[hsl(var(--success))]/10"
                  >
                    <TrendingDown className="h-4 w-4 text-[hsl(var(--success))]" />
                    <span className="text-sm font-medium capitalize text-[hsl(var(--success))]">{cat}</span>
                    <span className="text-sm text-[hsl(var(--success))]/70">{data.change}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reflection prompt */}
      <div className="rounded-3xl bg-muted/30 p-5">
        <p className="text-sm font-medium text-foreground mb-4">
          Does this reflect a change in routine?
        </p>

        {/* Quick responses */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {quickResponses.map((response) => (
            <button
              key={response.id}
              onClick={() => setSelectedResponse(response.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all",
                "hover:scale-[1.02] active:scale-[0.98]",
                selectedResponse === response.id
                  ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <span className="text-lg">{response.emoji}</span>
              <span className="text-sm font-medium text-foreground">{response.label}</span>
            </button>
          ))}
        </div>

        {/* Add note toggle */}
        {!showNote ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-full rounded-xl border border-dashed border-border hover:border-primary/50"
            onClick={() => setShowNote(true)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Add a note
          </Button>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <Textarea
              placeholder="What was happening this week?"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="min-h-[80px] rounded-2xl resize-none"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-12 rounded-2xl"
          onClick={onDismiss}
        >
          Skip for now
        </Button>
        <Button
          className="flex-1 h-12 rounded-2xl"
          onClick={handleSubmit}
          disabled={!selectedResponse}
        >
          Save Response
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Privacy note */}
      <p className="text-center text-xs text-muted-foreground">
        Your responses are private and help personalize future insights.
      </p>
    </div>
  );
}
