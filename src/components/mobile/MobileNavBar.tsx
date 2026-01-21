import { cn } from '@/lib/utils';
import { 
  LayoutGrid, 
  TrendingUp, 
  History, 
  FileSearch, 
  MessageCircle 
} from 'lucide-react';

interface MobileNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Home', icon: LayoutGrid },
  { id: 'patterns', label: 'Patterns', icon: TrendingUp },
  { id: 'scan', label: 'Scan', icon: FileSearch },
  { id: 'transactions', label: 'History', icon: History },
  { id: 'ask', label: 'Ask AI', icon: MessageCircle },
];

export function MobileNavBar({ activeTab, onTabChange }: MobileNavBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isScan = item.id === 'scan';
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition-all duration-200",
                isScan 
                  ? "relative -mt-6"
                  : "",
                isActive && !isScan
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {isScan ? (
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground scale-110" 
                    : "bg-primary/90 text-primary-foreground"
                )}>
                  <Icon className="h-6 w-6" />
                </div>
              ) : (
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                  isActive && "bg-primary/10"
                )}>
                  <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
                </div>
              )}
              <span className={cn(
                "text-[10px] font-medium transition-all",
                isActive ? "text-primary" : "text-muted-foreground",
                isScan && "mt-1"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
