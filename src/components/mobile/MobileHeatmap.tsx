import { WeeklyHeatmapData } from '@/types/transaction';
import { cn } from '@/lib/utils';

interface MobileHeatmapProps {
  data: WeeklyHeatmapData[];
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

function getIntensityClass(value: number): string {
  if (value === 0) return 'bg-muted/20';
  if (value < 20) return 'bg-primary/15';
  if (value < 40) return 'bg-primary/30';
  if (value < 60) return 'bg-primary/50';
  if (value < 80) return 'bg-primary/70';
  return 'bg-primary';
}

export function MobileHeatmap({ data }: MobileHeatmapProps) {
  const getCell = (day: typeof dayKeys[number], hour: number) => {
    return data.find(d => d.day === day && d.hour === hour);
  };

  // Group hours into 4-hour blocks for mobile
  const hourBlocks = [
    { label: '12a', hours: [0, 1, 2, 3] },
    { label: '4a', hours: [4, 5, 6, 7] },
    { label: '8a', hours: [8, 9, 10, 11] },
    { label: '12p', hours: [12, 13, 14, 15] },
    { label: '4p', hours: [16, 17, 18, 19] },
    { label: '8p', hours: [20, 21, 22, 23] },
  ];

  const getBlockValue = (day: typeof dayKeys[number], hours: number[]) => {
    const cells = hours.map(h => getCell(day, h)).filter(Boolean);
    if (cells.length === 0) return 0;
    return cells.reduce((sum, cell) => sum + (cell?.value || 0), 0) / cells.length;
  };

  return (
    <div className="px-5 animate-fade-in">
      <div className="rounded-3xl bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-foreground tracking-tight">Spending Heatmap</h3>
            <p className="text-sm text-muted-foreground">When you spend the most</p>
          </div>
        </div>
        
        {/* Hour labels */}
        <div className="flex mb-3">
          <div className="w-10 shrink-0" />
          <div className="flex flex-1 justify-between">
            {hourBlocks.map(block => (
              <span key={block.label} className="text-[10px] font-medium text-muted-foreground w-10 text-center">
                {block.label}
              </span>
            ))}
          </div>
        </div>
        
        {/* Grid */}
        <div className="space-y-2">
          {dayKeys.map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-3">
              <span className="w-8 text-[11px] font-medium text-muted-foreground">
                {days[dayIndex]}
              </span>
              <div className="flex flex-1 gap-1.5">
                {hourBlocks.map((block) => {
                  const value = getBlockValue(day, block.hours);
                  return (
                    <div
                      key={`${day}-${block.label}`}
                      className={cn(
                        "h-8 flex-1 rounded-lg transition-all duration-300 hover:scale-105",
                        getIntensityClass(value)
                      )}
                      style={{ animationDelay: `${dayIndex * 50}ms` }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <span className="text-[10px] font-medium text-muted-foreground">Less</span>
          <div className="flex gap-1">
            {['bg-muted/20', 'bg-primary/15', 'bg-primary/30', 'bg-primary/50', 'bg-primary/70', 'bg-primary'].map((cls, i) => (
              <div key={i} className={cn("h-4 w-4 rounded-md transition-transform hover:scale-110", cls)} />
            ))}
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  );
}
