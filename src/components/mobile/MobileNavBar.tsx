import { cn } from '@/lib/utils';
import { LayoutGrid, TrendingUp, History, Scan, Sparkles } from 'lucide-react';
interface MobileNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
const navItems = [{
  id: 'overview',
  label: 'Home',
  icon: LayoutGrid
}, {
  id: 'patterns',
  label: 'Patterns',
  icon: TrendingUp
}, {
  id: 'ask',
  label: 'Ask AI',
  icon: Sparkles,
  isCenter: true
}, {
  id: 'transactions',
  label: 'History',
  icon: History
}, {
  id: 'scan',
  label: 'Scan',
  icon: Scan
}];
export function MobileNavBar({
  activeTab,
  onTabChange
}: MobileNavBarProps) {
  return <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/50 safe-area-inset-bottom">
      <div className="py-2.5 max-w-lg mx-auto flex items-center justify-center rounded-none px-[10px]">
        {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const isCenter = item.isCenter;
        return <button key={item.id} onClick={() => onTabChange(item.id)} className={cn("relative flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-300", isCenter ? "px-2 -mt-5" : "px-4 py-2")}>
              {isCenter ? <div className={cn("flex h-16 w-16 items-center justify-center rounded-[1.75rem] transition-all duration-300 shadow-lg", isActive ? "bg-gradient-to-br from-primary to-[hsl(290_70%_55%)] scale-105 pulse-glow" : "bg-gradient-to-br from-primary/90 to-[hsl(290_70%_55%)]/90")}>
                  <Icon className="h-7 w-7 text-primary-foreground" strokeWidth={2} />
                </div> : <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300", isActive && "bg-primary/15")}>
                  <Icon className={cn("h-6 w-6 transition-all duration-300", isActive ? "text-primary" : "text-muted-foreground")} strokeWidth={isActive ? 2.5 : 2} />
                </div>}
              <span className={cn("text-[11px] font-semibold tracking-wide transition-all duration-300", isActive ? "text-primary" : "text-muted-foreground", isCenter && "mt-1.5")}>
                {item.label}
              </span>
              
              {/* M3 Active indicator pill */}
              {isActive && !isCenter && <div className="absolute -bottom-0.5 h-1 w-6 rounded-full bg-primary" />}
            </button>;
      })}
      </div>
    </nav>;
}