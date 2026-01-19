import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, TrendingUp, History, MessageCircle } from 'lucide-react';

interface TabNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full max-w-lg grid-cols-4 bg-card">
        <TabsTrigger 
          value="overview" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger 
          value="patterns"
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <TrendingUp className="h-4 w-4" />
          <span className="hidden sm:inline">Patterns</span>
        </TabsTrigger>
        <TabsTrigger 
          value="transactions"
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">History</span>
        </TabsTrigger>
        <TabsTrigger 
          value="ask"
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Ask AI</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
