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

export function MobileHeader({ userName = 'User', onNotificationSettingsClick }: MobileHeaderProps) {
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
    <header className="sticky top-0 z-40 glass safe-area-inset-top">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 sm:gap-4">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/10 shadow-md cursor-pointer hover:ring-primary/30 transition-all">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-base sm:text-lg">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-wide">{greeting}</p>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">{userName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-card shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {isDark ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" strokeWidth={1.5} />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" strokeWidth={1.5} />
            )}
          </Button>

          {/* Notifications */}
          <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
                )}
              </Button>
            </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-3">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={cn(
                      "relative rounded-2xl p-4 transition-all cursor-pointer",
                      notif.read ? "bg-muted/30" : "bg-primary/5 border-l-4 border-primary"
                    )}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); clearNotification(notif.id); }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <h4 className="font-medium text-foreground pr-6">{notif.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">{notif.time}</p>
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
