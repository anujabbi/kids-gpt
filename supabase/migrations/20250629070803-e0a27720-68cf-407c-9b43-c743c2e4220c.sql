
-- First, let's check and fix the RLS policies for the profiles table
-- The current policy might be too restrictive

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policies that allow family members to view each other's profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow users to view profiles of other family members
CREATE POLICY "Users can view family member profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR 
  family_id IN (
    SELECT family_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Make sure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
