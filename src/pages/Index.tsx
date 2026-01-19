import { useState, useMemo } from 'react';
import { Header } from '@/components/dashboard/Header';
import { TabNav } from '@/components/dashboard/TabNav';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { PatternTimeline } from '@/components/dashboard/PatternTimeline';
import { SpendingHeatmap } from '@/components/dashboard/SpendingHeatmap';
import { CategoryBreakdownChart } from '@/components/dashboard/CategoryBreakdownChart';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { AskAI } from '@/components/dashboard/AskAI';
import { PrivacyBanner } from '@/components/dashboard/PrivacyBanner';
import {
  generateMockTransactions,
  generateMockPatterns,
  generateMockInsights,
  generateHeatmapData,
  generateCategoryBreakdown,
} from '@/data/mockData';
import { InsightCard as InsightCardType, SpendingPattern, ContextTag } from '@/types/transaction';
import { toast } from 'sonner';

const Index = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [insights, setInsights] = useState<InsightCardType[]>(generateMockInsights());
  const [transactions, setTransactions] = useState(generateMockTransactions(100));
  
  const patterns = useMemo(() => generateMockPatterns(), []);
  const heatmapData = useMemo(() => generateHeatmapData(), []);
  const categoryData = useMemo(() => generateCategoryBreakdown(), []);

  const handleInsightFeedback = (id: string, feedback: 'accurate' | 'not_quite') => {
    setInsights(prev => 
      prev.map(insight => 
        insight.id === id ? { ...insight, userFeedback: feedback } : insight
      )
    );
    
    if (feedback === 'accurate') {
      toast.success('Thanks for confirming! This helps improve your insights.');
    } else {
      toast.info('Got it! We\'ll refine this pattern detection.');
    }
  };

  const handleInsightExpand = (id: string) => {
    toast.info('Pattern detection methodology explained');
  };

  const handlePatternClick = (pattern: SpendingPattern) => {
    toast.info(`Viewing details for: ${pattern.title}`);
  };

  const handleAddTag = (transactionId: string, tag: ContextTag) => {
    setTransactions(prev =>
      prev.map(txn =>
        txn.id === transactionId
          ? { ...txn, contextTags: [...(txn.contextTags || []), tag] }
          : txn
      )
    );
    toast.success('Context tag added! This helps personalize future insights.');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6">
        <div className="mb-6">
          <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <PrivacyBanner />
            <StatsCards />
            
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Insights column */}
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  Latest Insights
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {insights.filter(i => !i.dismissed).length} new
                  </span>
                </h2>
                {insights
                  .filter(insight => !insight.dismissed)
                  .map(insight => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      onFeedback={handleInsightFeedback}
                      onExpand={handleInsightExpand}
                    />
                  ))}
              </div>

              {/* Category breakdown */}
              <CategoryBreakdownChart data={categoryData} />
            </div>

            <SpendingHeatmap data={heatmapData} />
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <PatternTimeline 
              patterns={patterns} 
              onPatternClick={handlePatternClick} 
            />
            <SpendingHeatmap data={heatmapData} />
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <TransactionList 
            transactions={transactions} 
            onAddTag={handleAddTag}
          />
        )}

        {/* Ask AI Tab */}
        {activeTab === 'ask' && (
          <div className="mx-auto max-w-3xl">
            <AskAI />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
