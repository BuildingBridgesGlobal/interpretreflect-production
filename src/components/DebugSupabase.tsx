import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export function DebugSupabase() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    const tests: any = {};

    // Test 1: Check if Supabase client is initialized
    tests.clientInitialized = !!supabase;
    console.log('Test 1 - Client initialized:', tests.clientInitialized);

    // Test 2: Get current session
    try {
      const { data: { session }, error } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session check timeout')), 3000)
        )
      ]) as any;
      tests.sessionCheck = {
        success: !error,
        hasSession: !!session,
        userId: session?.user?.id,
        error: error?.message
      };
      console.log('Test 2 - Session check:', tests.sessionCheck);
    } catch (err: any) {
      tests.sessionCheck = { success: false, error: err.message };
      console.log('Test 2 - Session check failed:', err.message);
    }

    // Test 3: Try a simple query with timeout
    try {
      const { data, error } = await Promise.race([
        supabase.from('reflection_entries').select('id').limit(1),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout')), 3000)
        )
      ]) as any;
      tests.queryTest = {
        success: !error,
        hasData: !!data,
        dataLength: data?.length || 0,
        error: error?.message
      };
      console.log('Test 3 - Query test:', tests.queryTest);
    } catch (err: any) {
      tests.queryTest = { success: false, error: err.message };
      console.log('Test 3 - Query test failed:', err.message);
    }

    // Test 4: Check Supabase URL
    tests.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    console.log('Test 4 - Supabase URL:', tests.supabaseUrl);

    // Test 5: Try raw fetch to Supabase
    try {
      const response = await Promise.race([
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Fetch timeout')), 3000)
        )
      ]) as any;
      tests.rawFetch = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      };
      console.log('Test 5 - Raw fetch:', tests.rawFetch);
    } catch (err: any) {
      tests.rawFetch = { success: false, error: err.message };
      console.log('Test 5 - Raw fetch failed:', err.message);
    }

    setResults(tests);
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'white',
      padding: '20px',
      border: '2px solid #ccc',
      borderRadius: '8px',
      maxWidth: '400px',
      zIndex: 9999
    }}>
      <h3>Supabase Debug</h3>
      <button
        onClick={testConnection}
        disabled={loading}
        style={{
          background: '#4CAF50',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'wait' : 'pointer',
          marginBottom: '10px'
        }}
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>

      {Object.keys(results).length > 0 && (
        <pre style={{
          fontSize: '12px',
          overflow: 'auto',
          maxHeight: '300px',
          background: '#f4f4f4',
          padding: '10px',
          borderRadius: '4px'
        }}>
          {JSON.stringify(results, null, 2)}
        </pre>
      )}
    </div>
  );
}