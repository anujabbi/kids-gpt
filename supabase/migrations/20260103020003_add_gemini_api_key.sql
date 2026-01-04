-- Add Gemini API key column to families table
ALTER TABLE public.families
ADD COLUMN IF NOT EXISTS gemini_api_key text;

-- Add comment for documentation
COMMENT ON COLUMN public.families.gemini_api_key IS 'Google Gemini API key for image generation';
