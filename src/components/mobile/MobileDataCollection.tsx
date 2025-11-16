'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Mic, MicOff, Camera, Save, Send, X, Check, 
  Clock, MapPin, User, FileText, AlertCircle,
  ChevronLeft, ChevronRight, Upload, Download,
  Wifi, WifiOff, Battery, Signal
} from 'lucide-react';

interface MobileAssignment {
  id: string;
  assignment_name: string;
  assignment_date: string;
  start_time: string;
  end_time: string;
  location: string;
  setting: string;
  modality: string;
}

interface QuickCheckData {
  emotional_state: number;
  cognitive_load: number;
  physical_state: number;
  stress_level: number;
  notes: string;
  timestamp: string;
  location?: { lat: number; lng: number };
  photos: string[];
  audio_notes: string[];
}

export function MobileDataCollection({ userId }: { userId: string }) {
  const [currentAssignment, setCurrentAssignment] = useState<MobileAssignment | null>(null);
  const [checkType, setCheckType] = useState<'pre' | 'mid' | 'post'>('pre');
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(false);
  const [quickCheck, setQuickCheck] = useState<QuickCheckData>({
    emotional_state: 3,
    cognitive_load: 3,
    physical_state: 3,
    stress_level: 3,
    notes: '',
    timestamp: new Date().toISOString(),
    photos: [],
    audio_notes: []
  });

  const supabase = createClient();

  // Check online status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Load current assignment
  useEffect(() => {
    loadCurrentAssignment();
  }, [userId]);

  const loadCurrentAssignment = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('user_id', userId)
        .eq('assignment_date', today)
        .order('start_time', { ascending: true })
        .limit(1);

      if (!error && data && data.length > 0) {
        setCurrentAssignment(data[0]);
      }
    } catch (error) {
      console.error('Error loading current assignment:', error);
    }
  };

  const getGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setQuickCheck(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setQuickCheck(prev => ({
            ...prev,
            audio_notes: [...prev.audio_notes, base64Audio]
          }));
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handlePhotoCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Photo = reader.result as string;
          setQuickCheck(prev => ({
            ...prev,
            photos: [...prev.photos, base64Photo]
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const saveQuickCheck = async () => {
    try {
      setPendingSync(true);
      
      const checkData = {
        user_id: userId,
        assignment_id: currentAssignment?.id,
        check_type: checkType,
        emotional_state_score: quickCheck.emotional_state,
        cognitive_load_score: quickCheck.cognitive_load,
        physical_state_score: quickCheck.physical_state,
        stress_level_score: quickCheck.stress_level,
        notes: quickCheck.notes,
        location_lat: quickCheck.location?.lat,
        location_lng: quickCheck.location?.lng,
        photos: quickCheck.photos,
        audio_notes: quickCheck.audio_notes,
        timestamp: quickCheck.timestamp,
        is_synced: isOnline
      };

      // Save to local storage for offline access
      if (!isOnline) {
        const offlineData = JSON.parse(localStorage.getItem('offline_quick_checks') || '[]');
        offlineData.push(checkData);
        localStorage.setItem('offline_quick_checks', JSON.stringify(offlineData));
        
        // Reset form
        resetForm();
        setPendingSync(false);
        return;
      }

      // Save to database
      const { error } = await supabase
        .from('quick_reflections')
        .insert([checkData]);

      if (error) {
        throw error;
      }

      // Reset form
      resetForm();
      
    } catch (error) {
      console.error('Error saving quick check:', error);
      // Save to offline storage as fallback
      const offlineData = JSON.parse(localStorage.getItem('offline_quick_checks') || '[]');
      offlineData.push({
        ...checkData,
        is_synced: false
      });
      localStorage.setItem('offline_quick_checks', JSON.stringify(offlineData));
    } finally {
      setPendingSync(false);
    }
  };

  const resetForm = () => {
    setQuickCheck({
      emotional_state: 3,
      cognitive_load: 3,
      physical_state: 3,
      stress_level: 3,
      notes: '',
      timestamp: new Date().toISOString(),
      photos: [],
      audio_notes: []
    });
    setCurrentStep(0);
  };

  const syncOfflineData = async () => {
    if (!isOnline) return;
    
    try {
      const offlineData = JSON.parse(localStorage.getItem('offline_quick_checks') || '[]');
      if (offlineData.length === 0) return;

      const { error } = await supabase
        .from('quick_reflections')
        .insert(offlineData);

      if (!error) {
        localStorage.removeItem('offline_quick_checks');
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  // Sync offline data when coming back online
  useEffect(() => {
    if (isOnline) {
      syncOfflineData();
    }
  }, [isOnline]);

  const steps = [
    {
      title: 'Emotional State',
      icon: <Heart className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">How are you feeling emotionally right now?</p>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => setQuickCheck(prev => ({ ...prev, emotional_state: score }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  quickCheck.emotional_state === score
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">
                  {score === 1 ? '😞' : score === 2 ? '😕' : score === 3 ? '😐' : score === 4 ? '🙂' : '😊'}
                </div>
                <div className="text-xs text-gray-600">
                  {score === 1 ? 'Very Low' : score === 2 ? 'Low' : score === 3 ? 'Neutral' : score === 4 ? 'Good' : 'Excellent'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Cognitive Load',
      icon: <Brain className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">How mentally demanding does this assignment feel?</p>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => setQuickCheck(prev => ({ ...prev, cognitive_load: score }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  quickCheck.cognitive_load === score
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">
                  {score === 1 ? '🧠' : score === 2 ? '🤔' : score === 3 ? '😐' : score === 4 ? '😅' : '🤯'}
                </div>
                <div className="text-xs text-gray-600">
                  {score === 1 ? 'Very Light' : score === 2 ? 'Light' : score === 3 ? 'Moderate' : score === 4 ? 'Heavy' : 'Very Heavy'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Physical State',
      icon: <Activity className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">How is your physical condition right now?</p>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => setQuickCheck(prev => ({ ...prev, physical_state: score }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  quickCheck.physical_state === score
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">
                  {score === 1 ? '😴' : score === 2 ? '😪' : score === 3 ? '😐' : score === 4 ? '💪' : '🏃'}
                </div>
                <div className="text-xs text-gray-600">
                  {score === 1 ? 'Very Poor' : score === 2 ? 'Poor' : score === 3 ? 'Neutral' : score === 4 ? 'Good' : 'Excellent'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Stress Level',
      icon: <AlertCircle className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">How stressed are you feeling right now?</p>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => setQuickCheck(prev => ({ ...prev, stress_level: score }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  quickCheck.stress_level === score
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">
                  {score === 1 ? '😌' : score === 2 ? '😊' : score === 3 ? '😐' : score === 4 ? '😰' : '😱'}
                </div>
                <div className="text-xs text-gray-600">
                  {score === 1 ? 'Very Calm' : score === 2 ? 'Calm' : score === 3 ? 'Neutral' : score === 4 ? 'Stressed' : 'Very Stressed'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Additional Notes',
      icon: <FileText className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">Any additional observations or notes?</p>
          <textarea
            value={quickCheck.notes}
            onChange={(e) => setQuickCheck(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Add any observations about the assignment, environment, or your experience..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
          
          {/* Photo and Audio capture */}
          <div className="flex gap-2">
            <button
              onClick={handlePhotoCapture}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Camera className="w-4 h-4" />
              Add Photo ({quickCheck.photos.length})
            </button>
            
            <button
              onClick={isRecording ? stopAudioRecording : startAudioRecording}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-100 hover:bg-red-200 text-red-700' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isRecording ? 'Stop Recording' : 'Add Audio'} ({quickCheck.audio_notes.length})
            </button>
            
            <button
              onClick={getGeolocation}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Location
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleTimeString()}
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
          <Signal className="w-4 h-4" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Quick Check</h1>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              isOnline ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            {pendingSync && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                Syncing...
              </span>
            )}
          </div>
        </div>
        {currentAssignment && (
          <div className="mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {currentAssignment.assignment_name} - {currentAssignment.start_time}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4" />
              {currentAssignment.location}
            </div>
          </div>
        )}
      </div>

      {/* Check Type Selector */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex gap-2">
          {[
            { type: 'pre' as const, label: 'Pre-Assignment', icon: <Clock className="w-4 h-4" /> },
            { type: 'mid' as const, label: 'Mid-Assignment', icon: <Activity className="w-4 h-4" /> },
            { type: 'post' as const, label: 'Post-Assignment', icon: <Check className="w-4 h-4" /> }
          ].map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => setCheckType(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                checkType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</span>
          <span className="text-sm text-gray-600">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                {steps[currentStep].icon}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{steps[currentStep].title}</h2>
            </div>
            
            {steps[currentStep].content}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={saveQuickCheck}
              disabled={pendingSync}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {pendingSync ? 'Saving...' : 'Save Check'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}