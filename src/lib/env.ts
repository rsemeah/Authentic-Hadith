export type SupabaseEnv = {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  missing: string[];
};

export const getSupabaseEnv = (): SupabaseEnv => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null;
  const missing = [
    !supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
    !supabaseAnonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ].filter(Boolean) as string[];

  return { supabaseUrl, supabaseAnonKey, missing };
};

export const assertSupabaseEnv = () => {
  const env = getSupabaseEnv();
  if (env.missing.length > 0) {
    throw new Error(`Missing Supabase environment variables: ${env.missing.join(', ')}`);
  }
  return env as { supabaseUrl: string; supabaseAnonKey: string; missing: [] };
};
