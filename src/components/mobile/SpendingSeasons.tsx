import { cn } from '@/lib/utils';
import { 
  Sun,
  Home,
  Plane,
  Users,
  Briefcase,
  Heart,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

export interface SpendingSeason {
  id: string;
  label: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  categoryChanges: Record<string, { change: number; amount: number }>;
  isCurrent?: boolean;
}

interface SpendingSeasonsProps {
  seasons: SpendingSeason[];
  onSeasonClick?: (season: SpendingSeason) => void;
}

const seasonIcons: Record<string, React.ReactNode> = {
  'social': <Users className="h-5 w-5" />,
  'home': <Home className="h-5 w-5" />,
  'travel': <Plane className="h-5 w-5" />,
  'work': <Briefcase className="h-5 w-5" />,
  'health': <Heart className="h-5 w-5" />,
  'default': <Sun className="h-5 w-5" />,
};

const seasonColors: Record<string, string> = {
  'social': 'from-[hsl(var(--category-entertainment))] to-[hsl(var(--category-entertainment))]/70',
  'home': 'from-[hsl(var(--category-bills))] to-[hsl(var(--category-bills))]/70',
  'travel': 'from-[hsl(var(--category-transport))] to-[hsl(var(--category-transport))]/70',
  'work': 'from-muted to-muted/70',
  'health': 'from-[hsl(var(--category-health))] to-[hsl(var(--category-health))]/70',
  'default': 'from-primary to-primary/70',
};

function getSeasonType(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes('social') || lower.includes('party') || lower.includes('friends')) return 'social';
  if (lower.includes('home') || lower.includes('quiet') || lower.includes('indoor')) return 'home';
  if (lower.includes('travel') || lower.includes('trip') || lower.includes('vacation')) return 'travel';
  if (lower.includes('work') || lower.includes('busy') || lower.includes('hustle')) return 'work';
  if (lower.includes('health') || lower.includes('wellness') || lower.includes('fitness')) return 'health';
  return 'default';
}

function formatDateRange(start: Date, end?: Date): string {
  const startStr = new Date(start).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
  if (!end) return `${startStr} - Present`;
  const endStr = new Date(end).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
  return `${startStr} - ${endStr}`;
}

export function SpendingSeasons({ seasons, onSeasonClick }: SpendingSeasonsProps) {
  if (seasons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
          <Sun className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground">No Seasons Detected</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          We need a few more months of data to identify your spending seasons. Keep going!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 sm:px-5 lg:px-8 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Spending Seasons
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Your life phases over time
          </p>
        </div>
      </div>

      {/* Current season highlight */}
      {seasons.find(s => s.isCurrent) && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-5 sm:p-6 animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
          
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
              Current Season
            </span>
          </div>
          
          {(() => {
            const current = seasons.find(s => s.isCurrent)!;
            const type = getSeasonType(current.label);
            
            return (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-primary-foreground",
                    seasonColors[type]
                  )}>
                    {seasonIcons[type]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{current.label}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDateRange(current.startDate, current.endDate)}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {current.description}
                </p>

                {/* Category changes */}
                {Object.keys(current.categoryChanges).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(current.categoryChanges).slice(0, 4).map(([cat, data]) => {
                      const isUp = data.change > 0;
                      const Icon = isUp ? TrendingUp : data.change < 0 ? TrendingDown : Minus;
                      
                      return (
                        <div 
                          key={cat}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                            isUp 
                              ? "bg-destructive/10 text-destructive" 
                              : data.change < 0 
                                ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          <span className="capitalize">{cat}</span>
                          <span>{isUp ? '+' : ''}{data.change}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Past seasons timeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Past Seasons</h3>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
          
          {seasons
            .filter(s => !s.isCurrent)
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            .map((season, idx) => {
              const type = getSeasonType(season.label);
              
              return (
                <div 
                  key={season.id}
                  onClick={() => onSeasonClick?.(season)}
                  className="relative flex gap-4 pb-6 cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Timeline dot */}
                  <div className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-primary-foreground shadow-sm",
                    seasonColors[type]
                  )}>
                    {seasonIcons[type]}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 rounded-2xl bg-card p-4 shadow-sm transition-all group-hover:shadow-md group-active:scale-[0.99]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-foreground">{season.label}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatDateRange(season.startDate, season.endDate)}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {season.description}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
