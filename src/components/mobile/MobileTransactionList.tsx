import { useState } from 'react';
import { Transaction, TransactionCategory, ContextTag } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Film, 
  Receipt, 
  Heart,
  Search,
  Tag,
  Filter,
  X
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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

// Group transactions by date
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
      <div className="sticky top-0 z-30 bg-background px-4 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-card border-0"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
                categoryFilter === cat.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        {Array.from(groupedTransactions.entries()).map(([dateKey, txns]) => (
          <div key={dateKey}>
            <p className="text-xs font-medium text-muted-foreground mb-2 sticky top-0 bg-background py-1">
              {dateKey}
            </p>
            <div className="space-y-2">
              {txns.map((txn) => {
                const Icon = categoryIcons[txn.category];
                const isTagging = taggingId === txn.id;

                return (
                  <div
                    key={txn.id}
                    className="rounded-2xl bg-card p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
                        categoryGradients[txn.category]
                      )}>
                        <Icon className="h-5 w-5 text-primary-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">{txn.merchant}</p>
                          {txn.isRecurring && (
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              Recurring
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(txn.timestamp)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-semibold text-foreground">
                          -₹{txn.amount.toLocaleString()}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-muted-foreground"
                          onClick={() => setTaggingId(isTagging ? null : txn.id)}
                        >
                          <Tag className="mr-1 h-3 w-3" />
                          Tag
                        </Button>
                      </div>
                    </div>

                    {/* Tag selection */}
                    {isTagging && (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-border/50 pt-3">
                        {contextTags.map((tag) => (
                          <Button
                            key={tag.value}
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-full text-xs"
                            onClick={() => {
                              onAddTag(txn.id, tag.value);
                              setTaggingId(null);
                            }}
                          >
                            <span className="mr-1">{tag.emoji}</span>
                            {tag.label}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Existing tags */}
                    {txn.contextTags && txn.contextTags.length > 0 && !isTagging && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {txn.contextTags.map((tag) => {
                          const tagInfo = contextTags.find(t => t.value === tag);
                          return (
                            <Badge key={tag} variant="secondary" className="text-xs rounded-full">
                              {tagInfo?.emoji} {tagInfo?.label || tag}
                            </Badge>
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
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-muted-foreground">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
