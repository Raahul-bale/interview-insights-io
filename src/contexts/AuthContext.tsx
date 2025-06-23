
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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle email verification success
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          // Check if this is from email verification (has token in URL)
          const urlParams = new URLSearchParams(window.location.search);
          const isFromEmailVerification = urlParams.has('token_hash') || urlParams.has('type');
          
          if (isFromEmailVerification) {
            toast({
              title: "Email Verified Successfully!",
              description: "Welcome to Interview Insights! Your account is now active.",
            });
            
            // Redirect to auth page (login) and clear URL parameters
            setTimeout(() => {
              window.history.replaceState({}, document.title, '/auth');
              window.location.href = '/auth';
            }, 1000);
          }
        }

        // Handle token expired or invalid
        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.has('error')) {
            const error = urlParams.get('error');
            const errorDescription = urlParams.get('error_description');
            
            if (error === 'access_denied' || errorDescription?.includes('expired')) {
              toast({
                title: "Verification Link Expired",
                description: "The verification link has expired. Please request a new one.",
                variant: "destructive",
              });
              
              // Redirect to auth page
              setTimeout(() => {
                window.history.replaceState({}, document.title, '/auth');
                window.location.href = '/auth';
              }, 2000);
            }
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || '',
          }
        }
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
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
