'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.next';
import { MobileDataCollection } from '@/components/mobile/MobileDataCollection';
import { 
  Smartphone, Tablet, RotateCcw, Wifi, Battery, Signal,
  Settings, Download, Upload, Camera, Mic, MapPin
} from 'lucide-react';

export default function MobileInterfacePage() {
  const { user, loading } = useAuth();
  const [isPWA, setIsPWA] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    // Check if running as PWA
    const checkPWA = () => {
      setIsPWA(
        window.matchMedia('(display-mode: standalone)').matches ||
        (window as any).navigator.standalone ||
        document.referrer.includes('android-app://')
      );
    };

    // Check device type
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setDeviceType('mobile');
      } else if (width <= 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkPWA();
    checkDeviceType();

    window.addEventListener('resize', checkDeviceType);

    // Handle install prompt
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('resize', checkDeviceType);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mobile interface...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-4">Sign in to access the mobile data collection interface.</p>
          <a href="/login" className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (deviceType === 'desktop') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Tablet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Mobile Interface</h2>
          <p className="text-gray-600 mb-4">
            This interface is optimized for mobile devices. Please visit this page on your smartphone or tablet for the best experience.
          </p>
          
          {!isPWA && installPrompt && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">Install as App</h3>
              <p className="text-blue-700 text-sm mb-3">
                Install InterpretReflect as a Progressive Web App for offline access and better performance.
              </p>
              <button
                onClick={handleInstallPWA}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Install App
              </button>
            </div>
          )}

          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Mobile Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Photo capture for assignment documentation
              </li>
              <li className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Voice notes for quick reflections
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                GPS location tracking
              </li>
              <li className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Offline data collection
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PWA Status Banner */}
      {!isPWA && (
        <div className="bg-blue-500 text-white px-4 py-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>For best experience, install this app on your device</span>
            </div>
            {installPrompt && (
              <button
                onClick={handleInstallPWA}
                className="bg-white text-blue-500 px-3 py-1 rounded text-xs font-medium"
              >
                Install
              </button>
            )}
          </div>
        </div>
      )}

      {/* Device Status Bar */}
      <div className="bg-black text-white px-4 py-1 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Signal className="w-3 h-3" />
          <Wifi className="w-3 h-3" />
          <Battery className="w-3 h-3" />
        </div>
      </div>

      {/* Mobile Data Collection Interface */}
      <MobileDataCollection userId={user.id} />
    </div>
  );
}