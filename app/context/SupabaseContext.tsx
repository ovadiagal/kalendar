import { SupabaseClient } from '@supabase/supabase-js';
import { createContext } from 'react';

type SupabaseContextType = {
  isLoggedIn: boolean;
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  getGoogleOAuthUrl: () => Promise<string | null>;
  setOAuthSession: (tokens: { access_token: string; refresh_token: string }) => Promise<void>;
  supabase: SupabaseClient;
};

export const SupabaseContext = createContext<SupabaseContextType>({
  isLoggedIn: false,
  userId: null,
  login: async () => {},
  register: async () => {},
  forgotPassword: async () => {},
  logout: async () => {},
  getGoogleOAuthUrl: async () => null,
  setOAuthSession: async () => {},
  supabase: {} as SupabaseClient,
});
