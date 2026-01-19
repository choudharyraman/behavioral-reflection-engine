export type TransactionCategory = 
  | 'food' 
  | 'transport' 
  | 'shopping' 
  | 'entertainment' 
  | 'bills' 
  | 'health' 
  | 'other';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'late_night';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type PatternConfidence = 'strong' | 'emerging' | 'weak';

export type ContextTag = 
  | 'work_stress' 
  | 'celebration' 
  | 'guests' 
  | 'feeling_unwell' 
  | 'boredom' 
  | 'custom';

export interface Transaction {
  id: string;
  timestamp: Date;
  amount: number;
  merchant: string;
  category: TransactionCategory;
  isRecurring: boolean;
  timeOfDay: TimeOfDay;
  dayOfWeek: DayOfWeek;
  contextTags?: ContextTag[];
  customTag?: string;
}

export interface SpendingPattern {
  id: string;
  title: string;
  description: string;
  category: TransactionCategory;
  confidence: PatternConfidence;
  occurrences: number;
  timeRange: string;
  averageAmount: number;
  transactions: Transaction[];
  firstDetected: Date;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface InsightCard {
  id: string;
  title: string;
  narrative: string;
  pattern: SpendingPattern;
  actionable: boolean;
  dismissed: boolean;
  userFeedback?: 'accurate' | 'not_quite' | null;
  createdAt: Date;
}

export interface WeeklyHeatmapData {
  day: DayOfWeek;
  hour: number;
  value: number;
  count: number;
}

export interface CategoryBreakdown {
  category: TransactionCategory;
  total: number;
  percentage: number;
  trend: number;
  transactionCount: number;
}
