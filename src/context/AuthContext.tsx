
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
  signInWithGoogle: () => Promise<void>;
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

  const createUserProfile = async (userId: string, email: string, username: string, referralCode?: string) => {
    console.log('Creating profile for user:', userId, email, username);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          username: username,
          referral_code: referralCode || `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          coins: referralCode ? 20 : 10 // Bonus coins for referral
        });
      
      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }
      
      console.log('Profile created successfully');
      return true;
    } catch (error) {
      console.error('Failed to create profile:', error);
      return false;
    }
  };

  const fetchUserProfile = async (userId: string) => {
    console.log('Fetching profile for user:', userId);
    
    try {
      const { data, error } = await supabase.rpc('get_user_profile', { 
        user_uuid: userId 
      });
      
      console.log('Profile fetch result:', data, error);
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        const profile = data[0];
        return {
          id: profile.id,
          email: profile.email,
          username: profile.username,
          coins: profile.coins,
          referralCode: profile.referral_code,
          lastClaim: profile.last_claim
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Use setTimeout to avoid blocking auth state changes
          setTimeout(async () => {
            try {
              let profile = await fetchUserProfile(session.user.id);
              
              // If no profile exists, create one
              if (!profile) {
                console.log('No profile found, creating new profile');
                
                // Determine username and email
                let username = '';
                let email = session.user.email || '';
                
                if (session.user.user_metadata) {
                  // GitHub or other OAuth user
                  username = session.user.user_metadata.user_name || 
                           session.user.user_metadata.preferred_username || 
                           session.user.user_metadata.name ||
                           email.split('@')[0];
                } else {
                  // Regular email/password user - username should be in metadata
                  username = session.user.user_metadata?.username || email.split('@')[0];
                }
                
                const profileCreated = await createUserProfile(
                  session.user.id, 
                  email, 
                  username,
                  session.user.user_metadata?.referral_code
                );
                
                if (profileCreated) {
                  // Fetch the newly created profile
                  profile = await fetchUserProfile(session.user.id);
                }
              }
              
              if (profile) {
                setUser(profile);
              } else {
                console.error('Failed to create or fetch user profile');
                // Don't sign out the user, just set user to null
                setUser(null);
              }
            } catch (error) {
              console.error('Error handling user profile:', error);
              setUser(null);
            }
          }, 100);
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
          throw new Error(`Username "${emailOrUsername}" not found. Please check your username or sign up for an account.`);
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
      if (error.message === 'Invalid login credentials') {
        throw new Error('Invalid email/username or password. Please check your credentials and try again.');
      } else {
        throw new Error(error.message);
      }
    }
    
    console.log('Login successful');
  };

  const register = async (email: string, username: string, password: string, referralCode?: string) => {
    console.log('Registration attempt:', email, username);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          username,
          referral_code: referralCode
        }
      }
    });

    if (error) {
      console.error('Registration error:', error);
      throw new Error(error.message);
    }

    // Send verification email after successful registration
    if (data.user) {
      console.log('Sending verification email to:', email);
      try {
        const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
          body: {
            email: email,
            username: username,
            userId: data.user.id
          }
        });

        if (emailError) {
          console.error('Error sending verification email:', emailError);
          // Don't throw error here, as registration was successful
        } else {
          console.log('Verification email sent successfully');
        }
      } catch (error) {
        console.error('Error invoking send-verification-email function:', error);
      }
    }
    
    console.log('Registration successful');
  };

  const signInWithGoogle = async () => {
    console.log('Google OAuth login attempt');
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) {
      console.error('Google OAuth error:', error);
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
        signInWithGoogle,
        logout,
        updateUser,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
