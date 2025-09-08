import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, ChevronRight, Heart, AlertCircle } from 'lucide-react';

interface ProfessionalBoundariesResetProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

type ResetDuration = '30s' | '90s' | '3m' | '5m';
type SupportNeed = 'ready' | 'longer-break' | 'peer-support' | 'supervision' | 'end-day';

interface ResetData {
  emotionalDistance: number;
  professionalClarity: number;
  readiness: number;
  helpfulMethod: string;
  supportNeed: SupportNeed;
  professionalReflection: string;
  contentImpact: string;
  duration: number;
  timestamp: string;
}

export const ProfessionalBoundariesReset: React.FC<ProfessionalBoundariesResetProps> = ({ onClose, onComplete }) => {
  // Core states
  const [phase, setPhase] = useState<'setup' | 'practice' | 'reflection' | 'support'>('setup');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState<ResetDuration>('90s');
  const [currentFocus, setCurrentFocus] = useState('Acknowledging Impact');
  const [currentMessage, setCurrentMessage] = useState('What you interpreted matters, and so do you');
  
  // Reflection states
  const [emotionalDistance, setEmotionalDistance] = useState(5);
  const [professionalClarity, setProfessionalClarity] = useState(5);
  const [readiness, setReadiness] = useState(5);
  const [helpfulMethod, setHelpfulMethod] = useState('');
  const [supportNeed, setSupportNeed] = useState<SupportNeed>('ready');
  const [professionalReflection, setProfessionalReflection] = useState('');
  const [contentImpact, setContentImpact] = useState('');
  const [logReset, setLogReset] = useState(false);
  const [connectSupport, setConnectSupport] = useState(false);
  const [saveStrategy, setSaveStrategy] = useState(false);
  const [shareAnonymous, setShareAnonymous] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load preferences
  useEffect(() => {
    const saved = localStorage.getItem('professionalBoundariesPrefs');
    if (saved) {
      const prefs = JSON.parse(saved);
      setSelectedDuration(prefs.duration || '90s');
    }
  }, []);

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
          
          // Update focus message based on progress
          const progress = next / durationSeconds;
          if (progress < 0.2) {
            setCurrentFocus('Acknowledging Impact');
            setCurrentMessage('What you interpreted matters, and so do you');
          } else if (progress < 0.4) {
            setCurrentFocus('Physical Grounding');
            setCurrentMessage('Connect with something solid near you');
          } else if (progress < 0.6) {
            setCurrentFocus('Role Clarity');
            setCurrentMessage('You facilitated communication professionally');
          } else if (progress < 0.8) {
            setCurrentFocus('Returning to Present');
            setCurrentMessage('Notice your immediate surroundings');
          } else {
            setCurrentFocus('Professional Pride');
            setCurrentMessage('Your service mattered');
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

  const resetOptions = [
    {
      title: 'Physical Grounding',
      description: 'Touch your desk, feel your feet on the floor'
    },
    {
      title: 'Identity Return',
      description: 'Remember who you are beyond this moment'
    },
    {
      title: 'Present Moment',
      description: 'Notice three things in your immediate space'
    },
    {
      title: 'Professional Pride',
      description: 'Acknowledge the service you just provided'
    },
    {
      title: 'Natural Transition',
      description: 'Your personal completion gesture or breath'
    }
  ];

  const stepByStepPath = [
    { step: 1, title: 'Anchor', time: '10 seconds', action: 'Connect with something solid near you' },
    { step: 2, title: 'Clarify', time: '20 seconds', action: '"I facilitated communication professionally"' },
    { step: 3, title: 'Ground', time: '30 seconds', action: 'Return to your surroundings' },
    { step: 4, title: 'Acknowledge', time: '20 seconds', action: '"I served with skill and boundaries"' },
    { step: 5, title: 'Complete', time: '10 seconds', action: 'Take three settling breaths' }
  ];

  const handleStart = () => {
    setPhase('practice');
    setIsPlaying(true);
    setTimeElapsed(0);
  };

  const handlePause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleComplete = () => {
    setIsPlaying(false);
    setPhase('reflection');
  };

  const handleNeedSupport = () => {
    setPhase('support');
  };

  const handleSubmit = () => {
    const data: ResetData = {
      emotionalDistance,
      professionalClarity,
      readiness,
      helpfulMethod,
      supportNeed,
      professionalReflection,
      contentImpact,
      duration: timeElapsed,
      timestamp: new Date().toISOString()
    };
    
    // Check for concerning content that needs flagging
    const concerningKeywords = ['trauma', 'suicide', 'abuse', 'violence', 'death', 'assault'];
    const needsSupport = concerningKeywords.some(keyword => 
      contentImpact.toLowerCase().includes(keyword)
    );
    
    if (needsSupport && !connectSupport) {
      console.warn('Content impact may need support attention:', contentImpact);
      // In production, this would trigger appropriate support systems
    }
    
    if (saveStrategy) {
      localStorage.setItem('professionalBoundariesPrefs', JSON.stringify({
        duration: selectedDuration,
        preferredMethod: helpfulMethod
      }));
    }
    
    if (logReset) {
      const sessions = JSON.parse(localStorage.getItem('boundariesSessions') || '[]');
      sessions.push(data);
      localStorage.setItem('boundariesSessions', JSON.stringify(sessions));
    }
    
    if (onComplete) onComplete(data);
    onClose();
  };

  const getDurationSeconds = () => {
    return {
      '30s': 30,
      '90s': 90,
      '3m': 180,
      '5m': 300
    }[selectedDuration];
  };

  const getProgress = () => {
    return Math.min((timeElapsed / getDurationSeconds()) * 100, 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (duration: ResetDuration) => {
    return {
      '30s': '0:30',
      '90s': '1:30',
      '3m': '3:00',
      '5m': '5:00'
    }[duration];
  };

  // Setup phase
  if (phase === 'setup') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-rose-50 to-orange-50">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                  Professional Boundaries Reset
                </h1>
                <p className="text-lg text-gray-600">
                  Return to your center after difficult content
                </p>
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

            {/* Duration selection */}
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-4 text-gray-700">
                How long do you need?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: '30s' as ResetDuration, label: '30 seconds', desc: 'Quick reset' },
                  { id: '90s' as ResetDuration, label: '90 seconds', desc: 'Standard process' },
                  { id: '3m' as ResetDuration, label: '3 minutes', desc: 'Deep restoration' },
                  { id: '5m' as ResetDuration, label: '5 minutes', desc: 'Extended care' }
                ].map(duration => (
                  <button
                    key={duration.id}
                    onClick={() => setSelectedDuration(duration.id)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all ${
                      selectedDuration === duration.id
                        ? 'bg-white border-rose-400 shadow-lg'
                        : 'bg-white/50 border-transparent hover:bg-white/70'
                    }`}
                  >
                    <div className="font-semibold text-gray-800">{duration.label}</div>
                    <div className="text-sm mt-1 text-gray-600">• {duration.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Options */}
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-2 text-gray-700">
                Your Reset Options:
              </h2>
              <p className="text-gray-600 mb-4">Find what brings you back to center</p>
              
              <div className="space-y-3">
                {resetOptions.map((option, index) => (
                  <div key={index} className="bg-white/70 rounded-2xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-1">{option.title}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Path */}
            <div className="mb-8 bg-white/70 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-3">
                Step-by-Step Path: (if you prefer structure)
              </h3>
              <div className="space-y-3">
                {stepByStepPath.map((item) => (
                  <div key={item.step} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-rose-200 rounded-full flex items-center justify-center text-sm font-semibold text-rose-800">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-gray-800">{item.title}</span>
                        <span className="text-sm text-gray-500">({item.time})</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why this supports you */}
            <div className="mb-8 p-6 bg-gradient-to-r from-rose-100 to-orange-100 rounded-2xl">
              <h3 className="font-semibold mb-2 text-gray-900">
                Why This Supports You:
              </h3>
              <p className="text-gray-700">
                Intense content activates your mirror neurons as if you're experiencing it yourself. 
                This reset helps your prefrontal cortex restore professional boundaries.
              </p>
            </div>

            {/* Quick versions */}
            <div className="mb-8 bg-white/70 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Quick 30-Second Version:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Touch something solid (5 seconds)</li>
                <li>• "I held space professionally" (5 seconds)</li>
                <li>• Look at three things around you (10 seconds)</li>
                <li>• "My service mattered" (5 seconds)</li>
                <li>• Three deep breaths (5 seconds)</li>
              </ul>
            </div>

            {/* Different settings */}
            <div className="mb-8 bg-amber-50 rounded-2xl p-5">
              <h3 className="font-semibold mb-3 text-amber-900">For Different Settings:</h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li>• <strong>Private space:</strong> Use full process with voice</li>
                <li>• <strong>Team setting:</strong> Silent internal process</li>
                <li>• <strong>Public space:</strong> Brief, subtle version</li>
                <li>• <strong>Remote/VRI:</strong> Step away from screen if possible</li>
              </ul>
            </div>

            {/* Remember */}
            <div className="mb-8 p-5 bg-green-50 rounded-2xl">
              <h3 className="font-semibold mb-3 text-green-900">Remember:</h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• Feeling affected shows your humanity</li>
                <li>• Professional boundaries protect everyone</li>
                <li>• This is occupational health maintenance</li>
                <li>• You witnessed without absorbing</li>
                <li>• Your wellbeing serves your community</li>
              </ul>
            </div>

            {/* Progress indicator */}
            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-2">Progress:</p>
              <div className="flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-full rounded-full ${
                      i === 3 ? 'bg-rose-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleStart}
                className="flex-1 py-4 text-white rounded-2xl font-semibold text-lg transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                  focusRingColor: '#5C7F4F'
                }}
              >
                Begin Reset
              </button>
              <button
                onClick={handleNeedSupport}
                className="px-6 py-4 rounded-2xl font-medium text-gray-700 transition-all hover:shadow-md"
                style={{ 
                  backgroundColor: '#F0F5ED'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F0F5ED'}
              >
                I Need More Support
              </button>
              <button
                onClick={onClose}
                className="px-6 py-4 rounded-2xl font-medium text-gray-700 transition-all hover:shadow-md"
                style={{ 
                  backgroundColor: '#F0F5ED'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F0F5ED'}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Practice phase
  if (phase === 'practice') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-rose-50 to-orange-50">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Current Focus:
              </h2>
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

            {/* Main focus area */}
            <div className="mb-8 p-12 bg-gradient-to-r from-rose-600 to-orange-600 rounded-3xl text-center text-white">
              <h3 className="text-3xl font-light mb-4">{currentFocus}</h3>
              <p className="text-xl opacity-90">{currentMessage}</p>
            </div>

            {/* Circular progress indicator */}
            <div className="mb-8 flex justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="rgba(209, 213, 219, 0.5)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - getProgress() / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#dc2626" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-gray-800">
                    {Math.round(getProgress())}%
                  </span>
                </div>
              </div>
            </div>

            {/* Timer display */}
            <div className="mb-8 text-center">
              <p className="text-lg text-gray-600">
                Timer: {formatTime(timeElapsed)} / {formatDuration(selectedDuration)}
              </p>
            </div>

            {/* Your Reset Options reminder */}
            <div className="mb-8 p-6 bg-white/70 rounded-2xl">
              <h3 className="font-semibold mb-3 text-gray-800">Your Reset Options:</h3>
              <p className="text-gray-600 mb-4">Find what brings you back to center</p>
              <div className="grid grid-cols-2 gap-3">
                {resetOptions.slice(0, 4).map((option, index) => (
                  <div key={index} className="p-3 bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl">
                    <p className="font-medium text-sm text-gray-700">{option.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3">
              <button
                onClick={handlePause}
                className="px-8 py-3 text-white rounded-xl font-medium transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2"
                style={{ 
                  background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                  focusRingColor: '#5C7F4F'
                }}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {isPlaying ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={handleComplete}
                className="px-8 py-3 rounded-xl font-medium text-gray-700 transition-all hover:shadow-md"
                style={{ 
                  backgroundColor: '#F0F5ED'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F0F5ED'}
              >
                Complete Early
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Support phase
  if (phase === 'support') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-rose-50 to-orange-50">
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Your Support Options
              </h2>
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

            {/* Immediate support */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Immediate:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button className="p-5 bg-white rounded-2xl text-left hover:shadow-lg transition-all">
                  <h4 className="font-semibold text-gray-800 mb-2">Extended reset practice</h4>
                  <p className="text-sm text-gray-600 mb-3">Take 5 more minutes to fully reset</p>
                  <span className="text-rose-600 font-medium">Start →</span>
                </button>
                
                <button className="p-5 bg-white rounded-2xl text-left hover:shadow-lg transition-all">
                  <h4 className="font-semibold text-gray-800 mb-2">Peer support contact</h4>
                  <p className="text-sm text-gray-600 mb-3">Connect with a colleague who understands</p>
                  <span className="text-rose-600 font-medium">Connect →</span>
                </button>
                
                <button className="p-5 bg-white rounded-2xl text-left hover:shadow-lg transition-all">
                  <h4 className="font-semibold text-gray-800 mb-2">Supervisor check-in</h4>
                  <p className="text-sm text-gray-600 mb-3">Schedule time with your supervisor</p>
                  <span className="text-rose-600 font-medium">Schedule →</span>
                </button>
                
                <button className="p-5 bg-white rounded-2xl text-left hover:shadow-lg transition-all">
                  <h4 className="font-semibold text-gray-800 mb-2">EAP resources</h4>
                  <p className="text-sm text-gray-600 mb-3">Access employee assistance program</p>
                  <span className="text-rose-600 font-medium">Access →</span>
                </button>
              </div>
            </div>

            {/* For later */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">For Later:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 bg-amber-50 rounded-2xl">
                  <h4 className="font-medium text-amber-900 mb-2">Schedule debrief session</h4>
                  <p className="text-sm text-amber-800">Process today's content with support</p>
                </div>
                
                <div className="p-5 bg-amber-50 rounded-2xl">
                  <h4 className="font-medium text-amber-900 mb-2">Professional development on boundaries</h4>
                  <p className="text-sm text-amber-800">Strengthen your boundary-setting skills</p>
                </div>
                
                <div className="p-5 bg-amber-50 rounded-2xl">
                  <h4 className="font-medium text-amber-900 mb-2">Team support group</h4>
                  <p className="text-sm text-amber-800">Join others who understand these challenges</p>
                </div>
                
                <div className="p-5 bg-amber-50 rounded-2xl">
                  <h4 className="font-medium text-amber-900 mb-2">Wellness resources library</h4>
                  <p className="text-sm text-amber-800">Access self-care tools and strategies</p>
                </div>
              </div>
            </div>

            {/* Remember message */}
            <div className="mb-8 p-6 bg-gradient-to-r from-rose-100 to-orange-100 rounded-2xl">
              <div className="flex items-start gap-3">
                <Heart className="w-6 h-6 text-rose-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">Remember:</h3>
                  <p className="text-gray-700">
                    Seeking support is professional wisdom, not personal weakness. 
                    Your wellbeing directly impacts your ability to serve others effectively.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setPhase('reflection')}
                className="flex-1 py-3 text-white rounded-xl font-semibold transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                  focusRingColor: '#5C7F4F'
                }}
              >
                Continue to Check-In
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl font-medium text-gray-700 transition-all hover:shadow-md"
                style={{ 
                  backgroundColor: '#F0F5ED'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F0F5ED'}
              >
                Close for Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reflection phase - Post-Practice Check-In
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-2 text-gray-900">
            POST-PRACTICE CHECK-IN
          </h2>
          <p className="mb-4 text-gray-600">
            How separated do you feel from the content?
          </p>
          <p className="mb-8 text-sm text-gray-500">
            Checking your professional boundaries
          </p>

          {/* Readiness scales */}
          <div className="mb-8 space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Emotional distance:</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Absorbed</span>
                  <div className="relative w-48">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={emotionalDistance}
                      onChange={(e) => setEmotionalDistance(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-rose-600 rounded-full pointer-events-none"
                      style={{ left: `${(emotionalDistance - 1) * 11.11}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">Separate</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Professional clarity:</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Shaken</span>
                  <div className="relative w-48">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={professionalClarity}
                      onChange={(e) => setProfessionalClarity(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-rose-600 rounded-full pointer-events-none"
                      style={{ left: `${(professionalClarity - 1) * 11.11}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">Solid</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Readiness:</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Overwhelmed</span>
                  <div className="relative w-48">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={readiness}
                      onChange={(e) => setReadiness(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-rose-600 rounded-full pointer-events-none"
                      style={{ left: `${(readiness - 1) * 11.11}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">Prepared</span>
                </div>
              </div>
            </div>
          </div>

          {/* What helped most */}
          <div className="mb-6">
            <label className="block mb-3 font-medium text-gray-700">
              What helped you most?
            </label>
            <div className="space-y-2">
              {[
                'Physical grounding',
                'Role clarity reminder',
                'Returning to present',
                'Taking dedicated time',
                'Other'
              ].map(method => (
                <label key={method} className="flex items-center">
                  <input
                    type="radio"
                    name="helpfulMethod"
                    value={method}
                    checked={helpfulMethod === method}
                    onChange={(e) => setHelpfulMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{method}</span>
                </label>
              ))}
            </div>
            {helpfulMethod === 'Other' && (
              <input
                type="text"
                placeholder="Please specify..."
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            )}
          </div>

          {/* Support need */}
          <div className="mb-6">
            <label className="block mb-3 font-medium text-gray-700">
              Do you need additional support?
            </label>
            <div className="space-y-2">
              {[
                { value: 'ready' as SupportNeed, label: "I'm ready to continue" },
                { value: 'longer-break' as SupportNeed, label: 'Need a longer break' },
                { value: 'peer-support' as SupportNeed, label: 'Would like peer support' },
                { value: 'supervision' as SupportNeed, label: 'Considering supervision' },
                { value: 'end-day' as SupportNeed, label: 'Ready to end my day' }
              ].map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="supportNeed"
                    value={option.value}
                    checked={supportNeed === option.value}
                    onChange={(e) => setSupportNeed(e.target.value as SupportNeed)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Professional reflection */}
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700">
              Professional reflection: (optional)
            </label>
            <p className="text-sm text-gray-600 mb-2">
              What helped you maintain boundaries during the interpretation?
            </p>
            <textarea
              value={professionalReflection}
              onChange={(e) => setProfessionalReflection(e.target.value)}
              placeholder="Your observations..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              rows={3}
            />
          </div>

          {/* Content impact */}
          <div className="mb-8 p-5 bg-amber-50 rounded-2xl">
            <label className="block mb-2 font-medium text-amber-900">
              Content impact: (private, optional)
            </label>
            <p className="text-sm text-amber-800 mb-3">
              Is anything still sitting with you that needs attention?
            </p>
            <textarea
              value={contentImpact}
              onChange={(e) => setContentImpact(e.target.value)}
              placeholder="This is private and will be flagged for support if concerning keywords are detected..."
              className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={3}
            />
            {contentImpact && (
              <div className="mt-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  If this content mentions trauma, violence, or other difficult topics, 
                  support resources will be suggested.
                </p>
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="mb-8 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={logReset}
                onChange={(e) => setLogReset(e.target.checked)}
                className="mr-3"
              />
              <span className="text-gray-700">Log this reset (tracks exposure)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={connectSupport}
                onChange={(e) => setConnectSupport(e.target.checked)}
                className="mr-3"
              />
              <span className="text-gray-700">Connect with support network</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={saveStrategy}
                onChange={(e) => setSaveStrategy(e.target.checked)}
                className="mr-3"
              />
              <span className="text-gray-700">Save what worked for me</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={shareAnonymous}
                onChange={(e) => setShareAnonymous(e.target.checked)}
                className="mr-3"
              />
              <span className="text-gray-700">Share strategy anonymously with team</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 text-white rounded-xl font-semibold transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                focusRingColor: '#5C7F4F'
              }}
            >
              Complete
            </button>
            <button
              onClick={() => setPhase('support')}
              className="px-6 py-3 rounded-xl font-medium text-gray-700 transition-all hover:shadow-md"
              style={{ 
                backgroundColor: '#F0F5ED'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F0F5ED'}
            >
              Access Support Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};