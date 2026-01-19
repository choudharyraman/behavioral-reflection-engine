import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Upload, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ShoppingBag,
  Utensils,
  Car,
  Film,
  Receipt,
  Heart,
  X
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
  rawAnalysis?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  food: <Utensils className="h-4 w-4" />,
  transport: <Car className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  entertainment: <Film className="h-4 w-4" />,
  bills: <Receipt className="h-4 w-4" />,
  health: <Heart className="h-4 w-4" />,
};

const confidenceStyles = {
  strong: 'bg-pattern-strong/10 text-pattern-strong border-pattern-strong/20',
  emerging: 'bg-pattern-emerging/10 text-pattern-emerging border-pattern-emerging/20',
  weak: 'bg-pattern-weak/10 text-pattern-weak border-pattern-weak/20',
};

const trendIcons = {
  increasing: <TrendingUp className="h-4 w-4 text-destructive" />,
  stable: <Minus className="h-4 w-4 text-muted-foreground" />,
  decreasing: <TrendingDown className="h-4 w-4 text-success" />,
};

export function ScanDocument() {
  const [isDragOver, setIsDragOver] = useState(false);
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

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-statement', {
        body: { documentText: text }
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

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

    // Check file type - accept PDF, CSV, TXT
    const validTypes = ['application/pdf', 'text/csv', 'text/plain', 'application/vnd.ms-excel'];
    const validExtensions = ['.pdf', '.csv', '.txt'];
    
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidType && !hasValidExtension) {
      toast.error('Please upload a PDF, CSV, or TXT file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setFileName(file.name);
    setAnalysisResult(null);

    try {
      // For text-based files, read directly
      if (file.type === 'text/plain' || file.type === 'text/csv' || 
          file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
        const text = await readFileAsText(file);
        await analyzeDocument(text);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // For PDFs, we'll send a message to parse it
        // Note: In production, you'd use a proper PDF parser
        toast.info('Reading PDF content...');
        const text = await readFileAsText(file);
        // If the PDF is text-based, this might work
        // Otherwise we'd need a proper PDF parsing library
        await analyzeDocument(text.length > 100 ? text : `PDF Document: ${file.name}\n\nPlease note: This appears to be a scanned or image-based PDF. For best results, please upload a text-based bank statement or CSV export of your transactions.`);
      }
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Failed to process file');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

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
    <div className="space-y-6">
      {/* Upload Section */}
      {!analysisResult && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Scan Spending Document
            </CardTitle>
            <CardDescription>
              Upload your bank statement or spending report for AI-powered behavioral analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-all
                ${isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                }
                ${isAnalyzing ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              `}
            >
              <input
                type="file"
                accept=".pdf,.csv,.txt"
                onChange={handleFileInput}
                className="absolute inset-0 cursor-pointer opacity-0"
                disabled={isAnalyzing}
              />
              
              {isAnalyzing ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <div className="text-center">
                    <p className="font-medium text-foreground">Analyzing your document...</p>
                    <p className="text-sm text-muted-foreground">{fileName}</p>
                  </div>
                  <Progress value={analysisProgress} className="w-48" />
                </div>
              ) : (
                <>
                  <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-2 text-lg font-medium text-foreground">
                    Drop your statement here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse (PDF, CSV, TXT up to 10MB)
                  </p>
                </>
              )}
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-lg bg-info/10 p-3 text-sm text-info">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                <p className="font-medium">Privacy First</p>
                <p className="text-info/80">
                  Your document is analyzed securely. We don't store your transaction data permanently.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Analysis Complete
                </CardTitle>
                <CardDescription>{fileName}</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={resetAnalysis}>
                <X className="mr-2 h-4 w-4" />
                New Scan
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analysisResult.summary.totalTransactions}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(analysisResult.summary.totalSpent)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Patterns Found</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analysisResult.patterns.length}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Insights Generated</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analysisResult.insights.length}
                  </p>
                </div>
              </div>

              {/* Top Categories */}
              {analysisResult.summary.topCategories.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-3 font-medium text-foreground">Top Spending Categories</h4>
                  <div className="space-y-2">
                    {analysisResult.summary.topCategories.map((cat, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          {categoryIcons[cat.name.toLowerCase()] || <Receipt className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium capitalize">{cat.name}</span>
                            <span className="text-muted-foreground">{formatCurrency(cat.amount)}</span>
                          </div>
                          <Progress value={cat.percentage} className="mt-1 h-1.5" />
                        </div>
                        <span className="text-sm text-muted-foreground">{cat.percentage.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patterns Section */}
          {analysisResult.patterns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Detected Patterns
                </CardTitle>
                <CardDescription>
                  Behavioral patterns identified from your spending history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {analysisResult.patterns.map((pattern) => (
                    <div
                      key={pattern.id}
                      className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {categoryIcons[pattern.category.toLowerCase()] || 
                            <Receipt className="h-4 w-4 text-primary" />}
                          <h4 className="font-medium text-foreground">{pattern.title}</h4>
                        </div>
                        <Badge variant="outline" className={confidenceStyles[pattern.confidence]}>
                          {pattern.confidence}
                        </Badge>
                      </div>
                      <p className="mb-3 text-sm text-muted-foreground">{pattern.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {trendIcons[pattern.trend]}
                          <span className="capitalize">{pattern.trend}</span>
                        </span>
                        <span>{pattern.occurrences} occurrences</span>
                        <span>Avg: {formatCurrency(pattern.averageAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insights Section */}
          {analysisResult.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Behavioral Insights
                </CardTitle>
                <CardDescription>
                  AI-powered observations about your spending behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.insights.map((insight) => (
                    <div
                      key={insight.id}
                      className="rounded-lg border-l-4 border-primary bg-muted/30 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-medium text-foreground">{insight.title}</h4>
                        <Badge variant="outline" className={confidenceStyles[insight.confidence]}>
                          {insight.confidence}
                        </Badge>
                      </div>
                      <p className="mb-2 text-sm text-muted-foreground">{insight.description}</p>
                      {insight.actionable && (
                        <p className="text-sm font-medium text-primary">{insight.actionable}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transactions Preview */}
          {analysisResult.transactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Extracted Transactions</CardTitle>
                <CardDescription>
                  {analysisResult.transactions.length} transactions found in document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {analysisResult.transactions.slice(0, 20).map((txn, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            {categoryIcons[txn.category.toLowerCase()] || 
                              <Receipt className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{txn.description}</p>
                            <p className="text-xs text-muted-foreground">{txn.date}</p>
                          </div>
                        </div>
                        <span className="font-medium text-foreground">
                          {formatCurrency(txn.amount)}
                        </span>
                      </div>
                    ))}
                    {analysisResult.transactions.length > 20 && (
                      <p className="py-2 text-center text-sm text-muted-foreground">
                        + {analysisResult.transactions.length - 20} more transactions
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Raw Analysis (if parsing failed) */}
          {analysisResult.rawAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {analysisResult.rawAnalysis}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
