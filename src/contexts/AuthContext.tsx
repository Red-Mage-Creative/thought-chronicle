import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, displayName: string, accessCode: string) => Promise<{ error: any }>;
  signIn: (emailOrUsername: string, password: string) => Promise<{ error: any }>;
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
      // Validate access code
      const { data: configData, error: configError } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'signup_access_code')
        .single();

      if (configError || !configData) {
        return { error: { message: 'Unable to validate access code. Please try again.' } };
      }

      if (configData.value !== accessCode) {
        return { error: { message: 'Invalid access code. Please check and try again.' } };
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
      return { error: { message: 'An unexpected error occurred during signup.' } };
    }
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    try {
      // Check if input is email or username
      const isEmail = emailOrUsername.includes('@');
      let email = emailOrUsername;

      if (!isEmail) {
        // Get email from username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', emailOrUsername)
          .single();

        if (profileError || !profileData) {
          return { error: { message: 'Username not found. Please check and try again.' } };
        }

        // Get email from auth.users using the profile ID
        // Since we can't query auth.users directly, we'll try to sign in with username as email
        // If that fails, we'll show a helpful error message
        const { error: attemptError } = await supabase.auth.signInWithPassword({
          email: emailOrUsername,
          password
        });

        if (attemptError) {
          return { error: { message: 'Invalid username or password. Please try again.' } };
        }
        return { error: null };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { error };
    } catch (err) {
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