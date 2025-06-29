
-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('parent', 'child');

-- Create families table
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  family_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add role and family_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role public.app_role DEFAULT 'parent',
ADD COLUMN family_id UUID REFERENCES public.families(id) ON DELETE SET NULL;

-- Create family_members junction table for additional flexibility
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for families table
CREATE POLICY "Users can view their own family" 
  ON public.families 
  FOR SELECT 
  USING (id IN (
    SELECT family_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Parents can update their family" 
  ON public.families 
  FOR UPDATE 
  USING (id IN (
    SELECT family_id FROM public.profiles 
    WHERE id = auth.uid() AND role = 'parent'
  ));

-- RLS policies for family_members table
CREATE POLICY "Users can view their family members" 
  ON public.family_members 
  FOR SELECT 
  USING (family_id IN (
    SELECT family_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Parents can manage family members" 
  ON public.family_members 
  FOR ALL 
  USING (family_id IN (
    SELECT family_id FROM public.profiles 
    WHERE id = auth.uid() AND role = 'parent'
  ));

-- Function to generate unique family codes
CREATE OR REPLACE FUNCTION public.generate_family_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-character alphanumeric code
    code := upper(substring(encode(gen_random_bytes(4), 'base64') from 1 for 6));
    -- Remove problematic characters
    code := replace(replace(replace(code, '/', ''), '+', ''), '=', '');
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.families WHERE family_code = code) INTO exists_check;
    
    -- If code doesn't exist and is 6 characters, return it
    IF NOT exists_check AND length(code) = 6 THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Update handle_new_user function to support family creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  family_code_input TEXT;
  target_family_id UUID;
  user_role public.app_role;
  new_family_id UUID;
BEGIN
  -- Get role and family_code from metadata
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'parent');
  family_code_input := NEW.raw_user_meta_data->>'family_code';
  
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
  
  -- Insert user profile
  INSERT INTO public.profiles (id, email, full_name, role, family_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    user_role,
    target_family_id
  );
  
  -- Add to family_members if family exists
  IF target_family_id IS NOT NULL THEN
    INSERT INTO public.family_members (family_id, user_id, role)
    VALUES (target_family_id, NEW.id, user_role);
  END IF;
  
  RETURN NEW;
END;
$$;
