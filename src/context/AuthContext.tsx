import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_premium: boolean;
  premium_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

function toAppUser(user: User): AppUser {
  return {
    uid: user.id,
    email: user.email ?? null,
    displayName:
      user.user_metadata?.display_name ??
      user.user_metadata?.full_name ??
      user.email?.split('@')[0] ??
      null,
    photoURL: user.user_metadata?.avatar_url ?? null,
  };
}

const DEMO_USER: AppUser = {
  uid: 'demo-user-001',
  email: 'demo@studyflow.com',
  displayName: 'Demo Student',
  photoURL: null,
};

interface AuthContextType {
  user: AppUser | null;
  profile: Profile | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: AuthError | null; user: User | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (data: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'bio'>>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const isOAuthCallback = window.location.hash.includes('access_token');

  const fetchProfile = useCallback(async (userId: string, forceDemo?: boolean) => {
    if (forceDemo || userId === DEMO_USER.uid) {
      setProfile({
        id: userId,
        display_name: 'Demo Student',
        avatar_url: null,
        is_premium: true,
        premium_until: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return;
    }
    if (!supabase) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return;
      console.error('Failed to fetch profile:', error.message);
      return;
    }
    setProfile(data as Profile);
  }, []);

  useEffect(() => {
    const urlDemo = window.location.search.includes('sf_admin=true');
    if (urlDemo) {
      setUser(DEMO_USER);
      fetchProfile(DEMO_USER.uid, true);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    supabase!.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const appUser = toAppUser(session.user);
        setUser(appUser);
        fetchProfile(session.user.id);
      } else if (!isOAuthCallback) {
        // No session and not an OAuth callback — auto-activate demo user
        const demoUser = DEMO_USER;
        setUser(demoUser);
        fetchProfile(demoUser.uid, true);
        setIsDemo(true);
      }
      setLoading(false);
    }).catch(() => {
      if (!isOAuthCallback) {
        setUser(DEMO_USER);
        fetchProfile(DEMO_USER.uid, true);
        setIsDemo(true);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const appUser = toAppUser(session.user);
        setUser(appUser);
        setIsDemo(false);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setIsDemo(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, isOAuthCallback]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (isDemo) {
      setUser(DEMO_USER);
      fetchProfile(DEMO_USER.uid, true);
      return { error: null };
    }
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    return { error };
  }, [fetchProfile, isDemo]);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    if (isDemo) {
      const newUser = { ...DEMO_USER, email, displayName };
      setUser(newUser);
      fetchProfile(newUser.uid, true);
      return { error: null, user: null };
    }
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    return { error, user: data?.user ?? null };
  }, [isDemo]);

  const signInWithGoogle = useCallback(async () => {
    console.log('[AUTH] signInWithGoogle CLICKED');
    if (isDemo) {
      console.log('[AUTH] DEMO BRANCH — setting DEMO_USER, returning early (signInWithOAuth NOT called)');
      setUser(DEMO_USER);
      return;
    }
    const redirectTo = window.location.origin + '/app/';
    console.log('[AUTH] Calling signInWithOAuth with redirectTo:', redirectTo);
    const { data, error } = await supabase!.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    console.log('[AUTH] signInWithOAuth response:', { data, error });
    if (error) console.error('[AUTH] OAuth error:', error.message);
  }, [isDemo]);

  const signOut = useCallback(async () => {
    if (!isDemo) {
      await supabase!.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setIsDemo(false);
  }, [isDemo]);

  const resetPassword = useCallback(async (email: string) => {
    if (isDemo) return { error: null };
    const redirectTo = `${window.location.origin}/app/reset-password`;
    const { error } = await supabase!.auth.resetPasswordForEmail(email, { redirectTo });
    return { error };
  }, [isDemo]);

  const updateProfile = useCallback(async (data: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'bio'>>) => {
    if (!user) return { error: 'Not authenticated' };
    if (isDemo) {
      return { error: null };
    }
    const { error } = await supabase!
      .from('profiles')
      .upsert({ id: user.uid, ...data, updated_at: new Date().toISOString() });
    if (error) return { error: error.message };
    setProfile(prev => prev ? { ...prev, ...data } : null);
    return { error: null };
  }, [user, isDemo]);

  return (
    <AuthContext.Provider value={{
      user, profile, loading, isDemo,
      signIn, signUp, signInWithGoogle, signOut, resetPassword, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
