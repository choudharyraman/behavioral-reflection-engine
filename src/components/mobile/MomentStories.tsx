import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  X,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface MomentStory {
  id: string;
  title: string;
  narrative: string;
  patternType: string;
  heatmapData?: Record<string, number>;
  createdAt: Date;
  dismissed: boolean;
  userFeedback?: string;
}

interface MomentStoriesProps {
  stories: MomentStory[];
  onFeedback: (id: string, feedback: 'accurate' | 'not_quite') => void;
  onDismiss: (id: string) => void;
}

const categoryGradients: Record<string, string> = {
  food: 'from-[hsl(var(--category-food))] via-[hsl(var(--category-food))]/80 to-[hsl(var(--category-food))]/60',
  transport: 'from-[hsl(var(--category-transport))] via-[hsl(var(--category-transport))]/80 to-[hsl(var(--category-transport))]/60',
  shopping: 'from-[hsl(var(--category-shopping))] via-[hsl(var(--category-shopping))]/80 to-[hsl(var(--category-shopping))]/60',
  entertainment: 'from-[hsl(var(--category-entertainment))] via-[hsl(var(--category-entertainment))]/80 to-[hsl(var(--category-entertainment))]/60',
  bills: 'from-[hsl(var(--category-bills))] via-[hsl(var(--category-bills))]/80 to-[hsl(var(--category-bills))]/60',
  health: 'from-[hsl(var(--category-health))] via-[hsl(var(--category-health))]/80 to-[hsl(var(--category-health))]/60',
};

export function MomentStories({ stories, onFeedback, onDismiss }: MomentStoriesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  
  const visibleStories = stories.filter(s => !s.dismissed);
  const currentStory = visibleStories[currentIndex];

  useEffect(() => {
    if (!currentStory) return;

    setProgress(0);
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < visibleStories.length - 1) {
            setCurrentIndex(prev => prev + 1);
          }
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [currentIndex, currentStory, visibleStories.length]);

  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 3) {
      // Tap left - go back
      if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    } else if (x > (2 * width) / 3) {
      // Tap right - go forward
      if (currentIndex < visibleStories.length - 1) setCurrentIndex(prev => prev + 1);
    }
  };

  if (visibleStories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 mb-6">
          <Sparkles className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No Stories Yet</h3>
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
          We're analyzing your spending to find meaningful moments. Check back soon!
        </p>
      </div>
    );
  }

  const gradient = categoryGradients[currentStory.patternType] || 'from-primary via-primary/80 to-primary/60';

  return (
    <div className="relative w-full h-[70vh] max-h-[600px] min-h-[400px] sm:h-[75vh] sm:max-h-[700px]">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-20">
        {visibleStories.map((_, idx) => (
          <div key={idx} className="flex-1 h-0.5 sm:h-1 rounded-full bg-white/30 overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100"
              style={{ 
                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Main story card */}
      <div 
        className={cn(
          "relative w-full h-full rounded-3xl overflow-hidden cursor-pointer",
          "bg-gradient-to-br",
          gradient
        )}
        onClick={handleTap}
      >
        {/* Close button */}
        <button 
          className="absolute top-12 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(currentStory.id);
          }}
        >
          <X className="h-5 w-5 text-white" />
        </button>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
          {/* Category badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium capitalize">
              {currentStory.patternType}
            </span>
            <span className="flex items-center gap-1 text-white/70 text-xs">
              <Clock className="h-3 w-3" />
              {new Date(currentStory.createdAt).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
            {currentStory.title}
          </h2>

          {/* Narrative */}
          <p className="text-base sm:text-lg text-white/90 leading-relaxed mb-6">
            {currentStory.narrative}
          </p>

          {/* Mini heatmap */}
          {currentStory.heatmapData && (
            <div className="flex gap-1 mb-6">
              {Object.entries(currentStory.heatmapData).map(([day, value]) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <div 
                    className="w-8 h-8 rounded-lg transition-all"
                    style={{ 
                      backgroundColor: `rgba(255, 255, 255, ${0.1 + (value / 5) * 0.5})` 
                    }}
                  />
                  <span className="text-[10px] text-white/60">{day}</span>
                </div>
              ))}
            </div>
          )}

          {/* Feedback buttons */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className={cn(
                "flex-1 h-12 rounded-2xl font-medium transition-all",
                currentStory.userFeedback === 'accurate'
                  ? "bg-white text-foreground"
                  : "bg-white/20 text-white hover:bg-white/30"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onFeedback(currentStory.id, 'accurate');
              }}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              That's me
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "flex-1 h-12 rounded-2xl font-medium transition-all",
                currentStory.userFeedback === 'not_quite'
                  ? "bg-white text-foreground"
                  : "bg-white/20 text-white hover:bg-white/30"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onFeedback(currentStory.id, 'not_quite');
              }}
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              Not quite
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
