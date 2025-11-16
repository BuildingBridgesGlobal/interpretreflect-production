'use client';

import { useEffect, useState } from 'react';

export function ServiceWorkerRegister() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          setRegistration(registration);
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Check for updates
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          setIsUpdateAvailable(true);
        }
      });
    }
  }, []);

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setIsUpdateAvailable(false);
      window.location.reload();
    }
  };

  if (!isUpdateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center gap-3">
        <div>
          <p className="font-medium">Update Available</p>
          <p className="text-sm opacity-90">A new version is available</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={updateServiceWorker}
            className="bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Update
          </button>
          <button
            onClick={() => setIsUpdateAvailable(false)}
            className="text-white hover:text-gray-200 px-3 py-1 text-sm"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}