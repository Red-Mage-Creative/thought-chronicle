import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { checkPasswordBreach } from '@/utils/passwordSecurity';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, displayName: string, accessCode: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string, displayName: string, accessCode: string) => {
    try {
      // Check password against known breaches first
      const breachResult = await checkPasswordBreach(password);
      if (breachResult.isBreached) {
        return { 
          error: { 
            message: `This password has been found in ${breachResult.breachCount?.toLocaleString()} data breaches. Please choose a different password for your security.` 
          } 
        };
      }
      
      if (breachResult.error) {
        // Don't block signup if breach check fails, just log the issue
        console.warn('Password breach check failed:', breachResult.error);
      }

      // Validate access code using secure edge function
      const { data: validationResult, error: validationError } = await supabase.functions.invoke('validate-access-code', {
        body: { accessCode }
      });

      if (validationError) {
        console.error('Access code validation error:', validationError);
        const errorMessage = validationError.message?.includes('NetworkError') || validationError.message?.includes('Failed to fetch')
          ? 'Network issue while validating access code. Please try again.'
          : 'Unable to validate access code. Please try again.';
        return { error: { message: errorMessage } };
      }

      if (!validationResult?.valid) {
        return { error: { message: 'Invalid access code. Please check and try again.' } };
      }

      // Check if username is already taken using secure function
      const { data: isTaken, error: usernameError } = await supabase.rpc('is_username_taken', {
        check_username: username
      });

      if (usernameError) {
        console.error('Username check error:', usernameError);
        return { error: { message: 'Error checking username availability. Please try again.' } };
      }

      if (isTaken) {
        return { error: { message: 'Username is already taken. Please choose a different one.' } };
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: username,
            display_name: displayName
          }
        }
      });
      return { error };
    } catch (err) {
      console.error('Signup error:', err);
      return { error: { message: 'An unexpected error occurred during signup.' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { error };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: { message: 'An unexpected error occurred during sign in.' } };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};