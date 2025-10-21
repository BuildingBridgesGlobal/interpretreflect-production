import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Eye, Headphones, Monitor, Move } from 'lucide-react';

interface TechnologyFatigueResetProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

type ResetDuration = '20s' | '1m' | '2m' | '3m';

export const TechnologyFatigueReset: React.FC<TechnologyFatigueResetProps> = ({ onClose, onComplete }) => {
  const [phase, setPhase] = useState<'setup' | 'practice' | 'reflection'>('setup');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState<ResetDuration>('1m');
  
  // Reflection states
  const [feelingBetter, setFeelingBetter] = useState('');
  const [whatHelped, setWhatHelped] = useState('');
  const [nextTime, setNextTime] = useState('');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (isPlaying && phase === 'practice') {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const next = prev + 1;
          const durationSeconds = {
            '20s': 20,
            '1m': 60,
            '2m': 120,
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
      nextTime,
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
    return { '20s': 20, '1m': 60, '2m': 120, '3m': 180 }[selectedDuration];
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
                  Technology Fatigue Reset
                </h1>
                <p className="text-gray-600">
                  Relief from screens and headphones
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
                {['20s', '1m', '2m', '3m'].map(duration => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration as ResetDuration)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedDuration === duration
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {duration === '20s' ? '20 sec' : 
                     duration === '1m' ? '1 min' :
                     duration === '2m' ? '2 min' : '3 min'}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Options */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3 text-gray-700">Pick what you need:</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-teal-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-teal-600" />
                    <h3 className="font-medium text-gray-800">Eyes</h3>
                  </div>
                  <p className="text-sm text-gray-600">Look away or soften your gaze</p>
                </div>
                <div className="p-4 bg-cyan-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Headphones className="w-5 h-5 text-cyan-600" />
                    <h3 className="font-medium text-gray-800">Ears</h3>
                  </div>
                  <p className="text-sm text-gray-600">Remove headphones, massage ears</p>
                </div>
                <div className="p-4 bg-[rgba(107,130,104,0.05)] rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Move className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium text-gray-800">Posture</h3>
                  </div>
                  <p className="text-sm text-gray-600">Stand, stretch, or adjust</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-800">Distance</h3>
                  </div>
                  <p className="text-sm text-gray-600">Push screen back a bit</p>
                </div>
              </div>
            </div>

            {/* 20-20-20 rule */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-700">
                <strong>20-20-20 rule:</strong> Every 20 minutes, look 20 feet away for 20 seconds.
              </p>
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              className="w-full py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-all"
            >
              Begin Reset
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Practice phase
  if (phase === 'practice') {
    const progress = (timeElapsed / getDurationSeconds()) * 100;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-lg w-full bg-white">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Tech Break</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-8 text-center">
              Give your senses a rest
            </p>

            {/* Timer display */}
            <div className="text-center mb-8">
              <p className="text-3xl font-light text-gray-800">
                {formatTime(timeElapsed)} / {formatTime(getDurationSeconds())}
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Guidance */}
            <div className="text-center space-y-3 mb-8">
              <p className="text-gray-700">Look away from the screen.</p>
              <p className="text-gray-700">Relax your shoulders.</p>
              <p className="text-gray-700">Give your ears a break.</p>
            </div>

            <p className="text-center text-teal-600 font-medium mb-8">
              Your body needs this.
            </p>

            {/* Controls */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {isPlaying ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={handleComplete}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-all"
              >
                Skip
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
            <h2 className="text-xl font-bold text-gray-900">How do your eyes feel?</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Feeling */}
          <div className="mb-6">
            <p className="text-gray-700 mb-3">Less strained?</p>
            <div className="flex gap-3">
              {['Yes', 'A little', 'Same'].map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="better"
                    value={option}
                    checked={feelingBetter === option}
                    onChange={(e) => setFeelingBetter(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* What helped */}
          <div className="mb-6">
            <p className="text-gray-700 mb-3">What helped most?</p>
            <div className="space-y-2">
              {['Looking away', 'Relaxing posture', 'The break itself'].map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="helped"
                    value={option}
                    checked={whatHelped === option}
                    onChange={(e) => setWhatHelped(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Next time */}
          <div className="mb-8">
            <p className="text-gray-700 mb-3">For next time?</p>
            <div className="space-y-2">
              {['Perfect timing', 'Set reminder', 'Try longer break'].map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="next"
                    value={option}
                    checked={nextTime === option}
                    onChange={(e) => setNextTime(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};