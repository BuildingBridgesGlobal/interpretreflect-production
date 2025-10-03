import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause } from 'lucide-react';

interface BodyAwarenessJourneyProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

type ResetDuration = '30s' | '1m' | '2m' | '3m';

export const BodyAwarenessJourneyAccessible: React.FC<BodyAwarenessJourneyProps> = ({ onClose, onComplete }) => {
  const [phase, setPhase] = useState<'setup' | 'practice' | 'reflection'>('setup');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState<ResetDuration>('1m');
  const [currentArea, setCurrentArea] = useState('Head and face');
  
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
            '30s': 30,
            '1m': 60,
            '2m': 120,
            '3m': 180
          }[selectedDuration];
          
          // Update current body area
          const progress = next / durationSeconds;
          if (progress < 0.2) {
            setCurrentArea('Head and face');
          } else if (progress < 0.4) {
            setCurrentArea('Shoulders');
          } else if (progress < 0.6) {
            setCurrentArea('Chest');
          } else if (progress < 0.8) {
            setCurrentArea('Belly');
          } else {
            setCurrentArea('Legs');
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
                  Body Awareness Journey
                </h1>
                <p className="text-gray-600">
                  Check in with your body
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
                {['30s', '1m', '2m', '3m'].map(duration => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration as ResetDuration)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedDuration === duration
                        ? 'bg-blue-600 text-white'
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

            {/* Journey path */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3 text-gray-700">Move through your body:</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="px-3 py-1 bg-blue-100 rounded-lg">Head and face</span>
                <span>→</span>
                <span className="px-3 py-1 bg-blue-100 rounded-lg">Shoulders</span>
                <span>→</span>
                <span className="px-3 py-1 bg-blue-100 rounded-lg">Chest</span>
                <span>→</span>
                <span className="px-3 py-1 bg-blue-100 rounded-lg">Belly</span>
                <span>→</span>
                <span className="px-3 py-1 bg-blue-100 rounded-lg">Legs</span>
              </div>
            </div>

            {/* Your choice */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3 text-gray-700">Your choice:</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Adjust what needs adjusting</li>
                <li>• Just notice without changing</li>
                <li>• Breathe into each area</li>
                <li>• Soften where you can</li>
              </ul>
            </div>

            {/* Tip */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-700">
                <strong>Tip:</strong> Your body holds the day's work. Checking in helps you release it.
              </p>
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
            >
              Begin Journey
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
              <h2 className="text-xl font-bold text-gray-900">Your Journey</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

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
                  className="h-full bg-blue-600 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Current area */}
            <div className="text-center mb-8">
              <p className="text-sm text-gray-600 mb-2">Now focusing on:</p>
              <p className="text-2xl font-medium text-blue-600">{currentArea}</p>
            </div>

            {/* Guidance */}
            <div className="text-center space-y-3 mb-8">
              <p className="text-gray-700">Check your {currentArea.toLowerCase()}.</p>
              <p className="text-gray-700">How does it feel?</p>
            </div>

            <p className="text-center text-blue-600 font-medium mb-8">
              Take your time.
            </p>

            {/* Controls */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
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
            <h2 className="text-xl font-bold text-gray-900">How's your body?</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Feeling */}
          <div className="mb-6">
            <p className="text-gray-700 mb-3">Feeling more aware?</p>
            <div className="flex gap-3">
              {['Yes', 'A bit', 'Same'].map(option => (
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
            <p className="text-gray-700 mb-3">What felt good?</p>
            <div className="space-y-2">
              {['Noticing', 'Breathing', 'Adjusting'].map(option => (
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
            <p className="text-gray-700 mb-3">Next time?</p>
            <div className="space-y-2">
              {['Same is good', 'Try longer', 'Focus on one area'].map(option => (
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
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};