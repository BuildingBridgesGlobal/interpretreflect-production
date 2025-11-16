'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Bell, Settings, User, LogOut } from 'lucide-react';

export function DashboardNav() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login');
      } else {
        setUser(user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth/login');
      } else {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white border-b-2 border-brand-gray-200 sticky top-0 z-50">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-brand-primary font-sans">
                InterpretReflect
              </h1>
              <p className="text-xs text-brand-gray-500 font-body">
                Performance Optimization Platform
              </p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-brand-gray-50 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-brand-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-energy rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-brand-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-brand-electric-light rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-brand-electric" />
                </div>
                <span className="text-sm font-semibold text-brand-primary font-body">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-brand-gray-200 py-2">
                  <div className="px-4 py-2 border-b border-brand-gray-200">
                    <p className="text-sm font-semibold text-brand-primary font-body">
                      {user?.email}
                    </p>
                    <p className="text-xs text-brand-gray-500 font-body">Free Plan</p>
                  </div>

                  <button
                    onClick={() => router.push('/dashboard/settings')}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-brand-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-brand-gray-600" />
                    <span className="text-sm text-brand-primary font-body">Settings</span>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-body">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
