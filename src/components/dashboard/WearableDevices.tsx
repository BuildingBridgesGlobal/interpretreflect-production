'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Activity, Watch, Heart, Moon, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface WearableDevice {
  device_type: 'oura' | 'whoop' | 'apple_watch';
  connected: boolean;
  last_sync?: string;
  access_token?: string;
}

interface WearableEvent {
  id: string;
  device_type: string;
  event_type: string;
  event_time: string;
  threshold_crossed: number;
  baseline_value: number;
  current_value: number;
  suggested_action: string;
  reflection_triggered: boolean;
  dismissed: boolean;
}

export default function WearableDevices() {
  const [devices, setDevices] = useState<WearableDevice[]>([
    { device_type: 'oura', connected: false },
    { device_type: 'whoop', connected: false },
    { device_type: 'apple_watch', connected: false },
  ]);
  const [recentEvents, setRecentEvents] = useState<WearableEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    loadDeviceStatus();
    loadRecentEvents();
  }, []);

  const loadDeviceStatus = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check user_settings for connected devices
      const { data: settings } = await supabase
        .from('user_settings')
        .select('wearable_devices')
        .eq('user_id', user.id)
        .single();

      if (settings?.wearable_devices) {
        setDevices(settings.wearable_devices);
      }
    } catch (error) {
      console.error('Error loading device status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentEvents = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: events } = await supabase
        .from('wearable_events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_time', { ascending: false })
        .limit(10);

      if (events) {
        setRecentEvents(events);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const connectDevice = async (deviceType: string) => {
    setConnecting(deviceType);

    // In production, this would redirect to OAuth flow
    // For now, we'll simulate a connection
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Simulate OAuth redirect
      const redirectUrl = getOAuthUrl(deviceType);

      if (redirectUrl === '#demo') {
        // Demo mode - simulate connection
        await new Promise(resolve => setTimeout(resolve, 1500));

        const updatedDevices = devices.map(d =>
          d.device_type === deviceType
            ? { ...d, connected: true, last_sync: new Date().toISOString() }
            : d
        );

        setDevices(updatedDevices);

        // Save to database
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            wearable_devices: updatedDevices,
            updated_at: new Date().toISOString(),
          });

        alert(`${getDeviceLabel(deviceType)} connected successfully! (Demo mode)`);
      } else {
        // Redirect to actual OAuth flow
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error('Error connecting device:', error);
      alert('Failed to connect device. Please try again.');
    } finally {
      setConnecting(null);
    }
  };

  const disconnectDevice = async (deviceType: string) => {
    if (!confirm(`Disconnect ${getDeviceLabel(deviceType)}?`)) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedDevices = devices.map(d =>
        d.device_type === deviceType
          ? { ...d, connected: false, last_sync: undefined, access_token: undefined }
          : d
      );

      setDevices(updatedDevices);

      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          wearable_devices: updatedDevices,
          updated_at: new Date().toISOString(),
        });

    } catch (error) {
      console.error('Error disconnecting device:', error);
    }
  };

  const dismissEvent = async (eventId: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from('wearable_events')
        .update({ dismissed: true })
        .eq('id', eventId);

      setRecentEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Error dismissing event:', error);
    }
  };

  const getOAuthUrl = (deviceType: string): string => {
    // In production, these would be actual OAuth URLs
    const urls: Record<string, string> = {
      oura: '/api/oauth/oura/start',
      whoop: process.env.NEXT_PUBLIC_WHOOP_OAUTH_URL || '#demo',
      apple_watch: '#demo', // Apple Watch uses HealthKit, different flow
    };
    return urls[deviceType] || '#demo';
  };

  const getDeviceLabel = (deviceType: string): string => {
    const labels: Record<string, string> = {
      oura: 'Oura Ring',
      whoop: 'WHOOP',
      apple_watch: 'Apple Watch',
    };
    return labels[deviceType] || deviceType;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'oura':
        return <Activity className="w-6 h-6" />;
      case 'whoop':
        return <TrendingUp className="w-6 h-6" />;
      case 'apple_watch':
        return <Watch className="w-6 h-6" />;
      default:
        return <Heart className="w-6 h-6" />;
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'hrv_drop':
        return <Heart className="w-5 h-5 text-red-600" />;
      case 'stress_spike':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'poor_sleep':
        return <Moon className="w-5 h-5 text-blue-600" />;
      case 'recovery_alert':
        return <TrendingUp className="w-5 h-5 text-yellow-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getEventColor = (eventType: string): string => {
    switch (eventType) {
      case 'hrv_drop':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'stress_spike':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'poor_sleep':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'recovery_alert':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const formatEventType = (eventType: string): string => {
    return eventType.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Wearable Devices</h3>
        <p className="text-sm text-gray-600">
          Connect your wearable devices to receive biometric-triggered reflection prompts
        </p>
      </div>

      {/* Device Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {devices.map((device) => (
          <div
            key={device.device_type}
            className={`border rounded-lg p-4 transition-all ${
              device.connected
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getDeviceIcon(device.device_type)}
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {getDeviceLabel(device.device_type)}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {device.connected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              {device.connected ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>

            {device.last_sync && (
              <p className="text-xs text-gray-500 mb-3">
                Last sync: {new Date(device.last_sync).toLocaleString()}
              </p>
            )}

            <button
              onClick={() =>
                device.connected
                  ? disconnectDevice(device.device_type)
                  : connectDevice(device.device_type)
              }
              disabled={connecting === device.device_type}
              className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                device.connected
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {connecting === device.device_type ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Connecting...
                </span>
              ) : device.connected ? (
                'Disconnect'
              ) : (
                'Connect'
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-4">Recent Biometric Alerts</h4>
          <div className="space-y-3">
            {recentEvents.filter(e => !e.dismissed).map((event) => (
              <div
                key={event.id}
                className={`border rounded-lg p-4 ${getEventColor(event.event_type)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getEventIcon(event.event_type)}
                    <div>
                      <h5 className="font-semibold">{formatEventType(event.event_type)}</h5>
                      <p className="text-xs opacity-75">
                        {getDeviceLabel(event.device_type)} • {new Date(event.event_time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {event.reflection_triggered && (
                    <span className="px-2 py-1 bg-white/50 rounded-full text-xs font-medium">
                      Reflection Suggested
                    </span>
                  )}
                </div>

                <p className="text-sm mb-3">{event.suggested_action}</p>

                <div className="flex items-center justify-between">
                  <div className="text-xs space-x-4">
                    <span>
                      Baseline: <strong>{event.baseline_value.toFixed(1)}</strong>
                    </span>
                    <span>
                      Current: <strong>{event.current_value.toFixed(1)}</strong>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => dismissEvent(event.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-white/70 hover:bg-white rounded-lg transition-colors"
                    >
                      Dismiss
                    </button>
                    {event.reflection_triggered && (
                      <a
                        href="/dashboard/quick-reflect"
                        className="px-3 py-1.5 text-xs font-medium bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors"
                      >
                        Quick Reflect
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">📱</span>
          <div className="flex-1 text-sm text-blue-800">
            <p className="font-semibold mb-1">How Biometric Integration Works</p>
            <ul className="space-y-1 list-disc list-inside text-blue-700">
              <li>Connect your wearable device (Oura Ring, WHOOP, or Apple Watch)</li>
              <li>We monitor key biometric markers: HRV, stress levels, sleep quality, recovery</li>
              <li>When thresholds are crossed, you receive intelligent reflection prompts</li>
              <li>All biometric data stays private and is never shared with agencies</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              Patent #5: Biometric-Triggered Reflection Technology
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
