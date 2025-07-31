-- Fix remaining security warnings for existing functions

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  family_code_input TEXT;
  target_family_id UUID;
  user_role public.app_role;
  new_family_id UUID;
  user_age INTEGER;
BEGIN
  -- Get role, family_code, and age from metadata
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'parent');
  family_code_input := NEW.raw_user_meta_data->>'family_code';
  user_age := COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, NULL);
  
  -- Handle family logic based on role
  IF user_role = 'parent' THEN
    -- Create new family for parent
    INSERT INTO public.families (name, family_code)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Family') || '''s Family',
      public.generate_family_code()
    ) RETURNING id INTO new_family_id;
    target_family_id := new_family_id;
  ELSIF user_role = 'child' AND family_code_input IS NOT NULL THEN
    -- Find family by code for child
    SELECT id INTO target_family_id 
    FROM public.families 
    WHERE family_code = family_code_input;
  END IF;
  
  -- Insert user profile with age
  INSERT INTO public.profiles (id, email, full_name, role, family_id, age)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    user_role,
    target_family_id,
    user_age
  );
  
  -- Add to family_members if family exists
  IF target_family_id IS NOT NULL THEN
    INSERT INTO public.family_members (family_id, user_id, role)
    VALUES (target_family_id, NEW.id, user_role);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update update_child_age function  
CREATE OR REPLACE FUNCTION public.update_child_age(child_user_id uuid, new_age integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    parent_family_id uuid;
    child_family_id uuid;
    parent_role public.app_role;
BEGIN
    -- Get the current user's family_id and role
    SELECT family_id, role INTO parent_family_id, parent_role
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- Ensure the current user is a parent
    IF parent_role != 'parent' THEN
        RETURN FALSE;
    END IF;
    
    -- Get the child's family_id
    SELECT family_id INTO child_family_id
    FROM public.profiles 
    WHERE id = child_user_id;
    
    -- Ensure the child belongs to the same family
    IF parent_family_id != child_family_id THEN
        RETURN FALSE;
    END IF;
    
    -- Update the child's age
    UPDATE public.profiles 
    SET age = new_age, updated_at = now()
    WHERE id = child_user_id;
    
    RETURN TRUE;
END;
$function$;