import { cn } from '@/lib/utils';
import { 
  LayoutGrid, 
  TrendingUp, 
  History, 
  Scan, 
  MessageCircle 
} from 'lucide-react';

interface MobileNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Home', icon: LayoutGrid },
  { id: 'patterns', label: 'Patterns', icon: TrendingUp },
  { id: 'scan', label: 'Scan', icon: Scan },
  { id: 'transactions', label: 'History', icon: History },
  { id: 'ask', label: 'Ask AI', icon: MessageCircle },
];

export function MobileNavBar({ activeTab, onTabChange }: MobileNavBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass safe-area-inset-bottom">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isScan = item.id === 'scan';
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-2xl px-4 py-2 transition-all duration-300",
                isScan && "-mt-5"
              )}
            >
              {isScan ? (
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300",
                  isActive 
                    ? "bg-gradient-to-br from-primary to-[hsl(260_80%_60%)] shadow-lg scale-105 pulse-glow" 
                    : "bg-gradient-to-br from-primary/90 to-[hsl(260_80%_60%)]/90 shadow-md"
                )}>
                  <Icon className="h-6 w-6 text-primary-foreground" strokeWidth={1.5} />
                </div>
              ) : (
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                  isActive && "bg-primary/10"
                )}>
                  <Icon 
                    className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive ? "text-primary scale-110" : "text-muted-foreground"
                    )} 
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                </div>
              )}
              <span className={cn(
                "text-[11px] font-medium tracking-wide transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground",
                isScan && "mt-0.5"
              )}>
                {item.label}
              </span>
              
              {/* Active indicator dot */}
              {isActive && !isScan && (
                <div className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
