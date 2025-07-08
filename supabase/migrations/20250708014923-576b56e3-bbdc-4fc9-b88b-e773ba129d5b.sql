
-- Add new columns to personality_profiles table for the 5 specific questions
ALTER TABLE public.personality_profiles 
ADD COLUMN personality_description TEXT,
ADD COLUMN reading_preferences TEXT[],
ADD COLUMN dream_job TEXT;

-- Update the updated_at timestamp for existing records
UPDATE public.personality_profiles 
SET updated_at = now();
