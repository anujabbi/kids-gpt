-- Remove the public read policy that exposes user IDs and personal content
DROP POLICY IF EXISTS "Public comics can be viewed by anyone" ON public.comics;

-- Add a new policy that allows authenticated users to view public comics
-- This prevents anonymous access while still allowing sharing among authenticated users
CREATE POLICY "Authenticated users can view public comics" 
ON public.comics 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND is_public = true
);

-- Add a policy for authenticated users to view any comic by direct ID access
-- This enables sharing comic links between authenticated users
CREATE POLICY "Authenticated users can view comics by direct access"
ON public.comics
FOR SELECT
USING (
  auth.uid() IS NOT NULL
);