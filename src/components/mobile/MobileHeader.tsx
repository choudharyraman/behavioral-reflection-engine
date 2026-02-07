import { useState, useEffect } from 'react';
import { Bell, Moon, Sun, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  userName?: string;
  onNotificationSettingsClick?: () => void;
  onProfileClick?: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: '1', title: 'Unusual Spending', message: 'You spent 30% more on food this week', time: '2h ago', read: false },
  { id: '2', title: 'New Pattern', message: 'We detected a new late-night spending pattern', time: '1d ago', read: false },
  { id: '3', title: 'Budget Alert', message: 'You\'ve used 80% of your shopping budget', time: '2d ago', read: true },
];

export function MobileHeader({ userName = 'User', onNotificationSettingsClick, onProfileClick }: MobileHeaderProps) {
  const greeting = getGreeting();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);
  
  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  
  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-area-inset-top">
      <div className="flex items-center justify-between px-5 py-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Avatar 
            className="h-12 w-12 ring-2 ring-primary/20 shadow-lg cursor-pointer hover:ring-primary/40 transition-all duration-300 active:scale-95"
            onClick={onProfileClick}
          >
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-[hsl(290_70%_55%)] text-primary-foreground font-bold text-lg">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="cursor-pointer" onClick={onProfileClick}>
            <p className="text-xs font-medium text-muted-foreground tracking-wide">{greeting}</p>
            <h1 className="text-lg font-bold text-foreground">{userName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            className="h-11 w-11 rounded-2xl bg-secondary hover:bg-secondary/80 transition-all duration-300 active:scale-95"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-foreground" strokeWidth={2} />
            ) : (
              <Moon className="h-5 w-5 text-foreground" strokeWidth={2} />
            )}
          </Button>

          {/* Notifications */}
          <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-11 w-11 rounded-2xl bg-secondary hover:bg-secondary/80 transition-all duration-300"
              >
                <Bell className="h-5 w-5 text-foreground" strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background animate-pulse" />
                )}
              </Button>
            </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md rounded-l-3xl">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold">Notifications</SheetTitle>
              <SheetDescription>
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-3">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-16 w-16 rounded-3xl bg-secondary flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={cn(
                      "relative rounded-3xl p-4 transition-all duration-300 cursor-pointer",
                      notif.read 
                        ? "bg-secondary/50" 
                        : "bg-primary/10 border-l-4 border-primary"
                    )}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7 rounded-full opacity-60 hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); clearNotification(notif.id); }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                    <h4 className="font-semibold text-foreground pr-8">{notif.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2 font-medium">{notif.time}</p>
                  </div>
                ))
              )}
            </div>
          </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}