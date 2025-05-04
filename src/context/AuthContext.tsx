import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';
import { supabase, getCurrentSession, getCurrentUser } from '../lib/supabase';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSignUpDisabled, setIsSignUpDisabled] = useState(false);
  const [signUpTimer, setSignUpTimer] = useState(0);

  const setUserData = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('gemini_api_key')
        .eq('id', supabaseUser.id)
        .single();

      const session = await getCurrentSession();
      
      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        geminiApiKey: profile?.gemini_api_key || null,
        access_token: session?.access_token
      };

      setUser(userData);
      localStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error setting user data:', error);
      setUser(null);
      localStorage.removeItem('userData');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await getCurrentSession();
        if (session?.user) {
          await setUserData(session.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await setUserData(session.user);
      } else {
        setUser(null);
        localStorage.removeItem('userData');
      }
    });

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          await setUserData(currentUser);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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
        window.dispatchEvent(new Event('supabase.auth.change'));
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
          setTimeout(() => {
            setIsSignUpDisabled(false);
            setSignUpTimer(0);
          }, 60000);
        }
        throw error;
      }

      if (data.user) {
        await setUserData(data.user);
        window.dispatchEvent(new Event('supabase.auth.change'));
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
      window.dispatchEvent(new Event('supabase.auth.change'));
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