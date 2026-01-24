import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Loader2, 
  TrendingUp, 
  Sparkles,
  Shield,
  CheckCircle2,
  ShoppingBag,
  Utensils,
  Car,
  Film,
  Receipt,
  Heart,
  X,
  Camera,
  FolderOpen,
  ArrowRight,
  History,
  Trash2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface AnalysisResult {
  id: string;
  fileName: string;
  analyzedAt: Date;
  summary: {
    totalTransactions: number;
    totalSpent: number;
    dateRange: { start: string; end: string };
    topCategories: Array<{ name: string; amount: number; percentage: number }>;
  };
  patterns: Array<{
    id: string;
    title: string;
    description: string;
    confidence: 'strong' | 'emerging' | 'weak';
    category: string;
    occurrences: number;
    averageAmount: number;
    timeRange: string;
    trend: 'increasing' | 'stable' | 'decreasing';
  }>;
  insights: Array<{
    id: string;
    title: string;
    description: string;
    confidence: 'strong' | 'emerging' | 'weak';
    category: string;
    actionable: string;
  }>;
  transactions: Array<{
    date: string;
    description: string;
    amount: number;
    category: string;
  }>;
}

const categoryIcons: Record<string, React.ReactNode> = {
  food: <Utensils className="h-4 w-4" strokeWidth={1.5} />,
  transport: <Car className="h-4 w-4" strokeWidth={1.5} />,
  shopping: <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />,
  entertainment: <Film className="h-4 w-4" strokeWidth={1.5} />,
  bills: <Receipt className="h-4 w-4" strokeWidth={1.5} />,
  health: <Heart className="h-4 w-4" strokeWidth={1.5} />,
};

const categoryGradients: Record<string, string> = {
  food: 'from-[hsl(var(--category-food))] to-[hsl(var(--category-food))]/80',
  transport: 'from-[hsl(var(--category-transport))] to-[hsl(var(--category-transport))]/80',
  shopping: 'from-[hsl(var(--category-shopping))] to-[hsl(var(--category-shopping))]/80',
  entertainment: 'from-[hsl(var(--category-entertainment))] to-[hsl(var(--category-entertainment))]/80',
  bills: 'from-[hsl(var(--category-bills))] to-[hsl(var(--category-bills))]/80',
  health: 'from-[hsl(var(--category-health))] to-[hsl(var(--category-health))]/80',
};

const confidenceStyles = {
  strong: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20',
  emerging: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20',
  weak: 'bg-muted text-muted-foreground border-border',
};

type ViewMode = 'upload' | 'analyzing' | 'results' | 'history';

