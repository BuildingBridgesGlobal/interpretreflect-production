import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, Heart, Sparkles, Clock, CheckCircle } from 'lucide-react';

interface BodyCheckInProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

type PracticeDuration = '1m' | '2m' | '3m';
type BodyArea = 'head-jaw' | 'shoulders-neck' | 'chest-heart' | 'core-belly' | 'base-ground';

interface BodyAreaInfo {
  title: string;
  subtitle: string;
  instructions: string[];
  tip: string;
}

const BODY_AREAS: Record<BodyArea, BodyAreaInfo> = {
  'head-jaw': {
    title: 'Head & Jaw',
    subtitle: 'Where focus lives',
    instructions: [
      'Unclench your jaw',
      'Soften your mouth',
      'Release your temples',
      'Let your tongue relax'
    ],
    tip: 'Jaw tension = concentration overload'
  },
  'shoulders-neck': {
    title: 'Shoulders & Neck',
    subtitle: 'Where stress lands',
    instructions: [
      'Let them drop',
      'Roll them back gently',
      'Notice the release',
      'Better already'
    ],
    tip: 'Shoulders up = carrying stress'
  },
  'chest-heart': {
    title: 'Chest & Heart',
    subtitle: 'Where emotions sit',
    instructions: [
      'Open or protected?',
      'Just notice',
      'Both are okay',
      'No need to change'
    ],
    tip: 'Chest tightness = emotional load'
  },
  'core-belly': {
    title: 'Core & Belly',
    subtitle: 'Where tension hides',
    instructions: [
      'Let your belly be soft',
      'No holding needed',
      'Soft belly = calm mind',
      'Let it be easy'
    ],
    tip: 'Core tension = bracing for stress'
  },
  'base-ground': {
    title: 'Base & Ground',
    subtitle: 'Where stability lives',
    instructions: [
      'Feel your feet or seat',
      'Sense the ground below',
      "You're supported",
      'Connected to earth'
    ],
    tip: 'Unstable base = need for grounding'
  }
};

