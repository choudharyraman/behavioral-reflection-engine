import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
import { MomentStories, MomentStory } from '@/components/mobile/MomentStories';
import { EmotionTagger, EmotionTag, EmotionSummary } from '@/components/mobile/EmotionTagger';
import { SpendingSeasons, SpendingSeason } from '@/components/mobile/SpendingSeasons';
import { WeeklyCheckin, WeeklyCheckinData } from '@/components/mobile/WeeklyCheckin';
import { MoneyJournal, JournalEntry } from '@/components/mobile/MoneyJournal';
import { NotificationSettings, NotificationPreferences } from '@/components/mobile/NotificationSettings';
import { SoftNudge, DeviationEvent } from '@/components/mobile/SoftNudge';
import { ImpulseBuysScreen } from '@/components/mobile/ImpulseBuysScreen';
import { InsightsScreen } from '@/components/mobile/InsightsScreen';
import { ProfileScreen } from '@/components/mobile/ProfileScreen';
import {
  generateMockTransactions,
  generateMockPatterns,
  generateMockInsights,
  generateHeatmapData,
  generateCategoryBreakdown,
} from '@/data/mockData';
import { InsightCard as InsightCardType, SpendingPattern, ContextTag } from '@/types/transaction';
import { toast } from 'sonner';

// Mock data generators for new features
const generateMockStories = (): MomentStory[] => [
  {
    id: '1',
    title: 'Friday Night Treats',
    narrative: "It looks like most of your 'treat yourself' spends happen on Fridays between 7–10 PM. This might be your way of winding down after a long work week.",
    patternType: 'food',
    heatmapData: { Mon: 1, Tue: 1, Wed: 2, Thu: 2, Fri: 5, Sat: 3, Sun: 2 },
    createdAt: new Date(),
    dismissed: false,
  },
  {
    id: '2',
    title: 'Late Night Rides',
    narrative: "You tend to spend more on rides in weeks when you work late 3+ days. This seems connected to your work schedule.",
    patternType: 'transport',
    heatmapData: { Mon: 2, Tue: 3, Wed: 4, Thu: 3, Fri: 2, Sat: 1, Sun: 1 },
    createdAt: new Date(Date.now() - 86400000),
    dismissed: false,
  },
];

