import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight } from 'lucide-react';

interface EmotionMappingProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

type PracticeDuration = '1m' | '2m' | '3m' | '5m';
type PracticeMode = 'standard' | 'quick';
type PracticeStep = 'body' | 'name' | 'pattern' | 'strategy';

export const EmotionMapping: React.FC<EmotionMappingProps> = ({ onClose, onComplete }) => {
  const [phase, setPhase] = useState<'setup' | 'practice' | 'reflection'>('setup');
  const [mode, setMode] = useState<PracticeMode>('standard');
  const [currentStep, setCurrentStep] = useState<PracticeStep>('body');
  const [selectedDuration, setSelectedDuration] = useState<PracticeDuration>('3m');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // Reflection states
  const [feelingClearer, setFeelingClearer] = useState('');
  const [mostHelpful, setMostHelpful] = useState('');
  const [needSupport, setNeedSupport] = useState('');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (isActive && phase === 'practice') {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const next = prev + 1;
          const durationSeconds = {
            '1m': 60,
            '2m': 120,
            '3m': 180,
            '5m': 300
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
    setCurrentStep('body');
  };

  const handleQuickStart = () => {
    setMode('quick');
    setSelectedDuration('1m');
    setPhase('practice');
    setIsActive(true);
    setTimeElapsed(0);
  };

  const handleContinue = () => {
    const steps: PracticeStep[] = ['body', 'name', 'pattern', 'strategy'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    setPhase('reflection');
  };

  const handleSubmit = () => {
    const data = {
      mode,
      feelingClearer,
      mostHelpful,
      needSupport,
      duration: timeElapsed,
      timestamp: new Date().toISOString()
    };
    if (onComplete) onComplete(data);
    onClose();
  };

  const handleSupportResources = () => {
    // In a real app, this would navigate to support resources
    console.log('Navigating to support resources');
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDurationSeconds = () => {
    return { '1m': 60, '2m': 120, '3m': 180, '5m': 300 }[selectedDuration];
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
                  Emotion Mapping
                </h1>
                <p className="text-gray-600">
                  Understand what you're feeling
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Duration selection */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3 text-gray-700">How long?</p>
              <div className="flex gap-2">
                {['1m', '2m', '3m', '5m'].map(duration => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration as PracticeDuration)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedDuration === duration
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {duration === '1m' ? '1 min' :
                     duration === '2m' ? '2 min' :
                     duration === '3m' ? '3 min' : '5 min'}
                  </button>
                ))}
              </div>
            </div>

            {/* Check-in options */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3 text-gray-700">Check in with yourself:</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <h3 className="font-medium text-gray-800">Body Scan</h3>
                  <p className="text-sm text-gray-600">Where do you feel something?</p>
                </div>
                <div className="p-3 bg-teal-50 rounded-xl">
                  <h3 className="font-medium text-gray-800">Name It</h3>
                  <p className="text-sm text-gray-600">What emotion is present?</p>
                </div>
                <div className="p-3 bg-cyan-50 rounded-xl">
                  <h3 className="font-medium text-gray-800">Notice Patterns</h3>
                  <p className="text-sm text-gray-600">What triggered this feeling?</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <h3 className="font-medium text-gray-800">Reset Strategy</h3>
                  <p className="text-sm text-gray-600">What helps you regulate?</p>
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-700">
                <strong>Tip:</strong> Naming emotions reduces their intensity. Your brain calms down when you identify what's happening.
              </p>
            </div>

            {/* Start buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleStart}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all"
              >
                Begin Mapping
              </button>
              <button
                onClick={handleQuickStart}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-all"
              >
                Quick 1-minute check
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quick mode practice
  if (phase === 'practice' && mode === 'quick') {
    const progress = (timeElapsed / 60) * 100;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-lg w-full bg-white">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Quick Check</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                Timer: {formatTime(timeElapsed)} / 1:00
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Quick prompts */}
            <div className="space-y-6 text-center">
              <div>
                <p className="text-lg font-medium text-gray-800 mb-2">What are you feeling?</p>
                <p className="text-gray-600">Name it.</p>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-800 mb-2">Where is it in your body?</p>
                <p className="text-gray-600">Notice it.</p>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-800 mb-2">What do you need?</p>
                <p className="text-gray-600">Honor it.</p>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full mt-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standard practice - Body scan step
  if (phase === 'practice' && currentStep === 'body') {
    const progress = (timeElapsed / getDurationSeconds()) * 100;
    const durationDisplay = getDurationSeconds() === 60 ? '1 minute' :
                           getDurationSeconds() === 120 ? '2 minutes' :
                           getDurationSeconds() === 180 ? '3 minutes' : '5 minutes';
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-lg w-full bg-white">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Let's Check In</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6" />
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
                  className="h-full bg-emerald-600 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium text-gray-800">First, your body</h3>
              <p className="text-gray-700">Where do you notice something?</p>
              
              <div className="py-4">
                <p className="text-gray-600">Chest? Stomach? Shoulders? Jaw?</p>
              </div>
              
              <p className="text-emerald-600 font-medium">Take your time.</p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full mt-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Name it step
  if (phase === 'practice' && currentStep === 'name') {
    const progress = (timeElapsed / getDurationSeconds()) * 100;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-lg w-full bg-white">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Let's Check In</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

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
                  className="h-full bg-emerald-600 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Now, name it</h3>
              <p className="text-gray-700">What are you feeling?</p>
              
              <div className="py-4 space-y-2">
                <p className="text-gray-600">Frustrated? Sad? Overwhelmed?</p>
                <p className="text-gray-600">Angry? Tired? Numb?</p>
                <p className="text-gray-600">Or something else?</p>
              </div>
              
              <p className="text-emerald-600 font-medium">It's okay to feel this.</p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full mt-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pattern step
  if (phase === 'practice' && currentStep === 'pattern') {
    const progress = (timeElapsed / getDurationSeconds()) * 100;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-lg w-full bg-white">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Let's Check In</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

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
                  className="h-full bg-emerald-600 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium text-gray-800">What brought this on?</h3>
              <p className="text-gray-700">Was it:</p>
              
              <div className="py-4 space-y-2">
                <p className="text-gray-600">Similar to your own experience?</p>
                <p className="text-gray-600">Against your values?</p>
                <p className="text-gray-600">Intense content?</p>
                <p className="text-gray-600">Just accumulation?</p>
              </div>
              
              <p className="text-emerald-600 font-medium">Understanding helps.</p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full mt-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Strategy step
  if (phase === 'practice' && currentStep === 'strategy') {
    const progress = (timeElapsed / getDurationSeconds()) * 100;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-lg w-full bg-white">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Let's Check In</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

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
                  className="h-full bg-emerald-600 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium text-gray-800">What helps you reset?</h3>
              <p className="text-gray-700">Maybe:</p>
              
              <div className="py-4 space-y-2">
                <p className="text-gray-600">Take some deep breaths</p>
                <p className="text-gray-600">Move your body</p>
                <p className="text-gray-600">Talk to someone</p>
                <p className="text-gray-600">Just acknowledge it</p>
              </div>
              
              <p className="text-emerald-600 font-medium">You know what works for you.</p>
            </div>

            <button
              onClick={handleComplete}
              className="w-full mt-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all"
            >
              Complete
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
            <h2 className="text-xl font-bold text-gray-900">How clear do you feel now?</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Clearer question */}
          <div className="mb-6">
            <p className="text-gray-700 mb-3">Clearer?</p>
            <div className="flex gap-3">
              {['Yes', 'Somewhat', 'Still processing'].map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="clearer"
                    value={option}
                    checked={feelingClearer === option}
                    onChange={(e) => setFeelingClearer(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Most helpful */}
          <div className="mb-6">
            <p className="text-gray-700 mb-3">Most helpful part?</p>
            <div className="space-y-2">
              {['Naming it', 'Finding it in my body', 'Understanding why', 'Just taking time'].map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="helpful"
                    value={option}
                    checked={mostHelpful === option}
                    onChange={(e) => setMostHelpful(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Support need */}
          <div className="mb-8">
            <p className="text-gray-700 mb-3">Need more support?</p>
            <div className="space-y-2">
              {["I'm good", 'Could use more time', 'Want to talk to someone'].map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="support"
                    value={option}
                    checked={needSupport === option}
                    onChange={(e) => setNeedSupport(e.target.value)}
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
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all"
            >
              Done
            </button>
            {needSupport === 'Want to talk to someone' && (
              <button
                onClick={handleSupportResources}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-all"
              >
                Support Resources
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};