import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Brain, Eye, Wind, Hand, Activity, Circle, 
         ChevronRight, Sparkles, Info, Settings, Check, Zap, Target, Heart,
         Timer, Gauge, BarChart, TrendingUp, Calendar, Lock, Unlock } from 'lucide-react';

interface BodyAwarenessJourneyV2Props {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

type ApproachType = 'somatic' | 'visualization' | 'breathwork' | 'touch' | 'rhythm' | 'stillness';
type ExplorationMode = 'sequential' | 'focused' | 'dynamic' | 'integrated';
type GuidanceStyle = 'structured' | 'open' | 'scientific' | 'minimal';
type SensoryProfile = 'seeking' | 'avoiding' | 'variable';

interface PracticeData {
  duration: number;
  approach: ApproachType[];
  mode: ExplorationMode;
  energyLevel: number;
  calmness: number;
  focus: number;
  notableAreas: string[];
  timestamp: string;
  sensoryProfile?: SensoryProfile;
  guidanceStyle?: GuidanceStyle;
}

const bodyAreas = [
  { id: 'head', name: 'Head & Face', science: 'The facial muscles hold emotional tension. Relaxing them signals safety to the amygdala.' },
  { id: 'neck', name: 'Neck & Throat', science: 'Tension here can compress the vagus nerve, affecting nervous system regulation.' },
  { id: 'shoulders', name: 'Shoulders & Upper Back', science: 'The trapezius often holds stress-related tension.' },
  { id: 'chest', name: 'Chest & Heart', science: 'Chest opening enhances respiratory sinus arrhythmia, promoting parasympathetic tone.' },
  { id: 'arms', name: 'Arms & Hands', science: 'Hand awareness activates large areas of the sensory cortex.' },
  { id: 'core', name: 'Core & Belly', science: 'The gut-brain axis: belly relaxation enhances vagal tone.' },
  { id: 'hips', name: 'Hips & Pelvis', science: 'Hip flexors store trauma responses. Release can shift nervous system states.' },
  { id: 'legs', name: 'Legs & Feet', science: 'Grounding through feet awareness activates proprioceptive pathways.' }
];

export const BodyAwarenessJourneyV2: React.FC<BodyAwarenessJourneyV2Props> = ({ onClose, onComplete }) => {
  // Core states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'setup' | 'practice' | 'complete'>('setup');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(60); // seconds
  const [selectedApproaches, setSelectedApproaches] = useState<ApproachType[]>(['somatic']);
  const [explorationMode, setExplorationMode] = useState<ExplorationMode>('sequential');
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showScience, setShowScience] = useState(false);
  
  // Customization states
  const [sensoryProfile, setSensoryProfile] = useState<SensoryProfile>('variable');
  const [guidanceStyle, setGuidanceStyle] = useState<GuidanceStyle>('structured');
  const [visualIndicators, setVisualIndicators] = useState(true);
  const [vibrationCues, setVibrationCues] = useState(false);
  const [extendedTime, setExtendedTime] = useState(false);
  const [simplifiedLanguage, setSimplifiedLanguage] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [practiceSpeed, setPracticeSpeed] = useState<'slower' | 'default' | 'faster'>('default');
  
