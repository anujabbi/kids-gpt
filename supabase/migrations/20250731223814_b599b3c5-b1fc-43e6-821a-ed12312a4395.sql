-- Fix remaining security warnings for generate_family_code and get_current_user_family_id functions

-- Update generate_family_code function
CREATE OR REPLACE FUNCTION public.generate_family_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INTEGER;
BEGIN
  LOOP
    code := '';
    -- Generate 6-character code using random characters
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.families WHERE family_code = code) INTO exists_check;
    
    -- If code doesn't exist, return it
    IF NOT exists_check THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$function$;

-- Update get_current_user_family_id function
CREATE OR REPLACE FUNCTION public.get_current_user_family_id()
RETURNS uuid
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT family_id FROM public.profiles WHERE id = auth.uid();
$function$;