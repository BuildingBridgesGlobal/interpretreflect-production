import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { directInsertReflection } from '../services/directSupabaseApi';

interface BodyCheckInProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

type PracticeDuration = '30s' | '1m' | '2m' | '3m';
type ApproachType = 'scan-release' | 'micro-movement' | 'pressure-points' | 'just-witness';
type BodyArea = 'head-jaw' | 'shoulders-neck' | 'chest-heart' | 'core-belly' | 'base-ground';
type TensionArea = 'head-jaw' | 'shoulders-neck' | 'back' | 'hands-arms' | 'clear';

interface BodyAreaInfo {
  name: string;
  subtitle: string;
  guidance: string[];
  insight: string;
}

const BODY_AREAS: Record<BodyArea, BodyAreaInfo> = {
  'head-jaw': {
    name: 'Head & Jaw',
    subtitle: 'Where focus lives',
    guidance: ['Unclench your jaw.', 'Soften your mouth.', 'Release your temples.'],
    insight: 'Jaw tension = concentration overload'
  },
  'shoulders-neck': {
    name: 'Shoulders & Neck',
    subtitle: 'Where stress lands',
    guidance: ['Let them drop.', 'Better already.', 'Roll if needed.'],
    insight: 'Shoulders = carrying stress'
  },
  'chest-heart': {
    name: 'Chest & Heart',
    subtitle: 'Where emotions sit',
    guidance: ['Open or protected?', 'Both are okay.', 'Just notice.'],
    insight: 'Chest tightness = emotional load'
  },
  'core-belly': {
    name: 'Core & Belly',
    subtitle: 'Where tension hides',
    guidance: ['Soft belly = calm mind.', 'Let it be easy.', 'No holding needed.'],
    insight: 'Core tension = bracing for stress'
  },
  'base-ground': {
    name: 'Base & Ground',
    subtitle: 'Where stability lives',
    guidance: ['Feel your foundation.', "You're supported.", 'Connected to earth.'],
    insight: 'Unstable base = need for grounding'
  }
};

