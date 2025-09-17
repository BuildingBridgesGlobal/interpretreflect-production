import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface AssignmentResetProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

type PracticeDuration = '10s' | '30s' | '1m' | '3m';
type ResetOption = 'let-go' | 'shake-out' | 'pause' | 'move-on';

export const AssignmentReset: React.FC<AssignmentResetProps> = ({ onClose, onComplete }) => {
  const [phase, setPhase] = useState<'setup' | 'practice' | 'reflection'>('setup');
  const [selectedDuration, setSelectedDuration] = useState<PracticeDuration>('30s');
  const [selectedOption, setSelectedOption] = useState<ResetOption | null>(null);
  const [minimalMode, setMinimalMode] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // Reflection states
  const [readyForNext, setReadyForNext] = useState('');
  const [whatWorked, setWhatWorked] = useState('');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (isActive && phase === 'practice') {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const next = prev + 1;
          const durationSeconds = {
            '10s': 10,
            '30s': 30,
            '1m': 60,
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
  };

  const handleComplete = () => {
    setIsActive(false);
    setPhase('reflection');
  };

  const handleSubmit = () => {
    const data = {
      duration: selectedDuration,
      selectedOption,
      minimalMode,
      readyForNext,
      whatWorked,
      completedDuration: timeElapsed,
      timestamp: new Date().toISOString()
    };
    if (onComplete) onComplete(data);
    onClose();
  };

  const handleResetAgain = () => {
    setPhase('setup');
    setTimeElapsed(0);
    setReadyForNext('');
    setWhatWorked('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDurationSeconds = () => {
    return { '10s': 10, '30s': 30, '1m': 60, '3m': 180 }[selectedDuration];
  };

  // Setup phase
  if (phase === 'setup') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-lg w-full bg-white">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-1 text-gray-900">
                  Assignment Reset
                </h1>
                <p className="text-gray-600">
                  Clear between interpretations
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
                {['10s', '30s', '1m', '3m'].map(duration => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration as PracticeDuration)}
                    className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                      selectedDuration === duration
                        ? 'bg-sky-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {duration === '10s' ? '10 sec' :
                     duration === '30s' ? '30 sec' :
                     duration === '1m' ? '1 min' : '3 min'}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset options - simplified */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3 text-gray-700">Pick one:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedOption('let-go')}
                  className={`p-3 rounded-xl transition-all ${
                    selectedOption === 'let-go' 
                      ? 'bg-sky-100 border-2 border-sky-400' 
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-gray-800">Let Go</p>
                  <p className="text-xs text-gray-600">Mental clear</p>
                </button>
                <button
                  onClick={() => setSelectedOption('shake-out')}
                  className={`p-3 rounded-xl transition-all ${
                    selectedOption === 'shake-out' 
                      ? 'bg-sky-100 border-2 border-sky-400' 
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-gray-800">Shake Out</p>
                  <p className="text-xs text-gray-600">Physical reset</p>
                </button>
                <button
                  onClick={() => setSelectedOption('pause')}
                  className={`p-3 rounded-xl transition-all ${
                    selectedOption === 'pause' 
                      ? 'bg-sky-100 border-2 border-sky-400' 
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-gray-800">Pause</p>
                  <p className="text-xs text-gray-600">No language</p>
                </button>
                <button
                  onClick={() => setSelectedOption('move-on')}
                  className={`p-3 rounded-xl transition-all ${
                    selectedOption === 'move-on' 
                      ? 'bg-sky-100 border-2 border-sky-400' 
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-gray-800">Move On</p>
                  <p className="text-xs text-gray-600">File it away</p>
                </button>
              </div>
            </div>

            {/* Quick tip */}
            <p className="text-sm text-gray-600 mb-6">
              <strong>Quick tip:</strong> Even 10 seconds helps.
            </p>

            {/* Minimal mode toggle */}
            <div className="mb-6 flex items-center justify-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={minimalMode}
                  onChange={(e) => setMinimalMode(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Minimal mode (timer only)</span>
              </label>
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              className="w-full py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-all"
            >
              Start Reset
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Practice phase
  if (phase === 'practice') {
    const progress = (timeElapsed / getDurationSeconds()) * 100;
    
    // Minimal mode - just timer and visual
    if (minimalMode) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-3xl max-w-sm w-full bg-white">
            <div className="p-8">
              <div className="flex justify-end mb-6">
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Breathing circle animation */}
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="#0ea5e9"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 60}`}
                      strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress / 100)}`}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-2xl font-light text-gray-700">
                      {formatTime(timeElapsed)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-all"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Standard mode with text guidance
    const getPracticeContent = () => {
      switch (selectedDuration) {
        case '10s':
          return {
            title: 'Quick Reset',
            guidance: [
              'Out with the old.',
              'In with the new.'
            ]
          };
        case '30s':
          return {
            title: 'Resetting',
            subtitle: '30 seconds',
            guidance: [
              'Breathe out that last one.',
              'Shoulders down.',
              'Almost there.'
            ]
          };
        case '1m':
          return {
            title: 'Taking a Minute',
            guidance: [
              'Let it go.',
              'Move what needs moving.',
              'Rest what needs resting.',
              "You're doing great."
            ]
          };
        case '3m':
          return {
            title: 'Full Reset',
            guidance: [
              'That assignment is complete.',
              'What does your body need?',
              'What does your mind need?',
              'Take this time.',
              'No rush.',
              "You've earned this pause."
            ]
          };
        default:
          return {
            title: '',
            guidance: []
          };
      }
    };
    
    const content = getPracticeContent();
    const currentGuidance = Math.floor((timeElapsed / getDurationSeconds()) * content.guidance.length);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-lg w-full bg-white">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{content.title}</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            {content.subtitle && (
              <p className="text-gray-600 mb-6 text-center">{content.subtitle}</p>
            )}

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

            {/* Simplified guidance */}
            <div className="text-center space-y-3 min-h-[120px]">
              {content.guidance.map((text, index) => (
                <p 
                  key={index}
                  className={`text-lg transition-all duration-500 ${
                    index <= currentGuidance ? 'opacity-100' : 'opacity-0'
                  } ${index === currentGuidance ? 'font-medium text-sky-600 scale-105' : 'text-gray-700'}`}
                >
                  {text}
                </p>
              ))}
            </div>

            <button
              onClick={handleComplete}
              className="w-full mt-8 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-all"
            >
              Skip
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
        <div className="p-6">
          <div className="flex justify-end mb-4">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Ready for next? */}
          <div className="mb-6">
            <p className="text-lg font-medium text-gray-800 mb-4">Ready for next?</p>
            <div className="flex gap-2">
              {['Yes', 'Almost', 'Not yet'].map(option => (
                <button
                  key={option}
                  onClick={() => setReadyForNext(option)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    readyForNext === option
                      ? 'bg-sky-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* What worked? */}
          <div className="mb-8">
            <p className="text-lg font-medium text-gray-800 mb-4">What worked?</p>
            <div className="grid grid-cols-2 gap-2">
              {['Pause', 'Movement', 'Breathing', 'Time'].map(option => (
                <button
                  key={option}
                  onClick={() => setWhatWorked(option)}
                  className={`py-2 px-3 rounded-lg font-medium transition-all ${
                    whatWorked === option
                      ? 'bg-sky-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};