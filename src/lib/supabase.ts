import { createClient } from '@supabase/supabase-js';

// Supabase project credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase credentials. Running in demo mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// Types for our database (you can expand these as needed)
export interface User {
  id: string;
  email: string;
  created_at: string;
  subscription_status?: 'active' | 'inactive' | 'trial' | 'cancelled';
  subscription_plan?: 'essential' | 'professional' | 'organization';
  stripe_customer_id?: string;
}
