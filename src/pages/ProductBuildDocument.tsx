import { ArrowLeft, Brain, Scan, MessageCircle, Shield, Database, Cpu, TrendingUp, Zap, Eye, Bell, BookOpen, Target, Layers, GitBranch, Users, Lightbulb, BarChart3, Calendar, Heart, FileText, Globe, Lock, Server, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProductBuildDocument() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-5 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="h-11 w-11 rounded-xl neu-button flex items-center justify-center shrink-0">
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Product Build Document</h1>
            <p className="text-sm text-muted-foreground font-medium">Behavioral Reflection Engine — SpendAI</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* 1. Executive Summary */}
          <Section icon={BookOpen} title="1. Executive Summary">
            <p>SpendAI is an AI-powered <strong>Behavioral Reflection Engine</strong> that transforms raw bank statement data into meaningful behavioral insights. Unlike traditional budgeting apps that focus on categorization and limits, SpendAI uses artificial intelligence to detect recurring spending patterns, emotional triggers, and behavioral habits — then reflects them back to users in a non-judgmental, narrative style.</p>
            <p className="mt-3"><strong>Core Philosophy:</strong> "We don't tell you what to do with your money. We show you what you're already doing — and let you decide."</p>
            <div className="mt-4 rounded-xl neu-inset p-4">
              <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-2">Key Metrics</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Platform:</span> <span className="font-semibold">Mobile-first PWA</span></div>
                <div><span className="text-muted-foreground">Stack:</span> <span className="font-semibold">React + TypeScript + Vite</span></div>
                <div><span className="text-muted-foreground">Backend:</span> <span className="font-semibold">Lovable Cloud (Supabase)</span></div>
                <div><span className="text-muted-foreground">AI Models:</span> <span className="font-semibold">Google Gemini 2.5</span></div>
              </div>
            </div>
          </Section>

          {/* 2. Problem Statement */}
          <Section icon={Target} title="2. Problem Statement">
            <p>Traditional finance apps focus on <em>what</em> you spend. They categorize, set budgets, and alert you when you exceed limits. But they fail to answer the deeper questions:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Why do I always order food late at night on weekdays?</li>
              <li>Why does my entertainment spending spike after stressful work weeks?</li>
              <li>Am I spending more this month because of a pattern or a one-off event?</li>
              <li>What emotional state drives my impulse purchases?</li>
            </ul>
            <p className="mt-3">SpendAI bridges this gap by acting as a <strong>behavioral mirror</strong> — using AI to detect, narrate, and reflect spending behaviors back to users.</p>
          </Section>

          {/* 3. Product Vision */}
          <Section icon={Lightbulb} title="3. Product Vision & Principles">
            <div className="space-y-3">
              <Principle label="Reflective, Not Prescriptive" desc="The app observes and narrates — it never lectures or sets arbitrary limits." />
              <Principle label="Privacy-First" desc="All data is processed in-memory. Uploaded documents are never stored on servers. Row-Level Security ensures data isolation." />
              <Principle label="Behavioral Science-Informed" desc="Pattern detection is inspired by behavioral economics — identifying triggers, habits, and deviations from baseline behavior." />
              <Principle label="Narrative Intelligence" desc="AI generates human-readable stories, not raw data dumps. Every insight is wrapped in context and empathy." />
              <Principle label="Non-Judgmental Tone" desc="Language is carefully crafted to avoid shame or guilt. The app is a curious observer, not a strict accountant." />
            </div>
          </Section>

          {/* 4. Core Features */}
          <Section icon={Layers} title="4. Core Features">

            <SubSection icon={Scan} title="4.1 Document Scanning & OCR">
              <p>Users can upload bank statements in multiple formats:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>CSV/TXT files:</strong> Parsed directly using text extraction</li>
                <li><strong>PDF files:</strong> Text content extracted and analyzed</li>
                <li><strong>Photos (Camera/Gallery):</strong> Processed using Gemini Vision AI for OCR</li>
              </ul>
              <p className="mt-2">The extracted text is sent to the <code className="text-xs bg-muted px-1.5 py-0.5 rounded">analyze-statement</code> Edge Function, which uses Gemini AI to categorize each transaction into: Food, Transport, Shopping, Entertainment, Bills, Health, or Other.</p>
              <TechBox items={['Gemini 2.5 Flash for text analysis', 'Gemini Vision for image OCR', 'Base64 encoding for image transfer', 'Multi-stage progress tracking UI']} />
            </SubSection>

            <SubSection icon={Brain} title="4.2 AI Pattern Detection">
              <p>The <code className="text-xs bg-muted px-1.5 py-0.5 rounded">detect-patterns</code> Edge Function analyzes transaction history to find recurring behavioral patterns:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Temporal Patterns:</strong> "Late-night food ordering every Tuesday-Thursday"</li>
                <li><strong>Category Clusters:</strong> "Weekend shopping sprees averaging ₹2,500"</li>
                <li><strong>Post-Event Triggers:</strong> "Entertainment spending spikes after salary credit"</li>
              </ul>
              <p className="mt-2">Each pattern has a <strong>confidence level</strong> (Strong / Emerging / New) and a <strong>trend</strong> (Increasing / Stable / Decreasing), tracked over time.</p>
            </SubSection>

            <SubSection icon={MessageCircle} title="4.3 Ask AI — Conversational Insights">
              <p>A streaming chat interface powered by Server-Sent Events (SSE). Users ask natural-language questions:</p>
              <div className="mt-2 rounded-xl neu-inset p-3 space-y-2 text-sm">
                <p className="italic text-muted-foreground">"Why did I spend so much on food last week?"</p>
                <p className="italic text-muted-foreground">"What are my worst spending habits?"</p>
                <p className="italic text-muted-foreground">"How has my transport spending changed?"</p>
              </div>
              <p className="mt-2">The AI uses full transaction context to provide personalized, reflective answers. Responses stream in real-time token-by-token using a <code className="text-xs bg-muted px-1.5 py-0.5 rounded">ReadableStreamDefaultReader</code>.</p>
              <TechBox items={['SSE streaming via Edge Functions', 'Context-aware prompting with transaction history', 'Markdown rendering in chat bubbles', 'Suggested quick-action prompts']} />
            </SubSection>

            <SubSection icon={Zap} title="4.4 Impulse Buy Detection">
              <p>Automatically identifies impulse purchases based on:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Non-recurring transactions</li>
                <li>Made during late-night or weekend hours</li>
                <li>Below a threshold amount (small, spontaneous buys)</li>
              </ul>
              <p className="mt-2">Calculates peak impulse time, average impulse amount, and enables "pause before purchase" awareness.</p>
            </SubSection>

            <SubSection icon={Eye} title="4.5 Moment Stories">
              <p>AI-generated narrative cards that explain spending patterns in a relatable, story-like format. Generated by the <code className="text-xs bg-muted px-1.5 py-0.5 rounded">generate-stories</code> Edge Function.</p>
              <p className="mt-2">Example: <em>"Your Tuesday Night Ritual — Every Tuesday after 10 PM, you tend to order food delivery. This pattern has been consistent for 6 weeks, averaging ₹450 per order."</em></p>
            </SubSection>

            <SubSection icon={Bell} title="4.6 Soft Nudges & Deviation Engine">
              <p>The <code className="text-xs bg-muted px-1.5 py-0.5 rounded">deviation-engine</code> compares current spending against calculated baselines. When spending in a category deviates significantly (e.g., 40% above baseline), a non-intrusive nudge is triggered.</p>
              <p className="mt-2">Users can: Acknowledge the nudge, Dismiss it, or Mute that category's alerts. Nudges have a cooldown period to prevent alert fatigue.</p>
            </SubSection>

            <SubSection icon={Heart} title="4.7 Emotion Tagging">
              <p>Users can tag transactions with how they felt: Stressed, Celebrating, Bored, Guilty, Happy, FOMO, Tired, or custom emotions. This data enriches pattern detection over time.</p>
            </SubSection>

            <SubSection icon={Calendar} title="4.8 Weekly Check-ins & Money Journal">
              <p><strong>Weekly Check-ins:</strong> AI-generated summaries comparing this week's spending to your baseline behavior.</p>
              <p className="mt-2"><strong>Money Journal:</strong> Free-form reflections linked to specific patterns, building self-awareness over time.</p>
            </SubSection>

            <SubSection icon={TrendingUp} title="4.9 Spending Seasons">
              <p>Identifies macro-level behavioral shifts — periods where spending patterns change significantly. Example: "Heavy Social Month" with entertainment and dining spikes, or "Quiet Home Month" with increased bills.</p>
            </SubSection>

            <SubSection icon={BarChart3} title="4.10 Spending Heatmap">
              <p>A visual 7×4 grid (Day × Time-of-Day) showing spending intensity. Darker cells indicate higher spending concentration, helping users visually identify their spending hotspots.</p>
            </SubSection>
          </Section>

          {/* 5. System Architecture */}
          <Section icon={Server} title="5. System Architecture">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-sm mb-2">Frontend Layer</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Framework:</strong> React 18 + TypeScript + Vite</li>
                  <li><strong>Styling:</strong> Tailwind CSS with Neumorphic design system</li>
                  <li><strong>UI Components:</strong> shadcn/ui + custom neumorphic variants</li>
                  <li><strong>State:</strong> React hooks + TanStack Query for server state</li>
                  <li><strong>Routing:</strong> React Router v6</li>
                  <li><strong>Charts:</strong> Recharts for data visualization</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-sm mb-2">Backend Layer (Lovable Cloud)</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Database:</strong> PostgreSQL with Row-Level Security</li>
                  <li><strong>Auth:</strong> Email/Password + Google OAuth</li>
                  <li><strong>Edge Functions:</strong> Deno-based serverless functions</li>
                  <li><strong>Realtime:</strong> WebSocket subscriptions for live updates</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-sm mb-2">AI Layer</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Text Analysis:</strong> Gemini 2.5 Flash for transaction categorization</li>
                  <li><strong>Vision/OCR:</strong> Gemini Vision for bank statement image processing</li>
                  <li><strong>Pattern Detection:</strong> Gemini Pro for behavioral pattern analysis</li>
                  <li><strong>Narrative Generation:</strong> Gemini for story-style insight creation</li>
                  <li><strong>Conversational AI:</strong> Streaming chat with full context awareness</li>
                </ul>
              </div>
            </div>
          </Section>

          {/* 6. Database Schema */}
          <Section icon={Database} title="6. Database Schema">
            <div className="space-y-3">
              <TableCard name="profiles" desc="User profile data, preferences, budget settings, notification config" />
              <TableCard name="transactions" desc="Individual spending records with merchant, category, time metadata" />
              <TableCard name="spending_patterns" desc="AI-detected behavioral patterns with confidence and trend tracking" />
              <TableCard name="emotion_tags" desc="User-applied emotional context tags on transactions" />
              <TableCard name="journal_entries" desc="Free-form reflections linked to specific patterns" />
              <TableCard name="moment_stories" desc="AI-generated narrative cards explaining patterns" />
              <TableCard name="weekly_checkins" desc="Weekly behavioral summaries with category changes" />
              <TableCard name="spending_seasons" desc="Macro-level behavioral shift periods" />
              <TableCard name="deviation_events" desc="Spending anomalies triggering soft nudges" />
              <TableCard name="spending_baselines" desc="Calculated baseline amounts per category/period" />
              <TableCard name="notifications" desc="System notifications for nudges and insights" />
            </div>
          </Section>

          {/* 7. Edge Functions Pipeline */}
          <Section icon={Cpu} title="7. Edge Functions Pipeline">
            <div className="space-y-3">
              <FuncCard name="analyze-statement" desc="Parses uploaded bank statement text (CSV/TXT/PDF). Uses Gemini to categorize each transaction and extract structured data (merchant, amount, date, category)." />
              <FuncCard name="extract-image-text" desc="Accepts Base64-encoded images of bank statements. Uses Gemini Vision AI for OCR to extract text, then returns structured text for analysis." />
              <FuncCard name="detect-patterns" desc="Analyzes transaction history to find recurring behavioral patterns. Classifies by confidence (Strong/Emerging/New) and tracks trends over time." />
              <FuncCard name="generate-stories" desc="Creates narrative Moment Stories from detected patterns. Generates empathetic, non-judgmental story cards explaining user behavior." />
              <FuncCard name="deviation-engine" desc="Compares current spending against baselines. Triggers soft nudges when significant deviations are detected. Manages cooldown periods." />
              <FuncCard name="chat-ai" desc="Streaming conversational AI for spending Q&A. Uses SSE for real-time token streaming. Full transaction context awareness." />
            </div>
          </Section>

          {/* 8. Security */}
          <Section icon={Shield} title="8. Security & Privacy">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Row-Level Security (RLS):</strong> Every table has RLS policies ensuring users can only access their own data.</li>
              <li><strong>In-Memory Processing:</strong> Uploaded documents are analyzed in-memory and never persisted to storage.</li>
              <li><strong>Encrypted Edge Functions:</strong> All AI processing happens through encrypted serverless functions.</li>
              <li><strong>Authentication:</strong> Supports email/password with validation and Google OAuth.</li>
              <li><strong>Input Validation:</strong> Zod schemas validate all user inputs on the client side.</li>
              <li><strong>No Third-Party Tracking:</strong> No analytics or tracking scripts are embedded.</li>
            </ul>
          </Section>

          {/* 9. UI/UX Design */}
          <Section icon={Smartphone} title="9. UI/UX Design System">
            <p>The app uses a <strong>Neumorphic (Soft UI)</strong> design system characterized by:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Raised Elements:</strong> Dual-source shadows (dark + light) creating depth</li>
              <li><strong>Inset Fields:</strong> Input fields appear pressed into the surface</li>
              <li><strong>Tactile Buttons:</strong> Active states with scale transforms for physical feedback</li>
              <li><strong>Soft Color Palette:</strong> Blue-grey base with purple-violet primary accents</li>
              <li><strong>Rounded Shapes:</strong> Generous border-radius (1rem–1.5rem) throughout</li>
              <li><strong>Mobile-First:</strong> Designed primarily for mobile viewports with safe-area support</li>
            </ul>
          </Section>

          {/* 10. Future Roadmap */}
          <Section icon={Globe} title="10. Future Roadmap">
            <ul className="list-disc pl-5 space-y-1">
              <li>Dark mode neumorphic theme</li>
              <li>Direct bank account linking via Plaid/Open Banking</li>
              <li>Predictive spending forecasts</li>
              <li>Social spending comparisons (anonymized)</li>
              <li>Export reports as PDF</li>
              <li>Push notifications for nudges</li>
              <li>Multi-currency support</li>
              <li>Spending goals with behavioral tracking</li>
            </ul>
          </Section>

          {/* Credits */}
          <div className="rounded-2xl neu-raised p-6 text-center">
            <p className="text-sm text-muted-foreground">Designed & Built by</p>
            <p className="text-lg font-bold text-foreground mt-1">Raman Choudhary</p>
            <p className="text-xs text-muted-foreground mt-2">SpendAI — Behavioral Reflection Engine</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl neu-raised p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl neu-inset-sm flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
        </div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

function SubSection({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 pt-5 border-t border-border">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

function Principle({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="rounded-xl neu-inset p-3">
      <p className="text-sm font-bold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
    </div>
  );
}

function TechBox({ items }: { items: string[] }) {
  return (
    <div className="mt-3 rounded-xl neu-inset-sm p-3">
      <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-1.5">Technical Details</p>
      <ul className="text-xs text-muted-foreground space-y-0.5">
        {items.map((item, i) => <li key={i}>• {item}</li>)}
      </ul>
    </div>
  );
}

function TableCard({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="rounded-xl neu-inset p-3 flex gap-3">
      <code className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded h-fit shrink-0">{name}</code>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}

function FuncCard({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="rounded-xl neu-inset p-3">
      <code className="text-xs font-bold text-primary">{name}</code>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    </div>
  );
}
