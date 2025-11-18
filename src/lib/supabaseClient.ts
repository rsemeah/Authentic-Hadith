import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { assertSupabaseEnv, getSupabaseEnv } from './env';

type SupabaseBrowserClient = ReturnType<typeof createClientComponentClient<Database, 'public'>>;

let supabaseClient: SupabaseBrowserClient | null = null;

export const getSupabaseClient = (): SupabaseBrowserClient => {
  if (supabaseClient) return supabaseClient;

  const { supabaseUrl, supabaseAnonKey } = assertSupabaseEnv();

  supabaseClient = createClientComponentClient<Database, 'public'>({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });
  return supabaseClient;
};

export const getSupabaseEnvStatus = getSupabaseEnv;
