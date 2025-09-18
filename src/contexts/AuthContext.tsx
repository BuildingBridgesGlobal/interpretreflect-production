import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthResponse, AuthError } from '@supabase/supabase-js';
import { SessionManager, RoleManager, AuditLogger, enforceHttps } from '../utils/security';
import { SECURITY_CONFIG } from '../config/security';
import { dataSyncService } from '../services/dataSync';
import { UserDataLoader } from '../services/userDataLoader';

interface AuthResult {
  user?: User | null;
  error?: AuthError | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: string;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithApple: () => Promise<AuthResult>;
  signInWithMagicLink: (email: string) => Promise<AuthResult>;
  hasPermission: (permission: string) => boolean;
  extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>(SECURITY_CONFIG.rbac.defaultRole);
  const sessionManager = SessionManager.getInstance();

  // Enforce HTTPS on mount
  useEffect(() => {
    enforceHttps();
  }, []);

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        // Skip Supabase check if credentials are missing or in dev mode
        const isDevMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (isDevMode) {
          // Silently skip auth in dev mode
          setLoading(false);
          return;
        }
        
        // Session-first approach: check for existing session before calling getUser
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          // Only log if it's not an expected error
          if (sessionError.name !== 'AuthSessionMissingError') {
            console.error('Error getting session:', sessionError);
          }
          setLoading(false);
          return;
        }
        
        // Only try to get user if we have a session
        if (session?.user) {
          setUser(session.user);
          // Start session manager
          sessionManager.startSession();
          // Set user role (in production, fetch from database)
          const role = session.user.email?.includes('admin') ? 'admin' : 'user';
          RoleManager.setUserRole(session.user.id, role);
          setUserRole(role);
          
          // Load user data from Supabase on initial load
          await UserDataLoader.loadUserData(session.user.id);
          
          // Trigger initial sync
          dataSyncService.triggerManualSync();
        } else {
          // No session, no user - this is normal for logged out state
          setUser(null);
          setUserRole(SECURITY_CONFIG.rbac.defaultRole);
        }
      } catch (error) {
        // Unexpected error
        console.error('Unexpected error during auth initialization:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Only set up auth listener if Supabase is configured
    const isDevMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!isDevMode) {
      // Listen for changes on auth state (sign in, sign out, etc.)
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN' && session?.user) {
          sessionManager.startSession();
          const role = session.user.email?.includes('admin') ? 'admin' : 'user';
          RoleManager.setUserRole(session.user.id, role);
          setUserRole(role);
          
          // Load user data from Supabase first
          await UserDataLoader.loadUserData(session.user.id);
          
          // Then trigger data sync to ensure everything is up to date
          dataSyncService.triggerManualSync().then(() => {
            console.log('Initial data sync completed after sign in');
          });
        } else if (event === 'SIGNED_OUT') {
          sessionManager.endSession('LOGOUT');
          setUserRole(SECURITY_CONFIG.rbac.defaultRole);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Log failed sign in attempt
        AuditLogger.log({
          action: 'SIGN_IN_FAILED',
          category: 'AUTH',
          severity: 'WARN',
          details: { email, error: error.message },
        });
        throw error;
      }
      
      // Log successful sign in
      if (data.user) {
        AuditLogger.log({
          action: 'SIGN_IN_SUCCESS',
          category: 'AUTH',
          severity: 'INFO',
          userId: data.user.id,
          userEmail: data.user.email || undefined,
        });
        
        // Start session management
        sessionManager.startSession();
        
        // Set user role
        const role = data.user.email?.includes('admin') ? 'admin' : 'user';
        RoleManager.setUserRole(data.user.id, role);
        setUserRole(role);
        
        // Load user data from Supabase first
        await UserDataLoader.loadUserData(data.user.id);
        
        // Then trigger data sync to ensure everything is up to date
        dataSyncService.triggerManualSync().then(() => {
          console.log('Initial data sync completed after sign in');
        });
      }
      
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        // Log failed sign up attempt
        AuditLogger.log({
          action: 'SIGN_UP_FAILED',
          category: 'AUTH',
          severity: 'WARN',
          details: { email, error: error.message },
        });
        throw error;
      }
      
      // Log successful sign up
      if (data.user) {
        AuditLogger.log({
          action: 'SIGN_UP_SUCCESS',
          category: 'AUTH',
          severity: 'INFO',
          userId: data.user.id,
          userEmail: data.user.email || undefined,
        });
        
        // Set default user role
        RoleManager.setUserRole(data.user.id, 'user');
        setUserRole('user');
      }
      
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      // Log sign out
      if (user) {
        AuditLogger.log({
          action: 'SIGN_OUT',
          category: 'AUTH',
          severity: 'INFO',
          userId: user.id,
          userEmail: user.email || undefined,
        });
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // End session
      sessionManager.endSession('LOGOUT');
      setUser(null);
      setUserRole(SECURITY_CONFIG.rbac.defaultRole);

      // Clear all local storage and session storage
      localStorage.clear();
      sessionStorage.clear();

      // Force reload to completely reset the app state
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, try to clear state and redirect
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  const signInWithGoogle = async (): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        AuditLogger.log({
          action: 'GOOGLE_SSO_FAILED',
          category: 'AUTH',
          severity: 'WARN',
          details: { error: error.message }
        });
        throw error;
      }

      return { user: data.session?.user || null, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  const signInWithApple = async (): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        AuditLogger.log({
          action: 'APPLE_SSO_FAILED',
          category: 'AUTH',
          severity: 'WARN',
          details: { error: error.message }
        });
        throw error;
      }

      return { user: data.session?.user || null, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  const signInWithMagicLink = async (email: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          shouldCreateUser: true
        }
      });

      if (error) {
        AuditLogger.log({
          action: 'MAGIC_LINK_FAILED',
          category: 'AUTH',
          severity: 'WARN',
          details: { email, error: error.message }
        });
        throw error;
      }

      AuditLogger.log({
        action: 'MAGIC_LINK_SENT',
        category: 'AUTH',
        severity: 'INFO',
        details: { email }
      });

      return { user: null, error: null }; // User will be set after clicking link
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return RoleManager.hasPermission(user.id, permission);
  };

  const extendSession = () => {
    sessionManager.extendSession();
  };

  // Listen for session timeout events
  useEffect(() => {
    const handleSessionEnd = async (event: CustomEvent) => {
      if (event.detail.reason === 'TIMEOUT') {
        // Auto logout on timeout
        await signOut();
      }
    };

    window.addEventListener('sessionEnd', handleSessionEnd as EventListener);
    return () => {
      window.removeEventListener('sessionEnd', handleSessionEnd as EventListener);
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      userRole,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      signInWithApple,
      signInWithMagicLink,
      hasPermission,
      extendSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};
