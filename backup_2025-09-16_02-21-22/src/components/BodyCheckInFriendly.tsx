import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, Heart, Sparkles } from 'lucide-react';

interface BodyCheckInProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

type PracticeDuration = '30s' | '1m' | '2m';
type TensionLevel = 'tight' | 'okay' | 'relaxed';
type EnergyLevel = 'tired' | 'okay' | 'energized';
type ComfortLevel = 'uncomfortable' | 'okay' | 'comfortable';

export const BodyCheckIn: React.FC<BodyCheckInProps> = ({ onClose, onComplete }) => {
  const [phase, setPhase] = useState<'intro' | 'setup' | 'practice' | 'reflection'>('intro');
  const [selectedDuration, setSelectedDuration] = useState<PracticeDuration>('1m');
  const [currentStep, setCurrentStep] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // Reflection states
  const [tensionLevel, setTensionLevel] = useState<TensionLevel>('okay');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('okay');
  const [comfortLevel, setComfortLevel] = useState<ComfortLevel>('okay');
  const [tensionAreas, setTensionAreas] = useState<string[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkInSteps = [
    {
      title: "Let's start with your head",
      subtitle: "Notice your jaw and forehead",
      guidance: [
        "Is your jaw clenched?",
        "Gently let it soften",
        "Your tongue can relax too"
      ]
    },
    {
      title: "Check in with your shoulders",
      subtitle: "Where stress likes to hide",
      guidance: [
        "Are they up by your ears?",
        "Let them drop down",
        "Roll them back if it feels good"
      ]
    },
    {
      title: "Notice your breathing",
      subtitle: "No need to change it",
      guidance: [
        "Just notice the rhythm",
        "Is it shallow or deep?",
        "Let it be natural"
      ]
    },
    {
      title: "Feel your back and core",
      subtitle: "Your support system",
      guidance: [
        "Any tightness there?",
        "Adjust your posture gently",
        "Your body knows what it needs"
      ]
    },
    {
      title: "Notice your hands and arms",
      subtitle: "They work hard for you",
      guidance: [
        "Unclench your fists",
        "Shake them out if you want",
        "They deserve a break"
      ]
    }
  ];

  // Timer effect
  useEffect(() => {
    if (isActive && phase === 'practice') {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const next = prev + 1;
          const durationSeconds = {
            '30s': 30,
            '1m': 60,
            '2m': 120
          }[selectedDuration];
          
          // Auto-advance steps
          const stepDuration = Math.floor(durationSeconds / checkInSteps.length);
          const nextStep = Math.floor(next / stepDuration);
          if (nextStep < checkInSteps.length && nextStep !== currentStep) {
            setCurrentStep(nextStep);
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
  }, [isActive, phase, selectedDuration, currentStep]);

  const handleStart = () => {
    setPhase('practice');
    setIsActive(true);
    setTimeElapsed(0);
    setCurrentStep(0);
  };

  const handleComplete = () => {
    setIsActive(false);
    setPhase('reflection');
  };

  const handleNextStep = () => {
    if (currentStep < checkInSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSubmit = () => {
    const data = {
      duration: selectedDuration,
      tensionLevel,
      energyLevel,
      comfortLevel,
      tensionAreas,
      completedDuration: timeElapsed,
      timestamp: new Date().toISOString()
    };
    if (onComplete) onComplete(data);
    onClose();
  };

  const handleCheckInAgain = () => {
    setPhase('intro');
    setTimeElapsed(0);
    setCurrentStep(0);
    setTensionAreas([]);
    setTensionLevel('okay');
    setEnergyLevel('okay');
    setComfortLevel('okay');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDurationSeconds = () => {
    return { '30s': 30, '1m': 60, '2m': 120 }[selectedDuration];
  };

  // Intro phase
  if (phase === 'intro') {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-lg w-full bg-white shadow-sm">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: '#F0F5ED' }}>
                  <Heart className="w-6 h-6" style={{ color: '#5C7F4F' }} />
                </div>
                <div>
                  <h1 className="text-xl font-normal text-gray-700">
                    Body Check-In
                  </h1>
                  <p className="text-sm text-gray-500">
                    A moment just for you
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-8 p-4 rounded-xl" style={{ backgroundColor: '#F0F5ED' }}>
              <p className="text-gray-700 mb-2">
                Hi there! Let's take a moment to check in with your body.
              </p>
              <p className="text-sm text-gray-600">
                No judgment, just noticing. Your body's been working hard for you.
              </p>
            </div>

            <button
              onClick={() => setPhase('setup')}
              className="w-full py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all"
              style={{ backgroundColor: '#5C7F4F' }}
            >
              Let's Begin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Setup phase
  if (phase === 'setup') {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-lg w-full bg-white shadow-sm">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-normal text-gray-700">
                How much time do you have?
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3 mb-8">
              <button
                onClick={() => setSelectedDuration('30s')}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  selectedDuration === '30s'
                    ? 'border-green-400'
                    : 'border-transparent bg-gray-50 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: selectedDuration === '30s' ? '#F0F5ED' : undefined,
                  borderColor: selectedDuration === '30s' ? '#7A9B6E' : undefined
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">Quick Check</p>
                    <p className="text-sm text-gray-500">30 seconds</p>
                  </div>
                  <Sparkles className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Perfect for between tasks
                </p>
              </button>

              <button
                onClick={() => setSelectedDuration('1m')}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  selectedDuration === '1m'
                    ? 'border-green-400'
                    : 'border-transparent bg-gray-50 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: selectedDuration === '1m' ? '#F0F5ED' : undefined,
                  borderColor: selectedDuration === '1m' ? '#7A9B6E' : undefined
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">Regular Check-In</p>
                    <p className="text-sm text-gray-500">1 minute</p>
                  </div>
                  <Heart className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  A full body scan
                </p>
              </button>

              <button
                onClick={() => setSelectedDuration('2m')}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  selectedDuration === '2m'
                    ? 'border-green-400'
                    : 'border-transparent bg-gray-50 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: selectedDuration === '2m' ? '#F0F5ED' : undefined,
                  borderColor: selectedDuration === '2m' ? '#7A9B6E' : undefined
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">Deep Reset</p>
                    <p className="text-sm text-gray-500">2 minutes</p>
                  </div>
                  <Heart className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  When you really need it
                </p>
              </button>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all"
              style={{ backgroundColor: '#5C7F4F' }}
            >
              Start Check-In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Practice phase
  if (phase === 'practice') {
    const progress = (timeElapsed / getDurationSeconds()) * 100;
    const step = checkInSteps[currentStep];
    
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-lg w-full bg-white shadow-sm">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500">
                {formatTime(timeElapsed)} / {formatTime(getDurationSeconds())}
              </p>
              <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
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

            {/* Current step */}
            <div className="text-center mb-8">
              <h3 className="text-xl font-normal text-gray-700 mb-2">
                {step.title}
              </h3>
              <p className="text-sm mb-6" style={{ color: '#5C7F4F' }}>
                {step.subtitle}
              </p>
              
              <div className="space-y-3 p-4 rounded-xl" style={{ backgroundColor: '#F0F5ED' }}>
                {step.guidance.map((text, index) => (
                  <p key={index} className="text-gray-700">
                    {text}
                  </p>
                ))}
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {checkInSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full transition-all ${
                    index === currentStep ? '' : index < currentStep ? '' : 'bg-gray-300'
                  }`}
                  style={{
                    backgroundColor: index <= currentStep ? '#7A9B6E' : undefined
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleNextStep}
              className="w-full py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: '#5C7F4F' }}
            >
              {currentStep === checkInSteps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < checkInSteps.length - 1 && <ChevronRight className="w-5 h-5" />}
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
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <h2 className="text-xl font-normal text-gray-700 mb-2">
            How's your body feeling now?
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Let's see what you noticed
          </p>

          {/* Tension Level */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Tension Level</p>
            <div className="flex gap-2">
              {[
                { value: 'tight', label: 'Still tight' },
                { value: 'okay', label: 'Okay' },
                { value: 'relaxed', label: 'More relaxed' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setTensionLevel(option.value as TensionLevel)}
                  className={`flex-1 py-2.5 px-3 rounded-xl transition-all text-sm font-medium ${
                    tensionLevel === option.value
                      ? 'text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: tensionLevel === option.value ? '#5C7F4F' : undefined,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              Any awareness is progress
            </p>
          </div>

          {/* Energy Level */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Energy Level</p>
            <div className="flex gap-2">
              {[
                { value: 'tired', label: 'Tired' },
                { value: 'okay', label: 'Okay' },
                { value: 'energized', label: 'Energized' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setEnergyLevel(option.value as EnergyLevel)}
                  className={`flex-1 py-2.5 px-3 rounded-xl transition-all text-sm font-medium ${
                    energyLevel === option.value
                      ? 'text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: energyLevel === option.value ? '#5C7F4F' : undefined,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              Your body is honest with you
            </p>
          </div>

          {/* Comfort Level */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Overall Comfort</p>
            <div className="flex gap-2">
              {[
                { value: 'uncomfortable', label: 'Uncomfortable' },
                { value: 'okay', label: 'Okay' },
                { value: 'comfortable', label: 'Comfortable' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setComfortLevel(option.value as ComfortLevel)}
                  className={`flex-1 py-2.5 px-3 rounded-xl transition-all text-sm font-medium ${
                    comfortLevel === option.value
                      ? 'text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: comfortLevel === option.value ? '#5C7F4F' : undefined,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              Every check-in helps
            </p>
          </div>

          {/* Where tension was noticed */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Where did you notice something?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Head or jaw',
                'Shoulders',
                'Back',
                'Hands',
                'Chest',
                'Feeling good'
              ].map(area => (
                <button
                  key={area}
                  onClick={() => {
                    if (area === 'Feeling good') {
                      setTensionAreas(['Feeling good']);
                    } else if (tensionAreas.includes(area)) {
                      setTensionAreas(tensionAreas.filter(a => a !== area));
                    } else {
                      setTensionAreas([...tensionAreas.filter(a => a !== 'Feeling good'), area]);
                    }
                  }}
                  className={`p-2.5 rounded-xl text-center transition-all text-sm font-medium ${
                    tensionAreas.includes(area)
                      ? 'text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: tensionAreas.includes(area) ? '#7A9B6E' : undefined,
                    gridColumn: area === 'Feeling good' ? 'span 2' : undefined
                  }}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Encouraging message */}
          <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#F0F5ED' }}>
            <p className="text-sm text-gray-700">
              You took time to check in with yourself. That's self-care in action. 
              {tensionAreas.length > 0 && tensionAreas[0] !== 'Feeling good' && 
                " Your body's just telling you what it needs."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all"
              style={{ backgroundColor: '#5C7F4F' }}
            >
              Save Check-In
            </button>
            <button
              onClick={handleCheckInAgain}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
            >
              Check Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};