import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  TrendingUp,
  X,
  Check,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SpendingPattern } from '@/types/transaction';

export interface JournalEntry {
  id: string;
  content: string;
  patternId?: string;
  patternTitle?: string;
  createdAt: Date;
}

interface MoneyJournalProps {
  entries: JournalEntry[];
  patterns: SpendingPattern[];
  onAddEntry: (content: string, patternId?: string) => void;
  onDeleteEntry: (id: string) => void;
}

export function MoneyJournal({ entries, patterns, onAddEntry, onDeleteEntry }: MoneyJournalProps) {
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleSave = () => {
    if (newContent.trim()) {
      onAddEntry(newContent.trim(), selectedPatternId || undefined);
      setNewContent('');
      setSelectedPatternId(null);
      setIsAddingEntry(false);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="px-4 sm:px-5 lg:px-8 pb-24 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Money Journal</h2>
            <p className="text-xs text-muted-foreground">{entries.length} entries</p>
          </div>
        </div>
        
        <Button
          size="sm"
          className="rounded-xl h-10"
          onClick={() => setIsAddingEntry(true)}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Entry
        </Button>
      </div>

      {/* Empty state */}
      {entries.length === 0 && !isAddingEntry && (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 mb-6">
            <Pencil className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Start Your Journal</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            Add notes about your spending patterns to build self-awareness over time.
          </p>
          <Button
            className="mt-6 rounded-xl"
            onClick={() => setIsAddingEntry(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Write First Entry
          </Button>
        </div>
      )}

      {/* Add entry dialog */}
      <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 gap-0">
          <DialogHeader className="p-5 pb-4 border-b border-border/50">
            <DialogTitle className="text-lg font-semibold text-foreground">
              New Journal Entry
            </DialogTitle>
          </DialogHeader>

          <div className="p-5 space-y-4">
            {/* Link to pattern (optional) */}
            {patterns.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Link to a pattern (optional)
                </p>
                <div className="flex flex-wrap gap-2">
                  {patterns.slice(0, 4).map((pattern) => (
                    <button
                      key={pattern.id}
                      onClick={() => setSelectedPatternId(
                        selectedPatternId === pattern.id ? null : pattern.id
                      )}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all",
                        selectedPatternId === pattern.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      <TrendingUp className="h-3 w-3" />
                      {pattern.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Entry content */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Your reflection
              </p>
              <Textarea
                placeholder="What's on your mind about this pattern? What was happening in your life?"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="min-h-[120px] rounded-2xl resize-none"
                autoFocus
              />
            </div>

            {/* Prompts */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setNewContent(prev => prev + (prev ? ' ' : '') + 'This week I noticed...')}
                className="px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                This week I noticed...
              </button>
              <button
                onClick={() => setNewContent(prev => prev + (prev ? ' ' : '') + 'I felt...')}
                className="px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                I felt...
              </button>
              <button
                onClick={() => setNewContent(prev => prev + (prev ? ' ' : '') + 'Next time I want to...')}
                className="px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Next time I want to...
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="p-5 pt-0 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-2xl"
              onClick={() => {
                setIsAddingEntry(false);
                setNewContent('');
                setSelectedPatternId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-12 rounded-2xl"
              onClick={handleSave}
              disabled={!newContent.trim()}
            >
              <Check className="mr-2 h-4 w-4" />
              Save Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Entries list */}
      {entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry, idx) => (
            <div 
              key={entry.id}
              className="rounded-2xl bg-card p-4 shadow-sm animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Entry header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(entry.createdAt)}
                  </span>
                  {entry.patternTitle && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="flex items-center gap-1 text-xs font-medium text-primary">
                        <Sparkles className="h-3 w-3" />
                        {entry.patternTitle}
                      </span>
                    </>
                  )}
                </div>
                
                {deleteConfirmId === entry.id ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        onDeleteEntry(entry.id);
                        setDeleteConfirmId(null);
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg"
                      onClick={() => setDeleteConfirmId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteConfirmId(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Entry content */}
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Privacy note */}
      <p className="text-center text-xs text-muted-foreground pt-4">
        🔒 Your journal is private and stored securely on your device.
      </p>
    </div>
  );
}
