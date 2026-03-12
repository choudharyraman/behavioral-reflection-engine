import { useState } from 'react';
import { Transaction, TransactionCategory, ContextTag } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Utensils, Car, ShoppingBag, Film, Receipt, Heart, Search, Tag, X, Smile } from 'lucide-react';

interface MobileTransactionListProps {
  transactions: Transaction[];
  onAddTag: (transactionId: string, tag: ContextTag) => void;
  onEmotionTag?: (transaction: { id: string; merchant: string; amount: number }) => void;
}

const categoryIcons: Record<TransactionCategory, typeof Utensils> = { food: Utensils, transport: Car, shopping: ShoppingBag, entertainment: Film, bills: Receipt, health: Heart, other: Receipt };
const categoryGradients: Record<TransactionCategory, string> = {
  food: 'from-[hsl(var(--category-food))] to-[hsl(var(--category-food))]/80',
  transport: 'from-[hsl(var(--category-transport))] to-[hsl(var(--category-transport))]/80',
  shopping: 'from-[hsl(var(--category-shopping))] to-[hsl(var(--category-shopping))]/80',
  entertainment: 'from-[hsl(var(--category-entertainment))] to-[hsl(var(--category-entertainment))]/80',
  bills: 'from-[hsl(var(--category-bills))] to-[hsl(var(--category-bills))]/80',
  health: 'from-[hsl(var(--category-health))] to-[hsl(var(--category-health))]/80',
  other: 'from-muted to-muted/80',
};
const contextTags: { value: ContextTag; label: string; emoji: string }[] = [
  { value: 'work_stress', label: 'Work stress', emoji: '💼' },
  { value: 'celebration', label: 'Celebration', emoji: '🎉' },
  { value: 'guests', label: 'Guests', emoji: '👥' },
  { value: 'feeling_unwell', label: 'Unwell', emoji: '🤒' },
  { value: 'boredom', label: 'Boredom', emoji: '😴' },
];
const categories = [
  { value: 'all', label: 'All' }, { value: 'food', label: 'Food' }, { value: 'transport', label: 'Transport' },
  { value: 'shopping', label: 'Shopping' }, { value: 'entertainment', label: 'Fun' }, { value: 'bills', label: 'Bills' }, { value: 'health', label: 'Health' },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}
function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
function groupByDate(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();
  transactions.forEach(txn => {
    const dateKey = formatDate(txn.timestamp);
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(txn);
  });
  return groups;
}

export function MobileTransactionList({ transactions, onAddTag, onEmotionTag }: MobileTransactionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [taggingId, setTaggingId] = useState<string | null>(null);

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || txn.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const groupedTransactions = groupByDate(filteredTransactions.slice(0, 50));

  return (
    <div className="flex flex-col h-full pb-24">
      {/* Search and Filter */}
      <div className="sticky top-0 z-30 bg-background px-5 py-4 space-y-4">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-2xl border-0 text-base font-medium neu-inset"
          />
          {searchQuery && (
            <button className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full neu-button flex items-center justify-center" onClick={() => setSearchQuery('')}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide max-w-2xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={cn(
                "shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                categoryFilter === cat.value ? "bg-primary text-primary-foreground shadow-md" : "neu-button"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-5 space-y-5 pt-4">
        <div className="max-w-2xl mx-auto space-y-5">
        {Array.from(groupedTransactions.entries()).map(([dateKey, txns]) => (
          <div key={dateKey} className="animate-fade-in">
            <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">{dateKey}</p>
            <div className="space-y-3">
              {txns.map((txn, idx) => {
                const Icon = categoryIcons[txn.category];
                const isTagging = taggingId === txn.id;
                return (
                  <div key={txn.id} className="rounded-2xl p-4 neu-raised-sm neu-card-hover" style={{ animationDelay: `${idx * 30}ms` }}>
                    <div className="flex items-center gap-4">
                      <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm", categoryGradients[txn.category])}>
                        <Icon className="h-6 w-6 text-primary-foreground" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-foreground truncate">{txn.merchant}</p>
                          {txn.isRecurring && <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">Recurring</span>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 font-medium">{formatTime(txn.timestamp)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground tracking-tight">-₹{txn.amount.toLocaleString()}</p>
                        <div className="flex gap-1">
                          {onEmotionTag && (
                            <button className="h-8 px-2 text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1" onClick={() => onEmotionTag({ id: txn.id, merchant: txn.merchant, amount: txn.amount })}>
                              <Smile className="h-4 w-4" strokeWidth={2} /> Feel
                            </button>
                          )}
                          <button className="h-8 px-2 text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1" onClick={() => setTaggingId(isTagging ? null : txn.id)}>
                            <Tag className="h-4 w-4" strokeWidth={2} /> Context
                          </button>
                        </div>
                      </div>
                    </div>

                    {isTagging && (
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-border/50 pt-4 animate-fade-in">
                        {contextTags.map((tag) => (
                          <button key={tag.value} className="h-10 rounded-xl px-4 text-sm font-semibold neu-button flex items-center gap-2"
                            onClick={() => { onAddTag(txn.id, tag.value); setTaggingId(null); }}>
                            <span>{tag.emoji}</span> {tag.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {txn.contextTags && txn.contextTags.length > 0 && !isTagging && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {txn.contextTags.map((tag) => {
                          const tagInfo = contextTags.find(t => t.value === tag);
                          return <span key={tag} className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold neu-inset-sm">{tagInfo?.emoji} {tagInfo?.label || tag}</span>;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl neu-raised">
              <Receipt className="h-12 w-12 text-muted-foreground/50" strokeWidth={1.5} />
            </div>
            <p className="mt-5 text-lg font-semibold text-muted-foreground">No transactions found</p>
            <p className="mt-1 text-sm text-muted-foreground/70">Try adjusting your filters</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
