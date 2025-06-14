import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (masterPassword: string) => {
    try {
      // Check if the master password is correct
      if (masterPassword !== 'flippin1') {
        return { error: new Error('Invalid master password') };
      }

      // Use the specific Supabase credentials
      const email = 'admin@theleap.app';
      const password = 'flippin1';
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If sign in fails, try to sign up the user first
        if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: undefined, // Disable email confirmation
            }
          });

          if (signUpError && !signUpError.message.includes('User already registered')) {
            throw signUpError;
          }

          // Try signing in again after signup
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (retryError) {
            throw retryError;
          }
        } else {
          throw error;
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Authentication error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    signIn,
    signOut,
  };
}