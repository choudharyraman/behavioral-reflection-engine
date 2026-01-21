import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Upload, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
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
  FolderOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisResult {
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
  food: <Utensils className="h-4 w-4" />,
  transport: <Car className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  entertainment: <Film className="h-4 w-4" />,
  bills: <Receipt className="h-4 w-4" />,
  health: <Heart className="h-4 w-4" />,
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
  strong: 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]',
  emerging: 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]',
  weak: 'bg-muted text-muted-foreground',
};

export function MobileScanDocument() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const analyzeDocument = async (text: string) => {
    setIsAnalyzing(true);
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

      setAnalysisResult(data);
      toast.success('Document analyzed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze document');
    } finally {
      setIsAnalyzing(false);
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
    setAnalysisResult(null);

    try {
      if (file.type === 'text/plain' || file.type === 'text/csv' || 
          file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
        const text = await readFileAsText(file);
        await analyzeDocument(text);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        toast.info('Reading PDF content...');
        const text = await readFileAsText(file);
        await analyzeDocument(text.length > 100 ? text : `PDF Document: ${file.name}`);
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

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setFileName('');
    setAnalysisProgress(0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col min-h-full pb-24 px-4">
      {/* Upload Section */}
      {!analysisResult && !isAnalyzing && (
        <div className="flex flex-col items-center justify-center flex-1 py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 mb-6">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          
          <h2 className="text-xl font-semibold text-foreground text-center">
            Scan Your Statement
          </h2>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
            Upload your bank statement or spending report for AI-powered analysis
          </p>
          
          <div className="mt-8 flex gap-4">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,.csv,.txt"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-6 shadow-sm transition-all active:scale-95">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
                  <FolderOpen className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">Browse Files</span>
                <span className="text-xs text-muted-foreground">PDF, CSV, TXT</span>
              </div>
            </label>
            
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-6 shadow-sm transition-all active:scale-95">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
                  <Camera className="h-6 w-6 text-secondary-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">Take Photo</span>
                <span className="text-xs text-muted-foreground">Scan receipt</span>
              </div>
            </label>
          </div>
          
          <div className="mt-8 flex items-center gap-3 rounded-2xl bg-primary/5 p-4 max-w-sm">
            <Shield className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Privacy First:</span> Your document is analyzed securely. We don't store your data.
            </p>
          </div>
        </div>
      )}

      {/* Analyzing State */}
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center flex-1 py-8">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          </div>
          
          <h2 className="mt-6 text-xl font-semibold text-foreground">Analyzing...</h2>
          <p className="mt-2 text-sm text-muted-foreground text-center">{fileName}</p>
          
          <div className="mt-6 w-full max-w-xs">
            <Progress value={analysisProgress} className="h-2" />
            <p className="mt-2 text-xs text-center text-muted-foreground">
              {analysisProgress}% complete
            </p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {analysisResult && (
        <div className="space-y-4 py-4">
          {/* Success Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--success))]/10">
                <CheckCircle2 className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Analysis Complete</h2>
                <p className="text-xs text-muted-foreground truncate max-w-[180px]">{fileName}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={resetAnalysis} className="rounded-xl">
              <X className="mr-1 h-4 w-4" />
              New
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-4">
              <p className="text-xs text-primary-foreground/80">Total Spent</p>
              <p className="text-2xl font-bold text-primary-foreground">
                {formatCurrency(analysisResult.summary.totalSpent)}
              </p>
            </div>
            <div className="rounded-2xl bg-card p-4">
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold text-foreground">
                {analysisResult.summary.totalTransactions}
              </p>
            </div>
          </div>

          {/* Top Categories */}
          {analysisResult.summary.topCategories.length > 0 && (
            <div className="rounded-2xl bg-card p-4 shadow-sm">
              <h3 className="font-medium text-foreground mb-3">Top Categories</h3>
              <div className="space-y-3">
                {analysisResult.summary.topCategories.slice(0, 4).map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br",
                      categoryGradients[cat.name.toLowerCase()] || 'from-muted to-muted/80'
                    )}>
                      {categoryIcons[cat.name.toLowerCase()] || <Receipt className="h-4 w-4 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">{cat.name}</span>
                        <span className="text-muted-foreground">{formatCurrency(cat.amount)}</span>
                      </div>
                      <Progress value={cat.percentage} className="mt-1 h-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patterns */}
          {analysisResult.patterns.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Detected Patterns
              </h3>
              {analysisResult.patterns.slice(0, 3).map((pattern) => (
                <div key={pattern.id} className="rounded-2xl bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{pattern.title}</h4>
                    <Badge className={cn("text-[10px]", confidenceStyles[pattern.confidence])}>
                      {pattern.confidence}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{pattern.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Insights */}
          {analysisResult.insights.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Behavioral Insights
              </h3>
              {analysisResult.insights.slice(0, 3).map((insight) => (
                <div key={insight.id} className="rounded-2xl border-l-4 border-primary bg-card p-4">
                  <h4 className="font-medium text-foreground">{insight.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
                  {insight.actionable && (
                    <p className="mt-2 text-sm font-medium text-primary">{insight.actionable}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
