import { cn } from '@/lib/utils';
import { LayoutGrid, TrendingUp, History, Scan, Bot } from 'lucide-react';

interface MobileNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Home', icon: LayoutGrid },
  { id: 'patterns', label: 'Patterns', icon: TrendingUp },
  { id: 'ask', label: 'Agent', icon: Bot, isCenter: true },
  { id: 'transactions', label: 'History', icon: History },
  { id: 'scan', label: 'Scan', icon: Scan },
];

export function MobileNavBar({ activeTab, onTabChange }: MobileNavBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background safe-area-inset-bottom">
      <div className="py-2 max-w-lg mx-auto flex items-center justify-center px-3">
        {/* Neumorphic nav container */}
        <div className="flex items-center justify-around w-full rounded-2xl neu-raised-sm py-2 px-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isCenter = item.isCenter;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 transition-all duration-300",
                  isCenter ? "px-1 -mt-7" : "px-3 py-2"
                )}
              >
                {isCenter ? (
                  <div
                    className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-br from-primary to-[hsl(230_80%_65%)] shadow-lg"
                        : "neu-raised bg-background"
                    )}
                  >
                    <Icon className={cn("h-7 w-7", isActive ? "text-primary-foreground" : "text-primary")} strokeWidth={2} />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                      isActive ? "neu-inset-sm" : "neu-flat"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-all duration-300",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                )}
                <span
                  className={cn(
                    "text-[10px] font-semibold tracking-wide transition-all duration-300",
                    isActive ? "text-primary" : "text-muted-foreground",
                    isCenter && "mt-1"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
