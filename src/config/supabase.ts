import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from '../utils/logger';

let supabase: SupabaseClient;

export const initSupabase = (): SupabaseClient => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be defined in environment variables');
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey);
  logger.info('Supabase client initialized');

  return supabase;
};

export const getSupabase = (): SupabaseClient => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Call initSupabase() first.');
  }
  return supabase;
};

export default { initSupabase, getSupabase };