const generateMockSeasons = (): SpendingSeason[] => [
  {
    id: '1',
    label: 'Heavy Social Month',
    description: 'This month, you shifted more of your money towards eating out and entertainment compared to the past 3 months.',
    startDate: new Date(),
    categoryChanges: { food: { change: 23, amount: 8500 }, entertainment: { change: 15, amount: 3200 }, shopping: { change: -12, amount: 2100 } },
    isCurrent: true,
  },
  {
    id: '2',
    label: 'Quiet Home Month',
    description: 'A quieter period with more home-based spending and reduced social activities.',
    startDate: new Date(Date.now() - 60 * 86400000),
    endDate: new Date(Date.now() - 30 * 86400000),
    categoryChanges: { bills: { change: 8, amount: 12000 }, entertainment: { change: -25, amount: 1800 } },
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [insights, setInsights] = useState<InsightCardType[]>(generateMockInsights());
  const [transactions, setTransactions] = useState(generateMockTransactions(100));
  const [stories, setStories] = useState<MomentStory[]>(generateMockStories());
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [emotionCounts, setEmotionCounts] = useState<Record<string, number>>({});
  const [showEmotionTagger, setShowEmotionTagger] = useState(false);
  const [taggingTransaction, setTaggingTransaction] = useState<{id: string; merchant: string; amount: number} | null>(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    weeklyDigest: true,
    softNudges: false,
    sensitivity: 'medium',
    mutedCategories: [],
  });
  const [currentDeviation, setCurrentDeviation] = useState<DeviationEvent | null>(null);
  const [weeklyCheckin, setWeeklyCheckin] = useState<WeeklyCheckinData | null>({
    id: '1',
    weekStart: new Date(Date.now() - 7 * 86400000),
    summary: 'Compared to your usual, this week you spent more on food delivery and less on transport.',
    categoryChanges: { food: { change: 35, amount: 4200 }, transport: { change: -15, amount: 1800 } },
  });
  
  const patterns = useMemo(() => generateMockPatterns(), []);
  const heatmapData = useMemo(() => generateHeatmapData(), []);
  const categoryData = useMemo(() => generateCategoryBreakdown(), []);
  const seasons = useMemo(() => generateMockSeasons(), []);

  // Calculate stats for QuickStats
  const totalSpent = useMemo(() => 
    transactions.reduce((sum, t) => sum + t.amount, 0), [transactions]);
  
  const impulseCount = useMemo(() => 
    transactions.filter(t => !t.isRecurring && t.amount < 1000 && 
      (t.timeOfDay === 'late_night' || t.timeOfDay === 'evening' || 
       t.dayOfWeek === 'saturday' || t.dayOfWeek === 'sunday')).length, 
    [transactions]);

  const handleInsightFeedback = (id: string, feedback: 'accurate' | 'not_quite') => {
    setInsights(prev => prev.map(insight => insight.id === id ? { ...insight, userFeedback: feedback } : insight));
    toast.success(feedback === 'accurate' ? 'Thanks! This helps improve your insights.' : "Got it! We'll refine this pattern.");
  };

  const handleStoryFeedback = (id: string, feedback: 'accurate' | 'not_quite') => {
    setStories(prev => prev.map(s => s.id === id ? { ...s, userFeedback: feedback } : s));
    toast.success('Feedback saved!');
  };

  const handleStoryDismiss = (id: string) => {
    setStories(prev => prev.map(s => s.id === id ? { ...s, dismissed: true } : s));
  };

  const handlePatternClick = (pattern: SpendingPattern) => {
    toast.info(`Viewing: ${pattern.title}`);
  };

  const handleAddTag = (transactionId: string, tag: ContextTag) => {
    setTransactions(prev => prev.map(txn => txn.id === transactionId ? { ...txn, contextTags: [...(txn.contextTags || []), tag] } : txn));
    toast.success('Context added!');
  };

  const handleEmotionTag = (tag: EmotionTag, note?: string) => {
    setEmotionCounts(prev => ({ ...prev, [tag.id]: (prev[tag.id] || 0) + 1 }));
    setShowEmotionTagger(false);
    setTaggingTransaction(null);
    toast.success(`Tagged as "${tag.label}"`);
  };

  const handleJournalEntry = (content: string, patternId?: string) => {
    const pattern = patterns.find(p => p.id === patternId);
    setJournalEntries(prev => [{ id: Date.now().toString(), content, patternId, patternTitle: pattern?.title, createdAt: new Date() }, ...prev]);
    toast.success('Journal entry saved!');
  };

  const handleCheckinRespond = (response: string, note?: string) => {
    setWeeklyCheckin(prev => prev ? { ...prev, userResponse: response, userNote: note } : null);
    toast.success('Response saved!');
    setWeeklyCheckin(null);
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    toast.success('Signed out successfully');
  };

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background mesh-gradient flex flex-col">
      {activeTab === 'overview' && <MobileHeader userName={displayName} onNotificationSettingsClick={() => setShowNotificationSettings(true)} />}
      
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8 pb-24 sm:pb-28 pt-2">
            <QuickStats 
              onNavigate={handleNavigate}
              totalSpent={totalSpent}
              impulseCount={impulseCount}
              patternCount={patterns.length}
              insightCount={insights.filter(i => !i.userFeedback).length}
            />
            {stories.filter(s => !s.dismissed).length > 0 && (
              <div className="px-4"><MomentStories stories={stories} onFeedback={handleStoryFeedback} onDismiss={handleStoryDismiss} /></div>
            )}
            <InsightCarousel insights={insights} onFeedback={handleInsightFeedback} />
            {Object.keys(emotionCounts).length > 0 && <div className="px-4"><EmotionSummary emotionCounts={emotionCounts} /></div>}
            <CategoryGrid data={categoryData} />
            <MobileHeatmap data={heatmapData} />
          </div>
        )}
        {activeTab === 'patterns' && <MobilePatternList patterns={patterns} onPatternClick={handlePatternClick} />}
        {activeTab === 'transactions' && (
          <MobileTransactionList 
            transactions={transactions} 
            onAddTag={handleAddTag} 
            onEmotionTag={(txn) => {
              setTaggingTransaction(txn);
              setShowEmotionTagger(true);
            }}
          />
        )}
        {activeTab === 'scan' && <MobileScanDocument />}
        {activeTab === 'ask' && <MobileAskAI />}
        {activeTab === 'seasons' && <SpendingSeasons seasons={seasons} />}
        {activeTab === 'checkin' && <WeeklyCheckin checkin={weeklyCheckin} onRespond={handleCheckinRespond} onDismiss={() => setWeeklyCheckin(null)} />}
        {activeTab === 'journal' && <MoneyJournal entries={journalEntries} patterns={patterns} onAddEntry={handleJournalEntry} onDeleteEntry={(id) => setJournalEntries(prev => prev.filter(e => e.id !== id))} />}
        
        {/* New screens */}
        {activeTab === 'impulse' && <ImpulseBuysScreen transactions={transactions} onBack={() => setActiveTab('overview')} />}
        {activeTab === 'insights' && <InsightsScreen insights={insights} onBack={() => setActiveTab('overview')} onFeedback={handleInsightFeedback} />}
        {activeTab === 'profile' && <ProfileScreen onSignOut={handleSignOut} />}
      </main>

      <MobileNavBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <EmotionTagger isOpen={showEmotionTagger} onClose={() => { setShowEmotionTagger(false); setTaggingTransaction(null); }} onSelectTag={handleEmotionTag} transactionMerchant={taggingTransaction?.merchant} transactionAmount={taggingTransaction?.amount} />
      <NotificationSettings isOpen={showNotificationSettings} onClose={() => setShowNotificationSettings(false)} preferences={notificationPrefs} onSave={setNotificationPrefs} />
      <SoftNudge deviation={currentDeviation} onAcknowledge={(id, resp, note) => { setCurrentDeviation(null); toast.success('Response saved!'); }} onDismiss={() => setCurrentDeviation(null)} onMuteCategory={(cat) => { setNotificationPrefs(p => ({ ...p, mutedCategories: [...p.mutedCategories, cat] })); setCurrentDeviation(null); toast.info(`${cat} alerts muted`); }} />
    </div>
  );
};

export default Index;
