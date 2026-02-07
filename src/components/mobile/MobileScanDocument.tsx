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
  Eye,
  ImageIcon
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
  transfer: <ArrowRight className="h-4 w-4" strokeWidth={1.5} />,
  payment: <Receipt className="h-4 w-4" strokeWidth={1.5} />,
};

const categoryGradients: Record<string, string> = {
  food: 'from-[hsl(var(--category-food))] to-[hsl(var(--category-food))]/80',
  transport: 'from-[hsl(var(--category-transport))] to-[hsl(var(--category-transport))]/80',
  shopping: 'from-[hsl(var(--category-shopping))] to-[hsl(var(--category-shopping))]/80',
  entertainment: 'from-[hsl(var(--category-entertainment))] to-[hsl(var(--category-entertainment))]/80',
  bills: 'from-[hsl(var(--category-bills))] to-[hsl(var(--category-bills))]/80',
  health: 'from-[hsl(var(--category-health))] to-[hsl(var(--category-health))]/80',
  transfer: 'from-primary to-primary/80',
  payment: 'from-muted to-muted/80',
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
  const [analysisStep, setAnalysisStep] = useState('');
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

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Remove the data URL prefix to get just the base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const extractTextFromImage = async (file: File): Promise<string> => {
    setAnalysisStep('Scanning image with AI vision...');
    setAnalysisProgress(15);

    const base64 = await readFileAsBase64(file);
    
    const { data, error } = await supabase.functions.invoke('extract-image-text', {
      body: { 
        imageBase64: base64,
        mimeType: file.type 
      }
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return data.text;
  };

  const analyzeDocument = async (text: string, name: string) => {
    setViewMode('analyzing');
    setAnalysisProgress(30);
    setAnalysisStep('Extracting transactions...');

    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 5;
      });
    }, 800);

    try {
      setAnalysisStep('Detecting spending patterns...');
      setAnalysisProgress(50);

      const { data, error } = await supabase.functions.invoke('analyze-statement', {
        body: { documentText: text }
      });

      clearInterval(progressInterval);
      
      setAnalysisStep('Generating insights...');
      setAnalysisProgress(90);

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setAnalysisProgress(100);
      setAnalysisStep('Complete!');

      const result: AnalysisResult = {
        id: `analysis-${Date.now()}`,
        fileName: name,
        analyzedAt: new Date(),
        ...data
      };

      setCurrentResult(result);
      setAnalysisHistory(prev => [result, ...prev].slice(0, 10));
      setViewMode('results');
      toast.success('Analysis complete!');
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze document');
      setViewMode('upload');
    }
  };

  const handleFile = async (file: File, isImage: boolean = false) => {
    if (!file) return;

    setFileName(file.name);

    try {
      if (isImage || file.type.startsWith('image/')) {
        // Handle image files - use vision AI to extract text
        setViewMode('analyzing');
        setAnalysisProgress(5);
        setAnalysisStep('Processing image...');
        
        const extractedText = await extractTextFromImage(file);
        await analyzeDocument(extractedText, file.name);
      } else if (file.type === 'text/plain' || file.type === 'text/csv' || 
          file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
        // Handle text/CSV files
        const text = await readFileAsText(file);
        await analyzeDocument(text, file.name);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // Handle PDF - try to read as text first
        toast.info('Processing PDF...');
        const text = await readFileAsText(file);
        if (text.length > 100) {
          await analyzeDocument(text, file.name);
        } else {
          toast.error('Could not read PDF. Please try a CSV or image instead.');
          setViewMode('upload');
        }
      } else {
        toast.error('Unsupported file type. Please upload CSV, TXT, PDF, or an image.');
      }
    } catch (error) {
      console.error('File processing error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process file');
      setViewMode('upload');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file, false);
    // Reset input to allow re-selecting same file
    e.target.value = '';
  };

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file, true);
    // Reset input to allow re-selecting same file
    e.target.value = '';
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
    <div className="flex flex-col min-h-full pb-24 px-5">
      <div className="max-w-2xl mx-auto w-full">
        
      {/* Upload Section */}
      {viewMode === 'upload' && (
        <div className="flex flex-col items-center justify-center flex-1 py-12 animate-fade-in">
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary/20 to-[hsl(290_70%_55%)]/20 mb-8">
              <FileText className="h-14 w-14 text-primary" strokeWidth={1.5} />
            </div>
            <div className="absolute -inset-6 rounded-[3rem] bg-primary/10 blur-2xl -z-10" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground text-center">
            Scan Your Statement
          </h2>
          <p className="mt-3 text-base text-muted-foreground text-center max-w-xs leading-relaxed">
            Upload your bank statement or take a photo for AI-powered analysis
          </p>
          
          <div className="mt-10 flex gap-4 w-full max-w-xs">
            <label className="cursor-pointer flex-1 active:scale-[0.98] transition-transform">
              <input
                type="file"
                accept=".pdf,.csv,.txt"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3 rounded-[1.75rem] bg-card p-6 shadow-sm border border-border/50 transition-all duration-300 card-hover h-full">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(290_70%_55%)] shadow-lg shadow-primary/25">
                  <FolderOpen className="h-6 w-6 text-primary-foreground" strokeWidth={2} />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-bold text-foreground">Browse Files</span>
                  <span className="text-xs text-muted-foreground font-medium">PDF, CSV, TXT</span>
                </div>
              </div>
            </label>
            
            <label className="cursor-pointer flex-1 active:scale-[0.98] transition-transform">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageInput}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3 rounded-[1.75rem] bg-card p-6 shadow-sm border border-border/50 transition-all duration-300 card-hover h-full">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground shadow-lg">
                  <Camera className="h-6 w-6 text-background" strokeWidth={2} />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-bold text-foreground">Take Photo</span>
                  <span className="text-xs text-muted-foreground font-medium">Scan statement</span>
                </div>
              </div>
            </label>
          </div>

          {/* Image gallery option */}
          <label className="cursor-pointer mt-4 w-full max-w-xs active:scale-[0.98] transition-transform">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageInput}
              className="hidden"
            />
            <div className="flex items-center justify-center gap-2 rounded-full bg-secondary p-3 transition-all duration-300 hover:bg-secondary/80">
              <ImageIcon className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
              <span className="text-sm font-semibold text-muted-foreground">Choose from gallery</span>
            </div>
          </label>

          {/* History button */}
          {analysisHistory.length > 0 && (
            <Button
              variant="outline"
              className="mt-6 rounded-full font-semibold border-2"
              onClick={() => setViewMode('history')}
            >
              <History className="mr-2 h-4 w-4" strokeWidth={2} />
              View History ({analysisHistory.length})
            </Button>
          )}
          
          <div className="mt-10 flex items-start gap-4 rounded-[1.5rem] bg-primary/10 p-5 max-w-sm">
            <Shield className="h-5 w-5 shrink-0 text-primary mt-0.5" strokeWidth={2} />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground">Privacy First</span><br />
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
              <h2 className="text-xl font-bold text-foreground">Analysis History</h2>
              <p className="text-sm text-muted-foreground font-medium">{analysisHistory.length} previous scans</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setViewMode('upload')} className="rounded-full font-semibold border-2">
              <X className="mr-1 h-4 w-4" strokeWidth={2} /> Close
            </Button>
          </div>

          <div className="space-y-3">
            {analysisHistory.map((result, idx) => (
              <div
                key={result.id}
                className="flex items-center gap-4 rounded-[1.5rem] bg-card p-4 shadow-sm border border-border/50 animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
                  <FileText className="h-6 w-6 text-primary" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{result.fileName}</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {format(result.analyzedAt, 'MMM d, yyyy h:mm a')} • {formatCurrency(result.summary.totalSpent)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => viewHistoryItem(result)}
                    className="h-10 w-10 rounded-full"
                  >
                    <Eye className="h-5 w-5" strokeWidth={2} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteHistoryItem(result.id)}
                    className="h-10 w-10 rounded-full text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-5 w-5" strokeWidth={2} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyzing State */}
      {viewMode === 'analyzing' && (
        <div className="flex flex-col items-center justify-center flex-1 py-12 animate-fade-in">
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary/20 to-[hsl(290_70%_55%)]/20">
              <Loader2 className="h-14 w-14 animate-spin text-primary" strokeWidth={1.5} />
            </div>
            <div className="absolute -inset-6 rounded-[3rem] bg-primary/10 blur-2xl animate-pulse -z-10" />
          </div>
          
          <h2 className="mt-8 text-2xl font-bold text-foreground">Analyzing</h2>
          <p className="mt-2 text-base text-muted-foreground text-center truncate max-w-[220px] font-medium">{fileName}</p>
          
          <div className="mt-8 w-full max-w-xs">
            <Progress value={analysisProgress} className="h-2" />
            <p className="mt-3 text-sm text-center text-muted-foreground font-medium">
              {analysisStep || "Processing..."}
            </p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {viewMode === 'results' && currentResult && (
        <div className="space-y-5 py-6 animate-fade-in">
          {/* Success Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--success))]/15">
                <CheckCircle2 className="h-7 w-7 text-[hsl(var(--success))]" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Analysis Complete</h2>
                <p className="text-sm text-muted-foreground truncate max-w-[160px] font-medium">{currentResult.fileName}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setViewMode('upload')} 
              className="rounded-full border-2 font-semibold active:scale-95 transition-transform"
            >
              <X className="mr-1.5 h-4 w-4" strokeWidth={2} />
              New
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[1.75rem] bg-gradient-to-br from-primary via-primary to-[hsl(290_70%_55%)] p-5 shadow-lg shadow-primary/25">
              <p className="text-sm text-primary-foreground/80 font-medium">Total Spent</p>
              <p className="text-3xl font-bold text-primary-foreground tracking-tight mt-1">
                {formatCurrency(currentResult.summary.totalSpent)}
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-card p-5 shadow-sm border border-border/50">
              <p className="text-sm text-muted-foreground font-medium">Transactions</p>
              <p className="text-3xl font-bold text-foreground tracking-tight mt-1">
                {currentResult.summary.totalTransactions}
              </p>
            </div>
          </div>

          {/* Date Range */}
          {currentResult.summary.dateRange?.start && currentResult.summary.dateRange?.end && (
            <div className="rounded-full bg-secondary p-3 text-center">
              <p className="text-sm text-muted-foreground font-medium">
                Period: {currentResult.summary.dateRange.start} to {currentResult.summary.dateRange.end}
              </p>
            </div>
          )}

          {/* Top Categories */}
          {currentResult.summary.topCategories.length > 0 && (
            <div className="rounded-[1.75rem] bg-card p-5 shadow-sm border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-foreground">Top Categories</h3>
                <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                  See all
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              <div className="space-y-4">
                {currentResult.summary.topCategories.slice(0, 4).map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm",
                      categoryGradients[cat.name.toLowerCase()] || 'from-muted to-muted/80'
                    )}>
                      {categoryIcons[cat.name.toLowerCase()] || <Receipt className="h-4 w-4 text-primary-foreground" strokeWidth={2} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-foreground capitalize">{cat.name}</span>
                        <span className="text-sm font-bold text-foreground">{formatCurrency(cat.amount)}</span>
                      </div>
                      <Progress value={cat.percentage} className="mt-2 h-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patterns */}
          {currentResult.patterns.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" strokeWidth={2} />
                <h3 className="text-base font-bold text-foreground">Detected Patterns</h3>
              </div>
              {currentResult.patterns.slice(0, 3).map((pattern, idx) => (
                <div 
                  key={pattern.id} 
                  className="rounded-[1.5rem] bg-card p-5 shadow-sm border border-border/50 card-hover cursor-pointer active:scale-[0.98] transition-transform"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-bold text-foreground">{pattern.title}</h4>
                    <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-bold", confidenceStyles[pattern.confidence])}>
                      {pattern.confidence}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pattern.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Insights */}
          {currentResult.insights.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" strokeWidth={2} />
                <h3 className="text-base font-bold text-foreground">Behavioral Insights</h3>
              </div>
              {currentResult.insights.slice(0, 3).map((insight, idx) => (
                <div 
                  key={insight.id} 
                  className="rounded-[1.5rem] border-l-4 border-primary bg-card p-5 shadow-sm border-y border-r border-border/50 card-hover cursor-pointer active:scale-[0.98] transition-transform"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <h4 className="text-base font-bold text-foreground">{insight.title}</h4>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                  {insight.actionable && (
                    <p className="mt-3 text-sm font-semibold text-primary">💡 {insight.actionable}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Transactions Preview */}
          {currentResult.transactions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">
                  Extracted Transactions
                </h3>
                <span className="text-sm text-muted-foreground font-medium">
                  {currentResult.transactions.length} found
                </span>
              </div>
              <div className="space-y-2">
                {currentResult.transactions.slice(0, 5).map((txn, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm border border-border/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{txn.description}</p>
                      <p className="text-xs text-muted-foreground font-medium">{txn.date} • {txn.category}</p>
                    </div>
                    <p className="text-sm font-bold text-foreground">{formatCurrency(txn.amount)}</p>
                  </div>
                ))}
              </div>
              {currentResult.transactions.length > 5 && (
                <p className="text-sm text-center text-muted-foreground font-medium">
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
