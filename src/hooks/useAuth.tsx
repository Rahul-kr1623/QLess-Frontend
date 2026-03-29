import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface ClubProfile {
  id: string;
  user_id: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  club: ClubProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [club, setClub] = useState<ClubProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClub = async (userId: string) => {
    const { data } = await supabase
      .from('clubs')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    setClub(data as ClubProfile | null);
  };

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(() => fetchClub(session.user.id), 0);
        } else {
          setClub(null);
        }
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchClub(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Subscribe to club changes in realtime
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('club-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'clubs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setClub(payload.new as ClubProfile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      // Refresh club data after sign in
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) await fetchClub(currentUser.id);
    }
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setClub(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, club, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
