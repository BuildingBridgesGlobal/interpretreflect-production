'use client';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext.next';
import InstallPrompt from '@/components/InstallPrompt';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import '@/utils/preventDuplicateElements';
import ThemeToggle from '@/components/ThemeToggle';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <InstallPrompt />
      <ThemeToggle />
      <ServiceWorkerRegistrar />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#5C7F4F',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
          },
        }}
      />
    </AuthProvider>
  );
}
