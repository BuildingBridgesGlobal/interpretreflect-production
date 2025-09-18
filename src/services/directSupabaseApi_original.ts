/**
 * Direct Supabase API service
 * Bypasses the Supabase client to make direct API calls
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function directInsertReflection(data: any, accessToken?: string) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/reflection_entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Insert failed: ${response.status} - ${error}`);
    }

    const result = await response.json();
    return { data: result[0], error: null };
  } catch (error) {
    console.error('Direct API insert failed:', error);
    return { data: null, error };
  }
}

export async function directSelectReflections(userId: string, accessToken?: string) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/reflection_entries?user_id=eq.${userId}&select=*&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Select failed: ${response.status} - ${error}`);
    }

    const result = await response.json();
    return { data: result, error: null };
  } catch (error) {
    console.error('Direct API select failed:', error);
    return { data: null, error };
  }
}

export async function getSessionToken(): Promise<string | null> {
  try {
    // Try to get token from localStorage (where Supabase stores it)
    const storageKey = `sb-${SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`;
    const storedData = localStorage.getItem(storageKey);

    if (storedData) {
      const parsed = JSON.parse(storedData);
      return parsed.access_token || null;
    }
  } catch (error) {
    console.error('Failed to get session token:', error);
  }

  return null;
}