  // Post-practice states
  const [energyLevel, setEnergyLevel] = useState(5);
  const [calmness, setCalmness] = useState(5);
  const [focus, setFocus] = useState(5);
  const [notableAreas, setNotableAreas] = useState<string[]>([]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [trackSession, setTrackSession] = useState(true);
  const [setReminder, setSetReminder] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load preferences
  useEffect(() => {
    const savedPrefs = localStorage.getItem('bodyAwarenessV2Prefs');
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      setSensoryProfile(prefs.sensoryProfile || 'variable');
      setGuidanceStyle(prefs.guidanceStyle || 'structured');
      setHighContrastMode(prefs.highContrast || false);
      setVibrationCues(prefs.vibration || false);
      setSimplifiedLanguage(prefs.simplified || false);
      setPracticeSpeed(prefs.speed || 'default');
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (isPlaying && currentPhase === 'practice') {
      const speedMultiplier = practiceSpeed === 'slower' ? 1.5 : practiceSpeed === 'faster' ? 0.75 : 1;
      
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const next = prev + 1;
          
          // Progress through body areas in sequential mode
          if (explorationMode === 'sequential') {
            const timePerArea = (selectedDuration / bodyAreas.length) * speedMultiplier;
            const nextAreaIndex = Math.floor(next / timePerArea);
            if (nextAreaIndex !== currentAreaIndex && nextAreaIndex < bodyAreas.length) {
              setCurrentAreaIndex(nextAreaIndex);
              if (vibrationCues && 'vibrate' in navigator) {
                navigator.vibrate(100);
              }
            }
          }
          
          // Check completion
          if (next >= selectedDuration * speedMultiplier) {
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
  }, [isPlaying, currentPhase, selectedDuration, explorationMode, currentAreaIndex, practiceSpeed, vibrationCues]);

  const approaches = [
    {
      id: 'somatic' as ApproachType,
      icon: Brain,
      name: 'Somatic Release',
      description: 'Progressive tension release activates parasympathetic response'
    },
    {
      id: 'visualization' as ApproachType,
      icon: Eye,
      name: 'Visualization',
      description: 'Mental imagery engages the same neural pathways as physical movement'
    },
    {
      id: 'breathwork' as ApproachType,
      icon: Wind,
      name: 'Breathwork',
      description: 'Conscious breathing regulates autonomic nervous system'
    },
    {
      id: 'touch' as ApproachType,
      icon: Hand,
      name: 'Touch & Pressure',
      description: 'Tactile input provides proprioceptive feedback'
    },
    {
      id: 'rhythm' as ApproachType,
      icon: Activity,
      name: 'Rhythm & Vibration',
      description: 'Rhythmic stimulation synchronizes neural oscillations'
    },
    {
      id: 'stillness' as ApproachType,
      icon: Circle,
      name: 'Stillness',
      description: 'Focused attention strengthens interoceptive awareness'
    }
  ];

  const handleStart = () => {
    setCurrentPhase('practice');
    setIsPlaying(true);
    setTimeElapsed(0);
    setCurrentAreaIndex(0);
    
    if (vibrationCues && 'vibrate' in navigator) {
      navigator.vibrate(200);
    }
  };

  const handlePause = () => {
    setIsPlaying(!isPlaying);
    
    if (vibrationCues && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const handleComplete = () => {
    setIsPlaying(false);
    setCurrentPhase('complete');
    
    if (vibrationCues && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }
  };

  const handleSubmitComplete = () => {
    const practiceData: PracticeData = {
      duration: timeElapsed,
      approach: selectedApproaches,
      mode: explorationMode,
      energyLevel,
      calmness,
      focus,
      notableAreas,
      timestamp: new Date().toISOString(),
      sensoryProfile,
      guidanceStyle
    };
    
    // Save to localStorage if tracking
    if (trackSession) {
      const existingSessions = JSON.parse(localStorage.getItem('bodyAwarenessV2Sessions') || '[]');
      existingSessions.push(practiceData);
      localStorage.setItem('bodyAwarenessV2Sessions', JSON.stringify(existingSessions));
    }
    
    // Save preferences
    localStorage.setItem('bodyAwarenessV2Prefs', JSON.stringify({
      sensoryProfile,
      guidanceStyle,
      highContrast: highContrastMode,
      vibration: vibrationCues,
      simplified: simplifiedLanguage,
      speed: practiceSpeed
    }));
    
    if (onComplete) onComplete(practiceData);
    onClose();
  };

  const getProgressPercentage = () => {
    const speedMultiplier = practiceSpeed === 'slower' ? 1.5 : practiceSpeed === 'faster' ? 0.75 : 1;
    return Math.min((timeElapsed / (selectedDuration * speedMultiplier)) * 100, 100);
  };

  const getCurrentAreaName = () => {
    if (explorationMode === 'integrated') return 'Whole Body Awareness';
    if (explorationMode === 'dynamic') return 'Follow Your Attention';
    if (explorationMode === 'focused') return notableAreas[0] || 'Choose Your Focus';
    return bodyAreas[currentAreaIndex]?.name || 'Beginning...';
  };

  const getCurrentAreaScience = () => {
    if (!showScience || explorationMode !== 'sequential') return null;
    return bodyAreas[currentAreaIndex]?.science;
  };

  const getInsightText = () => {
    const avgResponse = (energyLevel + calmness + focus) / 3;
    if (avgResponse > 7) {
      return "Based on your practice, you engaged primarily proprioceptive pathways. Regular body awareness practice increases gray matter density in the insula, enhancing emotional resilience.";
    } else if (avgResponse > 4) {
      return "Your nervous system showed a moderate response. This suggests your interoceptive awareness is developing. Consistent practice strengthens the insula-prefrontal cortex connection.";
    } else {
      return "Your nervous system may need gentler approaches. Consider shorter sessions or focusing on single body areas to build interoceptive tolerance gradually.";
    }
  };

  // Render setup phase
  if (currentPhase === 'setup') {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`}>
        <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
          highContrastMode ? 'bg-white text-black border-4 border-black' : 'bg-white'
        }`}>
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className={`text-3xl font-light mb-2 ${
                  highContrastMode ? 'text-black font-bold' : 'text-gray-900'
                }`}>
                  Body Awareness Journey
                </h1>
                <p className={`${highContrastMode ? 'text-black' : 'text-gray-600'}`}>
                  Engage your nervous system through mindful attention
                </p>
              </div>
              <button 
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  highContrastMode ? 'hover:bg-black hover:text-white' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Duration Selection */}
            <div className="mb-8">
              <label className={`block mb-3 font-medium ${
                highContrastMode ? 'text-black' : 'text-gray-700'
              }`}>
                Duration:
              </label>
              <div className="flex gap-3">
                {[30, 60, 120, 180].map(duration => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedDuration === duration
                        ? (highContrastMode ? 'bg-black text-white' : 'bg-blue-600 text-white')
                        : (highContrastMode ? 'bg-gray-200 text-black border-2 border-gray-400' : 'bg-gray-100 hover:bg-gray-200')
                    }`}
                  >
                    {duration < 60 ? `${duration}s` : `${duration/60}m`}
                  </button>
                ))}
                <input
                  type="number"
                  placeholder="Custom"
                  className={`w-24 px-3 py-2 rounded-lg border ${
                    highContrastMode ? 'border-black bg-white text-black' : 'border-gray-300'
                  }`}
                  onChange={(e) => setSelectedDuration(parseInt(e.target.value) || 60)}
                />
              </div>
            </div>

            {/* Approach Selection */}
            <div className="mb-8">
              <label className={`block mb-3 font-medium ${
                highContrastMode ? 'text-black' : 'text-gray-700'
              }`}>
                Choose Your Approach:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {approaches.map(approach => {
                  const Icon = approach.icon;
                  const isSelected = selectedApproaches.includes(approach.id);
                  
                  return (
                    <button
                      key={approach.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedApproaches(selectedApproaches.filter(a => a !== approach.id));
                        } else {
                          setSelectedApproaches([...selectedApproaches, approach.id]);
                        }
                      }}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? (highContrastMode ? 'border-black bg-gray-100' : 'border-blue-500 bg-blue-50')
                          : (highContrastMode ? 'border-gray-400 hover:border-black' : 'border-gray-200 hover:border-gray-300')
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-6 h-6 mt-1 ${
                          isSelected 
                            ? (highContrastMode ? 'text-black' : 'text-blue-600')
                            : 'text-gray-400'
                        }`} />
                        <div>
                          <h3 className={`font-medium mb-1 ${
                            highContrastMode ? 'text-black' : 'text-gray-900'
                          }`}>
                            {approach.name}
                          </h3>
                          <p className={`text-sm ${
                            highContrastMode ? 'text-black' : 'text-gray-600'
                          }`}>
                            {approach.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exploration Mode */}
            <div className="mb-8">
              <label className={`block mb-3 font-medium ${
                highContrastMode ? 'text-black' : 'text-gray-700'
              }`}>
                Exploration Mode:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'sequential' as ExplorationMode, name: 'Sequential', desc: 'Top to bottom body scan' },
                  { id: 'focused' as ExplorationMode, name: 'Focused', desc: 'Single area deep attention' },
                  { id: 'dynamic' as ExplorationMode, name: 'Dynamic', desc: 'Follow your attention naturally' },
                  { id: 'integrated' as ExplorationMode, name: 'Integrated', desc: 'Whole body awareness' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setExplorationMode(mode.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      explorationMode === mode.id
                        ? (highContrastMode ? 'bg-black text-white border-black' : 'bg-blue-600 text-white border-blue-600')
                        : (highContrastMode ? 'border-gray-400 hover:border-black' : 'border-gray-300 hover:border-gray-400')
                    }`}
                  >
                    <div className="font-medium mb-1">{mode.name}</div>
                    <div className={`text-xs ${
                      explorationMode === mode.id ? 'opacity-90' : 'opacity-70'
                    }`}>
                      {mode.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Science Box */}
            <div className={`mb-8 p-6 rounded-xl ${
              highContrastMode ? 'bg-gray-100 border-2 border-black' : 'bg-gradient-to-r from-blue-50 to-purple-50'
            }`}>
              <div className="flex items-start gap-3">
                <Brain className={`w-6 h-6 mt-1 ${
                  highContrastMode ? 'text-black' : 'text-blue-600'
                }`} />
                <div>
                  <h3 className={`font-medium mb-2 ${
                    highContrastMode ? 'text-black' : 'text-gray-900'
                  }`}>
                    The Science
                  </h3>
                  <p className={`text-sm ${
                    highContrastMode ? 'text-black' : 'text-gray-700'
                  }`}>
                    This practice engages your insula cortex, improving interoceptive accuracy - 
                    your brain's ability to sense internal body signals. This strengthens emotional 
                    regulation and stress resilience.
                  </p>
                </div>
              </div>
            </div>

            {/* Practice Notes */}
            <div className={`mb-8 p-4 rounded-lg ${
              highContrastMode ? 'bg-yellow-100 border-2 border-black' : 'bg-amber-50'
            }`}>
              <h3 className={`font-medium mb-2 ${
                highContrastMode ? 'text-black' : 'text-amber-900'
              }`}>
                Your Practice, Your Way
              </h3>
              <ul className={`text-sm space-y-1 ${
                highContrastMode ? 'text-black' : 'text-amber-800'
              }`}>
                <li>• Movement variations welcome (rocking, stimming, adjusting)</li>
                <li>• All sensory preferences honored</li>
                <li>• Work with or around areas of tension</li>
                <li>• Adapt intensity to your nervous system's needs</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleStart}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                  highContrastMode 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Play className="w-5 h-5 inline mr-2" />
                Start
              </button>
              <button
                onClick={() => setShowCustomization(!showCustomization)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  highContrastMode 
                    ? 'bg-gray-200 text-black border-2 border-black hover:bg-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Settings className="w-5 h-5 inline mr-2" />
                Customize
              </button>
              <button
                onClick={() => setShowScience(!showScience)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  highContrastMode 
                    ? 'bg-gray-200 text-black border-2 border-black hover:bg-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Info className="w-5 h-5 inline mr-2" />
                Learn More
              </button>
            </div>

            {/* Customization Panel */}
            {showCustomization && (
              <div className={`mt-6 p-6 rounded-xl ${
                highContrastMode ? 'bg-gray-100 border-2 border-black' : 'bg-gray-50'
              }`}>
                <h3 className={`font-medium mb-4 ${
                  highContrastMode ? 'text-black' : 'text-gray-900'
                }`}>
                  Customization Panel
                </h3>
                
                <div className="space-y-6">
                  {/* Sensory Profile */}
                  <div>
                    <label className={`block mb-2 text-sm font-medium ${
                      highContrastMode ? 'text-black' : 'text-gray-700'
                    }`}>
                      Sensory Profile:
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: 'seeking' as SensoryProfile, label: 'More input (sensory seeking)' },
                        { id: 'avoiding' as SensoryProfile, label: 'Less input (sensory avoiding)' },
                        { id: 'variable' as SensoryProfile, label: 'Variable (depends on the day)' }
                      ].map(profile => (
                        <label key={profile.id} className="flex items-center">
                          <input
                            type="radio"
                            name="sensoryProfile"
                            checked={sensoryProfile === profile.id}
                            onChange={() => setSensoryProfile(profile.id)}
                            className="mr-3"
                          />
                          <span className={highContrastMode ? 'text-black' : ''}>
                            {profile.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Guidance Style */}
                  <div>
                    <label className={`block mb-2 text-sm font-medium ${
                      highContrastMode ? 'text-black' : 'text-gray-700'
                    }`}>
                      Guidance Style:
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: 'structured' as GuidanceStyle, label: 'Structured sequence' },
                        { id: 'open' as GuidanceStyle, label: 'Open exploration' },
                        { id: 'scientific' as GuidanceStyle, label: 'Science explanations' },
                        { id: 'minimal' as GuidanceStyle, label: 'Minimal instruction' }
                      ].map(style => (
                        <label key={style.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={guidanceStyle === style.id}
                            onChange={() => setGuidanceStyle(style.id)}
                            className="mr-3"
                          />
                          <span className={highContrastMode ? 'text-black' : ''}>
                            {style.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Accessibility Needs */}
                  <div>
                    <label className={`block mb-2 text-sm font-medium ${
                      highContrastMode ? 'text-black' : 'text-gray-700'
                    }`}>
                      Accessibility Needs:
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={visualIndicators}
                          onChange={(e) => setVisualIndicators(e.target.checked)}
                          className="mr-3"
                        />
                        <span className={highContrastMode ? 'text-black' : ''}>
                          Visual indicators only
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={vibrationCues}
                          onChange={(e) => setVibrationCues(e.target.checked)}
                          className="mr-3"
                        />
                        <span className={highContrastMode ? 'text-black' : ''}>
                          Vibration cues
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={extendedTime}
                          onChange={(e) => setExtendedTime(e.target.checked)}
                          className="mr-3"
                        />
                        <span className={highContrastMode ? 'text-black' : ''}>
                          Extended time
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={simplifiedLanguage}
                          onChange={(e) => setSimplifiedLanguage(e.target.checked)}
                          className="mr-3"
                        />
                        <span className={highContrastMode ? 'text-black' : ''}>
                          Simplified language
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={highContrastMode}
                          onChange={(e) => setHighContrastMode(e.target.checked)}
                          className="mr-3"
                        />
                        <span className={highContrastMode ? 'text-black' : ''}>
                          High contrast mode
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render practice phase
  if (currentPhase === 'practice') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
          highContrastMode ? 'bg-white text-black border-4 border-black' : 'bg-white'
        }`}>
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className={`text-xl font-light ${
                highContrastMode ? 'text-black font-bold' : 'text-gray-600'
              }`}>
                Current Focus: {getCurrentAreaName()}
              </h2>
              <button 
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  highContrastMode ? 'hover:bg-black hover:text-white' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className={`h-2 rounded-full overflow-hidden ${
                highContrastMode ? 'bg-gray-300' : 'bg-gray-200'
              }`}>
                <div 
                  className={`h-full transition-all duration-1000 ${
                    highContrastMode ? 'bg-black' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <p className={`mt-2 text-center text-sm ${
                highContrastMode ? 'text-black' : 'text-gray-600'
              }`}>
                Progress: {Math.round(getProgressPercentage())}%
              </p>
            </div>

            {/* Main Content Area */}
            <div className={`mb-8 p-8 rounded-xl text-center ${
              highContrastMode ? 'bg-gray-100 border-2 border-black' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
            }`}>
              {/* Area Name */}
              <h3 className={`text-3xl font-light mb-4 ${
                highContrastMode ? 'text-black font-bold' : 'text-gray-900'
              }`}>
                {getCurrentAreaName()}
              </h3>

              {/* Neural Note */}
              {getCurrentAreaScience() && (
                <div className={`mb-6 p-4 rounded-lg ${
                  highContrastMode ? 'bg-white border-2 border-black' : 'bg-white/70'
                }`}>
                  <p className={`text-sm flex items-start gap-2 ${
                    highContrastMode ? 'text-black' : 'text-gray-700'
                  }`}>
                    <Brain className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Neural Note:</strong> {getCurrentAreaScience()}
                    </span>
                  </p>
                </div>
              )}

              {/* Visual Indicator */}
              {visualIndicators && (
                <div className="mb-6">
                  <div className={`w-32 h-32 mx-auto rounded-full ${
                    isPlaying ? 'animate-pulse' : ''
                  } ${
                    highContrastMode ? 'bg-black' : 'bg-gradient-to-br from-blue-400 to-purple-400'
                  }`}>
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <Activity className={`w-16 h-16 ${
                        highContrastMode ? 'text-white' : 'text-white/80'
                      }`} />
                    </div>
                  </div>
                </div>
              )}

              {/* Timer Display */}
              <div className={`text-4xl font-light ${
                highContrastMode ? 'text-black font-bold' : 'text-gray-700'
              }`}>
                {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
              </div>
            </div>

            {/* Pace Control */}
            <div className="mb-6">
              <label className={`block mb-2 text-center text-sm ${
                highContrastMode ? 'text-black' : 'text-gray-600'
              }`}>
                Pace Control:
              </label>
              <div className="flex justify-center gap-2">
                {(['slower', 'default', 'faster'] as const).map(speed => (
                  <button
                    key={speed}
                    onClick={() => setPracticeSpeed(speed)}
                    className={`px-4 py-2 rounded-lg capitalize ${
                      practiceSpeed === speed
                        ? (highContrastMode ? 'bg-black text-white' : 'bg-blue-600 text-white')
                        : (highContrastMode ? 'bg-gray-200 border-2 border-gray-400' : 'bg-gray-100')
                    }`}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>

            {/* Control Buttons */}
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

  // Render complete phase
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
        highContrastMode ? 'bg-white text-black border-4 border-black' : 'bg-white'
      }`}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className={`text-3xl font-light mb-2 ${
              highContrastMode ? 'text-black font-bold' : 'text-gray-900'
            }`}>
              Your Nervous System Response
            </h2>
            <p className={highContrastMode ? 'text-black' : 'text-gray-600'}>
              What shifted?
            </p>
          </div>

          {/* Response Sliders */}
          <div className="space-y-6 mb-8">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span className={highContrastMode ? 'text-black font-medium' : ''}>
                    Energy level:
                  </span>
                </span>
                <span className={`font-medium ${
                  highContrastMode ? 'text-black' : 'text-gray-700'
                }`}>
                  {energyLevel}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span className={highContrastMode ? 'text-black font-medium' : ''}>
                    Calmness:
                  </span>
                </span>
                <span className={`font-medium ${
                  highContrastMode ? 'text-black' : 'text-gray-700'
                }`}>
                  {calmness}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={calmness}
                onChange={(e) => setCalmness(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <span className={highContrastMode ? 'text-black font-medium' : ''}>
                    Focus:
                  </span>
                </span>
                <span className={`font-medium ${
                  highContrastMode ? 'text-black' : 'text-gray-700'
                }`}>
                  {focus}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={focus}
                onChange={(e) => setFocus(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Practice Analysis */}
          <div className={`mb-8 p-6 rounded-xl ${
            highContrastMode ? 'bg-gray-100 border-2 border-black' : 'bg-gray-50'
          }`}>
            <h3 className={`font-medium mb-4 ${
              highContrastMode ? 'text-black' : 'text-gray-900'
            }`}>
              Practice Analysis:
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className={`text-sm ${highContrastMode ? 'text-black' : 'text-gray-600'}`}>
                  Duration:
                </p>
                <p className={`font-medium ${highContrastMode ? 'text-black' : 'text-gray-900'}`}>
                  {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <div>
                <p className={`text-sm ${highContrastMode ? 'text-black' : 'text-gray-600'}`}>
                  Approach:
                </p>
                <p className={`font-medium ${highContrastMode ? 'text-black' : 'text-gray-900'}`}>
                  {selectedApproaches.map(a => 
                    approaches.find(ap => ap.id === a)?.name
                  ).join(' + ')}
                </p>
              </div>
              <div>
                <p className={`text-sm ${highContrastMode ? 'text-black' : 'text-gray-600'}`}>
                  Mode:
                </p>
                <p className={`font-medium capitalize ${highContrastMode ? 'text-black' : 'text-gray-900'}`}>
                  {explorationMode}
                </p>
              </div>
            </div>

            {/* Notable Areas */}
            <div className="mb-4">
              <p className={`text-sm mb-2 ${highContrastMode ? 'text-black' : 'text-gray-600'}`}>
                Notable areas (optional):
              </p>
              <div className="flex flex-wrap gap-2">
                {bodyAreas.map(area => (
                  <button
                    key={area.id}
                    onClick={() => {
                      if (notableAreas.includes(area.name)) {
                        setNotableAreas(notableAreas.filter(a => a !== area.name));
                      } else {
                        setNotableAreas([...notableAreas, area.name]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      notableAreas.includes(area.name)
                        ? (highContrastMode ? 'bg-black text-white' : 'bg-blue-600 text-white')
                        : (highContrastMode ? 'bg-gray-200 border border-gray-400' : 'bg-gray-100')
                    }`}
                  >
                    {area.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Neuroscience Insight */}
          <div className={`mb-8 p-6 rounded-xl ${
            highContrastMode ? 'bg-yellow-100 border-2 border-black' : 'bg-gradient-to-r from-blue-50 to-purple-50'
          }`}>
            <h3 className={`font-medium mb-2 flex items-center gap-2 ${
              highContrastMode ? 'text-black' : 'text-gray-900'
            }`}>
              <Brain className="w-5 h-5" />
              Neuroscience Insight:
            </h3>
            <p className={`text-sm ${highContrastMode ? 'text-black' : 'text-gray-700'}`}>
              {getInsightText()}
            </p>
          </div>

          {/* Track Progress Options */}
          <div className="mb-8">
            <h3 className={`font-medium mb-4 ${
              highContrastMode ? 'text-black' : 'text-gray-900'
            }`}>
              Track Progress:
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={trackSession}
                  onChange={(e) => setTrackSession(e.target.checked)}
                  className="mr-3"
                />
                <span className={highContrastMode ? 'text-black' : ''}>
                  Log this session
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={setReminder}
                  onChange={(e) => setSetReminder(e.target.checked)}
                  className="mr-3"
                />
                <span className={highContrastMode ? 'text-black' : ''}>
                  Set practice reminder
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmitComplete}
              className={`flex-1 px-6 py-3 rounded-lg font-medium ${
                highContrastMode 
                  ? 'bg-black text-white hover:bg-gray-800' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Complete
            </button>
            <button
              onClick={() => {
                setCurrentPhase('setup');
                setTimeElapsed(0);
              }}
              className={`px-6 py-3 rounded-lg font-medium ${
                highContrastMode 
                  ? 'bg-gray-200 border-2 border-black hover:bg-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Practice Again
            </button>
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-lg font-medium ${
                highContrastMode 
                  ? 'bg-gray-200 border-2 border-black hover:bg-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Different Exercise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};