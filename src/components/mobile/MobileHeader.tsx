import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MobileHeaderProps {
  userName?: string;
}

export function MobileHeader({ userName = 'User' }: MobileHeaderProps) {
  const greeting = getGreeting();
  
  return (
    <header className="sticky top-0 z-40 glass safe-area-inset-top">
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 ring-2 ring-primary/10 shadow-md">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-lg">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-muted-foreground tracking-wide">{greeting}</p>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">{userName}</h1>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-11 w-11 rounded-full bg-card shadow-sm hover:shadow-md transition-shadow"
        >
          <Bell className="h-5 w-5 text-foreground" strokeWidth={1.5} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </Button>
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
