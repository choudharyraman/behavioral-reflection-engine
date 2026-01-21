import { useState, useMemo } from 'react';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileNavBar } from '@/components/mobile/MobileNavBar';
import { QuickStats } from '@/components/mobile/QuickStats';
import { InsightCarousel } from '@/components/mobile/InsightCarousel';
import { CategoryGrid } from '@/components/mobile/CategoryGrid';
import { MobilePatternList } from '@/components/mobile/MobilePatternList';
import { MobileTransactionList } from '@/components/mobile/MobileTransactionList';
import { MobileAskAI } from '@/components/mobile/MobileAskAI';
import { MobileScanDocument } from '@/components/mobile/MobileScanDocument';
import { MobileHeatmap } from '@/components/mobile/MobileHeatmap';
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
      toast.success('Thanks! This helps improve your insights.');
    } else {
      toast.info('Got it! We\'ll refine this pattern.');
    }
  };

  const handlePatternClick = (pattern: SpendingPattern) => {
    toast.info(`Viewing: ${pattern.title}`);
  };

  const handleAddTag = (transactionId: string, tag: ContextTag) => {
    setTransactions(prev =>
      prev.map(txn =>
        txn.id === transactionId
          ? { ...txn, contextTags: [...(txn.contextTags || []), tag] }
          : txn
      )
    );
    toast.success('Context added!');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Only show on overview */}
      {activeTab === 'overview' && <MobileHeader userName="Alex" />}
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 pb-24">
            <QuickStats />
            
            <InsightCarousel 
              insights={insights}
              onFeedback={handleInsightFeedback}
            />
            
            <CategoryGrid data={categoryData} />
            
            <MobileHeatmap data={heatmapData} />
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <div className="pt-4">
            <MobilePatternList 
              patterns={patterns} 
              onPatternClick={handlePatternClick} 
            />
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <MobileTransactionList 
            transactions={transactions} 
            onAddTag={handleAddTag}
          />
        )}

        {/* Scan Documents Tab */}
        {activeTab === 'scan' && (
          <MobileScanDocument />
        )}

        {/* Ask AI Tab */}
        {activeTab === 'ask' && (
          <MobileAskAI />
        )}
      </main>

      {/* Bottom Navigation */}
      <MobileNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
