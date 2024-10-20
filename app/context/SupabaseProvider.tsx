import React, { useState, useEffect } from 'react';

import { SupabaseContext } from './SupabaseContext';

import { supabase } from '~/utils/supabase';

type SupabaseProviderProps = {
  children: JSX.Element | JSX.Element[];
};

export const SupabaseProvider = (props: SupabaseProviderProps) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isNavigationReady, setNavigationReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const getGoogleOAuthUrl = async (): Promise<string | null> => {
    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'kalendar://google-auth',
      },
    });

    return result.data.url;
  };

  const setOAuthSession = async (tokens: { access_token: string; refresh_token: string }) => {
    const { data, error } = await supabase.auth.setSession({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    if (error) throw error;

    setLoggedIn(data.session !== null);
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setLoggedIn(true);
  };

  const register = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setLoggedIn(false);
  };

  const checkIfUserIsLoggedIn = async () => {
    const result = await supabase.auth.getSession();
    setLoggedIn(result.data.session !== null);
    setUserId(result.data.session?.user.id || null);
    setNavigationReady(true);
  };

  useEffect(() => {
    checkIfUserIsLoggedIn();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setLoggedIn(session !== null);
      setUserId(session?.user.id || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SupabaseContext.Provider
      value={{
        isLoggedIn,
        userId,
        login,
        register,
        forgotPassword,
        logout,
        getGoogleOAuthUrl,
        setOAuthSession,
        supabase,
      }}>
      {isNavigationReady ? props.children : null}
    </SupabaseContext.Provider>
  );
};
