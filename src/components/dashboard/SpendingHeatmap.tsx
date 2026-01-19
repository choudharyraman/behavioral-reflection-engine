import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklyHeatmapData } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface SpendingHeatmapProps {
  data: WeeklyHeatmapData[];
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const hours = Array.from({ length: 24 }, (_, i) => i);

function getIntensityClass(value: number): string {
  if (value === 0) return 'bg-muted/30';
  if (value < 20) return 'bg-primary/20';
  if (value < 40) return 'bg-primary/40';
  if (value < 60) return 'bg-primary/60';
  if (value < 80) return 'bg-primary/80';
  return 'bg-primary';
}

function formatHour(hour: number): string {
  if (hour === 0) return '12am';
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return '12pm';
  return `${hour - 12}pm`;
}

export function SpendingHeatmap({ data }: SpendingHeatmapProps) {
  const getCell = (day: typeof dayKeys[number], hour: number) => {
    return data.find(d => d.day === day && d.hour === hour);
  };

  // Show only key hours to reduce clutter
  const displayHours = [0, 6, 9, 12, 15, 18, 21];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Weekly Spending Activity
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          When you tend to spend the most
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Hour labels */}
            <div className="mb-2 flex">
              <div className="w-12 shrink-0" />
              <div className="flex flex-1 justify-between px-1">
                {displayHours.map(hour => (
                  <span key={hour} className="text-xs text-muted-foreground">
                    {formatHour(hour)}
                  </span>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="space-y-1">
              {dayKeys.map((day, dayIndex) => (
                <div key={day} className="flex items-center gap-2">
                  <span className="w-10 shrink-0 text-xs font-medium text-muted-foreground">
                    {days[dayIndex]}
                  </span>
                  <div className="flex flex-1 gap-0.5">
                    {hours.map(hour => {
                      const cell = getCell(day, hour);
                      return (
                        <div
                          key={`${day}-${hour}`}
                          className={cn(
                            "h-5 flex-1 rounded-sm transition-colors hover:ring-2 hover:ring-primary/50",
                            getIntensityClass(cell?.value || 0)
                          )}
                          title={`${days[dayIndex]} ${formatHour(hour)}: ${cell?.count || 0} transactions`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <span className="text-xs text-muted-foreground">Less</span>
              <div className="flex gap-0.5">
                {['bg-muted/30', 'bg-primary/20', 'bg-primary/40', 'bg-primary/60', 'bg-primary/80', 'bg-primary'].map((cls, i) => (
                  <div key={i} className={cn("h-3 w-3 rounded-sm", cls)} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
