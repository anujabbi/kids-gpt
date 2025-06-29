
-- Add openai_api_key column to families table
ALTER TABLE public.families 
ADD COLUMN openai_api_key TEXT;

-- Create RLS policies for API key access
CREATE POLICY "Family members can view their family's API key" 
  ON public.families 
  FOR SELECT 
  USING (
    id IN (
      SELECT family_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Parents can update their family's API key" 
  ON public.families 
  FOR UPDATE 
  USING (
    id IN (
      SELECT family_id 
      FROM public.profiles 
      WHERE id = auth.uid() AND role = 'parent'
    )
  );

-- Enable RLS on families table if not already enabled
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
