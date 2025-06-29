
-- Check if RLS is enabled on profiles table and enable if not
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'profiles' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create profile policies only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile" 
        ON public.profiles 
        FOR SELECT 
        USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" 
        ON public.profiles 
        FOR UPDATE 
        USING (auth.uid() = id);
    END IF;
END $$;

-- Enable RLS on family_members table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'family_members' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create family_members policies only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'family_members' 
        AND policyname = 'Users can view their family members'
    ) THEN
        CREATE POLICY "Users can view their family members" 
        ON public.family_members 
        FOR SELECT 
        USING (auth.uid() = user_id OR family_id IN (
            SELECT family_id FROM public.profiles WHERE id = auth.uid()
        ));
    END IF;
END $$;

-- Enable RLS on families table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'families' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create families policies only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'families' 
        AND policyname = 'Users can view their own family'
    ) THEN
        CREATE POLICY "Users can view their own family" 
        ON public.families 
        FOR SELECT 
        USING (id IN (
            SELECT family_id FROM public.profiles WHERE id = auth.uid()
        ));
    END IF;
END $$;
