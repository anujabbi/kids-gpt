
-- Add conversation type to conversations table
ALTER TABLE public.conversations 
ADD COLUMN type TEXT DEFAULT 'regular' CHECK (type IN ('regular', 'personality-quiz'));

-- Create personality_profiles table to store quiz results
CREATE TABLE public.personality_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  interests TEXT[],
  favorite_colors TEXT[],
  hobbies TEXT[],
  learning_style TEXT,
  personality_traits JSONB,
  quiz_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add Row Level Security (RLS) to personality_profiles
ALTER TABLE public.personality_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for personality_profiles
CREATE POLICY "Users can view their own personality profile" 
  ON public.personality_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own personality profile" 
  ON public.personality_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personality profile" 
  ON public.personality_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow parents to view their children's personality profiles
CREATE POLICY "Parents can view their children's personality profiles" 
  ON public.personality_profiles 
  FOR SELECT 
  USING (user_id IN (
    SELECT p.id
    FROM profiles p
    JOIN profiles parent ON parent.id = auth.uid()
    WHERE p.family_id = parent.family_id 
    AND parent.role = 'parent' 
    AND p.role = 'child'
  ));
