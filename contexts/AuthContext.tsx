import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

// Extend Supabase User type with uid for compatibility if needed, 
// but for now we'll just use the Supabase User type directly.
// If other components expect 'uid', we might need to map 'id' to 'uid'.
// Let's check if we need to add a compatibility layer.
// Looking at previous code, it seems 'uid' was used. Supabase user has 'id'.
// Let's add a compatibility wrapper to be safe, or just cast it.
// Actually, let's just use the Supabase User and see if we need to fix downstream components.
// Most likely downstream components use user.uid. Supabase user has user.id.
// Let's add a compatibility interface to minimize breakage.

interface AuthUser extends User {
  uid: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to map Supabase user to our AuthUser type (adding uid alias)
  const mapUser = (sbUser: User | null): AuthUser | null => {
    if (!sbUser) return null;
    return {
      ...sbUser,
      uid: sbUser.id
    } as AuthUser;
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(mapUser(session?.user ?? null));
      setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(mapUser(session?.user ?? null));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google Sign In Error:", error);
      alert("Failed to sign in with Google.");
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
