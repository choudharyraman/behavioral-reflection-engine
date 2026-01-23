import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  AlertCircle,
  TrendingUp,
  X,
  ChevronRight,
  MessageSquare,
  Clock,
  BellOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export interface DeviationEvent {
  id: string;
  category: string;
  deviationPercentage: number;
  baselineAmount: number;
  currentAmount: number;
  occurrenceCount: number;
  timePeriod: string;
  narrative: string;
  acknowledged: boolean;
  acknowledgedResponse?: string;
}

interface SoftNudgeProps {
  deviation: DeviationEvent | null;
  onAcknowledge: (id: string, response: string, note?: string) => void;
  onDismiss: () => void;
  onMuteCategory: (category: string) => void;
}

const quickResponses = [
  { id: 'oneoff', label: 'This is a one-time thing', emoji: '✨' },
  { id: 'routine', label: 'Change in routine', emoji: '🔄' },
  { id: 'aware', label: 'Already aware', emoji: '👍' },
  { id: 'later', label: 'Will look later', emoji: '⏰' },
];

export function SoftNudge({ deviation, onAcknowledge, onDismiss, onMuteCategory }: SoftNudgeProps) {
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  if (!deviation) return null;

  const handleConfirm = () => {
    if (selectedResponse) {
      onAcknowledge(deviation.id, selectedResponse, customNote || undefined);
      setSelectedResponse(null);
      setCustomNote('');
    }
  };

  return (
    <Dialog open={!!deviation} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="relative p-5 pb-4 bg-gradient-to-b from-[hsl(var(--warning))]/10 to-transparent">
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--warning))]/20">
              <AlertCircle className="h-6 w-6 text-[hsl(var(--warning))]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Noticed a change
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                This week • {deviation.category}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Narrative */}
          <p className="text-sm text-foreground leading-relaxed">
            {deviation.narrative}
          </p>

          {/* Stats */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-muted/50 transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-foreground">
                +{deviation.deviationPercentage}% from baseline
              </span>
            </div>
            <ChevronRight className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              showDetails && "rotate-90"
            )} />
          </button>

          {showDetails && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <div className="p-3 rounded-xl bg-card border border-border">
                <p className="text-xs text-muted-foreground">Usual week</p>
                <p className="text-lg font-bold text-foreground">₹{deviation.baselineAmount}</p>
              </div>
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <p className="text-xs text-muted-foreground">This week</p>
                <p className="text-lg font-bold text-destructive">₹{deviation.currentAmount}</p>
              </div>
              <div className="col-span-2 p-3 rounded-xl bg-muted">
                <p className="text-xs text-muted-foreground">Transactions</p>
                <p className="text-base font-semibold text-foreground">
                  {deviation.occurrenceCount} in {deviation.timePeriod}
                </p>
              </div>
            </div>
          )}

          {/* Quick responses */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Does this feel accurate?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickResponses.map((response) => (
                <button
                  key={response.id}
                  onClick={() => setSelectedResponse(response.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-3 rounded-xl border transition-all text-left",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    selectedResponse === response.id
                      ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <span className="text-base">{response.emoji}</span>
                  <span className="text-xs font-medium text-foreground">{response.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional note */}
          {selectedResponse && (
            <div className="animate-fade-in">
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  placeholder="Add context (optional)..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="min-h-[60px] rounded-2xl pl-10 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 pt-0 space-y-3">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-2xl"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
            <Button
              className="flex-1 h-12 rounded-2xl"
              onClick={handleConfirm}
              disabled={!selectedResponse}
            >
              Confirm
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-destructive rounded-xl"
            onClick={() => onMuteCategory(deviation.category)}
          >
            <BellOff className="mr-2 h-4 w-4" />
            Turn off {deviation.category} alerts
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
