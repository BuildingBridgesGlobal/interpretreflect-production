import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Shield, Heart, Clock, CheckCircle } from 'lucide-react';

interface ProfessionalBoundariesResetProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

type ResetDuration = '30s' | '90s' | '3m' | '5m';

export const ProfessionalBoundariesResetAccessible: React.FC<ProfessionalBoundariesResetProps> = ({ onClose, onComplete }) => {
  const [phase, setPhase] = useState<'setup' | 'practice' | 'reflection'>('setup');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState<ResetDuration>('90s');
  
  // Reflection states
  const [feelingBetter, setFeelingBetter] = useState('');
  const [whatHelped, setWhatHelped] = useState('');
  const [needSupport, setNeedSupport] = useState('');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<HTMLDivElement>(null);

  // Timer effect
  useEffect(() => {
    if (isPlaying && phase === 'practice') {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const next = prev + 1;
          const durationSeconds = {
            '30s': 30,
            '90s': 90,
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
  }, [isPlaying, phase, selectedDuration]);

  const handleStart = () => {
    setPhase('practice');
    setIsPlaying(true);
    setTimeElapsed(0);
  };

  const handleComplete = () => {
    setIsPlaying(false);
    setPhase('reflection');
  };

  const handleSubmit = () => {
    const data = {
      feelingBetter,
      whatHelped,
      needSupport,
      duration: timeElapsed,
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
    return { '30s': 30, '90s': 90, '3m': 180, '5m': 300 }[selectedDuration];
  };

  // Setup phase
  if (phase === 'setup') {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
        <section 
          aria-labelledby="boundary-reset-title" 
          className="rounded-3xl max-w-2xl w-full bg-white shadow-sm"
          lang="en"
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: '#F0F5ED' }}>
                  <Shield className="w-6 h-6" style={{ color: '#5C7F4F' }} />
                </div>
                <div>
                  <h2 id="boundary-reset-title" className="text-xl font-normal" style={{ color: '#2D3748' }}>
                    Professional Boundaries Reset
                  </h2>
                  <p className="text-sm" style={{ color: '#4A5568' }}>
                    Step back after difficult content
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                }}
                aria-label="Close professional boundaries reset"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Reset Steps */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
                We'll work through these steps:
              </h3>
              <ol className="space-y-3" role="list">
                <li className="p-3 rounded-xl flex items-start gap-3" style={{ backgroundColor: '#F0F5ED' }}>
                  <span 
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: '#7A9B6E' }}
                    aria-hidden="true"
                  >
                    1
                  </span>
                  <div className="flex-1">
                    <h4 className="font-medium" style={{ color: '#2D3748' }}>Ground Yourself</h4>
                    <p className="text-sm mt-1" style={{ color: '#4A5568' }}>
                      Touch your desk, feel your feet. Find a point of contact with the present moment.
                    </p>
                  </div>
                </li>
                <li className="p-3 rounded-xl flex items-start gap-3" style={{ backgroundColor: '#F0F5ED' }}>
                  <span 
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: '#7A9B6E' }}
                    aria-hidden="true"
                  >
                    2
                  </span>
                  <div className="flex-1">
                    <h4 className="font-medium" style={{ color: '#2D3748' }}>Remember Your Role</h4>
                    <p className="text-sm mt-1" style={{ color: '#4A5568' }}>
                      "I interpreted professionally." Remind yourself of your purpose.
                    </p>
                  </div>
                </li>
                <li className="p-3 rounded-xl flex items-start gap-3" style={{ backgroundColor: '#F0F5ED' }}>
                  <span 
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: '#7A9B6E' }}
                    aria-hidden="true"
                  >
                    3
                  </span>
                  <div className="flex-1">
                    <h4 className="font-medium" style={{ color: '#2D3748' }}>Come Back to Now</h4>
                    <p className="text-sm mt-1" style={{ color: '#4A5568' }}>
                      Notice where you are, right now. Look around the room.
                    </p>
                  </div>
                </li>
                <li className="p-3 rounded-xl flex items-start gap-3" style={{ backgroundColor: '#F0F5ED' }}>
                  <span 
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: '#7A9B6E' }}
                    aria-hidden="true"
                  >
                    4
                  </span>
                  <div className="flex-1">
                    <h4 className="font-medium" style={{ color: '#2D3748' }}>Take Pride</h4>
                    <p className="text-sm mt-1" style={{ color: '#4A5568' }}>
                      You helped communication happen. That matters.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Remember */}
            <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#F5F9F3' }}>
              <p className="text-sm" style={{ color: '#2D3748' }}>
                <strong>Remember:</strong> Feeling affected is human. This helps you continue serving well.
              </p>
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              className="w-full py-4 min-h-[56px] text-white rounded-xl font-medium text-lg hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                focusRingColor: '#5C7F4F'
              }}
              aria-label="Begin professional boundaries reset process"
            >
              Begin Reset
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Practice phase
  if (phase === 'practice') {
    const progress = (timeElapsed / getDurationSeconds()) * 100;
    
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
        <section 
          aria-labelledby="reset-practice-title" 
          className="rounded-3xl max-w-lg w-full bg-white shadow-sm"
          lang="en"
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 id="reset-practice-title" className="text-xl font-normal" style={{ color: '#2D3748' }}>
                Let's Step Back
              </h2>
              <button 
                onClick={onClose} 
                className="p-2 rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                }}
                aria-label="Close reset practice"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <p className="text-center mb-8" style={{ color: '#4A5568' }}>
              {getDurationSeconds() === 30 ? '30 seconds' : 
               getDurationSeconds() === 90 ? '90 seconds' :
               getDurationSeconds() === 180 ? '3 minutes' : '5 minutes'} to reset
            </p>

            {/* Timer display */}
            <div 
              ref={timerRef}
              className="text-center mb-8"
              role="timer"
              aria-live="polite"
              aria-atomic="true"
              aria-label={`Timer: ${formatTime(timeElapsed)} of ${formatTime(getDurationSeconds())}`}
            >
              <p className="text-3xl font-light" style={{ color: '#2D3748' }}>
                {formatTime(timeElapsed)} / {formatTime(getDurationSeconds())}
              </p>
            </div>

            {/* Progress bar */}
            <div 
              className="mb-8"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Reset progress"
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

            {/* Step-by-step Guidance */}
            <div className="mb-8">
              <ol className="space-y-3" role="list" aria-label="Reset steps in progress">
                <li className="p-3 rounded-xl text-left" style={{ backgroundColor: '#F0F5ED' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium" style={{ color: '#5C7F4F' }}>Step 1</span>
                  </div>
                  <p className="text-sm" style={{ color: '#2D3748' }}>
                    Touch something solid - your desk, chair, or floor
                  </p>
                </li>
                <li className="p-3 rounded-xl text-left" style={{ backgroundColor: '#F0F5ED' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium" style={{ color: '#5C7F4F' }}>Step 2</span>
                  </div>
                  <p className="text-sm" style={{ color: '#2D3748' }}>
                    Remember: "I interpreted professionally"
                  </p>
                </li>
                <li className="p-3 rounded-xl text-left" style={{ backgroundColor: '#F0F5ED' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium" style={{ color: '#5C7F4F' }}>Step 3</span>
                  </div>
                  <p className="text-sm" style={{ color: '#2D3748' }}>
                    Look around - notice where you are right now
                  </p>
                </li>
                <li className="p-3 rounded-xl text-left" style={{ backgroundColor: '#F0F5ED' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium" style={{ color: '#5C7F4F' }}>Step 4</span>
                  </div>
                  <p className="text-sm" style={{ color: '#2D3748' }}>
                    Feel proud - you helped communication happen
                  </p>
                </li>
              </ol>
            </div>

            <p className="text-center font-medium mb-8" style={{ color: '#5C7F4F' }}>
              You're safe here.
            </p>

            {/* Controls */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 py-3 min-h-[48px] text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                  focusRingColor: '#5C7F4F'
                }}
                aria-label={isPlaying ? 'Pause timer' : 'Resume timer'}
              >
                {isPlaying ? <Pause className="w-5 h-5" aria-hidden="true" /> : <Play className="w-5 h-5" aria-hidden="true" />}
                <span>{isPlaying ? 'Pause' : 'Resume'}</span>
              </button>
              <button
                onClick={handleComplete}
                className="px-6 py-3 min-h-[48px] rounded-xl font-medium transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  backgroundColor: '#F0F5ED',
                  color: '#2D3748',
                  focusRingColor: '#5C7F4F'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F0F5ED'}
                aria-label="Skip to reflection phase"
              >
                Skip
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Reflection phase
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
      <section 
        aria-labelledby="reset-reflection-title" 
        className="rounded-3xl max-w-lg w-full bg-white shadow-sm"
        lang="en"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 id="reset-reflection-title" className="text-xl font-normal" style={{ color: '#2D3748' }}>
              How are you feeling now?
            </h2>
            <button 
              onClick={onClose} 
              className="p-2 rounded-xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
              }}
              aria-label="Close reflection"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Feeling better */}
          <fieldset className="mb-6">
            <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
              Feeling more separated from it?
            </legend>
            <div className="flex gap-2" role="radiogroup">
              {['Yes', 'A bit', 'Not yet'].map(option => (
                <button
                  key={option}
                  onClick={() => setFeelingBetter(option)}
                  className={`flex-1 py-2.5 px-3 rounded-xl transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    feelingBetter === option
                      ? 'text-white'
                      : ''
                  }`}
                  style={{
                    background: feelingBetter === option ? 'linear-gradient(135deg, #1b5e20, #2e7d32)' : undefined,
                    backgroundColor: feelingBetter === option ? undefined : '#F0F5ED',
                    color: feelingBetter === option ? 'white' : '#4A5568',
                    focusRingColor: '#5C7F4F'
                  }}
                  onMouseEnter={(e) => {
                    if (feelingBetter !== option) {
                      e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (feelingBetter !== option) {
                      e.currentTarget.style.backgroundColor = '#F0F5ED';
                    }
                  }}
                  role="radio"
                  aria-checked={feelingBetter === option}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          {/* What helped */}
          <fieldset className="mb-6">
            <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
              What helped most?
            </legend>
            <div className="grid grid-cols-3 gap-2" role="radiogroup">
              {['Grounding', 'Role reminder', 'Taking time'].map(option => (
                <button
                  key={option}
                  onClick={() => setWhatHelped(option)}
                  className={`py-2.5 px-3 rounded-xl transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    whatHelped === option
                      ? 'text-white'
                      : ''
                  }`}
                  style={{
                    background: whatHelped === option ? 'linear-gradient(135deg, #1b5e20, #2e7d32)' : undefined,
                    backgroundColor: whatHelped === option ? undefined : '#F0F5ED',
                    color: whatHelped === option ? 'white' : '#4A5568',
                    focusRingColor: '#5C7F4F'
                  }}
                  onMouseEnter={(e) => {
                    if (whatHelped !== option) {
                      e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (whatHelped !== option) {
                      e.currentTarget.style.backgroundColor = '#F0F5ED';
                    }
                  }}
                  role="radio"
                  aria-checked={whatHelped === option}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Support need */}
          <fieldset className="mb-8">
            <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
              Need more support?
            </legend>
            <div className="flex gap-2" role="radiogroup">
              {["I'm good", 'Maybe later', 'Yes, please'].map(option => (
                <button
                  key={option}
                  onClick={() => setNeedSupport(option)}
                  className={`flex-1 py-2.5 px-3 rounded-xl transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    needSupport === option
                      ? 'text-white'
                      : ''
                  }`}
                  style={{
                    background: needSupport === option ? 'linear-gradient(135deg, #1b5e20, #2e7d32)' : undefined,
                    backgroundColor: needSupport === option ? undefined : '#F0F5ED',
                    color: needSupport === option ? 'white' : '#4A5568',
                    focusRingColor: '#5C7F4F'
                  }}
                  onMouseEnter={(e) => {
                    if (needSupport !== option) {
                      e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (needSupport !== option) {
                      e.currentTarget.style.backgroundColor = '#F0F5ED';
                    }
                  }}
                  role="radio"
                  aria-checked={needSupport === option}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          {needSupport === 'Yes, please' && (
            <div 
              className="mb-6 p-4 rounded-xl"
              style={{ backgroundColor: '#F0F5ED' }}
              role="region"
              aria-label="Support options"
            >
              <p className="text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                Support options:
              </p>
              <ul className="text-sm space-y-1" style={{ color: '#4A5568' }}>
                <li>• Talk to a colleague</li>
                <li>• Contact your supervisor</li>
                <li>• Take a longer break</li>
                <li>• Access EAP resources</li>
              </ul>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
              focusRingColor: '#5C7F4F'
            }}
            aria-label="Complete reset and close"
          >
            Done
          </button>
        </div>
      </section>
    </div>
  );
};
// Export alias for compatibility
export const ProfessionalBoundariesReset = ProfessionalBoundariesResetAccessible;
