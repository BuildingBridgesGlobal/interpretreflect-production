import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { dataSyncService } from '../services/dataSync';
import { useAuth } from '../contexts/AuthContext';

export function SyncStatusIndicator() {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced?: number; failed?: number } | null>(null);

  useEffect(() => {
    // Check sync status every 30 seconds
    const interval = setInterval(() => {
      const status = dataSyncService.getSyncStatus();
      if (status.inProgress) {
        setSyncStatus('syncing');
      } else if (status.lastSync) {
        setLastSyncTime(status.lastSync);
        setSyncStatus('idle');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    if (!user) {
      setSyncStatus('error');
      return;
    }

    setSyncStatus('syncing');
    try {
      const result = await dataSyncService.triggerManualSync();
      if (result.success) {
        setSyncStatus('success');
        setSyncResult({ synced: result.synced, failed: result.failed });
        setLastSyncTime(new Date());
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 5000);
      }
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never synced';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSyncTime.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  if (!user) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 shadow-sm">
          <CloudOff className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-700">Sign in to sync data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className="relative"
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        {/* Main indicator button */}
        <button
          onClick={handleManualSync}
          disabled={syncStatus === 'syncing'}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all
            ${syncStatus === 'idle' ? 'bg-white hover:bg-gray-50 border border-gray-200' : ''}
            ${syncStatus === 'syncing' ? 'bg-blue-50 border border-blue-200' : ''}
            ${syncStatus === 'success' ? 'bg-green-50 border border-green-200' : ''}
            ${syncStatus === 'error' ? 'bg-red-50 border border-red-200' : ''}
          `}
        >
          {syncStatus === 'idle' && <Cloud className="h-4 w-4 text-gray-600" />}
          {syncStatus === 'syncing' && <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />}
          {syncStatus === 'success' && <Check className="h-4 w-4 text-green-600" />}
          {syncStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
          
          <span className={`text-sm font-medium
            ${syncStatus === 'idle' ? 'text-gray-700' : ''}
            ${syncStatus === 'syncing' ? 'text-blue-700' : ''}
            ${syncStatus === 'success' ? 'text-green-700' : ''}
            ${syncStatus === 'error' ? 'text-red-700' : ''}
          `}>
            {syncStatus === 'idle' && 'Sync data'}
            {syncStatus === 'syncing' && 'Syncing...'}
            {syncStatus === 'success' && 'Synced'}
            {syncStatus === 'error' && 'Sync failed'}
          </span>
        </button>

        {/* Details tooltip */}
        {showDetails && (
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white rounded-lg p-3 shadow-xl">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Last sync:</span>
                <span className="font-medium">{formatLastSync()}</span>
              </div>
              {syncResult && syncStatus === 'success' && (
                <>
                  <div className="flex justify-between">
                    <span>Items synced:</span>
                    <span className="font-medium">{syncResult.synced || 0}</span>
                  </div>
                  {syncResult.failed && syncResult.failed > 0 && (
                    <div className="flex justify-between text-yellow-300">
                      <span>Failed:</span>
                      <span className="font-medium">{syncResult.failed}</span>
                    </div>
                  )}
                </>
              )}
              <div className="pt-2 mt-2 border-t border-gray-700">
                <p className="text-xs opacity-90">
                  Your data is automatically synced every 5 minutes when you're signed in.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}