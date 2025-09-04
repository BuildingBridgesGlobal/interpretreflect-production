import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause } from 'lucide-react';

interface BreathingPracticeProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

type PracticeDuration = '30s' | '1m' | '2m' | '4m';
type BreathingStyle = 'box' | 'triangle' | 'long-exhale' | 'natural';

interface BreathingPattern {
  name: string;
  description: string;
  timing: { in: number; hold: number; out: number; rest: number };
  color: string;
}

const BREATHING_STYLES: Record<BreathingStyle, BreathingPattern> = {
  'box': {
    name: 'Box (4-4-4-4)',
    description: 'Focus and clarity',
    timing: { in: 4, hold: 4, out: 4, rest: 4 },
    color: 'sky'
  },
  'triangle': {
    name: 'Triangle (3-3-3)',
    description: 'Quick calm',
    timing: { in: 3, hold: 3, out: 3, rest: 0 },
    color: 'blue'
  },
  'long-exhale': {
    name: 'Long Exhale (4-8)',
    description: 'Deep release',
    timing: { in: 4, hold: 0, out: 8, rest: 0 },
    color: 'teal'
  },
  'natural': {
    name: 'Natural',
    description: 'Your own rhythm',
    timing: { in: 0, hold: 0, out: 0, rest: 0 },
    color: 'green'
  }
};

