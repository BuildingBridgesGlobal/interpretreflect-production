import React, { useState, useEffect, useRef } from 'react';
import { X, Pause, Play, Settings } from 'lucide-react';

interface BreathingPracticeProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

type PracticeDuration = '30s' | '1m' | '2m' | '4m';
type BreathingStyle = 'steady' | 'calming' | 'natural' | 'gentle';
type VisualMode = 'guide' | 'timer' | 'minimal';
type ColorTheme = 'green' | 'sage' | 'forest' | 'gray';

const COLOR_THEMES: Record<ColorTheme, { primary: string; light: string; bg: string }> = {
  green: { primary: '#5C7F4F', light: '#7A9B6E', bg: '#F0F5ED' },
  sage: { primary: '#7A9B6E', light: '#91B082', bg: '#F5F9F3' },
  forest: { primary: '#4A6B3E', light: '#5C7F4F', bg: '#EEF3EB' },
  gray: { primary: '#718096', light: '#A0AEC0', bg: '#F7FAFC' }
};

export const BreathingPractice: React.FC<BreathingPracticeProps> = ({ onClose, onComplete }) => {
  const [phase, setPhase] = useState<'setup' | 'settings' | 'practice' | 'reflection'>('setup');
  const [selectedDuration, setSelectedDuration] = useState<PracticeDuration>('2m');
  const [selectedStyle, setSelectedStyle] = useState<BreathingStyle>('steady');
  const [visualMode, setVisualMode] = useState<VisualMode>('guide');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('green');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in');
  const [showSettings, setShowSettings] = useState(false);
  
  // Reflection states
  const [howFeeling, setHowFeeling] = useState('');
  const [paceOkay, setPaceOkay] = useState('');
  const [shareThoughts, setShareThoughts] = useState('');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get breathing timing
  const getBreathingTiming = () => {
    switch (selectedStyle) {
      case 'steady': return { in: 4, out: 4 };
      case 'calming': return { in: 4, out: 6 };
      case 'natural': return { in: 0, out: 0 };
      case 'gentle': return { in: 3, out: 3 };
      default: return { in: 4, out: 4 };
    }
  };

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
  }, [isActive, phase, selectedDuration]);

  // Breathing animation effect
  useEffect(() => {
    if (isActive && phase === 'practice' && selectedStyle !== 'natural' && visualMode === 'guide') {
      const timing = getBreathingTiming();
      let cycleTime = 0;
      
      breathIntervalRef.current = setInterval(() => {
        cycleTime = (cycleTime + 0.1) % (timing.in + timing.out);
        setBreathPhase(cycleTime < timing.in ? 'in' : 'out');
      }, 100);
    }

    return () => {
      if (breathIntervalRef.current) {
        clearInterval(breathIntervalRef.current);
      }
    };
  }, [isActive, phase, selectedStyle, visualMode]);

  const handleStart = () => {
    setPhase('practice');
    setIsActive(true);
    setTimeElapsed(0);
  };

  const handlePausePlay = () => {
    setIsActive(!isActive);
  };

  const handleComplete = () => {
    setIsActive(false);
    setPhase('reflection');
  };

  const handleSubmit = () => {
    const data = {
      duration: selectedDuration,
      style: selectedStyle,
      visualMode,
      colorTheme,
      howFeeling,
      paceOkay,
      shareThoughts,
      completedDuration: timeElapsed,
      timestamp: new Date().toISOString()
    };
    if (onComplete) onComplete(data);
    onClose();
  };

  const handleBreatheAgain = () => {
    setPhase('setup');
    setTimeElapsed(0);
    setHowFeeling('');
    setPaceOkay('');
    setShareThoughts('');
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDurationSeconds = () => {
    return { '30s': 30, '1m': 60, '2m': 120, '4m': 240 }[selectedDuration];
  };

  const colors = COLOR_THEMES[colorTheme];

  // Setup phase
  if (phase === 'setup') {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-lg w-full bg-white shadow-sm">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-normal text-gray-700 mb-1">
                  Breathing Practice
                </h1>
                <p className="text-gray-500">
                  Let's breathe together
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Duration selection */}
            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-4">How long would you like?</p>
              <div className="flex gap-2">
                {['30s', '1m', '2m', '4m'].map(duration => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration as PracticeDuration)}
                    className={`flex-1 py-2 rounded-lg transition-all ${
                      selectedDuration === duration
                        ? `text-gray-700`
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: selectedDuration === duration ? colors.bg : 'transparent'
                    }}
                  >
                    {duration === '30s' ? '30 sec' :
                     duration === '1m' ? '1 min' :
                     duration === '2m' ? '2 min' : '4 min'}
                  </button>
                ))}
              </div>
            </div>

            {/* Style selection */}
            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-4">Choose what feels right:</p>
              <div className="space-y-2">
                {[
                  { value: 'steady', label: 'Steady', desc: 'Even and balanced' },
                  { value: 'calming', label: 'Calming', desc: 'Slower, deeper' },
                  { value: 'natural', label: 'Natural', desc: 'Your comfortable pace' },
                  { value: 'gentle', label: 'Gentle', desc: 'Soft and easy' }
                ].map(style => (
                  <button
                    key={style.value}
                    onClick={() => setSelectedStyle(style.value as BreathingStyle)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedStyle === style.value
                        ? 'border'
                        : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                    }`}
                    style={{
                      backgroundColor: selectedStyle === style.value ? colors.bg : undefined,
                      borderColor: selectedStyle === style.value ? colors.light : undefined
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{style.label}</span>
                      <span className="text-sm text-gray-500">{style.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tip */}
            <p className="text-sm text-gray-500 mb-6 text-center italic">
              Just 30 seconds of steady breathing can shift how you feel.
            </p>

            {/* Settings button - more visible */}
            <button
              onClick={() => setPhase('settings')}
              className="w-full mb-4 py-2.5 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 hover:bg-gray-50"
              style={{ 
                borderColor: colors.light,
                color: colors.primary
              }}
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Adjust visual preferences</span>
            </button>

            {/* Start button */}
            <button
              onClick={handleStart}
              className="w-full py-3 rounded-xl transition-all text-white font-medium hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              Let's Begin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Settings phase
  if (phase === 'settings') {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-lg w-full bg-white shadow-sm">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-normal text-gray-700">What works best for you?</h2>
              <button onClick={() => setPhase('setup')} className="p-2 hover:bg-gray-50 rounded-xl">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Visual mode */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">Visual preference:</p>
              <div className="space-y-2">
                <button
                  onClick={() => setVisualMode('guide')}
                  className={`w-full p-3 rounded-xl text-left transition-all border ${
                    visualMode === 'guide' ? 'border-2' : 'bg-gray-50 border-transparent'
                  }`}
                  style={{
                    backgroundColor: visualMode === 'guide' ? colors.bg : undefined,
                    borderColor: visualMode === 'guide' ? colors.primary : undefined
                  }}
                >
                  Breathe with the visual guide
                </button>
                <button
                  onClick={() => setVisualMode('timer')}
                  className={`w-full p-3 rounded-xl text-left transition-all border ${
                    visualMode === 'timer' ? 'border-2' : 'bg-gray-50 border-transparent'
                  }`}
                  style={{
                    backgroundColor: visualMode === 'timer' ? colors.bg : undefined,
                    borderColor: visualMode === 'timer' ? colors.primary : undefined
                  }}
                >
                  Just show me a timer
                </button>
                <button
                  onClick={() => setVisualMode('minimal')}
                  className={`w-full p-3 rounded-xl text-left transition-all border ${
                    visualMode === 'minimal' ? 'border-2' : 'bg-gray-50 border-transparent'
                  }`}
                  style={{
                    backgroundColor: visualMode === 'minimal' ? colors.bg : undefined,
                    borderColor: visualMode === 'minimal' ? colors.primary : undefined
                  }}
                >
                  Less movement please
                </button>
              </div>
            </div>

            {/* Color theme */}
            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-3">Color preference:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'green', label: 'Soft green', desc: 'natural' },
                  { value: 'sage', label: 'Sage', desc: 'calming' },
                  { value: 'forest', label: 'Forest', desc: 'grounding' },
                  { value: 'gray', label: 'Gray', desc: 'neutral' }
                ].map(color => (
                  <button
                    key={color.value}
                    onClick={() => setColorTheme(color.value as ColorTheme)}
                    className={`p-3 rounded-xl text-center transition-all border ${
                      colorTheme === color.value ? 'border-2' : 'border-transparent'
                    }`}
                    style={{
                      backgroundColor: COLOR_THEMES[color.value as ColorTheme].bg,
                      borderColor: colorTheme === color.value 
                        ? COLOR_THEMES[color.value as ColorTheme].primary 
                        : undefined
                    }}
                  >
                    <p className="text-gray-700">{color.label}</p>
                    <p className="text-xs text-gray-500">({color.desc})</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setPhase('setup')}
              className="w-full py-3 rounded-xl transition-all text-white font-medium hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              Save What Works For Me
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Practice phase
  if (phase === 'practice') {
    const breathingScale = breathPhase === 'in' ? 1.2 : 0.85;
    const timing = getBreathingTiming();
    
    const getGuidanceText = () => {
      const progress = timeElapsed / getDurationSeconds();
      
      switch (selectedDuration) {
        case '30s':
          if (timeElapsed === 0) return "I'll breathe with you";
          if (timeElapsed < 10) return "Three breaths with me.";
          if (timeElapsed < 20) return "Almost there.";
          return "Perfect.";
        
        case '1m':
          if (timeElapsed === 0) return "One minute, just us breathing";
          if (timeElapsed < 20) return "Settle in with the motion.";
          if (timeElapsed < 40) return "Halfway there.";
          return "You're doing wonderfully.";
        
        case '2m':
          if (timeElapsed === 0) return "Let's take our time";
          if (timeElapsed < 30) return breathPhase === 'in' ? "Let's breathe in together..." : "And breathe out...";
          if (timeElapsed < 60) return "Follow the gentle motion";
          if (timeElapsed < 90) return "or find your own way.";
          if (timeElapsed < 110) return "I'm here with you.";
          return "No rush at all.";
        
        case '4m':
          if (timeElapsed === 0) return "We have plenty of time";
          if (timeElapsed < 60) return "Settle into whatever feels comfortable.";
          if (timeElapsed < 120) return "The circle breathes with us,";
          if (timeElapsed < 180) return "or you can close your eyes.";
          if (timeElapsed < 210) return "This is your time.";
          return "I'm just here keeping you company.";
        
        default:
          return "";
      }
    };

    const getTitle = () => {
      switch (selectedDuration) {
        case '30s': return 'Quick reset together';
        case '1m': return 'One minute together';
        case '2m': return "I'll breathe with you";
        case '4m': return 'Deep breathing together';
        default: return '';
      }
    };
    
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full text-center">
          <button 
            onClick={onClose} 
            className="absolute top-8 right-8 p-2 hover:bg-gray-50 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>

          {/* Title */}
          <h2 className="text-lg text-gray-600 mb-8">{getTitle()}</h2>

          {/* Visual guide */}
          {visualMode === 'guide' && (
            <div className="flex justify-center mb-8">
              <div 
                className="w-32 h-32 rounded-full transition-all duration-[4000ms] ease-in-out relative"
                style={{ 
                  backgroundColor: colors.light,
                  transform: `scale(${selectedStyle === 'natural' ? 1 : breathingScale})`,
                  opacity: 0.4,
                  boxShadow: `0 0 40px ${colors.primary}20`
                }}
              >
                <div 
                  className="absolute inset-4 rounded-full"
                  style={{ 
                    backgroundColor: colors.primary,
                    opacity: 0.3
                  }}
                />
              </div>
            </div>
          )}

          {/* Timer display */}
          {(visualMode === 'timer' || visualMode === 'minimal') && (
            <div className="mb-8">
              <p className="text-3xl font-light text-gray-600">
                {formatTime(timeElapsed)}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                of {formatTime(getDurationSeconds())}
              </p>
            </div>
          )}

          {/* Timer bar */}
          <div className="text-sm text-gray-400 mb-6">
            Timer: {formatTime(timeElapsed)} / {formatTime(getDurationSeconds())}
          </div>

          {/* Guidance text */}
          <div className="h-16 flex items-center justify-center mb-8">
            <p className="text-gray-600 text-lg">
              {getGuidanceText()}
            </p>
          </div>

          {/* Encouragement */}
          {timeElapsed > 10 && timeElapsed % 20 < 5 && (
            <p className="text-sm text-gray-400 italic mb-6">
              You're doing great.
            </p>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-3">
            <button
              onClick={handlePausePlay}
              className="px-6 py-2 rounded-lg flex items-center gap-2 transition-all border"
              style={{ 
                backgroundColor: colors.bg,
                borderColor: colors.light,
                color: colors.primary
              }}
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isActive ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={handleComplete}
              className="px-6 py-2 rounded-lg transition-all hover:bg-gray-50"
              style={{ color: colors.primary }}
            >
              I'm Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reflection phase
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="rounded-3xl max-w-lg w-full bg-white shadow-sm">
        <div className="p-8">
          <div className="flex justify-end mb-4">
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <h2 className="text-xl font-normal text-gray-700 mb-6">How are you feeling now?</h2>

          {/* Feeling check */}
          <div className="mb-6">
            <div className="flex gap-2">
              {['Better', 'About the same', 'Need a bit more'].map(option => (
                <button
                  key={option}
                  onClick={() => setHowFeeling(option)}
                  className={`flex-1 py-3 px-3 rounded-xl transition-all text-sm ${
                    howFeeling === option
                      ? 'text-gray-700 border'
                      : 'text-gray-600 border border-transparent'
                  }`}
                  style={{
                    backgroundColor: howFeeling === option ? colors.bg : '#F7FAFC',
                    borderColor: howFeeling === option ? colors.light : undefined
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Pace check */}
          <div className="mb-6">
            <p className="text-gray-600 mb-3">Was the pace okay?</p>
            <div className="flex gap-2">
              {['Perfect', "Let's adjust next time"].map(option => (
                <button
                  key={option}
                  onClick={() => setPaceOkay(option)}
                  className={`flex-1 py-3 px-3 rounded-xl transition-all text-sm ${
                    paceOkay === option
                      ? 'text-gray-700 border'
                      : 'text-gray-600 border border-transparent'
                  }`}
                  style={{
                    backgroundColor: paceOkay === option ? colors.bg : '#F7FAFC',
                    borderColor: paceOkay === option ? colors.light : undefined
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Optional share */}
          <div className="mb-8">
            <p className="text-gray-600 mb-3">Want to share anything? <span className="text-gray-400">(optional)</span></p>
            <textarea
              value={shareThoughts}
              onChange={(e) => setShareThoughts(e.target.value)}
              placeholder="How was that for you?"
              className="w-full p-3 rounded-xl bg-gray-50 text-gray-600 placeholder-gray-400 resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl transition-all text-white font-medium hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              All Done
            </button>
            <button
              onClick={handleBreatheAgain}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-all"
            >
              Breathe Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};