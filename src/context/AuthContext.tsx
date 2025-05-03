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
      detectSessionInUrl: false,
      storage: window.localStorage
    }
  }
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSignUpDisabled, setIsSignUpDisabled] = useState(false);
  const [signUpTimer, setSignUpTimer] = useState(0);

  const setUserData = async (supabaseUser: SupabaseUser | null) => {
    if (!supabaseUser) {
      setUser(null);
      localStorage.removeItem('userData');
      return;
    }

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

      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        geminiApiKey: profile?.gemini_api_key || null
      };

      setUser(userData);
      localStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error in setUserData:', error);
      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        geminiApiKey: null
      };
      setUser(userData);
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await setUserData(session.user);
        } else {
          setUser(null);
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await setUserData(session.user);
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
        localStorage.removeItem('userData');
      }
    });

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await setUserData(session.user);
        } else {
          setUser(null);
          localStorage.removeItem('userData');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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

  // Add this function inside your AuthProvider component
const checkSessionPersisted = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    setUser(null);
    localStorage.removeItem('userData');
  }
};

// Add this useEffect hook
useEffect(() => {
  const handleStorageEvent = async (e: StorageEvent) => {
    if (e.key === 'sb-auth-token') {
      await checkSessionPersisted();
    }
  };

  window.addEventListener('storage', handleStorageEvent);
  return () => window.removeEventListener('storage', handleStorageEvent);
}, []);

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
      localStorage.removeItem('userData');
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
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          gemini_api_key: apiKey,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      const updatedUser = {
        ...user,
        geminiApiKey: apiKey
      };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));

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