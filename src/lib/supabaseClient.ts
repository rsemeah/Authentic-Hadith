'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { getPublicSupabaseEnv } from './env';

/**
 * Creates a Supabase client configured for use in client components.
 * Uses the public URL and anon key only.
 */
export const createSupabaseBrowserClient = (): SupabaseClient<Database> => {
  const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseEnv();
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};
