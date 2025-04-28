import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateGeminiApiKey: (apiKey: string) => Promise<void>;
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
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'supabase.auth.token',
    }
  }
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSignUpDisabled, setIsSignUpDisabled] = useState(false);
  const [signUpTimer, setSignUpTimer] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserData(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await setUserData(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let interval: number;
    if (isSignUpDisabled && signUpTimer > 0) {
      interval = setInterval(() => {
        setSignUpTimer((prev) => {
          if (prev <= 1) {
            setIsSignUpDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSignUpDisabled, signUpTimer]);

  const createProfile = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([{ id: userId }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  const setUserData = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!profile) {
        await createProfile(supabaseUser.id);
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          geminiApiKey: null
        });
        return;
      }

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        geminiApiKey: profile.gemini_api_key
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

      if (error) throw error;

      if (data.user) {
        await setUserData(data.user);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    if (isSignUpDisabled) {
      throw new Error(`Please wait ${signUpTimer} seconds before trying again`);
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) {
        if (signUpError.message.includes('rate_limit')) {
          setIsSignUpDisabled(true);
          setSignUpTimer(60);
        }
        throw signUpError;
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
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateGeminiApiKey = async (apiKey: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ gemini_api_key: apiKey })
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, geminiApiKey: apiKey });
    } catch (error) {
      console.error('Error updating Gemini API key:', error);
      throw error;
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