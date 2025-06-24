import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Session error:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle email confirmation success
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          // Check if this is from email verification
          const urlParams = new URLSearchParams(window.location.search);
          const hasToken = urlParams.has('token_hash') || urlParams.has('access_token');
          
          if (hasToken) {
            toast({
              title: "Email Verified Successfully!",
              description: "Welcome to Interview Insights! Your account is now active.",
            });
            
            // Clean up URL parameters after successful verification
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }

        // Handle email confirmation errors
        if (event === 'TOKEN_REFRESHED') {
          const urlParams = new URLSearchParams(window.location.search);
          const error = urlParams.get('error');
          const errorDescription = urlParams.get('error_description');
          
          if (error) {
            console.error('Auth error:', error, errorDescription);
            toast({
              title: "Authentication Error",
              description: errorDescription || "There was an issue with authentication. Please try again.",
              variant: "destructive",
            });
            
            // Clean up URL parameters
            window.history.replaceState({}, document.title, '/auth');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [toast]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://interview-insights-io.vercel.app/auth',
          data: {
            full_name: fullName || '',
          }
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        return { error };
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Check your email!",
          description: "We've sent you a confirmation link. Please check your email and click the link to verify your account.",
        });
      }
      
      return { error: null };
    } catch (error) {
      console.error('Signup exception:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Signin error:', error);
      }
      
      return { error };
    } catch (error) {
      console.error('Signin exception:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        setSession(null);
      }
      return { error };
    } catch (error) {
      console.error('Signout exception:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
