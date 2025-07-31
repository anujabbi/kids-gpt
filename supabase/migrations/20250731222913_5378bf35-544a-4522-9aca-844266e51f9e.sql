-- Create comics table
CREATE TABLE public.comics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  story_idea text NOT NULL,
  comic_style text NOT NULL CHECK (comic_style IN ('cartoon', 'ghibli', 'superhero')),
  panels jsonb NOT NULL DEFAULT '[]'::jsonb,
  generation_id text,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  view_count integer NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.comics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Children can create their own comics" 
ON public.comics 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'child'
  )
);

CREATE POLICY "Users can view their own comics" 
ON public.comics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public comics can be viewed by anyone" 
ON public.comics 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can update their own comics" 
ON public.comics 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comics" 
ON public.comics 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage bucket for comic images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('comic-images', 'comic-images', true);

-- Storage policies for comic images
CREATE POLICY "Anyone can view comic images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'comic-images');

CREATE POLICY "Children can upload comic images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'comic-images' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'child'
  )
);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_comics_updated_at
BEFORE UPDATE ON public.comics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();