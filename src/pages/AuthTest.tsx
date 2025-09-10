import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Info } from 'lucide-react';

export function AuthTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string, status: 'success' | 'error' | 'info' = 'info') => {
    const icon = status === 'success' ? '✅' : status === 'error' ? '❌' : 'ℹ️';
    setTestResults(prev => [...prev, `${icon} ${message}`]);
  };

  const clearResults = () => setTestResults([]);

  const testConnection = async () => {
    clearResults();
    setIsLoading(true);
    
    try {
      addResult('Testing Supabase connection...', 'info');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        addResult(`Connection Error: ${error.message}`, 'error');
      } else {
        addResult('Successfully connected to Supabase', 'success');
        addResult(`Current session: ${data.session ? 'Active session found' : 'No active session'}`, 'info');
      }
    } catch (err) {
      addResult(`Failed to connect: ${err}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testSignUp = async () => {
    clearResults();
    setIsLoading(true);
    
    try {
      addResult('Testing sign up functionality...', 'info');
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        addResult(`Sign up error: ${error.message}`, 'error');
      } else {
        addResult('Sign up successful', 'success');
        addResult(`User ID: ${data.user?.id}`, 'info');
        addResult(`Email: ${data.user?.email}`, 'info');
        addResult(`Confirmation required: ${data.user?.confirmed_at ? 'No' : 'Yes'}`, 'info');
      }
    } catch (err) {
      addResult(`Sign up failed: ${err}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testSignIn = async () => {
    clearResults();
    setIsLoading(true);
    
    try {
      addResult('Testing sign in functionality...', 'info');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        addResult(`Sign in error: ${error.message}`, 'error');
        if (error.message.includes('not confirmed')) {
          addResult('User email needs confirmation', 'info');
        }
      } else {
        addResult('Sign in successful', 'success');
        addResult(`Session token: ${data.session?.access_token ? 'Present' : 'Missing'}`, 'info');
        addResult(`User ID: ${data.user?.id}`, 'info');
      }
    } catch (err) {
      addResult(`Sign in failed: ${err}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testSignOut = async () => {
    clearResults();
    setIsLoading(true);
    
    try {
      addResult('Testing sign out functionality...', 'info');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        addResult(`Sign out error: ${error.message}`, 'error');
      } else {
        addResult('Sign out successful', 'success');
      }
    } catch (err) {
      addResult(`Sign out failed: ${err}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testDatabase = async () => {
    clearResults();
    setIsLoading(true);
    
    try {
      addResult('Checking database access...', 'info');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          addResult('Profiles table not found - may need to be created', 'info');
        } else if (error.message.includes('permission') || error.message.includes('denied')) {
          addResult('RLS policies active - authentication required for access', 'info');
        } else {
          addResult(`Database access error: ${error.message}`, 'error');
        }
      } else {
        addResult('Database access successful', 'success');
        addResult(`Records found: ${data?.length || 0}`, 'info');
      }
    } catch (err) {
      addResult(`Database query failed: ${err}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Supabase Authentication Test</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Test Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={testConnection} 
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Connection
            </button>
            <button 
              onClick={testSignUp} 
              disabled={isLoading || !email || !password}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Sign Up
            </button>
            <button 
              onClick={testSignIn} 
              disabled={isLoading || !email || !password}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Sign In
            </button>
            <button 
              onClick={testSignOut} 
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Sign Out
            </button>
            <button 
              onClick={testDatabase} 
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Database
            </button>
            <button 
              onClick={clearResults} 
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Results
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Test Results:</h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="font-mono text-sm">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <strong>Current Configuration:</strong>
              <br />
              Supabase URL: {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
              <br />
              Anon Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}