export const BodyCheckInAccessible: React.FC<BodyCheckInProps> = ({ onClose, onComplete }) => {
  const [phase, setPhase] = useState<'setup' | 'practice' | 'reflection'>('setup');
  const [selectedDuration, setSelectedDuration] = useState<PracticeDuration>('1m');
  const [currentArea, setCurrentArea] = useState<BodyArea>('head-jaw');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [justFinishedAssignment, setJustFinishedAssignment] = useState<boolean | null>(null);
  
  // Reflection states
  const [tensionLevel, setTensionLevel] = useState('');
  const [energyLevel, setEnergyLevel] = useState('');
  const [overallFeeling, setOverallFeeling] = useState('');
  const [tensionAreas, setTensionAreas] = useState<string[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<HTMLDivElement>(null);

  // Timer effect
  useEffect(() => {
    if (isActive && phase === 'practice') {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const next = prev + 1;
          const durationSeconds = {
            '1m': 60,
            '2m': 120,
            '3m': 180
          }[selectedDuration];
          
          // Auto-advance through body areas
          const areas: BodyArea[] = ['head-jaw', 'shoulders-neck', 'chest-heart', 'core-belly', 'base-ground'];
          const areaTime = Math.floor(durationSeconds / 5);
          const currentIndex = Math.floor(next / areaTime);
          if (currentIndex < areas.length && areas[currentIndex] !== currentArea) {
            setCurrentArea(areas[currentIndex]);
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
      justFinishedAssignment,
      tensionLevel,
      energyLevel,
      overallFeeling,
      tensionAreas,
      completedDuration: timeElapsed,
      timestamp: new Date().toISOString()
    };
    if (onComplete) onComplete(data);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDurationSeconds = () => {
    return { '1m': 60, '2m': 120, '3m': 180 }[selectedDuration];
  };

  // Setup phase
  if (phase === 'setup') {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
        <section 
          aria-labelledby="body-checkin-title"
          className="rounded-3xl max-w-2xl w-full bg-white shadow-sm"
          lang="en"
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: '#F0F5ED' }}>
                  <Heart className="w-6 h-6" style={{ color: '#5C7F4F' }} />
                </div>
                <div>
                  <h2 id="body-checkin-title" className="text-xl font-normal" style={{ color: '#2D3748' }}>
                    Body Check-In
                  </h2>
                  <p className="text-sm" style={{ color: '#4A5568' }}>
                    Release what you're holding
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-50 rounded-xl transition-all"
                aria-label="Close body check-in"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Pre-practice question */}
            {justFinishedAssignment === null && (
              <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#F0F5ED' }}>
                <p className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
                  Just finished a tough assignment?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setJustFinishedAssignment(true)}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ 
                      backgroundColor: '#5C7F4F',
                      focusRingColor: '#5C7F4F'
                    }}
                  >
                    Yes - focus on release
                  </button>
                  <button
                    onClick={() => setJustFinishedAssignment(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    style={{ color: '#4A5568' }}
                  >
                    No - general check-in
                  </button>
                </div>
              </div>
            )}

            {/* Duration selection */}
            <fieldset className="mb-6">
              <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
                How long?
              </legend>
              <div role="group" aria-label="Body Check-In Timer Options" className="flex gap-2">
                {[
                  { value: '1m', label: '1 minute', desc: 'Quick scan' },
                  { value: '2m', label: '2 minutes', desc: 'Full check-in' },
                  { value: '3m', label: '3 minutes', desc: 'Deep reset' }
                ].map(duration => (
                  <button
                    key={duration.value}
                    onClick={() => setSelectedDuration(duration.value as PracticeDuration)}
                    className={`flex-1 p-3 rounded-xl text-center transition-all border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      selectedDuration === duration.value
                        ? 'border-green-400'
                        : 'border-transparent bg-gray-50 hover:bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: selectedDuration === duration.value ? '#F0F5ED' : undefined,
                      borderColor: selectedDuration === duration.value ? '#7A9B6E' : undefined,
                      focusRingColor: '#5C7F4F'
                    }}
                    aria-pressed={selectedDuration === duration.value}
                  >
                    <p className="font-medium" style={{ color: '#2D3748' }}>{duration.label}</p>
                    <p className="text-xs" style={{ color: '#4A5568' }}>{duration.desc}</p>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Body areas preview */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
                We'll check in with:
              </h3>
              <ol className="space-y-2" role="list">
                {Object.entries(BODY_AREAS).map(([key, area], index) => (
                  <li key={key} className="flex items-start gap-3">
                    <span 
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: '#7A9B6E' }}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm" style={{ color: '#2D3748' }}>{area.title}</h4>
                      <p className="text-xs" style={{ color: '#4A5568' }}>{area.subtitle}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Common patterns */}
            <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#F5F9F3' }}>
              <p className="text-sm" style={{ color: '#2D3748' }}>
                <strong>Common holding patterns:</strong> Interpreters often carry tension in jaw (concentration), shoulders (stress), and hands (signing/writing).
              </p>
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              className="w-full py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                backgroundColor: '#5C7F4F',
                focusRingColor: '#5C7F4F'
              }}
              aria-label="Begin Body Check-In"
            >
              Begin Check-In
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Practice phase
  if (phase === 'practice') {
    const progress = (timeElapsed / getDurationSeconds()) * 100;
    const areaInfo = BODY_AREAS[currentArea];
    const areas: BodyArea[] = ['head-jaw', 'shoulders-neck', 'chest-heart', 'core-belly', 'base-ground'];
    const currentIndex = areas.indexOf(currentArea);
    
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
        <section 
          aria-labelledby="practice-title"
          className="rounded-3xl max-w-lg w-full bg-white shadow-sm"
          lang="en"
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 id="practice-title" className="text-xl font-normal" style={{ color: '#2D3748' }}>
                Step {currentIndex + 1} of 5
              </h2>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-50 rounded-xl transition-all"
                aria-label="Close practice"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Timer */}
            <div 
              ref={timerRef}
              className="text-center mb-4"
              role="timer"
              aria-live="polite"
              aria-atomic="true"
              aria-label={`Timer: ${formatTime(timeElapsed)} of ${formatTime(getDurationSeconds())}`}
            >
              <p className="text-sm" style={{ color: '#4A5568' }}>
                {formatTime(timeElapsed)} / {formatTime(getDurationSeconds())}
              </p>
            </div>

            {/* Progress bar */}
            <div 
              className="mb-6"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Practice progress"
            >
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-1000"
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: '#7A9B6E'
                  }}
                />
              </div>
            </div>

            {/* Body area indicators */}
            <div className="flex justify-center gap-1 mb-8" role="group" aria-label="Body areas progress">
              {areas.map((area, index) => (
                <div
                  key={area}
                  className={`h-2 w-8 rounded-full transition-all`}
                  style={{
                    backgroundColor: index <= currentIndex ? '#7A9B6E' : '#E2E8F0'
                  }}
                  aria-label={`Area ${index + 1}: ${index <= currentIndex ? 'completed' : 'pending'}`}
                />
              ))}
            </div>

            {/* Current area content */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2" style={{ color: '#2D3748' }}>
                {areaInfo.title}
              </h3>
              <p className="text-sm mb-6" style={{ color: '#5C7F4F' }}>
                {areaInfo.subtitle}
              </p>
              
              <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: '#F0F5ED' }}>
                <ul className="space-y-2" role="list">
                  {areaInfo.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#7A9B6E' }} />
                      <span className="text-sm" style={{ color: '#4A5568' }}>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <p className="text-xs italic mb-6" style={{ color: '#5C7F4F' }}>
                {areaInfo.tip}
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                backgroundColor: '#5C7F4F',
                focusRingColor: '#5C7F4F'
              }}
              aria-label={currentArea === 'base-ground' ? 'Complete check-in' : 'Continue to next area'}
            >
              {currentArea === 'base-ground' ? 'Complete' : 'Continue'}
              {currentArea !== 'base-ground' && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Reflection phase
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
      <section 
        aria-labelledby="reflection-title"
        className="rounded-3xl max-w-lg w-full bg-white shadow-sm"
        lang="en"
      >
        <div className="p-8">
          <div className="flex justify-end mb-4">
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-50 rounded-xl transition-all"
              aria-label="Close reflection"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <h2 id="reflection-title" className="text-xl font-normal mb-6" style={{ color: '#2D3748' }}>
            How's your body feeling now?
          </h2>

          {/* Tension Level */}
          <fieldset className="mb-6">
            <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
              Tension Level
            </legend>
            <div className="flex gap-2" role="radiogroup">
              {['Holding a lot', 'Some release', 'Much lighter'].map(option => (
                <button
                  key={option}
                  onClick={() => setTensionLevel(option)}
                  className={`flex-1 py-2.5 px-3 rounded-xl transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    tensionLevel === option
                      ? 'text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: tensionLevel === option ? '#5C7F4F' : undefined,
                    color: tensionLevel === option ? 'white' : '#4A5568',
                    focusRingColor: '#5C7F4F'
                  }}
                  role="radio"
                  aria-checked={tensionLevel === option}
                >
                  {option}
                </button>
              ))}
            </div>
            <p className="text-xs mt-2 italic" style={{ color: '#4A5568' }}>
              Most people feel some release after checking in
            </p>
          </fieldset>

          {/* Energy Level */}
          <fieldset className="mb-6">
            <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
              Energy Level
            </legend>
            <div className="flex gap-2" role="radiogroup">
              {['Depleted', 'Okay', 'Restored'].map(option => (
                <button
                  key={option}
                  onClick={() => setEnergyLevel(option)}
                  className={`flex-1 py-2.5 px-3 rounded-xl transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    energyLevel === option
                      ? 'text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: energyLevel === option ? '#5C7F4F' : undefined,
                    color: energyLevel === option ? 'white' : '#4A5568',
                    focusRingColor: '#5C7F4F'
                  }}
                  role="radio"
                  aria-checked={energyLevel === option}
                >
                  {option}
                </button>
              ))}
            </div>
            <p className="text-xs mt-2 italic" style={{ color: '#4A5568' }}>
              Even noticing can bring energy back
            </p>
          </fieldset>

          {/* Overall Feeling */}
          <fieldset className="mb-6">
            <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
              Overall Comfort
            </legend>
            <div className="flex gap-2" role="radiogroup">
              {['Tight', 'Better', 'Easeful'].map(option => (
                <button
                  key={option}
                  onClick={() => setOverallFeeling(option)}
                  className={`flex-1 py-2.5 px-3 rounded-xl transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    overallFeeling === option
                      ? 'text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: overallFeeling === option ? '#5C7F4F' : undefined,
                    color: overallFeeling === option ? 'white' : '#4A5568',
                    focusRingColor: '#5C7F4F'
                  }}
                  role="radio"
                  aria-checked={overallFeeling === option}
                >
                  {option}
                </button>
              ))}
            </div>
            <p className="text-xs mt-2 italic" style={{ color: '#4A5568' }}>
              Every bit of ease helps
            </p>
          </fieldset>

          {/* Where tension was noticed */}
          <fieldset className="mb-6">
            <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
              Where did you notice tension?
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Head or jaw',
                'Shoulders or neck',
                'Chest',
                'Back',
                'Hands or arms',
                'Feeling clear'
              ].map(area => (
                <button
                  key={area}
                  onClick={() => {
                    if (area === 'Feeling clear') {
                      setTensionAreas(['Feeling clear']);
                    } else if (tensionAreas.includes(area)) {
                      setTensionAreas(tensionAreas.filter(a => a !== area));
                    } else {
                      setTensionAreas([...tensionAreas.filter(a => a !== 'Feeling clear'), area]);
                    }
                  }}
                  className={`p-2.5 rounded-xl text-center transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    tensionAreas.includes(area)
                      ? 'text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: tensionAreas.includes(area) ? '#7A9B6E' : undefined,
                    color: tensionAreas.includes(area) ? 'white' : '#4A5568',
                    gridColumn: area === 'Feeling clear' ? 'span 2' : undefined,
                    focusRingColor: '#5C7F4F'
                  }}
                  aria-pressed={tensionAreas.includes(area)}
                >
                  {area}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Insights */}
          {tensionAreas.length > 0 && tensionAreas[0] !== 'Feeling clear' && (
            <div 
              className="mb-6 p-4 rounded-xl"
              style={{ backgroundColor: '#F0F5ED' }}
              role="region"
              aria-label="Insights about tension"
            >
              <p className="text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                What this tells you:
              </p>
              <ul className="text-sm space-y-1" style={{ color: '#4A5568' }}>
                {tensionAreas.includes('Head or jaw') && (
                  <li>• Jaw tension → You've been concentrating hard</li>
                )}
                {tensionAreas.includes('Shoulders or neck') && (
                  <li>• Shoulder tightness → You're carrying stress</li>
                )}
                {tensionAreas.includes('Back') && (
                  <li>• Back tension → Your posture needs attention</li>
                )}
                {tensionAreas.includes('Hands or arms') && (
                  <li>• Hand strain → They've been working hard</li>
                )}
              </ul>
              <p className="text-xs mt-3 italic" style={{ color: '#5C7F4F' }}>
                These are just patterns - your body knows what it needs
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: '#5C7F4F',
              focusRingColor: '#5C7F4F'
            }}
            aria-label="Save check-in and close"
          >
            Save This Check-In
          </button>
        </div>
      </section>
    </div>
  );
};

// Export alias for compatibility
export const BodyCheckIn = BodyCheckInAccessible;