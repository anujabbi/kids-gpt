
-- Add age column to profiles table if it doesn't exist (it should already exist based on the schema)
-- This is just to ensure we have the column and can update it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'age') THEN
        ALTER TABLE public.profiles ADD COLUMN age integer;
    END IF;
END $$;

-- Create or replace function to update child age (only parents can update their children's ages)
CREATE OR REPLACE FUNCTION public.update_child_age(child_user_id uuid, new_age integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;
