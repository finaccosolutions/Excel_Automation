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
      storage: {
        getItem: (key) => {
          const value = globalThis.localStorage?.getItem(key) ?? null;
          return Promise.resolve(value);
        },
        setItem: (key, value) => {
          globalThis.localStorage?.setItem(key, value);
          return Promise.resolve();
        },
        removeItem: (key) => {
          globalThis.localStorage?.removeItem(key);
          return Promise.resolve();
        },
      },
    }
  }
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSignUpDisabled, setIsSignUpDisabled] = useState(false);
  const [signUpTimer, setSignUpTimer] = useState(0);
  const [authInitialized, setAuthInitialized] = useState(false);

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

      const userData = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        geminiApiKey: profile?.gemini_api_key || null
      };

      setUser(userData);
      // Store user data in localStorage for persistence
      localStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error in setUserData:', error);
      const userData = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        geminiApiKey: null
      };
      setUser(userData);
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  };

  // Handle storage events for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userData') {
        if (event.newValue) {
          setUser(JSON.parse(event.newValue));
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to get stored user data first
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          setUser(JSON.parse(storedUserData));
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await setUserData(session.user);
        } else {
          setUser(null);
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
        setUser(null);
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!authInitialized) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('userData');
        return;
      }

      setLoading(true);
      try {
        if (session?.user) {
          await setUserData(session.user);
        } else {
          setUser(null);
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        setUser(null);
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [authInitialized]);

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
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (isSignUpDisabled) {
      throw new Error(`Please wait ${signUpTimer} seconds before trying again`);
    }

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      localStorage.removeItem('userData');
      window.location.reload(); // Reload to ensure clean state
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateGeminiApiKey = async (apiKey: string | null) => {
    if (!user) {
      return { error: 'User not authenticated' };
    }

    setLoading(true);
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
    } finally {
      setLoading(false);
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