export const BreathingPractice: React.FC<BreathingPracticeProps> = ({ onClose, onComplete }) => {
  const [phase, setPhase] = useState<'setup' | 'practice' | 'reflection'>('setup');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState<PracticeDuration>('2m');
  const [selectedStyle, setSelectedStyle] = useState<BreathingStyle>('box');
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out' | 'rest'>('in');
  const [breathCycleTime, setBreathCycleTime] = useState(0);
  const [currentFeeling, setCurrentFeeling] = useState<'Centered' | 'Peaceful' | 'Focused'>('Centered');
  
  // Nervous system tracking
  const [activationLevel, setActivationLevel] = useState(7);
  const [clarityLevel, setClarityLevel] = useState(5);
  
  // Reflection states
  const [whatWorked, setWhatWorked] = useState('');
  const [trackPattern, setTrackPattern] = useState('');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get pace timing
  const getPaceTiming = () => BREATHING_STYLES[selectedStyle].timing;

  // Update nervous system metrics based on time
  useEffect(() => {
    if (phase === 'practice' && timeElapsed > 0) {
      // Gradually reduce activation and increase clarity
      if (timeElapsed === 30) {
        setActivationLevel(5);
        setClarityLevel(6);
        setCurrentFeeling('Peaceful');
      } else if (timeElapsed === 60) {
        setActivationLevel(3);
        setClarityLevel(8);
        setCurrentFeeling('Focused');
      } else if (timeElapsed === 120) {
        setActivationLevel(2);
        setClarityLevel(9);
      }
    }
  }, [timeElapsed, phase]);

  // Timer effect
  useEffect(() => {
    if (isPlaying && phase === 'practice') {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const next = prev + 1;
          const durationSeconds = {
            '30s': 30,
            '1m': 60,
            '2m': 120,
            '4m': 240
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
  }, [isPlaying, phase, selectedDuration]);

  // Breathing cycle effect
  useEffect(() => {
    if (isPlaying && phase === 'practice' && selectedStyle !== 'natural') {
      const timing = getPaceTiming();
      const totalCycle = timing.in + timing.hold + timing.out + timing.rest;
      
      breathIntervalRef.current = setInterval(() => {
        setBreathCycleTime(prev => {
          const next = (prev + 0.1) % totalCycle;
          
          if (next < timing.in) {
            setBreathPhase('in');
          } else if (next < timing.in + timing.hold) {
            setBreathPhase('hold');
          } else if (next < timing.in + timing.hold + timing.out) {
            setBreathPhase('out');
          } else {
            setBreathPhase('rest');
          }
          
          return next;
        });
      }, 100);
    }

    return () => {
      if (breathIntervalRef.current) {
        clearInterval(breathIntervalRef.current);
      }
    };
  }, [isPlaying, phase, selectedStyle]);

  const handleStart = () => {
    setPhase('practice');
    setIsPlaying(true);
    setTimeElapsed(0);
    setBreathCycleTime(0);
    setActivationLevel(7);
    setClarityLevel(5);
  };

  const handlePausePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleChangeStyle = (newStyle: BreathingStyle) => {
    setSelectedStyle(newStyle);
    setBreathCycleTime(0);
  };

  const handleComplete = () => {
    setIsPlaying(false);
    setPhase('reflection');
  };

  const handleSubmit = () => {
    const data = {
      duration: selectedDuration,
      style: selectedStyle,
      completedDuration: timeElapsed,
      activationLevel,
      clarityLevel,
      whatWorked,
      trackPattern,
      timestamp: new Date().toISOString()
    };
    if (onComplete) onComplete(data);
    onClose();
  };

  const handleBreatheAgain = () => {
    setPhase('setup');
    setTimeElapsed(0);
    setWhatWorked('');
    setTrackPattern('');
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDurationSeconds = () => {
    return { '30s': 30, '1m': 60, '2m': 120, '4m': 240 }[selectedDuration];
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
                  Breathing Practice
                </h1>
                <p className="text-gray-600">
                  Reset your nervous system
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
                {['30s', '1m', '2m', '4m'].map(duration => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration as PracticeDuration)}
                    className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                      selectedDuration === duration
                        ? 'bg-sky-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {duration === '30s' ? '30 sec' :
                     duration === '1m' ? '1 min' :
                     duration === '2m' ? '2 min' : '4 min'}
                  </button>
                ))}
              </div>
            </div>

            {/* Style selection */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3 text-gray-700">Find your style:</p>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(BREATHING_STYLES) as BreathingStyle[]).map(style => {
                  const pattern = BREATHING_STYLES[style];
                  return (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`p-3 rounded-xl text-left transition-all ${
                        selectedStyle === style
                          ? 'bg-sky-100 border-2 border-sky-400'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <p className="font-medium text-gray-800">{pattern.name}</p>
                      <p className="text-sm text-gray-600">{pattern.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Why it works */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-700">
                <strong>Why it works:</strong> Extended exhales trigger your vagus nerve, shifting you from stress to calm in under a minute.
              </p>
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              className="w-full py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-all"
            >
              Start Breathing
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Practice phase
  if (phase === 'practice') {
    const progress = (timeElapsed / getDurationSeconds()) * 100;
    const timing = getPaceTiming();
    const isNaturalStyle = selectedStyle === 'natural';
    
    const getPhaseText = () => {
      if (isNaturalStyle) return 'Follow your natural rhythm';
      switch (breathPhase) {
        case 'in': return 'In through your nose...';
        case 'hold': return 'Hold gently...';
        case 'out': return 'Long exhale out...';
        case 'rest': return 'Rest...';
        default: return '';
      }
    };

    const getPracticeTitle = () => {
      switch (selectedDuration) {
        case '30s': return 'Quick Calm';
        case '1m': return 'One Minute Reset';
        case '2m': return 'Breathing Together';
        case '4m': return 'Deep Breathing';
        default: return 'Breathing Practice';
      }
    };

    const getPracticeSubtitle = () => {
      switch (selectedDuration) {
        case '30s': return '30 seconds';
        case '1m': return '';
        case '2m': return '2 minutes of reset';
        case '4m': return 'Full nervous system reset';
        default: return '';
      }
    };

    const getProgressMessage = () => {
      if (selectedDuration === '30s' && timeElapsed > 15) return 'Stress dropping already.';
      if (selectedDuration === '1m' && timeElapsed > 30) return 'Halfway there.';
      if (selectedDuration === '2m' && timeElapsed > 60) return 'Perfect.';
      if (selectedDuration === '4m') {
        if (timeElapsed > 60) return 'This is professional maintenance.';
        if (timeElapsed > 120) return 'Mind clearing.';
        if (timeElapsed > 180) return 'Almost complete.';
      }
      return '';
    };

    // Calculate breathing circle animation
    const getBreathingCircleScale = () => {
      if (isNaturalStyle) return 1;
      const totalCycle = timing.in + timing.hold + timing.out + timing.rest;
      const cyclePosition = breathCycleTime % totalCycle;
      
      if (cyclePosition < timing.in) {
        return 0.8 + (0.2 * (cyclePosition / timing.in));
      } else if (cyclePosition < timing.in + timing.hold) {
        return 1;
      } else if (cyclePosition < timing.in + timing.hold + timing.out) {
        const outPosition = cyclePosition - timing.in - timing.hold;
        return 1 - (0.2 * (outPosition / timing.out));
      } else {
        return 0.8;
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-lg w-full bg-white">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{getPracticeTitle()}</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            {getPracticeSubtitle() && (
              <p className="text-gray-600 mb-6 text-center">{getPracticeSubtitle()}</p>
            )}

            {/* Breathing circle animation */}
            <div className="flex justify-center mb-6">
              <div 
                className="w-24 h-24 bg-gradient-to-br from-sky-400 to-teal-400 rounded-full transition-transform duration-1000 ease-in-out flex items-center justify-center"
                style={{ 
                  transform: `scale(${getBreathingCircleScale()})`,
                  opacity: 0.8 + (0.2 * getBreathingCircleScale())
                }}
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <p className="text-lg font-light text-gray-700">{formatTime(timeElapsed)}</p>
                </div>
              </div>
            </div>

            {/* Timer and progress */}
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                Timer: {formatTime(timeElapsed)} / {formatTime(getDurationSeconds())}
              </p>
            </div>

            <div className="mb-6">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-teal-500 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Breath guidance */}
            <div className="text-center mb-6">
              <p className="text-lg text-sky-600 font-medium mb-2">{getPhaseText()}</p>
              <p className="text-gray-600">{getProgressMessage()}</p>
            </div>

            {/* Current feeling indicator */}
            <div className="flex justify-center gap-2 mb-6">
              <span className="text-sm text-gray-600">Feeling:</span>
              {['Centered', 'Peaceful', 'Focused'].map(feeling => (
                <span
                  key={feeling}
                  className={`text-sm px-2 py-1 rounded-full transition-all ${
                    currentFeeling === feeling
                      ? 'bg-sky-100 text-sky-700 font-medium'
                      : 'text-gray-400'
                  }`}
                >
                  {feeling}
                </span>
              ))}
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const styles = Object.keys(BREATHING_STYLES) as BreathingStyle[];
                  const currentIndex = styles.indexOf(selectedStyle);
                  const nextStyle = styles[(currentIndex + 1) % styles.length];
                  handleChangeStyle(nextStyle);
                }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-all"
              >
                Change Style
              </button>
              <button
                onClick={handlePausePlay}
                className="px-6 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-all flex items-center justify-center gap-2"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {isPlaying ? 'Pause' : 'Resume'}
              </button>
            </div>
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
            <h2 className="text-xl font-bold text-gray-900">Your nervous system now:</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Nervous system metrics */}
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Activation:</span>
                <span className="text-gray-600">High → Low</span>
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full">
                <div 
                  className="absolute h-3 w-3 bg-sky-600 rounded-full transform -translate-x-1/2"
                  style={{ left: `${100 - (activationLevel * 10)}%` }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">10</span>
                  <span className="text-xs text-gray-400">1</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Clarity:</span>
                <span className="text-gray-600">Foggy → Clear</span>
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full">
                <div 
                  className="absolute h-3 w-3 bg-teal-600 rounded-full transform -translate-x-1/2"
                  style={{ left: `${clarityLevel * 10}%` }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">1</span>
                  <span className="text-xs text-gray-400">10</span>
                </div>
              </div>
            </div>
          </div>

          {/* What worked */}
          <div className="mb-6">
            <p className="text-gray-700 mb-3">What worked?</p>
            <div className="grid grid-cols-2 gap-2">
              {['The pace', 'The length', 'The guidance', 'Just doing it'].map(option => (
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

          {/* Track pattern */}
          <div className="mb-8">
            <p className="text-gray-700 mb-3">Want to track your pattern?</p>
            <div className="space-y-2">
              {['Save this preference', 'Just continue', 'Try different next time'].map(option => (
                <button
                  key={option}
                  onClick={() => setTrackPattern(option)}
                  className={`w-full py-2 px-3 rounded-lg text-left font-medium transition-all ${
                    trackPattern === option
                      ? 'bg-sky-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-all"
            >
              Complete
            </button>
            <button
              onClick={handleBreatheAgain}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-all"
            >
              Breathe Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};