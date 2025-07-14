
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
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile after authentication
          setTimeout(async () => {
              try {
                console.log('Fetching profile for user:', session.user.id);
                const { data, error } = await supabase.rpc('get_user_profile', { 
                  user_uuid: session.user.id 
                });
                
                console.log('Profile fetch result:', data, error);
                
                if (error) {
                  console.error('Error fetching profile:', error);
                  return;
                }
                
                if (data && data.length > 0) {
                  const profile = data[0];
                  setUser({
                    id: profile.id,
                    email: profile.email,
                    username: profile.username,
                    coins: profile.coins,
                    referralCode: profile.referral_code,
                    lastClaim: profile.last_claim
                  });
                } else {
                  console.log('No profile found for user');
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
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    console.log('Login attempt with:', emailOrUsername);
    let email = emailOrUsername;
    
    // If input doesn't contain @, treat it as username and fetch email
    if (!emailOrUsername.includes('@')) {
      try {
        console.log('Looking up username:', emailOrUsername);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', emailOrUsername)
          .maybeSingle();
        
        console.log('Username lookup result:', profile, error);
        
        if (error) {
          console.error('Database error during username lookup:', error);
          throw new Error('Error looking up username. Please try again.');
        }
        
        if (!profile) {
          console.log('No profile found for username:', emailOrUsername);
          throw new Error('Username not found. Please check your username or sign up for an account.');
        }
        
        email = profile.email;
        console.log('Found email for username:', email);
      } catch (error: any) {
        console.error('Username lookup failed:', error);
        throw new Error(error.message || 'Error looking up username. Please try again.');
      }
    }
    
    console.log('Attempting login with email:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      if (error.message === 'Email not confirmed') {
        throw new Error('Please check your email and click the confirmation link before signing in.');
      } else if (error.message === 'Invalid login credentials') {
        throw new Error('Invalid email/username or password. Please check your credentials.');
      } else {
        throw new Error(error.message);
      }
    }
    
    console.log('Login successful');
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
