-- Create character_library table for shared comic characters
CREATE TABLE public.character_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,           -- Personality/role description
  visual_description text NOT NULL,    -- Physical appearance details
  image_url text NOT NULL,             -- Supabase Storage URL
  art_style text NOT NULL CHECK (art_style IN ('cartoon', 'ghibli', 'superhero', 'simple')),

  -- Ownership & Sharing
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_public boolean NOT NULL DEFAULT false,     -- Shared with all users
  is_featured boolean NOT NULL DEFAULT false,   -- Staff picks / pre-made characters

  -- Metadata
  use_count integer NOT NULL DEFAULT 0,         -- Popularity tracking
  tags text[] DEFAULT '{}',                     -- Search tags like ['dragon', 'friendly']

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.character_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view featured characters (pre-made library)
CREATE POLICY "Anyone can view featured characters"
ON public.character_library
FOR SELECT
USING (is_featured = true);

-- Authenticated users can view public characters
CREATE POLICY "Authenticated users can view public characters"
ON public.character_library
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_public = true);

-- Users can view their own characters
CREATE POLICY "Users can view their own characters"
ON public.character_library
FOR SELECT
USING (auth.uid() = created_by);

-- Children can create characters
CREATE POLICY "Children can create characters"
ON public.character_library
FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'child'
  )
);

-- Users can update their own characters
CREATE POLICY "Users can update their own characters"
ON public.character_library
FOR UPDATE
USING (auth.uid() = created_by);

-- Users can delete their own characters
CREATE POLICY "Users can delete their own characters"
ON public.character_library
FOR DELETE
USING (auth.uid() = created_by);

-- Create storage bucket for character library images
INSERT INTO storage.buckets (id, name, public)
VALUES ('character-library', 'character-library', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for character library images
CREATE POLICY "Anyone can view character library images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'character-library');

CREATE POLICY "Authenticated users can upload character images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'character-library' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own character images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'character-library' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own character images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'character-library' AND
  auth.uid() IS NOT NULL
);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_character_library_updated_at
BEFORE UPDATE ON public.character_library
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for common queries
CREATE INDEX idx_character_library_featured ON public.character_library(is_featured) WHERE is_featured = true;
CREATE INDEX idx_character_library_public ON public.character_library(is_public) WHERE is_public = true;
CREATE INDEX idx_character_library_created_by ON public.character_library(created_by);
CREATE INDEX idx_character_library_art_style ON public.character_library(art_style);
CREATE INDEX idx_character_library_tags ON public.character_library USING GIN(tags);

-- Function to increment use count
CREATE OR REPLACE FUNCTION public.increment_character_use_count(character_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.character_library
  SET use_count = use_count + 1
  WHERE id = character_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
