import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (sessionUser) => {
      if (!sessionUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();
        
      if (!error && data) {
        setUser({ ...sessionUser, profile: data });
      } else {
        setUser({ ...sessionUser, profile: { role: 'user' } });
      }
      
      setLoading(false);
    };

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session?.user ?? null);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: () => supabase.auth.signOut(),
    user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
