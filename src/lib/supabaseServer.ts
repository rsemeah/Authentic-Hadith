import { cookies } from 'next/headers';
import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { assertSupabaseEnv } from './env';

export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  assertSupabaseEnv();
  return createServerComponentClient<Database, 'public'>({
    cookies: () => cookieStore,
  }) as any;
};

export const createRouteSupabaseClient = () => {
  const cookieStore = cookies();
  assertSupabaseEnv();
  return createRouteHandlerClient<Database, 'public'>({
    cookies: () => cookieStore,
  }) as any;
};