export const BodyCheckIn: React.FC<BodyCheckInProps> = ({ onClose, onComplete }) => {
  const [phase, setPhase] = useState<'setup' | 'practice' | 'reflection'>('setup');
  const [selectedDuration, setSelectedDuration] = useState<PracticeDuration>('1m');
  const [selectedApproach, setSelectedApproach] = useState<ApproachType>('scan-release');
  const [currentArea, setCurrentArea] = useState<BodyArea>('head-jaw');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [justFinishedAssignment, setJustFinishedAssignment] = useState<boolean | null>(null);
  
  // Body status tracking
  const [tensionLevel, setTensionLevel] = useState(7);
  const [energyLevel, setEnergyLevel] = useState(4);
  const [comfortLevel, setComfortLevel] = useState(4);
  const [tensionMap, setTensionMap] = useState<TensionArea[]>([]);
  
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
          
          // Update body metrics progressively
          if (next % 10 === 0) {
            setTensionLevel(prev => Math.max(1, prev - 1));
            setEnergyLevel(prev => Math.min(10, prev + 0.5));
            setComfortLevel(prev => Math.min(10, prev + 1));
          }
          
          // Auto-advance through body areas for standard durations
          if (selectedDuration === '1m') {
            const areaTime = 12; // 12 seconds per area
            const areas: BodyArea[] = ['head-jaw', 'shoulders-neck', 'chest-heart', 'core-belly', 'base-ground'];
            const currentIndex = Math.floor(next / areaTime);
            if (currentIndex < areas.length && areas[currentIndex] !== currentArea) {
              setCurrentArea(areas[currentIndex]);
            }
          }
          
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
  }, [isActive, phase, selectedDuration, currentArea]);

  const handleStart = () => {
    setPhase('practice');
    setIsActive(true);
    setTimeElapsed(0);
    setCurrentArea('head-jaw');
    
    // Set initial metrics based on whether just finished assignment
    if (justFinishedAssignment) {
      setTensionLevel(8);
      setEnergyLevel(3);
      setComfortLevel(3);
    } else {
      setTensionLevel(6);
      setEnergyLevel(5);
      setComfortLevel(5);
    }
  };

  const handleContinue = () => {
    const areas: BodyArea[] = ['head-jaw', 'shoulders-neck', 'chest-heart', 'core-belly', 'base-ground'];
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

  const handleSubmit = () => {
    const data = {
      duration: selectedDuration,
      approach: selectedApproach,
      justFinishedAssignment,
      tensionLevel,
      energyLevel,
      comfortLevel,
      tensionMap,
      completedDuration: timeElapsed,
      timestamp: new Date().toISOString()
    };
    if (onComplete) onComplete(data);
    onClose();
  };

  const handleCheckInAgain = () => {
    setPhase('setup');
    setTimeElapsed(0);
    setCurrentArea('head-jaw');
    setTensionMap([]);
    setJustFinishedAssignment(null);
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
                  Release what you're holding
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Pre-practice prompt */}
            {justFinishedAssignment === null && (
              <div className="mb-6 p-4 bg-amber-50 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-2">Just finished a tough assignment?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setJustFinishedAssignment(true)}
                    className="px-4 py-2 bg-amber-100 hover:bg-amber-200 rounded-lg text-sm font-medium text-gray-700"
                  >
                    Yes - focus on release
                  </button>
                  <button
                    onClick={() => setJustFinishedAssignment(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
                  >
                    No - general check-in
                  </button>
                </div>
              </div>
            )}

            {/* Duration selection */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3 text-gray-700">How long?</p>
              <div className="flex gap-2">
                {['30s', '1m', '2m', '3m'].map(duration => (
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
                     duration === '2m' ? '2 min' : '3 min'}
                  </button>
                ))}
              </div>
            </div>

            {/* Approach selection */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3 text-gray-700">Your approach:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedApproach('scan-release')}
                  className={`p-3 rounded-xl text-left transition-all ${
                    selectedApproach === 'scan-release'
                      ? 'bg-sky-100 border-2 border-sky-400'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-gray-800">Scan & Release</p>
                  <p className="text-xs text-gray-600">Notice and let go</p>
                </button>
                <button
                  onClick={() => setSelectedApproach('micro-movement')}
                  className={`p-3 rounded-xl text-left transition-all ${
                    selectedApproach === 'micro-movement'
                      ? 'bg-sky-100 border-2 border-sky-400'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-gray-800">Micro-Movement</p>
                  <p className="text-xs text-gray-600">Small adjustments</p>
                </button>
                <button
                  onClick={() => setSelectedApproach('pressure-points')}
                  className={`p-3 rounded-xl text-left transition-all ${
                    selectedApproach === 'pressure-points'
                      ? 'bg-sky-100 border-2 border-sky-400'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-gray-800">Pressure Points</p>
                  <p className="text-xs text-gray-600">Strategic touch</p>
                </button>
                <button
                  onClick={() => setSelectedApproach('just-witness')}
                  className={`p-3 rounded-xl text-left transition-all ${
                    selectedApproach === 'just-witness'
                      ? 'bg-sky-100 border-2 border-sky-400'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-gray-800">Just Witness</p>
                  <p className="text-xs text-gray-600">Observe without changing</p>
                </button>
              </div>
            </div>

            {/* Common holding patterns */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-700">
                <strong>Common holding patterns:</strong> Interpreters often carry tension in jaw (concentration), shoulders (stress), and hands (signing/writing).
              </p>
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              className="w-full py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-all"
            >
              Begin Check-In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Practice phase
  if (phase === 'practice') {
    const progress = (timeElapsed / getDurationSeconds()) * 100;
    
    const getPracticeContent = () => {
      switch (selectedDuration) {
        case '30s':
          return {
            title: 'Power Scan',
            subtitle: 'Hit the key spots',
            showAreaDetails: false,
            quickGuidance: ['Jaw - release', 'Shoulders - drop', 'Belly - soften', 'Feet - ground', 'Four spots. Big difference.']
          };
        case '1m':
          return {
            title: 'Checking In',
            subtitle: '1 minute scan',
            showAreaDetails: true,
            quickGuidance: null
          };
        case '2m':
          return {
            title: 'Deep Check-In',
            subtitle: 'Full body inventory',
            showAreaDetails: true,
            quickGuidance: null,
            deepGuidance: ["Starting at your crown...", "What's tight (information)", "What's easy (resource)", "What needs attention (priority)", "Move through slowly.", "Pay attention to what your body is communicating."]
          };
        case '3m':
          return {
            title: 'Complete Reset',
            subtitle: 'Professional body maintenance',
            showAreaDetails: true,
            quickGuidance: null,
            deepGuidance: ["This is occupational health.", "Check:", "Repetitive strain areas", "Emotional holding spots", "Fatigue indicators", "Adjust what needs adjusting.", "Document patterns for later."]
          };
        default:
          return { title: '', subtitle: '', showAreaDetails: true, quickGuidance: null };
      }
    };
    
    const content = getPracticeContent();
    const areaInfo = BODY_AREAS[currentArea];
    
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

            <p className="text-gray-600 mb-6 text-center">{content.subtitle}</p>

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
                  className="h-full bg-gradient-to-r from-sky-500 to-teal-500 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Content based on duration */}
            {content.quickGuidance ? (
              // 30-second quick version
              <div className="text-center space-y-2">
                {content.quickGuidance.map((text, index) => (
                  <p 
                    key={index}
                    className={`text-lg ${
                      index === content.quickGuidance.length - 1 
                        ? 'font-medium text-sky-600 mt-4' 
                        : 'text-gray-700'
                    }`}
                  >
                    {text}
                  </p>
                ))}
              </div>
            ) : content.deepGuidance && selectedDuration !== '1m' ? (
              // 2-3 minute deep versions
              <div className="space-y-3">
                {content.deepGuidance.map((text, index) => (
                  <p key={index} className="text-gray-700">{text}</p>
                ))}
              </div>
            ) : (
              // 1-minute standard version with area details
              <div className="text-center space-y-4">
                <div className="p-4 bg-sky-50 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{areaInfo.name}</h3>
                  <p className="text-sm text-sky-600 mb-3">{areaInfo.subtitle}</p>
                  <div className="space-y-2">
                    {areaInfo.guidance.map((text, index) => (
                      <p key={index} className="text-gray-700">{text}</p>
                    ))}
                  </div>
                </div>

                {/* Body area indicator */}
                <div className="flex justify-center gap-1">
                  {(['head-jaw', 'shoulders-neck', 'chest-heart', 'core-belly', 'base-ground'] as BodyArea[]).map(area => (
                    <div
                      key={area}
                      className={`h-2 w-8 rounded-full transition-all ${
                        area === currentArea ? 'bg-sky-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full mt-4 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-all flex items-center justify-center gap-2"
                >
                  {currentArea === 'base-ground' ? 'Complete' : 'Continue'}
                  {currentArea !== 'base-ground' && <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            )}

            {/* Complete button for longer practices */}
            {(selectedDuration === '2m' || selectedDuration === '3m' || selectedDuration === '30s') && (
              <button
                onClick={handleComplete}
                className="w-full mt-6 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-all"
              >
                {selectedDuration === '30s' ? 'Done' : 'Continue'}
              </button>
            )}
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
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <h2 className="text-xl font-normal text-gray-700 mb-8">How's your body feeling?</h2>

          {/* Body metrics - warmer presentation */}
          <div className="space-y-6 mb-8">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-3">Tension Level</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Holding a lot</span>
                <span>Released</span>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full">
                <div 
                  className="absolute h-3 w-3 bg-blue-300 rounded-full transform -translate-x-1/2 -translate-y-0.5"
                  style={{ left: `${100 - (tensionLevel * 10)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 italic">Most people feel some release after checking in</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-3">Energy Level</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Depleted</span>
                <span>Restored</span>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full">
                <div 
                  className="absolute h-3 w-3 bg-blue-300 rounded-full transform -translate-x-1/2 -translate-y-0.5"
                  style={{ left: `${energyLevel * 10}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 italic">Even noticing can bring energy back</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-3">Overall Comfort</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Tight</span>
                <span>Easeful</span>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full">
                <div 
                  className="absolute h-3 w-3 bg-blue-300 rounded-full transform -translate-x-1/2 -translate-y-0.5"
                  style={{ left: `${comfortLevel * 10}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 italic">Every bit of ease helps</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mb-6"></div>

          {/* Tension areas - friendlier */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 mb-4">Where did you notice tension?</p>
            <div className="space-y-2">
              {[
                { value: 'head-jaw', label: 'Head or jaw' },
                { value: 'shoulders-neck', label: 'Shoulders or neck' },
                { value: 'back', label: 'Back' },
                { value: 'hands-arms', label: 'Hands or arms' },
                { value: 'clear', label: 'Feeling pretty clear' }
              ].map(area => (
                <button
                  key={area.value}
                  onClick={() => {
                    if (area.value === 'clear') {
                      setTensionMap(['clear' as TensionArea]);
                    } else if (tensionMap.includes(area.value as TensionArea)) {
                      setTensionMap(tensionMap.filter(t => t !== area.value));
                    } else {
                      setTensionMap([...tensionMap.filter(t => t !== 'clear'), area.value as TensionArea]);
                    }
                  }}
                  className={`w-full py-3 px-4 rounded-xl text-left transition-all ${
                    tensionMap.includes(area.value as TensionArea)
                      ? 'bg-blue-50 text-gray-700 border border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-transparent'
                  }`}
                >
                  {area.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gentle insights */}
          {tensionMap.length > 0 && tensionMap[0] !== 'clear' && (
            <>
              <div className="border-t border-gray-100 pt-6 mb-6"></div>
              
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-600 mb-4">What this might mean:</p>
                <div className="space-y-3">
                  {tensionMap.includes('head-jaw') && (
                    <p className="text-sm text-gray-500">
                      If you noticed <span className="font-medium">jaw tension</span> → You might be concentrating really hard today
                    </p>
                  )}
                  {tensionMap.includes('shoulders-neck') && (
                    <p className="text-sm text-gray-500">
                      If you noticed <span className="font-medium">shoulder tightness</span> → You're probably carrying some stress
                    </p>
                  )}
                  {tensionMap.includes('back') && (
                    <p className="text-sm text-gray-500">
                      If you noticed <span className="font-medium">back tension</span> → Your posture might need some love
                    </p>
                  )}
                  {tensionMap.includes('hands-arms') && (
                    <p className="text-sm text-gray-500">
                      If you noticed <span className="font-medium">hand strain</span> → Your hands have been working hard
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-4 italic">
                  These are just patterns - your body knows what it needs
                </p>
              </div>
            </>
          )}

          {/* Encouragement */}
          {tensionMap.length > 0 && tensionMap[0] !== 'clear' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600">
                You're taking care of yourself. That matters. 💙
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
            >
              Save This Check-In
            </button>
            <button
              onClick={handleCheckInAgain}
              className="flex-1 py-3 bg-blue-100 text-gray-700 rounded-xl hover:bg-blue-200 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};