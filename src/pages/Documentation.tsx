import { ArrowLeft, Brain, Scan, MessageCircle, Shield, Database, Cpu, TrendingUp, Zap, Eye, FileText, BarChart3, Bell, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Documentation() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: BookOpen, title: 'What is SpendAI?',
      content: 'SpendAI is an AI-powered behavioral spending analysis app. It goes beyond traditional budgeting by understanding your spending patterns, emotional triggers, and behavioral habits. Instead of just tracking numbers, it reflects your behavior back to you in a non-judgmental, narrative style — helping you become more mindful about your money.',
    },
    {
      icon: Brain, title: 'AI-Powered Pattern Detection',
      content: 'The app uses Google Gemini AI models to analyze your transaction history and detect recurring behavioral patterns — like late-night food ordering, weekend shopping sprees, or post-salary entertainment binges. Patterns are classified by confidence level (Strong, Emerging, New) and tracked over time to see if they\'re increasing, stable, or decreasing.',
    },
    {
      icon: Scan, title: 'Document Scanning & OCR',
      content: 'SpendAI supports uploading bank statements in CSV, TXT, or PDF formats. For physical statements, you can take a photo or choose from your gallery — the app uses Gemini Vision AI to perform OCR (Optical Character Recognition) on the image, extracting transaction data automatically. The extracted text is then analyzed by the AI to categorize transactions and detect patterns.',
    },
    {
      icon: MessageCircle, title: 'Ask AI — Conversational Insights',
      content: 'The Ask AI feature provides a streaming chat interface where you can ask natural-language questions about your spending. Examples: "Why did I overspend last week?", "What triggers my late-night orders?", "How has my spending changed?" The AI uses your transaction context to provide personalized, reflective answers using server-sent events (SSE) for real-time streaming.',
    },
    {
      icon: TrendingUp, title: 'Spending Heatmap & Categories',
      content: 'A visual heatmap shows when you spend the most across the week (day × time-of-day). Category breakdowns show where your money goes (Food, Transport, Shopping, Entertainment, Bills, Health) with trend indicators showing month-over-month changes.',
    },
    {
      icon: Zap, title: 'Impulse Buy Detection',
      content: 'The app identifies impulse purchases — non-recurring, small transactions made during late-night or weekend hours. It calculates your peak impulse time and average impulse amount, helping you set "pause before purchase" reminders.',
    },
    {
      icon: Eye, title: 'Moment Stories & Soft Nudges',
      content: 'Moment Stories are AI-generated narrative cards that explain your spending patterns in a relatable, story-like format. Soft Nudges are non-intrusive alerts triggered by the Deviation Engine when your spending in a category significantly deviates from your baseline. You can acknowledge, dismiss, or mute category alerts.',
    },
    {
      icon: Bell, title: 'Weekly Check-ins & Journal',
      content: 'Weekly check-ins summarize your spending changes compared to your usual behavior. The Money Journal lets you write reflections linked to specific patterns, building self-awareness over time. Emotion tagging allows you to tag transactions with how you felt (stressed, celebrating, bored, etc.).',
    },
    {
      icon: Database, title: 'System Architecture',
      content: 'Frontend: React + TypeScript + Vite + Tailwind CSS with Neumorphic UI design. Backend: Lovable Cloud (Supabase) for authentication, database (PostgreSQL), and Edge Functions. Database tables: profiles, transactions, spending_patterns, emotion_tags, journal_entries, moment_stories, weekly_checkins, spending_seasons, deviation_events, notifications, spending_baselines.',
    },
    {
      icon: Cpu, title: 'Edge Functions & AI Pipeline',
      content: 'chat-ai: Streaming conversational AI using Gemini for spending Q&A. analyze-statement: Parses uploaded bank statement text, categorizes transactions, and detects patterns. extract-image-text: Uses Gemini Vision for OCR on photographed bank statements. detect-patterns: Analyzes transaction history to find recurring behavioral patterns. generate-stories: Creates narrative "Moment Stories" from detected patterns. deviation-engine: Compares current spending against baselines to trigger soft nudges.',
    },
    {
      icon: Shield, title: 'Privacy & Security',
      content: 'All data is processed securely through encrypted Edge Functions. Uploaded documents are analyzed in-memory and never stored on servers. Row-Level Security (RLS) policies ensure users can only access their own data. Authentication supports email/password and Google OAuth.',
    },
    {
      icon: BarChart3, title: 'Spending Seasons',
      content: 'SpendAI identifies "Spending Seasons" — periods where your spending behavior shifts significantly. For example, a "Heavy Social Month" where eating out and entertainment spike, or a "Quiet Home Month" with more bills and less socializing. These are tracked over time to help you understand your financial rhythms.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="h-11 w-11 rounded-xl neu-button flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Documentation</h1>
            <p className="text-sm text-muted-foreground font-medium">Everything about SpendAI</p>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <details key={idx} className="group rounded-2xl neu-raised overflow-hidden">
                <summary className="flex items-center gap-4 p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <div className="h-11 w-11 rounded-xl neu-inset-sm flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="text-base font-bold text-foreground flex-1">{section.title}</h3>
                  <div className="h-6 w-6 rounded-full neu-inset-sm flex items-center justify-center transition-transform group-open:rotate-45 text-muted-foreground text-lg font-bold">+</div>
                </summary>
                <div className="px-5 pb-5 pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed pl-15">{section.content}</p>
                </div>
              </details>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground/60 py-8 font-medium">
          Built by <span className="font-bold text-muted-foreground">Raman Choudhary</span>
        </p>
      </div>
    </div>
  );
}
