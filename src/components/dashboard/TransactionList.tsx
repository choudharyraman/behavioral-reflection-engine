import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Transaction, TransactionCategory, ContextTag } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Film, 
  Receipt, 
  Heart,
  Search,
  Tag,
  Clock,
  History
} from 'lucide-react';

interface TransactionListProps {
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

const categoryColors: Record<TransactionCategory, string> = {
  food: 'bg-[hsl(var(--category-food))]',
  transport: 'bg-[hsl(var(--category-transport))]',
  shopping: 'bg-[hsl(var(--category-shopping))]',
  entertainment: 'bg-[hsl(var(--category-entertainment))]',
  bills: 'bg-[hsl(var(--category-bills))]',
  health: 'bg-[hsl(var(--category-health))]',
  other: 'bg-muted',
};

const contextTags: { value: ContextTag; label: string }[] = [
  { value: 'work_stress', label: 'Work stress' },
  { value: 'celebration', label: 'Celebration' },
  { value: 'guests', label: 'Guests' },
  { value: 'feeling_unwell', label: 'Feeling unwell' },
  { value: 'boredom', label: 'Boredom' },
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
  if (days < 7) return `${days} days ago`;
  
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short' 
  });
}

export function TransactionList({ transactions, onAddTag }: TransactionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [taggingId, setTaggingId] = useState<string | null>(null);

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || txn.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" />
          Transaction History
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search merchants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="food">Food & Dining</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="bills">Bills</SelectItem>
              <SelectItem value="health">Health</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {filteredTransactions.slice(0, 20).map((txn) => {
            const Icon = categoryIcons[txn.category];
            const isTagging = taggingId === txn.id;

            return (
              <div
                key={txn.id}
                className="group rounded-lg border border-border/50 bg-card p-3 transition-colors hover:border-border"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    categoryColors[txn.category]
                  )}>
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{txn.merchant}</p>
                      {txn.isRecurring && (
                        <Badge variant="outline" className="text-xs">Recurring</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(txn.timestamp)} at {formatTime(txn.timestamp)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      -₹{txn.amount.toLocaleString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100"
                      onClick={() => setTaggingId(isTagging ? null : txn.id)}
                    >
                      <Tag className="mr-1 h-3 w-3" />
                      Add context
                    </Button>
                  </div>
                </div>

                {/* Tag selection */}
                {isTagging && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-border/50 pt-3 animate-in fade-in slide-in-from-top-2">
                    {contextTags.map((tag) => (
                      <Button
                        key={tag.value}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          onAddTag(txn.id, tag.value);
                          setTaggingId(null);
                        }}
                      >
                        {tag.label}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Existing tags */}
                {txn.contextTags && txn.contextTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {txn.contextTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {contextTags.find(t => t.value === tag)?.label || tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredTransactions.length > 20 && (
          <div className="mt-4 text-center">
            <Button variant="outline">
              Load more transactions
            </Button>
          </div>
        )}

        {filteredTransactions.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No transactions found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
