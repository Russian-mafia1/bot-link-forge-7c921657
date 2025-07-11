
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
  login: (email: string, password: string) => Promise<void>;
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
          // Fetch or create user profile
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (error && error.code === 'PGRST116') {
                // Profile doesn't exist, create one
                const newProfile = {
                  id: session.user.id,
                  email: session.user.email!,
                  username: session.user.email!.split('@')[0],
                  coins: 10,
                  referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
                  last_claim: null
                };

                const { data: createdProfile, error: createError } = await supabase
                  .from('profiles')
                  .insert([newProfile])
                  .select()
                  .single();

                if (!createError && createdProfile) {
                  setUser({
                    id: createdProfile.id,
                    email: createdProfile.email,
                    username: createdProfile.username,
                    coins: createdProfile.coins,
                    referralCode: createdProfile.referral_code,
                    lastClaim: createdProfile.last_claim
                  });
                }
              } else if (profile) {
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

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
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
