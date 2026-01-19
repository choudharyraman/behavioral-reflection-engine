import { 
  Transaction, 
  SpendingPattern, 
  InsightCard, 
  WeeklyHeatmapData, 
  CategoryBreakdown,
  TransactionCategory 
} from '@/types/transaction';

const categories: TransactionCategory[] = ['food', 'transport', 'shopping', 'entertainment', 'bills', 'health'];
const merchants: Record<TransactionCategory, string[]> = {
  food: ['Swiggy', 'Zomato', 'Dominos', 'Starbucks', 'McDonalds', 'Subway'],
  transport: ['Uber', 'Ola', 'Metro Card', 'Rapido', 'BluSmart'],
  shopping: ['Amazon', 'Flipkart', 'Myntra', 'Nykaa', 'Croma'],
  entertainment: ['Netflix', 'Spotify', 'BookMyShow', 'Steam', 'Disney+'],
  bills: ['Electricity Bill', 'Internet Bill', 'Phone Recharge', 'Gas Bill'],
  health: ['Apollo Pharmacy', 'Practo', 'Gym Membership', 'Cult.fit'],
  other: ['Miscellaneous']
};

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getTimeOfDay(hour: number): Transaction['timeOfDay'] {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'late_night';
}

function getDayOfWeek(date: Date): Transaction['dayOfWeek'] {
  const days: Transaction['dayOfWeek'][] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

export function generateMockTransactions(count: number = 100): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const date = randomDate(threeMonthsAgo, now);
    const category = categories[Math.floor(Math.random() * categories.length)];
    const merchantList = merchants[category];
    
    transactions.push({
      id: `txn-${i}`,
      timestamp: date,
      amount: Math.round((Math.random() * 2000 + 50) * 100) / 100,
      merchant: merchantList[Math.floor(Math.random() * merchantList.length)],
      category,
      isRecurring: Math.random() > 0.7,
      timeOfDay: getTimeOfDay(date.getHours()),
      dayOfWeek: getDayOfWeek(date),
    });
  }

  // Add some late-night food patterns
  for (let i = 0; i < 15; i++) {
    const date = randomDate(threeMonthsAgo, now);
    date.setHours(21 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60));
    
    transactions.push({
      id: `txn-latenight-${i}`,
      timestamp: date,
      amount: Math.round((Math.random() * 500 + 200) * 100) / 100,
      merchant: merchants.food[Math.floor(Math.random() * 2)],
      category: 'food',
      isRecurring: false,
      timeOfDay: 'late_night',
      dayOfWeek: getDayOfWeek(date),
    });
  }

  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function generateMockPatterns(): SpendingPattern[] {
  return [
    {
      id: 'pattern-1',
      title: 'Late-night food orders',
      description: 'You tend to order food delivery between 9-11 PM on weekdays',
      category: 'food',
      confidence: 'strong',
      occurrences: 12,
      timeRange: '9 PM - 11 PM',
      averageAmount: 380,
      transactions: [],
      firstDetected: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      trend: 'stable',
    },
    {
      id: 'pattern-2',
      title: 'Weekend shopping sprees',
      description: 'Your shopping transactions peak during weekends',
      category: 'shopping',
      confidence: 'strong',
      occurrences: 8,
      timeRange: 'Saturdays & Sundays',
      averageAmount: 1250,
      transactions: [],
      firstDetected: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      trend: 'increasing',
    },
    {
      id: 'pattern-3',
      title: 'Post-salary entertainment',
      description: 'Entertainment spending increases in the first week after salary',
      category: 'entertainment',
      confidence: 'emerging',
      occurrences: 4,
      timeRange: '1st-7th of month',
      averageAmount: 650,
      transactions: [],
      firstDetected: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      trend: 'stable',
    },
    {
      id: 'pattern-4',
      title: 'Morning coffee ritual',
      description: 'Consistent coffee purchases every Tuesday and Thursday morning',
      category: 'food',
      confidence: 'strong',
      occurrences: 16,
      timeRange: '8 AM - 10 AM',
      averageAmount: 180,
      transactions: [],
      firstDetected: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
      trend: 'stable',
    },
  ];
}

export function generateMockInsights(): InsightCard[] {
  const patterns = generateMockPatterns();
  
  return [
    {
      id: 'insight-1',
      title: 'Late-night ordering pattern detected',
      narrative: 'We noticed you often order food delivery late at night on weekdays. This pattern has been consistent over the last 3 months. You\'ve spent ₹4,560 on late-night orders this month.',
      pattern: patterns[0],
      actionable: true,
      dismissed: false,
      userFeedback: null,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'insight-2',
      title: 'Weekend spending is rising',
      narrative: 'Your weekend shopping has increased by 23% compared to last month. This might suggest weekend retail therapy is becoming a habit.',
      pattern: patterns[1],
      actionable: true,
      dismissed: false,
      userFeedback: null,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'insight-3',
      title: 'New pattern emerging',
      narrative: 'It looks like you tend to spend more on entertainment right after your salary is credited. This pattern is starting to emerge over the last 2 months.',
      pattern: patterns[2],
      actionable: false,
      dismissed: false,
      userFeedback: null,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ];
}

export function generateHeatmapData(): WeeklyHeatmapData[] {
  const data: WeeklyHeatmapData[] = [];
  const days: Transaction['dayOfWeek'][] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach(day => {
    for (let hour = 0; hour < 24; hour++) {
      let value = Math.random() * 50;
      
      // Create patterns
      if (day !== 'saturday' && day !== 'sunday' && hour >= 21 && hour <= 23) {
        value = 60 + Math.random() * 40; // Late night weekday spike
      }
      if ((day === 'saturday' || day === 'sunday') && hour >= 14 && hour <= 18) {
        value = 70 + Math.random() * 30; // Weekend afternoon spike
      }
      
      data.push({
        day,
        hour,
        value: Math.round(value),
        count: Math.floor(value / 10),
      });
    }
  });
  
  return data;
}

export function generateCategoryBreakdown(): CategoryBreakdown[] {
  return [
    { category: 'food', total: 12450, percentage: 32, trend: 8, transactionCount: 45 },
    { category: 'shopping', total: 8920, percentage: 23, trend: -5, transactionCount: 12 },
    { category: 'transport', total: 5680, percentage: 15, trend: 2, transactionCount: 28 },
    { category: 'entertainment', total: 4560, percentage: 12, trend: 15, transactionCount: 8 },
    { category: 'bills', total: 4200, percentage: 11, trend: 0, transactionCount: 6 },
    { category: 'health', total: 2890, percentage: 7, trend: -3, transactionCount: 5 },
  ];
}
