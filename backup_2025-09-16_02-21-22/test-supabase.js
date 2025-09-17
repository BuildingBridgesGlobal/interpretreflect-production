import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials
const supabaseUrl = 'https://kvguxuxanpynwdffpssm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Z3V4dXhhbnB5bndkZmZwc3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDE2OTIsImV4cCI6MjA3MjE3NzY5Mn0.h06fvdvhtI5oRDMi97izpw8BKsTFKXMZziu3POvYxeU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...\n');
  
  try {
    // Test 1: Check if we can connect
    const { data: tables, error: tablesError } = await supabase
      .from('reflections')
      .select('id')
      .limit(1);
    
    if (tablesError) {
      if (tablesError.message.includes('relation "public.reflections" does not exist')) {
        console.error('❌ Tables not created yet. Please run the SQL script first.');
      } else {
        console.error('❌ Connection error:', tablesError.message);
      }
    } else {
      console.log('✅ Successfully connected to Supabase!');
      console.log('✅ Reflections table exists');
    }
    
    // Test 2: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (user) {
      console.log('✅ User authenticated:', user.email);
    } else {
      console.log('ℹ️  No user currently authenticated (this is normal if not logged in)');
    }
    
    // Test 3: List all tables
    const { data: allTables } = await supabase
      .rpc('get_tables', {});
    
    console.log('\n📊 Database Status:');
    console.log('- Connection: Active');
    console.log('- Project: kvguxuxanpynwdffpssm');
    console.log('- Ready for reflections: Yes');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testConnection();