import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile, FarmType } from '@/types/types';
import { toast } from 'sonner';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch profile:', error);
    return null;
  }
  return data;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithUsername: (username: string, password: string, farmType: FarmType) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const getDemoProfile = (): Profile => {
    const now = new Date().toISOString();
    return {
      id: 'demo-user',
      username: 'Demo Farmer',
      email: null,
      phone: null,
      role: 'user',
      farm_type: 'both',
      location: 'Local Demo',
      created_at: now,
      updated_at: now,
    };
  };

  const enableDemoMode = (username?: string, farmType?: FarmType) => {
    setUser({ id: 'demo-user' } as User);
    const demo = getDemoProfile();
    setProfile({
      ...demo,
      username: username ?? demo.username,
      farm_type: farmType ?? demo.farm_type,
    });
  };

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const profileData = await getProfile(user.id);
    setProfile(profileData);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser({ id: 'demo-user' } as User);
      setProfile(getDemoProfile());
      setLoading(false);
      return;
    }

    supabase
      .auth
      .getSession()
      // @ts-ignore
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          getProfile(session.user.id).then(setProfile);
        } else {
          setProfile(null);
        }
      })
      .catch(error => {
        console.error('Failed to fetch user info, switching to demo mode:', error);
        enableDemoMode();
        toast.warning('Live backend unreachable. Running in demo mode.');
      })
      .finally(() => {
        setLoading(false);
      });

    // @ts-ignore
    // In this function, do NOT use any await calls. Use `.then()` instead to avoid deadlocks.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id).then(setProfile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithUsername = async (username: string, password: string) => {
    if (!isSupabaseConfigured) {
      enableDemoMode(username);
      return { error: null };
    }

    try {
      const email = `${username}@miaoda.com`;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      const message = (error as Error).message?.toLowerCase() || '';
      if (message.includes('fetch') || message.includes('network') || message.includes('failed to fetch')) {
        enableDemoMode(username);
        toast.warning('Live backend unreachable. Signed in with demo mode.');
        return { error: null };
      }
      return { error: error as Error };
    }
  };

  const signUpWithUsername = async (username: string, password: string, farmType: FarmType, gmailId?: string) => {
    if (!isSupabaseConfigured) {
      enableDemoMode(username, farmType);
      return { error: null };
    }

    try {
      const email = `${username}@miaoda.com`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: data.user.id,
              username,
              email,
              gmail_id: gmailId || null,
              farm_type: farmType,
              role: 'user',
            },
            { onConflict: 'id' }
          );

        if (profileError) {
          console.error('Failed to create profile after signup:', profileError);
          throw new Error('Account created, but profile setup failed. Please log in and update profile.');
        }
      }
      
      return { error: null };
    } catch (error) {
      const message = (error as Error).message?.toLowerCase() || '';
      if (message.includes('fetch') || message.includes('network') || message.includes('failed to fetch')) {
        enableDemoMode(username, farmType);
        toast.warning('Live backend unreachable. Demo account created locally.');
        return { error: null };
      }
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      // Clear auth state
      setUser(null);
      setProfile(null);
      
      // Try to sign out from Supabase if configured
      if (isSupabaseConfigured) {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Supabase sign out error:', error);
        }
      }
      
      // Clear localStorage auth-related data
      localStorage.removeItem('darkMode');
      localStorage.removeItem('notifications');
      localStorage.removeItem('emailNotifications');
      localStorage.removeItem('publicProfile');
      localStorage.removeItem('dataCollection');
      localStorage.removeItem('language');
      localStorage.removeItem('timezone');
      
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Sign out failed:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithUsername, signUpWithUsername, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
