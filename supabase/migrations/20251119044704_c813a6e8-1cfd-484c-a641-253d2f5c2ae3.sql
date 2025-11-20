-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create symptom checks table
CREATE TABLE public.symptom_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  symptoms JSONB NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  duration_value INTEGER NOT NULL,
  duration_unit TEXT NOT NULL CHECK (duration_unit IN ('hours', 'days', 'weeks')),
  body_area TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create suggestions table
CREATE TABLE public.suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_id UUID REFERENCES public.symptom_checks(id) ON DELETE CASCADE NOT NULL,
  suggestions_text TEXT NOT NULL,
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('emergency', 'consult_doctor', 'self_care', 'monitor')),
  possible_conditions JSONB,
  home_remedies JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create symptom history aggregation table
CREATE TABLE public.symptom_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  symptom_name TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  last_reported TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, symptom_name)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for symptom_checks
CREATE POLICY "Users can view their own symptom checks"
  ON public.symptom_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own symptom checks"
  ON public.symptom_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symptom checks"
  ON public.symptom_checks FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for suggestions
CREATE POLICY "Users can view suggestions for their checks"
  ON public.suggestions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.symptom_checks
      WHERE symptom_checks.id = suggestions.check_id
      AND symptom_checks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create suggestions for their checks"
  ON public.suggestions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.symptom_checks
      WHERE symptom_checks.id = suggestions.check_id
      AND symptom_checks.user_id = auth.uid()
    )
  );

-- RLS Policies for symptom_history
CREATE POLICY "Users can view their own symptom history"
  ON public.symptom_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own symptom history"
  ON public.symptom_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symptom history"
  ON public.symptom_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();