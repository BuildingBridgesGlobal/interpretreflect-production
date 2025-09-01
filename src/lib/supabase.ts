import { createClient } from '@supabase/supabase-js';

// Supabase project credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get current user
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return { user };
};

// Types for our database (you can expand these as needed)
export interface User {
  id: string;
  email: string;
  created_at: string;
  subscription_status?: 'active' | 'inactive' | 'trial' | 'cancelled';
  subscription_plan?: 'essential' | 'professional' | 'organization';
  stripe_customer_id?: string;
}
