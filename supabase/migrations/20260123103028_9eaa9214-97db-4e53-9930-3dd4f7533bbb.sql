-- User profiles for storing preferences
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  notification_preferences JSONB DEFAULT '{"weekly_digest": true, "soft_nudges": false, "sensitivity": "medium", "muted_categories": []}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Transactions table for storing user spending data
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  merchant TEXT NOT NULL,
  category TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_of_day TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Emotion tags for transactions
CREATE TABLE public.emotion_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  custom_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Spending patterns detected by the engine
CREATE TABLE public.spending_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence TEXT NOT NULL DEFAULT 'emerging',
  occurrences INTEGER NOT NULL DEFAULT 1,
  time_range TEXT,
  average_amount DECIMAL(10, 2),
  trend TEXT DEFAULT 'stable',
  first_detected TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Moments that matter stories
CREATE TABLE public.moment_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  narrative TEXT NOT NULL,
  pattern_type TEXT NOT NULL,
  related_transactions UUID[] DEFAULT '{}',
  heatmap_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  dismissed BOOLEAN DEFAULT false,
  user_feedback TEXT
);

-- Spending seasons (3-6 month phases)
CREATE TABLE public.spending_seasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  category_changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Weekly check-ins
CREATE TABLE public.weekly_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  summary TEXT NOT NULL,
  category_changes JSONB,
  user_response TEXT,
  user_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Money journal entries (tied to patterns)
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_id UUID REFERENCES public.spending_patterns(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Spending baselines per user/category/time
CREATE TABLE public.spending_baselines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  time_period TEXT NOT NULL,
  baseline_amount DECIMAL(10, 2) NOT NULL,
  baseline_count INTEGER NOT NULL DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, time_period)
);

-- Deviation events for notifications
CREATE TABLE public.deviation_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  deviation_percentage DECIMAL(5, 2) NOT NULL,
  baseline_amount DECIMAL(10, 2) NOT NULL,
  current_amount DECIMAL(10, 2) NOT NULL,
  occurrence_count INTEGER NOT NULL,
  time_period TEXT NOT NULL,
  narrative TEXT,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_response TEXT,
  cooldown_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications queue
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moment_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deviation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for emotion_tags
CREATE POLICY "Users can view their own emotion tags" ON public.emotion_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own emotion tags" ON public.emotion_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own emotion tags" ON public.emotion_tags FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for spending_patterns
CREATE POLICY "Users can view their own patterns" ON public.spending_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own patterns" ON public.spending_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own patterns" ON public.spending_patterns FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for moment_stories
CREATE POLICY "Users can view their own stories" ON public.moment_stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stories" ON public.moment_stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stories" ON public.moment_stories FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for spending_seasons
CREATE POLICY "Users can view their own seasons" ON public.spending_seasons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own seasons" ON public.spending_seasons FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for weekly_checkins
CREATE POLICY "Users can view their own checkins" ON public.weekly_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own checkins" ON public.weekly_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own checkins" ON public.weekly_checkins FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for journal_entries
CREATE POLICY "Users can view their own journal" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for spending_baselines
CREATE POLICY "Users can view their own baselines" ON public.spending_baselines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own baselines" ON public.spending_baselines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own baselines" ON public.spending_baselines FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for deviation_events
CREATE POLICY "Users can view their own deviations" ON public.deviation_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own deviations" ON public.deviation_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own deviations" ON public.deviation_events FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patterns_updated_at BEFORE UPDATE ON public.spending_patterns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();