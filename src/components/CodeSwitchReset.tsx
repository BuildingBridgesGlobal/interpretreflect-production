import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Brain, Languages, Hand, Heart, Eye, Timer, 
         CheckCircle, AlertCircle, Zap, Shield, RefreshCw, Volume2, VolumeX } from 'lucide-react';

interface CodeSwitchResetProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

type ResetMethod = 'language' | 'modal' | 'cultural' | 'memory' | 'combination';
type ResetDuration = '10s' | '30s' | '3m' | '5m';
type AssignmentType = 'between' | 'mid-break' | 'team-switch' | 'end-day' | 'vri-remote';

interface ResetData {
  clearLevel: string;
  bestMethod: ResetMethod;
  mentalClarity: number;
  physicalReadiness: number;
  emotionalNeutrality: number;
  culturalPositioning: number;
  assignmentResidue: string;
  duration: number;
  timestamp: string;
  adjustmentNeeded: string;
}

export const CodeSwitchReset: React.FC<CodeSwitchResetProps> = ({ onClose, onComplete }) => {
  // Core states
  const [phase, setPhase] = useState<'setup' | 'practice' | 'reflection'>('setup');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState<ResetDuration>('3m');
  const [selectedMethod, setSelectedMethod] = useState<ResetMethod>('combination');
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('between');
  const [currentStep, setCurrentStep] = useState(0);
  
  // Practice states
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [signedLanguageMode, setSignedLanguageMode] = useState(false);
  const [quickMode, setQuickMode] = useState(false);
  
  // Reflection states
  const [clearLevel, setClearLevel] = useState('');
  const [bestMethod, setBestMethod] = useState('');
  const [mentalClarity, setMentalClarity] = useState(5);
  const [physicalReadiness, setPhysicalReadiness] = useState(5);
  const [emotionalNeutrality, setEmotionalNeutrality] = useState(5);
  const [culturalPositioning, setCulturalPositioning] = useState(5);
  const [adjustmentNeeded, setAdjustmentNeeded] = useState('');
  const [assignmentResidue, setAssignmentResidue] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [trackOverTime, setTrackOverTime] = useState(false);
  const [remindAfterAssignment, setRemindAfterAssignment] = useState(false);
  const [shareAnonymous, setShareAnonymous] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load preferences
  useEffect(() => {
    const saved = localStorage.getItem('codeSwitchResetPrefs');
    if (saved) {
      const prefs = JSON.parse(saved);
      setSelectedDuration(prefs.duration || '3m');
      setSelectedMethod(prefs.method || 'combination');
      setSignedLanguageMode(prefs.signedLanguage || false);
      setHighContrastMode(prefs.highContrast || false);
      setVibrationEnabled(prefs.vibration || false);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (isPlaying && phase === 'practice') {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const next = prev + 1;
          
          // Calculate duration in seconds
          const durationSeconds = {
            '10s': 10,
            '30s': 30,
            '3m': 180,
            '5m': 300
          }[selectedDuration];
          
          // Update step for guided practice
          if (selectedDuration === '30s' && next % 6 === 0) {
            setCurrentStep(Math.floor(next / 6));
          } else if (next % 30 === 0) {
            setCurrentStep(Math.floor(next / 30));
          }
          
          // Vibrate on transitions if enabled
          if (vibrationEnabled && next % 30 === 0 && 'vibrate' in navigator) {
            navigator.vibrate(100);
          }
          
          // Check completion
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
  }, [isPlaying, phase, selectedDuration, vibrationEnabled]);

  const resetMethods = {
    language: {
      title: 'Language Clearing',
      icon: Languages,
      techniques: [
        'Silent space: No language for 30 seconds',
        'Native language: Return to your first language briefly',
        'Nonsense sounds: Humming or gibberish to clear words',
        'Number counting: Count in a third language',
        'Music without words: Let rhythm replace language'
      ]
    },
    modal: {
      title: 'Modal Reset (Signed Languages)',
      icon: Hand,
      techniques: [
        'Shake out hands: Physical release of signing tension',
        'Vision break: Close eyes or look at distance',
        'Opposite modality: If signing, subvocalize; if speaking, move hands',
        'Stretch signing space: Expand and contract your signing bubble'
      ]
    },
    cultural: {
      title: 'Cultural/Emotional Reset',
      icon: Heart,
      techniques: [
        'Return to self: "I am [name], I am here"',
        'Role clarity: "I interpreted, I am not the message"',
        'Emotional discharge: Brief movement or breath to release held emotions',
        'Cultural neutral: Focus on universal human experience'
      ]
    },
    memory: {
      title: 'Memory Dump',
      icon: Brain,
      techniques: [
        'Write and destroy: Scribble key terms then cross them out',
        'Mental filing: Visualize putting the assignment in a folder',
        'Physical gesture: Literally brush off your shoulders',
        'Replacement image: Fill your mind with a neutral image'
      ]
    },
    combination: {
      title: 'Quick Reset Sequence',
      icon: RefreshCw,
      techniques: [
        'Three breaths with shoulder rolls',
        'Shake out hands/arms',
        'Say your name once',
        'Look at something far away',
        'Return to neutral ready position'
      ]
    }
  };

  const quickResetSteps = [
    { time: '0-6s', action: 'Three deep breaths with shoulder rolls' },
    { time: '6-12s', action: 'Shake out hands and arms' },
    { time: '12-18s', action: 'Say your name once, ground yourself' },
    { time: '18-24s', action: 'Look at something far away' },
    { time: '24-30s', action: 'Return to neutral ready position' }
  ];

  const handleStart = () => {
    setPhase('practice');
    setIsPlaying(true);
    setTimeElapsed(0);
    setCurrentStep(0);
    
    if (vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(200);
    }
  };

  const handlePause = () => {
    setIsPlaying(!isPlaying);
    
    if (vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  };

  const handleComplete = () => {
    setIsPlaying(false);
    setPhase('reflection');
    
    if (vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }
  };

  const handleSubmit = () => {
    const data: ResetData = {
      clearLevel,
      bestMethod: selectedMethod,
      mentalClarity,
      physicalReadiness,
      emotionalNeutrality,
      culturalPositioning,
      assignmentResidue,
      duration: timeElapsed,
      timestamp: new Date().toISOString(),
      adjustmentNeeded
    };
    
    // Save preferences if requested
    if (saveAsDefault) {
      localStorage.setItem('codeSwitchResetPrefs', JSON.stringify({
        duration: selectedDuration,
        method: selectedMethod,
        signedLanguage: signedLanguageMode,
        highContrast: highContrastMode,
        vibration: vibrationEnabled
      }));
    }
    
    // Track data if requested
    if (trackOverTime) {
      const sessions = JSON.parse(localStorage.getItem('codeSwitchSessions') || '[]');
      sessions.push(data);
      localStorage.setItem('codeSwitchSessions', JSON.stringify(sessions));
    }
    
    // Flag concerning residue for supervision
    if (assignmentResidue && assignmentResidue.length > 50) {
      console.warn('Assignment residue may need supervision attention:', assignmentResidue);
    }
    
    if (onComplete) onComplete(data);
    onClose();
  };

  const getDurationSeconds = () => {
    return {
      '10s': 10,
      '30s': 30,
      '3m': 180,
      '5m': 300
    }[selectedDuration];
  };

  const getProgress = () => {
    return Math.min((timeElapsed / getDurationSeconds()) * 100, 100);
  };

  const getCurrentInstruction = () => {
    if (selectedDuration === '30s' && quickResetSteps[currentStep]) {
      return quickResetSteps[currentStep].action;
    }
    
    const method = resetMethods[selectedMethod];
    if (method && method.techniques[currentStep]) {
      return method.techniques[currentStep];
    }
    
    return 'Continue your reset practice';
  };

  // Setup phase
  if (phase === 'setup') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
          highContrastMode ? 'bg-white text-black border-4 border-black' : 'bg-white'
        }`}>
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${
                  highContrastMode ? 'text-black' : 'text-gray-900'
                }`}>
                  Code Switch Reset
                </h1>
                <p className={`text-lg ${highContrastMode ? 'text-black' : 'text-gray-600'}`}>
                  Clear your linguistic channels between assignments
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Duration selection */}
            <div className="mb-8">
              <label className={`block mb-3 font-medium ${
                highContrastMode ? 'text-black' : 'text-gray-700'
              }`}>
                Choose your reset duration:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: '10s' as ResetDuration, label: '10 seconds', desc: 'Quick handoff' },
                  { id: '30s' as ResetDuration, label: '30 seconds', desc: 'Between assignments' },
                  { id: '3m' as ResetDuration, label: '3 minutes', desc: 'Full reset' },
                  { id: '5m' as ResetDuration, label: '5 minutes', desc: 'End of day' }
                ].map(duration => (
                  <button
                    key={duration.id}
                    onClick={() => setSelectedDuration(duration.id)}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      selectedDuration === duration.id
                        ? (highContrastMode ? 'bg-black text-white border-black' : 'bg-blue-600 text-white border-blue-600')
                        : (highContrastMode ? 'border-black hover:bg-gray-100' : 'border-gray-300 hover:bg-gray-50')
                    }`}
                  >
                    <div className="font-semibold">{duration.label}</div>
                    <div className={`text-sm mt-1 ${
                      selectedDuration === duration.id ? 'opacity-90' : 'opacity-60'
                    }`}>
                      {duration.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reset method selection */}
            <div className="mb-8">
              <label className={`block mb-3 font-medium ${
                highContrastMode ? 'text-black' : 'text-gray-700'
              }`}>
                Choose your reset method:
              </label>
              <div className="space-y-3">
                {Object.entries(resetMethods).map(([key, method]) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedMethod(key as ResetMethod)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedMethod === key
                          ? (highContrastMode ? 'bg-black text-white border-black' : 'bg-blue-50 border-blue-500')
                          : (highContrastMode ? 'border-black hover:bg-gray-100' : 'border-gray-300 hover:bg-gray-50')
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-6 h-6 mt-1 ${
                          selectedMethod === key
                            ? (highContrastMode ? 'text-white' : 'text-blue-600')
                            : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-2 ${
                            selectedMethod === key && highContrastMode ? 'text-white' : ''
                          }`}>
                            {method.title}
                          </h3>
                          <ul className={`text-sm space-y-1 ${
                            selectedMethod === key 
                              ? (highContrastMode ? 'text-gray-200' : 'text-gray-700')
                              : 'text-gray-500'
                          }`}>
                            {method.techniques.slice(0, 2).map((technique, i) => (
                              <li key={i}>• {technique.split(':')[0]}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Why this works */}
            <div className={`mb-8 p-6 rounded-xl ${
              highContrastMode ? 'bg-yellow-100 border-2 border-black' : 'bg-gradient-to-r from-blue-50 to-purple-50'
            }`}>
              <h3 className={`font-semibold mb-2 flex items-center gap-2 ${
                highContrastMode ? 'text-black' : 'text-gray-900'
              }`}>
                <Brain className="w-5 h-5" />
                Why This Works for Interpreters:
              </h3>
              <p className={`text-sm ${highContrastMode ? 'text-black' : 'text-gray-700'}`}>
                Your brain needs to clear residual activation patterns between languages. 
                This practice helps reset your linguistic channels, reducing interference 
                and improving accuracy for your next interpretation.
              </p>
            </div>

            {/* Comfort reminders */}
            <div className={`mb-8 p-4 rounded-lg ${
              highContrastMode ? 'bg-gray-100 border-2 border-black' : 'bg-amber-50'
            }`}>
              <h3 className={`font-medium mb-2 ${
                highContrastMode ? 'text-black' : 'text-amber-900'
              }`}>
                Comfort Reminders:
              </h3>
              <ul className={`text-sm space-y-1 ${
                highContrastMode ? 'text-black' : 'text-amber-800'
              }`}>
                <li>• Errors happen when channels aren't clear - this helps</li>
                <li>• Your brain needs this reset to maintain accuracy</li>
                <li>• This isn't weakness, it's professional maintenance</li>
                <li>• Even 10 seconds helps more than nothing</li>
              </ul>
            </div>

            {/* Options */}
            <div className="mb-8 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={signedLanguageMode}
                  onChange={(e) => setSignedLanguageMode(e.target.checked)}
                  className="mr-3"
                />
                <span>I work with signed languages</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEnabled}
                  onChange={(e) => setAudioEnabled(e.target.checked)}
                  className="mr-3"
                />
                <span>Enable audio cues</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={vibrationEnabled}
                  onChange={(e) => setVibrationEnabled(e.target.checked)}
                  className="mr-3"
                />
                <span>Enable vibration cues</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={highContrastMode}
                  onChange={(e) => setHighContrastMode(e.target.checked)}
                  className="mr-3"
                />
                <span>High contrast mode</span>
              </label>
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                highContrastMode
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Play className="w-5 h-5 inline mr-2" />
              Begin Reset Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Practice phase
  if (phase === 'practice') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
          highContrastMode ? 'bg-white text-black border-4 border-black' : 'bg-white'
        }`}>
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className={`text-2xl font-bold ${
                highContrastMode ? 'text-black' : 'text-gray-900'
              }`}>
                Current Phase: Release Previous Assignment
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Reset journey visualization */}
            <div className={`mb-8 p-6 rounded-xl text-center ${
              highContrastMode ? 'bg-gray-100 border-2 border-black' : 'bg-gradient-to-r from-blue-100 to-purple-100'
            }`}>
              <p className={`text-sm mb-4 ${highContrastMode ? 'text-black' : 'text-gray-600'}`}>
                Your Reset Journey:
              </p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className={`px-3 py-1 rounded ${
                  timeElapsed < getDurationSeconds() * 0.25
                    ? (highContrastMode ? 'bg-black text-white' : 'bg-blue-600 text-white')
                    : (highContrastMode ? 'bg-gray-300' : 'bg-gray-200')
                }`}>
                  Release language A
                </span>
                <span>•</span>
                <span className={`px-3 py-1 rounded ${
                  timeElapsed >= getDurationSeconds() * 0.25 && timeElapsed < getDurationSeconds() * 0.5
                    ? (highContrastMode ? 'bg-black text-white' : 'bg-blue-600 text-white')
                    : (highContrastMode ? 'bg-gray-300' : 'bg-gray-200')
                }`}>
                  Neural pause
                </span>
                <span>•</span>
                <span className={`px-3 py-1 rounded ${
                  timeElapsed >= getDurationSeconds() * 0.5 && timeElapsed < getDurationSeconds() * 0.75
                    ? (highContrastMode ? 'bg-black text-white' : 'bg-blue-600 text-white')
                    : (highContrastMode ? 'bg-gray-300' : 'bg-gray-200')
                }`}>
                  Clear channel
                </span>
                <span>•</span>
                <span className={`px-3 py-1 rounded ${
                  timeElapsed >= getDurationSeconds() * 0.75
                    ? (highContrastMode ? 'bg-black text-white' : 'bg-green-600 text-white')
                    : (highContrastMode ? 'bg-gray-300' : 'bg-gray-200')
                }`}>
                  Ready for language B
                </span>
              </div>
            </div>

            {/* Current instruction */}
            <div className={`mb-8 p-8 rounded-xl text-center ${
              highContrastMode ? 'bg-black text-white' : 'bg-blue-700 text-white'
            }`}>
              <p className="text-2xl font-medium mb-2">
                {getCurrentInstruction()}
              </p>
              <p className="text-lg opacity-90">
                Let go of the last interpretation
              </p>
            </div>

            {/* Timer and progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className={`font-medium ${highContrastMode ? 'text-black' : 'text-gray-700'}`}>
                  Progress:
                </span>
                <span className={`text-lg font-bold ${highContrastMode ? 'text-black' : 'text-gray-900'}`}>
                  {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')} / {
                    selectedDuration === '10s' ? '0:10' :
                    selectedDuration === '30s' ? '0:30' :
                    selectedDuration === '3m' ? '3:00' :
                    '5:00'
                  }
                </span>
              </div>
              <div className={`h-4 rounded-full overflow-hidden ${
                highContrastMode ? 'bg-gray-300' : 'bg-gray-200'
              }`}>
                <div
                  className={`h-full transition-all duration-1000 ${
                    highContrastMode ? 'bg-black' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
            </div>

            {/* Special instructions for signed language interpreters */}
            {signedLanguageMode && (
              <div className={`mb-8 p-4 rounded-lg ${
                highContrastMode ? 'bg-yellow-100 border-2 border-black' : 'bg-yellow-50'
              }`}>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Hand className="w-5 h-5" />
                  Modal Reset Reminder:
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Shake out your hands to release signing tension</li>
                  <li>• Give your eyes a break - look at something distant</li>
                  <li>• Stretch your signing space</li>
                  <li>• Return hands to neutral resting position</li>
                </ul>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-3">
              <button
                onClick={handlePause}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                  highContrastMode
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {isPlaying ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={handleComplete}
                className={`px-6 py-3 rounded-lg font-medium ${
                  highContrastMode
                    ? 'bg-gray-200 border-2 border-black hover:bg-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Complete Early
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
      <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
        highContrastMode ? 'bg-white text-black border-4 border-black' : 'bg-white'
      }`}>
        <div className="p-8">
          <h2 className={`text-3xl font-bold mb-2 ${
            highContrastMode ? 'text-black' : 'text-gray-900'
          }`}>
            Professional Reflection
          </h2>
          <p className={`mb-8 ${highContrastMode ? 'text-black' : 'text-gray-600'}`}>
            Track your interpreting wellness
          </p>

          {/* Clear level */}
          <div className="mb-6">
            <label className={`block mb-3 font-medium ${
              highContrastMode ? 'text-black' : 'text-gray-700'
            }`}>
              How clear do you feel?
            </label>
            <div className="space-y-2">
              {[
                'Fully reset and ready',
                'Mostly clear',
                'Somewhat clearer',
                'Still carrying previous content',
                'Other'
              ].map(level => (
                <button
                  key={level}
                  onClick={() => setClearLevel(level)}
                  className={`block w-full text-left px-4 py-3 rounded-lg transition-all ${
                    clearLevel === level
                      ? (highContrastMode ? 'bg-black text-white' : 'bg-blue-600 text-white')
                      : (highContrastMode ? 'bg-gray-100 border border-black' : 'bg-gray-50 hover:bg-gray-100')
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Best method */}
          <div className="mb-6">
            <label className={`block mb-3 font-medium ${
              highContrastMode ? 'text-black' : 'text-gray-700'
            }`}>
              What reset method worked best?
            </label>
            <select
              value={bestMethod}
              onChange={(e) => setBestMethod(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                highContrastMode ? 'border-black bg-white' : 'border-gray-300'
              }`}
            >
              <option value="">Select...</option>
              <option value="language">Language clearing</option>
              <option value="physical">Physical release</option>
              <option value="emotional">Emotional reset</option>
              <option value="memory">Memory dump</option>
              <option value="combination">Combination</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Readiness scales */}
          <div className="mb-6">
            <h3 className={`font-medium mb-4 ${
              highContrastMode ? 'text-black' : 'text-gray-700'
            }`}>
              Readiness for next assignment:
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Mental clarity', value: mentalClarity, setter: setMentalClarity },
                { label: 'Physical readiness', value: physicalReadiness, setter: setPhysicalReadiness },
                { label: 'Emotional neutrality', value: emotionalNeutrality, setter: setEmotionalNeutrality },
                { label: 'Cultural positioning', value: culturalPositioning, setter: setCulturalPositioning }
              ].map(scale => (
                <div key={scale.label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">{scale.label}:</span>
                    <span className="text-sm font-medium">{scale.value}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={scale.value}
                    onChange={(e) => scale.setter(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Adjustment needed */}
          <div className="mb-6">
            <label className={`block mb-3 font-medium ${
              highContrastMode ? 'text-black' : 'text-gray-700'
            }`}>
              Would you adjust for next time?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Need more time',
                'Need less time',
                'Different technique',
                'More physical release',
                'More mental clearing',
                'Perfect as is'
              ].map(adjustment => (
                <button
                  key={adjustment}
                  onClick={() => setAdjustmentNeeded(adjustment)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    adjustmentNeeded === adjustment
                      ? (highContrastMode ? 'bg-black text-white' : 'bg-blue-600 text-white')
                      : (highContrastMode ? 'bg-gray-100 border border-black' : 'bg-gray-50 hover:bg-gray-100')
                  }`}
                >
                  {adjustment}
                </button>
              ))}
            </div>
          </div>

          {/* Assignment residue check */}
          <div className={`mb-6 p-4 rounded-lg ${
            highContrastMode ? 'bg-yellow-100 border-2 border-black' : 'bg-amber-50'
          }`}>
            <label className={`block mb-2 font-medium ${
              highContrastMode ? 'text-black' : 'text-amber-900'
            }`}>
              Assignment residue check:
            </label>
            <p className={`text-sm mb-2 ${highContrastMode ? 'text-black' : 'text-amber-800'}`}>
              Are you still holding anything from the previous interpretation that needs attention?
            </p>
            <textarea
              value={assignmentResidue}
              onChange={(e) => setAssignmentResidue(e.target.value)}
              placeholder="Optional - flagged for supervision if concerning"
              className={`w-full px-3 py-2 rounded border ${
                highContrastMode ? 'border-black' : 'border-amber-300'
              }`}
              rows={3}
            />
          </div>

          {/* Preferences */}
          <div className="mb-8">
            <h3 className={`font-medium mb-3 ${
              highContrastMode ? 'text-black' : 'text-gray-700'
            }`}>
              Your Preferences:
            </h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={saveAsDefault}
                  onChange={(e) => setSaveAsDefault(e.target.checked)}
                  className="mr-3"
                />
                <span>Save this reset method as default</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={trackOverTime}
                  onChange={(e) => setTrackOverTime(e.target.checked)}
                  className="mr-3"
                />
                <span>Track my reset needs over time</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={remindAfterAssignment}
                  onChange={(e) => setRemindAfterAssignment(e.target.checked)}
                  className="mr-3"
                />
                <span>Remind me after each assignment</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={shareAnonymous}
                  onChange={(e) => setShareAnonymous(e.target.checked)}
                  className="mr-3"
                />
                <span>Share insights with my team (anonymous)</span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className={`flex-1 py-3 rounded-lg font-semibold ${
                highContrastMode
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Complete
            </button>
            <button
              onClick={() => {
                setPhase('setup');
                setTimeElapsed(0);
                setCurrentStep(0);
              }}
              className={`px-6 py-3 rounded-lg font-medium ${
                highContrastMode
                  ? 'bg-gray-200 border-2 border-black hover:bg-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Log & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};