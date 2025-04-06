// lib/supabase/client.ts

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// Declare a variable to hold the client instance
let supabase: SupabaseClient | null = null;

export const createClient = (): SupabaseClient => {
  // Check if supabase instance already exists
  if (!supabase) {
    // Create and assign the Supabase client only once
    supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabase;
};