export function MobileScanDocument() {
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [fileName, setFileName] = useState<string>('');

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const analyzeDocument = async (text: string, name: string) => {
    setViewMode('analyzing');
    setAnalysisProgress(0);

    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-statement', {
        body: { documentText: text }
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const result: AnalysisResult = {
        id: `analysis-${Date.now()}`,
        fileName: name,
        analyzedAt: new Date(),
        ...data
      };

      setCurrentResult(result);
      setAnalysisHistory(prev => [result, ...prev].slice(0, 10)); // Keep last 10
      setViewMode('results');
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze document');
      setViewMode('upload');
    }
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    const validTypes = ['application/pdf', 'text/csv', 'text/plain'];
    const validExtensions = ['.pdf', '.csv', '.txt'];
    
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidType && !hasValidExtension) {
      toast.error('Please upload a PDF, CSV, or TXT file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFileName(file.name);

    try {
      if (file.type === 'text/plain' || file.type === 'text/csv' || 
          file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
        const text = await readFileAsText(file);
        await analyzeDocument(text, file.name);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        toast.info('Reading PDF content...');
        const text = await readFileAsText(file);
        await analyzeDocument(text.length > 100 ? text : `PDF Document: ${file.name}`, file.name);
      }
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Failed to process file');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const viewHistoryItem = (result: AnalysisResult) => {
    setCurrentResult(result);
    setViewMode('results');
  };

  const deleteHistoryItem = (id: string) => {
    setAnalysisHistory(prev => prev.filter(r => r.id !== id));
    toast.success('Removed from history');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col min-h-full pb-24 px-4 sm:px-5 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        
      {/* Upload Section */}
      {viewMode === 'upload' && (
        <div className="flex flex-col items-center justify-center flex-1 py-10 sm:py-12 animate-fade-in">
          <div className="relative">
            <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-[1.75rem] sm:rounded-[2rem] bg-gradient-to-br from-primary/20 to-primary/10 mb-6 sm:mb-8">
              <FileText className="h-12 w-12 sm:h-14 sm:w-14 text-primary" strokeWidth={1.5} />
            </div>
            <div className="absolute -inset-6 rounded-[3rem] bg-primary/5 blur-2xl -z-10" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground text-center tracking-tight">
            Scan Your Statement
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground text-center max-w-xs leading-relaxed">
            Upload your bank statement for AI-powered behavioral analysis
          </p>
          
          <div className="mt-8 sm:mt-10 flex gap-3 sm:gap-4 w-full max-w-xs">
            <label className="cursor-pointer flex-1 active:scale-[0.98] transition-transform">
              <input
                type="file"
                accept=".pdf,.csv,.txt"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl bg-card p-5 sm:p-6 shadow-sm transition-all duration-300 card-hover h-full">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-[hsl(260_80%_60%)] shadow-md">
                  <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <span className="block text-xs sm:text-sm font-semibold text-foreground">Browse Files</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">PDF, CSV, TXT</span>
                </div>
              </div>
            </label>
            
            <label className="cursor-pointer flex-1 active:scale-[0.98] transition-transform">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl bg-card p-5 sm:p-6 shadow-sm transition-all duration-300 card-hover h-full">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-foreground shadow-md">
                  <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-background" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <span className="block text-xs sm:text-sm font-semibold text-foreground">Take Photo</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Scan receipt</span>
                </div>
              </div>
            </label>
          </div>

          {/* History button */}
          {analysisHistory.length > 0 && (
            <Button
              variant="outline"
              className="mt-6 rounded-xl"
              onClick={() => setViewMode('history')}
            >
              <History className="mr-2 h-4 w-4" />
              View History ({analysisHistory.length})
            </Button>
          )}
          
          <div className="mt-8 sm:mt-10 flex items-start gap-3 rounded-2xl sm:rounded-3xl bg-primary/5 p-4 sm:p-5 max-w-sm">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary mt-0.5" strokeWidth={1.5} />
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Privacy First</span><br />
              Your document is analyzed securely and never stored on our servers.
            </p>
          </div>
        </div>
      )}

      {/* History View */}
      {viewMode === 'history' && (
        <div className="py-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Analysis History</h2>
              <p className="text-sm text-muted-foreground">{analysisHistory.length} previous scans</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setViewMode('upload')} className="rounded-xl">
              <X className="mr-1 h-4 w-4" /> Close
            </Button>
          </div>

          <div className="space-y-3">
            {analysisHistory.map((result, idx) => (
              <div
                key={result.id}
                className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{result.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(result.analyzedAt, 'MMM d, yyyy h:mm a')} • {formatCurrency(result.summary.totalSpent)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => viewHistoryItem(result)}
                    className="h-8 w-8 rounded-lg"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteHistoryItem(result.id)}
                    className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyzing State */}
      {viewMode === 'analyzing' && (
        <div className="flex flex-col items-center justify-center flex-1 py-10 sm:py-12 animate-fade-in">
          <div className="relative">
            <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-[1.75rem] sm:rounded-[2rem] bg-gradient-to-br from-primary/20 to-primary/10">
              <Loader2 className="h-12 w-12 sm:h-14 sm:w-14 animate-spin text-primary" strokeWidth={1.5} />
            </div>
            <div className="absolute -inset-6 rounded-[3rem] bg-primary/10 blur-2xl animate-pulse -z-10" />
          </div>
          
          <h2 className="mt-6 sm:mt-8 text-xl sm:text-2xl font-semibold text-foreground tracking-tight">Analyzing</h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground text-center truncate max-w-[200px]">{fileName}</p>
          
          <div className="mt-6 sm:mt-8 w-full max-w-xs">
            <Progress value={analysisProgress} className="h-1.5 sm:h-2" />
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-center text-muted-foreground">
              {analysisProgress < 30 && "Reading document..."}
              {analysisProgress >= 30 && analysisProgress < 60 && "Extracting transactions..."}
              {analysisProgress >= 60 && analysisProgress < 90 && "Detecting patterns..."}
              {analysisProgress >= 90 && "Generating insights..."}
            </p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {viewMode === 'results' && currentResult && (
        <div className="space-y-4 sm:space-y-5 py-5 sm:py-6 animate-fade-in">
          {/* Success Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-[hsl(var(--success))]/10">
                <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-[hsl(var(--success))]" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">Analysis Complete</h2>
                <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[140px] sm:max-w-[160px]">{currentResult.fileName}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setViewMode('upload')} 
              className="rounded-xl sm:rounded-2xl border-border/50 h-9 sm:h-10 text-xs sm:text-sm active:scale-95 transition-transform"
            >
              <X className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-4 sm:w-4" strokeWidth={1.5} />
              New
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary via-primary to-[hsl(260_80%_60%)] p-4 sm:p-5 shadow-lg">
              <p className="text-xs sm:text-sm text-primary-foreground/80">Total Spent</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary-foreground tracking-tight mt-1">
                {formatCurrency(currentResult.summary.totalSpent)}
              </p>
            </div>
            <div className="rounded-2xl sm:rounded-3xl bg-card p-4 sm:p-5 shadow-sm">
              <p className="text-xs sm:text-sm text-muted-foreground">Transactions</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-1">
                {currentResult.summary.totalTransactions}
              </p>
            </div>
          </div>

          {/* Top Categories */}
          {currentResult.summary.topCategories.length > 0 && (
            <div className="rounded-2xl sm:rounded-3xl bg-card p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">Top Categories</h3>
                <button className="flex items-center gap-1 text-xs sm:text-sm font-medium text-primary hover:underline">
                  See all
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {currentResult.summary.topCategories.slice(0, 4).map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-3 sm:gap-4">
                    <div className={cn(
                      "flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br shadow-sm",
                      categoryGradients[cat.name.toLowerCase()] || 'from-muted to-muted/80'
                    )}>
                      {categoryIcons[cat.name.toLowerCase()] || <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" strokeWidth={1.5} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-medium text-foreground capitalize">{cat.name}</span>
                        <span className="text-xs sm:text-sm font-semibold text-foreground">{formatCurrency(cat.amount)}</span>
                      </div>
                      <Progress value={cat.percentage} className="mt-1.5 sm:mt-2 h-1 sm:h-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patterns */}
          {currentResult.patterns.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" strokeWidth={1.5} />
                <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">Detected Patterns</h3>
              </div>
              {currentResult.patterns.slice(0, 3).map((pattern, idx) => (
                <div 
                  key={pattern.id} 
                  className="rounded-2xl sm:rounded-3xl bg-card p-4 sm:p-5 shadow-sm card-hover cursor-pointer active:scale-[0.98] transition-transform"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <h4 className="text-sm sm:text-base font-semibold text-foreground">{pattern.title}</h4>
                    <span className={cn("rounded-full border px-2 sm:px-2.5 py-0.5 text-[8px] sm:text-[10px] font-medium", confidenceStyles[pattern.confidence])}>
                      {pattern.confidence}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{pattern.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Insights */}
          {currentResult.insights.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" strokeWidth={1.5} />
                <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">Behavioral Insights</h3>
              </div>
              {currentResult.insights.slice(0, 3).map((insight, idx) => (
                <div 
                  key={insight.id} 
                  className="rounded-2xl sm:rounded-3xl border-l-4 border-primary bg-card p-4 sm:p-5 shadow-sm card-hover cursor-pointer active:scale-[0.98] transition-transform"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <h4 className="text-sm sm:text-base font-semibold text-foreground">{insight.title}</h4>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                  {insight.actionable && (
                    <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-primary">💡 {insight.actionable}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Transactions Preview */}
          {currentResult.transactions.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                  Extracted Transactions
                </h3>
                <span className="text-xs text-muted-foreground">
                  {currentResult.transactions.length} found
                </span>
              </div>
              <div className="space-y-2">
                {currentResult.transactions.slice(0, 5).map((txn, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-card p-3 shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{txn.description}</p>
                      <p className="text-xs text-muted-foreground">{txn.date} • {txn.category}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(txn.amount)}</p>
                  </div>
                ))}
              </div>
              {currentResult.transactions.length > 5 && (
                <p className="text-xs text-center text-muted-foreground">
                  +{currentResult.transactions.length - 5} more transactions
                </p>
              )}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
