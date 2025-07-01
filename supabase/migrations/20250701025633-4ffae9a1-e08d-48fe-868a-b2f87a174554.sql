
-- Add profile image columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN profile_image_type TEXT DEFAULT 'alien1',
ADD COLUMN custom_profile_image_url TEXT;

-- Create storage bucket for custom profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true);

-- Create storage policies for profile-images bucket
CREATE POLICY "Users can upload their own profile images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view profile images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can update their own profile images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
