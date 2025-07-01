import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'parent' | 'child' | null;
  family_id: string | null;
  age: number | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string, timeout = 10000) => {
    console.log('Fetching profile for user:', userId);
    try {
      console.log('Making Supabase query to profiles table...');
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), timeout);
      });
      
      // Race the query against the timeout
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      console.log('Supabase profiles query result:', { data, error });

      if (error) {
        console.error('Error fetching user profile:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setProfile(null);
        return null;
      } else {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
        return data;
      }
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error);
      // Don't block auth for profile failures - continue with null profile
      setProfile(null);
      return null;
    }
  };

  const clearAuthState = () => {
    console.log('Clearing auth state');
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      console.log('Initializing auth...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            clearAuthState();
            setLoading(false);
          }
          return;
        }

        console.log('Initial session check:', session?.user?.id || 'No session');

        if (!mounted) return;

        if (session?.user) {
          setSession(session);
          setUser(session.user);
          console.log('User found, fetching profile...');
          try {
            await fetchUserProfile(session.user.id, 5000); // 5 second timeout for initial load
            console.log('Profile loaded during init');
          } catch (profileError) {
            console.error('Profile fetch failed during init:', profileError);
            // Continue anyway - don't block auth for profile failures
          }
        } else {
          clearAuthState();
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          clearAuthState();
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
          clearAuthState();
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('Processing auth event:', event);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('User authenticated, fetching profile...');
            try {
              await fetchUserProfile(session.user.id, 5000); // 5 second timeout
              console.log('Profile loaded after auth event');
            } catch (profileError) {
              console.error('Profile fetch failed after auth event:', profileError);
              // Continue anyway - don't block auth for profile failures
            }
          } else {
            clearAuthState();
          }
          setLoading(false);
        }
      }
    );

    // Set a maximum timeout for initialization
    initTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timeout - forcing completion');
        setLoading(false);
      }
    }, 15000); // 15 second max timeout

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      if (initTimeout) clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in...');
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
      setLoading(false);
    }
    // Don't set loading to false on success - let auth state change handle it
    
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('Attempting to sign up with metadata:', metadata);
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });
    
    if (error) {
      console.error('Sign up error:', error);
    } else {
      console.log('Sign up successful');
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out...');
    await supabase.auth.signOut();
    clearAuthState();
    setLoading(false);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
