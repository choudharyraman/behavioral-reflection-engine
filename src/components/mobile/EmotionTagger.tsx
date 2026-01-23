import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Heart,
  Frown,
  PartyPopper,
  Coffee,
  Users,
  Pill,
  Sparkles,
  X,
  Check,
  Plus,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface EmotionTag {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const defaultTags: EmotionTag[] = [
  { id: 'stressed', label: 'Felt stressed', icon: 'frown', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  { id: 'celebration', label: 'Celebration', icon: 'party', color: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20' },
  { id: 'bored', label: 'Bored scroll', icon: 'coffee', color: 'bg-muted text-muted-foreground border-border' },
  { id: 'family', label: 'Helping family', icon: 'users', color: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20' },
  { id: 'unwell', label: 'Feeling unwell', icon: 'pill', color: 'bg-[hsl(var(--category-health))]/10 text-[hsl(var(--category-health))] border-[hsl(var(--category-health))]/20' },
  { id: 'treat', label: 'Treat myself', icon: 'sparkles', color: 'bg-primary/10 text-primary border-primary/20' },
];

const iconMap: Record<string, React.ReactNode> = {
  frown: <Frown className="h-4 w-4" />,
  party: <PartyPopper className="h-4 w-4" />,
  coffee: <Coffee className="h-4 w-4" />,
  users: <Users className="h-4 w-4" />,
  pill: <Pill className="h-4 w-4" />,
  sparkles: <Sparkles className="h-4 w-4" />,
  heart: <Heart className="h-4 w-4" />,
};

interface EmotionTaggerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTag: (tag: EmotionTag, customNote?: string) => void;
  transactionMerchant?: string;
  transactionAmount?: number;
}

export function EmotionTagger({ 
  isOpen, 
  onClose, 
  onSelectTag, 
  transactionMerchant,
  transactionAmount 
}: EmotionTaggerProps) {
  const [selectedTag, setSelectedTag] = useState<EmotionTag | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [customLabel, setCustomLabel] = useState('');

  const handleConfirm = () => {
    if (selectedTag) {
      onSelectTag(selectedTag, customNote || undefined);
      resetState();
    }
  };

  const handleCustomTag = () => {
    if (customLabel.trim()) {
      const customTag: EmotionTag = {
        id: `custom-${Date.now()}`,
        label: customLabel.trim(),
        icon: 'heart',
        color: 'bg-primary/10 text-primary border-primary/20',
      };
      onSelectTag(customTag, customNote || undefined);
      resetState();
    }
  };

  const resetState = () => {
    setSelectedTag(null);
    setCustomNote('');
    setShowCustom(false);
    setCustomLabel('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetState()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-4 border-b border-border/50">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Add Context
          </DialogTitle>
          {transactionMerchant && (
            <p className="text-sm text-muted-foreground mt-1">
              {transactionMerchant}
              {transactionAmount && ` • ₹${transactionAmount}`}
            </p>
          )}
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Quick emotion tags */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              How did this feel?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {defaultTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(selectedTag?.id === tag.id ? null : tag)}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all duration-200",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    selectedTag?.id === tag.id
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background " + tag.color
                      : tag.color
                  )}
                >
                  {iconMap[tag.icon]}
                  <span className="text-sm font-medium">{tag.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom tag */}
          {!showCustom ? (
            <Button
              variant="ghost"
              className="w-full h-12 rounded-2xl border border-dashed border-border hover:border-primary hover:bg-primary/5"
              onClick={() => setShowCustom(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add custom tag
            </Button>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Enter custom tag..."
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="h-12 rounded-2xl"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl"
                  onClick={() => setShowCustom(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1 rounded-xl"
                  onClick={handleCustomTag}
                  disabled={!customLabel.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          {/* Optional note */}
          {selectedTag && (
            <div className="animate-fade-in">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Add a note (optional)
              </p>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="What was happening?"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="h-12 rounded-2xl pl-11"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 pt-0 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-2xl"
            onClick={resetState}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-12 rounded-2xl"
            onClick={handleConfirm}
            disabled={!selectedTag}
          >
            <Check className="mr-2 h-4 w-4" />
            Save Context
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Emotion summary component
interface EmotionSummaryProps {
  emotionCounts: Record<string, number>;
  onViewDetails?: () => void;
}

export function EmotionSummary({ emotionCounts, onViewDetails }: EmotionSummaryProps) {
  const entries = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
  
  if (entries.length === 0) return null;

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Your Emotion Tags</h3>
        {onViewDetails && (
          <button 
            onClick={onViewDetails}
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {entries.slice(0, 4).map(([tag, count]) => {
          const tagInfo = defaultTags.find(t => t.id === tag) || {
            label: tag,
            icon: 'heart',
            color: 'bg-muted text-muted-foreground border-border',
          };
          
          return (
            <div
              key={tag}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium",
                tagInfo.color
              )}
            >
              {iconMap[tagInfo.icon]}
              <span>{tagInfo.label}</span>
              <span className="ml-1 opacity-60">{count}</span>
            </div>
          );
        })}
      </div>
      {entries.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          In the last month, {entries.length} different contexts were tagged.
        </p>
      )}
    </div>
  );
}
