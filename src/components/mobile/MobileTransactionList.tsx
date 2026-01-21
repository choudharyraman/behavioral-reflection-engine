import { useState } from 'react';
import { Transaction, TransactionCategory, ContextTag } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Film, 
  Receipt, 
  Heart,
  Search,
  Tag,
  X
} from 'lucide-react';

interface MobileTransactionListProps {
  transactions: Transaction[];
  onAddTag: (transactionId: string, tag: ContextTag) => void;
}

const categoryIcons: Record<TransactionCategory, typeof Utensils> = {
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  entertainment: Film,
  bills: Receipt,
  health: Heart,
  other: Receipt,
};

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

const categories: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'food', label: 'Food' },
  { value: 'transport', label: 'Transport' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'entertainment', label: 'Fun' },
  { value: 'bills', label: 'Bills' },
  { value: 'health', label: 'Health' },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short' 
  });
}

function groupByDate(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();
  
  transactions.forEach(txn => {
    const dateKey = formatDate(txn.timestamp);
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(txn);
  });
  
  return groups;
}

export function MobileTransactionList({ transactions, onAddTag }: MobileTransactionListProps) {
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
      {/* Search and Filter Header */}
      <div className="sticky top-0 z-30 glass px-5 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 rounded-2xl bg-card border-0 shadow-sm text-base"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                categoryFilter === cat.value
                  ? "bg-foreground text-background shadow-md"
                  : "bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-5 space-y-5 pt-2">
        {Array.from(groupedTransactions.entries()).map(([dateKey, txns]) => (
          <div key={dateKey} className="animate-fade-in">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              {dateKey}
            </p>
            <div className="space-y-3">
              {txns.map((txn, idx) => {
                const Icon = categoryIcons[txn.category];
                const isTagging = taggingId === txn.id;

                return (
                  <div
                    key={txn.id}
                    className="rounded-3xl bg-card p-4 shadow-sm card-hover"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm",
                        categoryGradients[txn.category]
                      )}>
                        <Icon className="h-5 w-5 text-primary-foreground" strokeWidth={1.5} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground truncate tracking-tight">{txn.merchant}</p>
                          {txn.isRecurring && (
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                              Recurring
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatTime(txn.timestamp)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-bold text-foreground tracking-tight">
                          -₹{txn.amount.toLocaleString()}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                          onClick={() => setTaggingId(isTagging ? null : txn.id)}
                        >
                          <Tag className="mr-1 h-3 w-3" strokeWidth={1.5} />
                          Add context
                        </Button>
                      </div>
                    </div>

                    {/* Tag selection */}
                    {isTagging && (
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-border/50 pt-4 animate-fade-in">
                        {contextTags.map((tag) => (
                          <Button
                            key={tag.value}
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-full border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                            onClick={() => {
                              onAddTag(txn.id, tag.value);
                              setTaggingId(null);
                            }}
                          >
                            <span className="mr-1.5">{tag.emoji}</span>
                            {tag.label}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Existing tags */}
                    {txn.contextTags && txn.contextTags.length > 0 && !isTagging && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {txn.contextTags.map((tag) => {
                          const tagInfo = contextTags.find(t => t.value === tag);
                          return (
                            <span 
                              key={tag} 
                              className="inline-flex items-center rounded-full bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                            >
                              {tagInfo?.emoji} {tagInfo?.label || tag}
                            </span>
                          );
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
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/30">
              <Receipt className="h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} />
            </div>
            <p className="mt-4 text-base font-medium text-muted-foreground">No transactions found</p>
            <p className="mt-1 text-sm text-muted-foreground/70">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
