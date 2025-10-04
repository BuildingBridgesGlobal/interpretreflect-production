// Test MCP connection to boltV1IR Supabase backend
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kvguxuxanpynwdffpssm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Z3V4dXhhbnB5bndkZmZwc3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDE2OTIsImV4cCI6MjA3MjE3NzY5Mn0.h06fvdvhtI5oRDMi97izpw8BKsTFKXMZziu3POvYxeU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test 1: Check connection
console.log('🔌 Testing Supabase connection...');

// Test 2: Query recent stress/energy data
async function queryRecentTracking() {
  console.log('\n📊 Fetching recent stress & energy tracking data...');
  
  const { data, error } = await supabase
    .from('reflection_entries')
    .select('id, user_id, entry_kind, created_at, data')
    .or('data->>stressLevel.not.is.null,data->>energyLevel.not.is.null')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`✅ Found ${data.length} tracking entries`);
  
  data.forEach((entry, index) => {
    const stress = entry.data?.stressLevel;
    const energy = entry.data?.energyLevel;
    console.log(`\n${index + 1}. ${entry.entry_kind} - ${new Date(entry.created_at).toLocaleString()}`);
    if (stress) console.log(`   Stress: ${stress}/10`);
    if (energy) console.log(`   Energy: ${energy}/10`);
  });
}

// Test 3: Insert new tracking entry
async function insertTrackingEntry(stress, energy) {
  console.log(`\n📝 Inserting new tracking entry: Stress=${stress}, Energy=${energy}`);
  
  const { data, error } = await supabase
    .from('reflection_entries')
    .insert({
      entry_kind: 'wellness_checkin',
      data: {
        stressLevel: stress,
        energyLevel: energy,
        timestamp: new Date().toISOString(),
        source: 'MCP-Integration'
      }
    })
    .select();
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log('✅ Entry inserted successfully!', data);
}

// Run tests
queryRecentTracking()
  .then(() => {
    console.log('\n\n🎯 Would you like to insert your current metrics?');
    console.log('Stress: 3/10, Energy: 7/10');
    // Uncomment to insert:
    // return insertTrackingEntry(3, 7);
  })
  .catch(console.error);
