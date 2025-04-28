import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateGeminiApiKey: (apiKey: string | null) => Promise<{ error?: string }>;
  isSignUpDisabled: boolean;
  signUpTimer: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabase: SupabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSignUpDisabled, setIsSignUpDisabled] = useState(false);
  const [signUpTimer, setSignUpTimer] = useState(0);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await setUserData(session.user);
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          await setUserData(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let interval: number;
    if (isSignUpDisabled && signUpTimer > 0) {
      interval = window.setInterval(() => {
        setSignUpTimer((prev) => {
          if (prev <= 1) {
            setIsSignUpDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => window.clearInterval(interval);
  }, [isSignUpDisabled, signUpTimer]);

  const setUserData = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('gemini_api_key')
        .eq('id', supabaseUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
        throw fetchError;
      }

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        geminiApiKey: profile?.gemini_api_key || null
      });
    } catch (error) {
      console.error('Error in setUserData:', error);
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        geminiApiKey: null
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await setUserData(data.user);
      }

      return {};
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string) => {
    if (isSignUpDisabled) {
      throw new Error(`Please wait ${signUpTimer} seconds before trying again`);
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('rate_limit')) {
          setIsSignUpDisabled(true);
          setSignUpTimer(60);
        }
        throw error;
      }

      if (data.user) {
        await setUserData(data.user);
        setIsSignUpDisabled(true);
        setSignUpTimer(60);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      window.localStorage.removeItem('sb-' + import.meta.env.VITE_SUPABASE_URL + '-auth-token');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateGeminiApiKey = async (apiKey: string | null) => {
    if (!user) {
      return { error: 'User not authenticated' };
    }

    try {
      // First, check if the profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let updateError;
      if (!existingProfile) {
        // If profile doesn't exist, create it
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id,
            gemini_api_key: apiKey,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        updateError = insertError;
      } else {
        // If profile exists, update it
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({ 
            gemini_api_key: apiKey,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        updateError = updateErr;
      }

      if (updateError) throw updateError;

      // Update local state
      setUser(prevUser => prevUser ? {
        ...prevUser,
        geminiApiKey: apiKey
      } : null);

      return {};
    } catch (error) {
      console.error('Error updating Gemini API key:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to update API key'
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      updateGeminiApiKey,
      isSignUpDisabled,
      signUpTimer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};