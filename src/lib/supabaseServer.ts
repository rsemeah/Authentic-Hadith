import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { getServerSupabaseEnv } from './env';

const getProjectRef = (supabaseUrl: string) => {
  const host = new URL(supabaseUrl).host;
  return host.split('.')[0];
};

const getAccessTokenFromCookies = (supabaseUrl: string) => {
  const cookieStore = cookies();
  const projectRef = getProjectRef(supabaseUrl);
  const authCookie = cookieStore.get(`sb-${projectRef}-auth-token`);
  if (!authCookie?.value) return undefined;

  try {
    const parsed = JSON.parse(authCookie.value);
    return (
      parsed?.access_token ||
      parsed?.currentSession?.access_token ||
      parsed?.user?.access_token ||
      parsed?.session?.access_token
    );
  } catch {
    return undefined;
  }
};

const buildAuthHeaders = (supabaseUrl: string) => {
  const accessToken = getAccessTokenFromCookies(supabaseUrl);
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
};

export const createServerSupabaseClient = (): SupabaseClient<Database> => {
  const { supabaseUrl, supabaseAnonKey } = getServerSupabaseEnv();

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: { headers: buildAuthHeaders(supabaseUrl) },
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

export const createRouteSupabaseClient = createServerSupabaseClient;
