
-- First, drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view family member profiles" ON public.profiles;

-- Create a security definer function to get the current user's family_id
-- This function runs with elevated privileges and avoids RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_family_id()
RETURNS UUID AS $$
  SELECT family_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Now create the policy using the security definer function
CREATE POLICY "Users can view family member profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR 
  family_id = public.get_current_user_family_id()
);
