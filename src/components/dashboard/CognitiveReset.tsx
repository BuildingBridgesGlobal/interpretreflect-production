'use client';

import { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, RotateCcw, X } from 'lucide-react';

type BreathingTechnique = 'box' | '478' | 'calm';

const TECHNIQUES = {
  box: {
    name: 'Box Breathing',
    description: 'Navy SEAL technique for stress management',
    phases: [
      { name: 'Inhale', duration: 4 },
      { name: 'Hold', duration: 4 },
      { name: 'Exhale', duration: 4 },
      { name: 'Hold', duration: 4 },
    ],
    totalCycle: 16,
  },
  '478': {
    name: '4-7-8 Breathing',
    description: 'Dr. Andrew Weil\'s relaxation technique',
    phases: [
      { name: 'Inhale', duration: 4 },
      { name: 'Hold', duration: 7 },
      { name: 'Exhale', duration: 8 },
    ],
    totalCycle: 19,
  },
  calm: {
    name: 'Calm Breathing',
    description: 'Simple deep breathing for quick recovery',
    phases: [
      { name: 'Inhale', duration: 5 },
      { name: 'Exhale', duration: 5 },
    ],
    totalCycle: 10,
  },
};

export function CognitiveReset() {
  const [isOpen, setIsOpen] = useState(false);
  const [technique, setTechnique] = useState<BreathingTechnique>('box');
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTechnique = TECHNIQUES[technique];
  const currentPhaseData = currentTechnique.phases[currentPhase];

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Move to next phase
            const nextPhase = (currentPhase + 1) % currentTechnique.phases.length;
            setCurrentPhase(nextPhase);

            // If completed full cycle
            if (nextPhase === 0) {
              setCyclesCompleted(prev => prev + 1);
            }

            return currentTechnique.phases[nextPhase].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeRemaining, currentPhase, currentTechnique]);

  const startExercise = () => {
    setIsActive(true);
    setCurrentPhase(0);
    setTimeRemaining(currentTechnique.phases[0].duration);
    setCyclesCompleted(0);
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const resetExercise = () => {
    setIsActive(false);
    setCurrentPhase(0);
    setTimeRemaining(0);
    setCyclesCompleted(0);
  };

  const getCircleScale = () => {
    const phase = currentPhaseData.name.toLowerCase();
    if (phase.includes('inhale')) return 1.2;
    if (phase.includes('exhale')) return 0.8;
    return 1;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-brand-electric to-brand-energy text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50 group"
      >
        <Wind className="w-6 h-6" />
        <span className="absolute bottom-full right-0 mb-2 bg-brand-primary text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-body">
          Cognitive Reset
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsOpen(false);
            resetExercise();
          }}
          className="absolute top-4 right-4 text-brand-gray-400 hover:text-brand-primary transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-brand-primary mb-2 font-sans">
            Cognitive Reset
          </h2>
          <p className="text-brand-gray-600 font-body">
            Evidence-based breathing exercises for immediate stress relief
          </p>
        </div>

        {/* Technique Selector */}
        {!isActive && timeRemaining === 0 && (
          <div className="mb-8">
            <label className="block text-sm font-semibold text-brand-primary mb-3 font-body">
              Choose a Technique
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(TECHNIQUES) as BreathingTechnique[]).map(key => (
                <button
                  key={key}
                  onClick={() => setTechnique(key)}
                  className={`p-4 rounded-lg text-left transition-all ${
                    technique === key
                      ? 'bg-brand-electric text-white'
                      : 'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'
                  }`}
                >
                  <p className="font-bold text-sm mb-1 font-body">{TECHNIQUES[key].name}</p>
                  <p className="text-xs opacity-90 font-body">{TECHNIQUES[key].description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Breathing Visualization */}
        <div className="flex flex-col items-center justify-center py-12">
          {/* Animated Circle */}
          <div className="relative w-48 h-48 mb-8">
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-electric-light to-brand-energy-light transition-transform duration-1000 ease-in-out"
              style={{
                transform: `scale(${isActive ? getCircleScale() : 1})`,
              }}
            ></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-4xl font-bold text-brand-primary font-mono">
                {timeRemaining || '--'}
              </p>
              <p className="text-lg font-semibold text-brand-gray-600 font-body">
                {currentPhaseData?.name || 'Ready'}
              </p>
            </div>
          </div>

          {/* Cycles Counter */}
          {cyclesCompleted > 0 && (
            <p className="text-brand-gray-600 mb-4 font-body">
              {cyclesCompleted} cycle{cyclesCompleted !== 1 ? 's' : ''} completed
            </p>
          )}

          {/* Controls */}
          <div className="flex gap-4">
            {!isActive && timeRemaining === 0 ? (
              <button
                onClick={startExercise}
                className="flex items-center gap-2 bg-brand-electric text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-primary transition-colors font-body"
              >
                <Play className="w-5 h-5" />
                Start
              </button>
            ) : (
              <>
                <button
                  onClick={isActive ? pauseExercise : startExercise}
                  className="flex items-center gap-2 bg-brand-electric text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-primary transition-colors font-body"
                >
                  {isActive ? (
                    <>
                      <Pause className="w-5 h-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Resume
                    </>
                  )}
                </button>
                <button
                  onClick={resetExercise}
                  className="flex items-center gap-2 bg-brand-gray-200 text-brand-primary px-6 py-3 rounded-lg font-semibold hover:bg-brand-gray-300 transition-colors font-body"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-brand-gray-50 rounded-lg p-4 mt-8">
          <h4 className="font-semibold text-brand-primary mb-2 font-body">How it works:</h4>
          <ul className="text-sm text-brand-gray-600 space-y-1 font-body">
            {currentTechnique.phases.map((phase, i) => (
              <li key={i}>
                <strong>{phase.name}:</strong> {phase.duration} seconds
              </li>
            ))}
          </ul>
          <p className="text-xs text-brand-gray-500 mt-3 font-body italic">
            Tip: Find a comfortable position, close your eyes if possible, and follow the breathing pattern.
          </p>
        </div>
      </div>
    </div>
  );
}
