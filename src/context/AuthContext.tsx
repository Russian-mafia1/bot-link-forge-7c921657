
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  username: string;
  coins: number;
  referralCode: string;
  lastClaim?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<AuthUser>) => void;
  isLoading: boolean;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile after authentication
          setTimeout(async () => {
              try {
                // Use a raw query to avoid type issues
                const { data } = await supabase.rpc('get_user_profile', { 
                  user_uuid: session.user.id 
                });
                
                if (data?.[0]) {
                  const profile = data[0];
                  setUser({
                    id: profile.id,
                    email: profile.email,
                    username: profile.username,
                    coins: profile.coins,
                    referralCode: profile.referral_code,
                    lastClaim: profile.last_claim
                  });
                }
              } catch (error) {
                console.error('Error fetching profile:', error);
              }
          }, 0);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    let email = emailOrUsername;
    
    // If input doesn't contain @, treat it as username and fetch email
    if (!emailOrUsername.includes('@')) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', emailOrUsername)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            throw new Error('Username not found. Please check your username or sign up for an account.');
          }
          throw new Error('Error looking up username. Please try again.');
        }
        
        if (!profile) {
          throw new Error('Username not found. Please check your username or sign up for an account.');
        }
        
        email = profile.email;
      } catch (error: any) {
        throw new Error(error.message || 'Error looking up username. Please try again.');
      }
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === 'Email not confirmed') {
        throw new Error('Please check your email and click the confirmation link before signing in.');
      } else if (error.message === 'Invalid login credentials') {
        throw new Error('Invalid email/username or password. Please check your credentials.');
      } else {
        throw new Error(error.message);
      }
    }
  };

  const register = async (email: string, username: string, password: string, referralCode?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
          referral_code: referralCode
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    setUser(null);
    setSession(null);
  };

  const updateUser = (userData: Partial<AuthUser>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        login,
        register,
        logout,
        updateUser,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
