import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { directInsertReflection } from '../services/directSupabaseApi';

interface BodyCheckInProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
  mode?: 'quick' | 'standard';
  duration?: '30s' | '1m' | '2m' | '3m';
}

type PracticeDuration = '30s' | '1m' | '2m' | '3m';
type PracticeMode = 'standard' | 'quick';
type BodyArea = 'head' | 'shoulders' | 'chest' | 'belly' | 'legs';

export const BodyCheckIn: React.FC<BodyCheckInProps> = ({ onClose, onComplete, mode: initialMode = 'standard', duration = '1m' }) => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<'setup' | 'practice' | 'reflection'>('practice');
  const [mode, setMode] = useState<PracticeMode>(initialMode);
  const [currentArea, setCurrentArea] = useState<BodyArea>('head');
  const [selectedDuration, setSelectedDuration] = useState<PracticeDuration>(duration);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Reflection states
  const [feelingBetter, setFeelingBetter] = useState('');
  const [whatHelped, setWhatHelped] = useState('');
  const [needsAttention, setNeedsAttention] = useState('');
  
  // Body tension tracking
  const [tensionLevel, setTensionLevel] = useState<number>(5);
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [moodLevel, setMoodLevel] = useState<number>(5);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (isActive && phase === 'practice') {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const next = prev + 1;
          const durationSeconds = {
            '30s': 30,
            '1m': 60,
            '2m': 120,
            '3m': 180
          }[selectedDuration];
          
          if (next >= durationSeconds) {
            handleComplete();
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, phase, selectedDuration]);

  const handleStart = () => {
    setPhase('practice');
    setIsActive(true);
    setTimeElapsed(0);
    setCurrentArea('head');
  };

  const handleQuickStart = () => {
    setMode('quick');
    setSelectedDuration('30s');
    setPhase('practice');
    setIsActive(true);
    setTimeElapsed(0);
  };

  const handleContinue = () => {
    const areas: BodyArea[] = ['head', 'shoulders', 'chest', 'belly', 'legs'];
    const currentIndex = areas.indexOf(currentArea);
    if (currentIndex < areas.length - 1) {
      setCurrentArea(areas[currentIndex + 1]);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    setPhase('reflection');
  };

  const handleSubmit = async () => {
    if (!user) {
      console.log('No user authenticated, saving locally');
      const data = {
        mode,
        feelingBetter,
        whatHelped,
        needsAttention,
        duration: timeElapsed,
        timestamp: new Date().toISOString()
      };
      if (onComplete) onComplete(data);
      onClose();
      return;
    }

    setIsSaving(true);
    
    try {
      // Save body check-in data to Supabase
      const { error } = await supabase
        .from('body_checkins')
        .insert({
          user_id: user.id,
          tension_level: tensionLevel,
          energy_level: energyLevel,
          mood_level: moodLevel,
          overall_feeling: Math.round((tensionLevel + energyLevel + moodLevel) / 3),
          notes: `Mode: ${mode}, Feeling better: ${feelingBetter}, What helped: ${whatHelped}, Needs attention: ${needsAttention}`,
          body_areas: {
            feelingBetter,
            whatHelped,
            needsAttention,
            mode,
            duration: timeElapsed
          }
        });

      if (error) {
        console.error('Error saving body check-in:', error);
      } else {
        console.log('Body check-in saved successfully');
      }

      // Also save as a reflection entry
      const reflectionData = {
        user_id: user.id,
        reflection_type: 'body_checkin',
        type: 'wellness',
        answers: {
          feelingBetter,
          whatHelped,
          needsAttention,
          mode,
          duration: timeElapsed,
          tensionLevel,
          energyLevel,
          moodLevel
        },
        status: 'completed',
        metadata: {
          practice_mode: mode,
          duration_seconds: timeElapsed
        }
      };

      const { error: reflectionError } = await supabase
        .from('reflections')
        .insert(reflectionData);

      if (reflectionError) {
        console.error('Error saving reflection:', reflectionError);
      }

      const data = {
        mode,
        feelingBetter,
        whatHelped,
        needsAttention,
        duration: timeElapsed,
        timestamp: new Date().toISOString()
      };
      if (onComplete) onComplete(data);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  const handleCheckInAgain = () => {
    setPhase('setup');
    setTimeElapsed(0);
    setCurrentArea('head');
    setFeelingBetter('');
    setWhatHelped('');
    setNeedsAttention('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDurationSeconds = () => {
    return { '30s': 30, '1m': 60, '2m': 120, '3m': 180 }[selectedDuration];
  };

  // Setup phase
  if (phase === 'setup') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-2xl w-full bg-white">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-1 text-gray-900">
                  Body Check-In
                </h1>
                <p className="text-gray-600">
                  Notice how your body feels
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                }}
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Practice options */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3 text-gray-700">Your way:</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-sky-50 rounded-xl">
                  <h3 className="font-medium text-gray-800">Move</h3>
                  <p className="text-sm text-gray-600">Stretch or adjust</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <h3 className="font-medium text-gray-800">Breathe</h3>
                  <p className="text-sm text-gray-600">Into tight spots</p>
                </div>
                <div className="p-3 bg-cyan-50 rounded-xl">
                  <h3 className="font-medium text-gray-800">Touch</h3>
                  <p className="text-sm text-gray-600">Gentle pressure</p>
                </div>
                <div className="p-3 bg-teal-50 rounded-xl">
                  <h3 className="font-medium text-gray-800">Just Notice</h3>
                  <p className="text-sm text-gray-600">No need to change</p>
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-700">
                <strong>Tip:</strong> Your body holds the day's work. Checking in helps you release it.
              </p>
            </div>

            {/* Start buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleStart}
                className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-all"
              >
                Begin Check-In
              </button>
              <button
                onClick={handleQuickStart}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-all"
              >
                Quick 30-second scan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quick mode practice
  if (phase === 'practice' && mode === 'quick') {
    const progress = (timeElapsed / 30) * 100;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-lg w-full bg-white">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Quick Scan</h2>
              <button 
                onClick={onClose} 
                className="p-2 rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                }}
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                Timer: {formatTime(timeElapsed)} / 0:30
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-600 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Quick prompts */}
            <div className="space-y-4 text-center">
              <p className="text-lg font-medium text-gray-800">Head to toe, how are you?</p>
              
              <div className="space-y-3 text-gray-700">
                <p>Shoulders - let them drop.</p>
                <p>Belly - let it soften.</p>
                <p>Feet - feel the ground.</p>
              </div>
              
              <p className="text-sky-600 font-medium">Take a breath.</p>
            </div>

            <button
              onClick={handleComplete}
              className="w-full mt-8 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standard practice - Body areas
  if (phase === 'practice' && mode === 'standard') {
    const progress = (timeElapsed / getDurationSeconds()) * 100;
    const durationDisplay = getDurationSeconds() === 30 ? '30 seconds' :
                           getDurationSeconds() === 60 ? '1 minute' :
                           getDurationSeconds() === 120 ? '2 minutes' : '3 minutes';
    
    const getAreaContent = () => {
      switch (currentArea) {
        case 'head':
          return {
            title: 'Start with your head and face.',
            question: 'How do they feel?',
            suggestion: 'Let them soften if that feels good.'
          };
        case 'shoulders':
          return {
            title: 'Now your shoulders.',
            question: 'Holding anything there?',
            suggestion: 'Roll them if you want.'
          };
        case 'chest':
          return {
            title: 'Your chest and breathing.',
            question: 'Just notice.',
            suggestion: 'No need to change anything.'
          };
        case 'belly':
          return {
            title: 'Check your belly.',
            question: 'Soft? Tight? Just okay?',
            suggestion: 'Let it be however it is.'
          };
        case 'legs':
          return {
            title: 'Your legs and feet.',
            question: 'How do they feel?',
            suggestion: 'Adjust if needed.',
            ending: 'Almost done.'
          };
        default:
          return {
            title: '',
            question: '',
            suggestion: ''
          };
      }
    };
    
    const content = getAreaContent();
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-lg w-full bg-white">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Let's Check In</h2>
              <button 
                onClick={onClose} 
                className="p-2 rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                }}
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <p className="text-gray-600 mb-6 text-center">
              {durationDisplay} for you
            </p>

            {/* Timer */}
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                Timer: {formatTime(timeElapsed)} / {formatTime(getDurationSeconds())}
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-600 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium text-gray-800">{content.title}</h3>
              {content.question && <p className="text-gray-700">{content.question}</p>}
              <p className="text-sky-600">{content.suggestion}</p>
              {content.ending && <p className="text-gray-600 font-medium">{content.ending}</p>}
            </div>

            <button
              onClick={currentArea === 'legs' ? handleComplete : handleContinue}
              className="w-full mt-8 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-all flex items-center justify-center gap-2"
            >
              {currentArea === 'legs' ? 'Complete' : 'Continue'}
              {currentArea !== 'legs' && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reflection phase
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-3xl max-w-lg w-full bg-white">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">How's your body now?</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Better question */}
          <div className="mb-6">
            <p className="text-gray-700 mb-3">Better?</p>
            <div className="flex gap-3">
              {['Yes', 'Somewhat', 'About the same'].map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="better"
                    value={option}
                    checked={feelingBetter === option}
                    onChange={(e) => setFeelingBetter(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* What helped */}
          <div className="mb-6">
            <p className="text-gray-700 mb-3">What helped?</p>
            <div className="space-y-2">
              {['Moving/adjusting', 'Just noticing', 'Taking time', 'Breathing through it'].map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="helped"
                    value={option}
                    checked={whatHelped === option}
                    onChange={(e) => setWhatHelped(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Needs attention */}
          <div className="mb-8">
            <p className="text-gray-700 mb-3">Any spots need more attention?</p>
            <div className="space-y-2">
              {['All good', 'Shoulders/neck', 'Back', 'Other areas'].map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="attention"
                    value={option}
                    checked={needsAttention === option}
                    onChange={(e) => setNeedsAttention(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Done'}
            </button>
            <button
              onClick={handleCheckInAgain}
              disabled={isSaving}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check In Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};