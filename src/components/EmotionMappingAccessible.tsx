import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, Heart, Brain, Eye, Sparkles } from 'lucide-react';

interface EmotionMappingProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

type PracticeDuration = '1m' | '3m' | '5m';
type PracticeStep = 'body' | 'name' | 'pattern' | 'strategy';

export const EmotionMappingAccessible: React.FC<EmotionMappingProps> = ({ onClose, onComplete }) => {
  const [phase, setPhase] = useState<'setup' | 'practice' | 'reflection'>('setup');
  const [currentStep, setCurrentStep] = useState<PracticeStep>('body');
  const [selectedDuration, setSelectedDuration] = useState<PracticeDuration>('3m');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // Reflection states
  const [feelingClearer, setFeelingClearer] = useState('');
  const [mostHelpful, setMostHelpful] = useState('');
  const [needSupport, setNeedSupport] = useState('');
  const [manualNavigation, setManualNavigation] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);
  
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
            '3m': 180,
            '5m': 300
          }[selectedDuration];
          
          // Auto-advance steps based on duration
          // Only auto-advance if user hasn't manually navigated
          if (!manualNavigation) {
            const stepDuration = Math.floor(durationSeconds / 4); // 4 steps
            const nextStep = Math.floor(next / stepDuration);
            const steps: PracticeStep[] = ['body', 'name', 'pattern', 'strategy'];
            if (nextStep < steps.length && steps[nextStep] !== currentStep) {
              setCurrentStep(steps[nextStep]);
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
  }, [isActive, phase, selectedDuration, currentStep]);

  const handleStart = () => {
    setPhase('practice');
    setIsActive(true);
    setTimeElapsed(0);
    setCurrentStep('body');
    setManualNavigation(false); // Reset manual navigation flag
  };

  const handleContinue = () => {
    setManualNavigation(true); // User has taken control
    const steps: PracticeStep[] = ['body', 'name', 'pattern', 'strategy'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
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
      feelingClearer,
      mostHelpful,
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
    return { '1m': 60, '3m': 180, '5m': 300 }[selectedDuration];
  };

  const getStepContent = () => {
    const steps = {
      body: {
        icon: <Heart className="w-8 h-8" style={{ color: '#5C7F4F' }} />,
        title: 'Body Scan',
        question: 'Where do you notice something in your body?',
        prompts: ['Chest - tightness or openness?', 'Stomach - butterflies or tension?', 'Shoulders - holding or relaxed?', 'Jaw - clenched or soft?'],
        encouragement: 'Just notice, no judgment.'
      },
      name: {
        icon: <Brain className="w-8 h-8" style={{ color: '#5C7F4F' }} />,
        title: 'Name It',
        question: 'What emotion is present?',
        prompts: ['Frustrated', 'Sad or heavy', 'Overwhelmed', 'Angry or irritated', 'Tired or numb', 'Something else entirely'],
        encouragement: "It's okay to feel this."
      },
      pattern: {
        icon: <Eye className="w-8 h-8" style={{ color: '#5C7F4F' }} />,
        title: 'Notice Patterns',
        question: 'What triggered this feeling?',
        prompts: ['Similar to your own experience', 'Against your values', 'The intensity of the content', 'Just accumulation over time'],
        encouragement: 'Understanding helps.'
      },
      strategy: {
        icon: <Sparkles className="w-8 h-8" style={{ color: '#5C7F4F' }} />,
        title: 'Reset Strategy',
        question: 'What helps you regulate?',
        prompts: ['Take some deep breaths', 'Move your body', 'Talk to someone', 'Just acknowledge it'],
        encouragement: 'You know what works for you.'
      }
    };
    return steps[currentStep];
  };

  // Setup phase
  if (phase === 'setup') {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
        <section 
          aria-labelledby="emotion-mapping-title" 
          className="rounded-3xl max-w-2xl w-full bg-white shadow-sm"
          lang="en"
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: '#F0F5ED' }}>
                  <Brain className="w-6 h-6" style={{ color: '#5C7F4F' }} />
                </div>
                <div>
                  <h2 id="emotion-mapping-title" className="text-xl font-normal" style={{ color: '#2D3748' }}>
                    Emotion Mapping
                  </h2>
                  <p className="text-sm" style={{ color: '#4A5568' }}>
                    Understand what you're feeling in response to interpreted content
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                }}
                aria-label="Close emotion mapping"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Check-in steps */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
                We'll walk through these steps together:
              </h3>
              <ol className="space-y-3" role="list">
                <li className="flex items-start gap-3">
                  <span 
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: '#7A9B6E' }}
                    aria-hidden="true"
                  >
                    1
                  </span>
                  <div>
                    <h4 className="font-medium" style={{ color: '#2D3748' }}>Body Scan</h4>
                    <p className="text-sm" style={{ color: '#4A5568' }}>
                      Where do you notice something in your body? (chest, stomach, shoulders, jaw)
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span 
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: '#7A9B6E' }}
                    aria-hidden="true"
                  >
                    2
                  </span>
                  <div>
                    <h4 className="font-medium" style={{ color: '#2D3748' }}>Name It</h4>
                    <p className="text-sm" style={{ color: '#4A5568' }}>
                      What emotion is present? (frustrated, sad, overwhelmed, angry, tired, numb)
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span 
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: '#7A9B6E' }}
                    aria-hidden="true"
                  >
                    3
                  </span>
                  <div>
                    <h4 className="font-medium" style={{ color: '#2D3748' }}>Notice Patterns</h4>
                    <p className="text-sm" style={{ color: '#4A5568' }}>
                      What triggered this? (similar experience, against values, intensity, accumulation)
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span 
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: '#7A9B6E' }}
                    aria-hidden="true"
                  >
                    4
                  </span>
                  <div>
                    <h4 className="font-medium" style={{ color: '#2D3748' }}>Reset Strategy</h4>
                    <p className="text-sm" style={{ color: '#4A5568' }}>
                      What helps you regulate? (breathe, move, talk, acknowledge)
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Tip */}
            <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#F5F9F3' }}>
              <p className="text-sm" style={{ color: '#2D3748' }}>
                <strong>Tip:</strong> Naming emotions reduces their intensity. Your brain calms down when you identify what's happening.
              </p>
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              className="w-full py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                focusRingColor: '#5C7F4F'
              }}
              aria-label="Begin Emotion Mapping"
            >
              Begin Mapping
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Practice phase
  if (phase === 'practice') {
    const progress = (timeElapsed / getDurationSeconds()) * 100;
    const stepContent = getStepContent();
    const steps: PracticeStep[] = ['body', 'name', 'pattern', 'strategy'];
    const currentStepIndex = steps.indexOf(currentStep);
    
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
                Step {currentStepIndex + 1}: {stepContent.title}
              </h2>
              <button 
                onClick={onClose} 
                className="p-2 rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                }}
                aria-label="Close practice"
              >
                <X className="w-5 h-5 text-white" />
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
              className="mb-8"
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

            {/* Step indicator dots */}
            <div className="flex justify-center gap-2 mb-8" role="group" aria-label="Progress steps">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className={`h-2 w-8 rounded-full transition-all ${
                    index <= currentStepIndex ? '' : 'bg-gray-300'
                  }`}
                  style={{
                    backgroundColor: index <= currentStepIndex ? '#7A9B6E' : undefined
                  }}
                  aria-label={`Step ${index + 1}: ${index <= currentStepIndex ? 'completed' : 'pending'}`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-4">
                {stepContent.icon}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3" style={{ color: '#2D3748' }}>
                  {stepContent.question}
                </h3>
                
                <ul className="space-y-2 p-4 rounded-xl" style={{ backgroundColor: '#F0F5ED' }} role="list">
                  {stepContent.prompts.map((prompt, index) => (
                    <li key={index} className="text-sm" style={{ color: '#4A5568' }}>
                      {prompt}
                    </li>
                  ))}
                </ul>
              </div>
              
              <p className="font-medium" style={{ color: '#5C7F4F' }}>
                {stepContent.encouragement}
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full mt-8 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                focusRingColor: '#5C7F4F'
              }}
              aria-label={currentStep === 'strategy' ? 'Complete mapping' : 'Continue to next step'}
            >
              {currentStep === 'strategy' ? 'Complete' : 'Continue'}
              {currentStep !== 'strategy' && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Reflection phase
  return (
    <>
      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
        <section 
        aria-labelledby="reflection-title" 
        className="rounded-3xl max-w-lg w-full bg-white shadow-sm"
        lang="en"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 id="reflection-title" className="text-xl font-normal" style={{ color: '#2D3748' }}>
              How clear do you feel now?
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

          {/* Clearer question */}
          <fieldset className="mb-6">
            <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
              Feeling clearer?
            </legend>
            <div className="flex gap-2" role="radiogroup">
              {['Yes', 'Somewhat', 'Still processing'].map(option => (
                <button
                  key={option}
                  onClick={() => setFeelingClearer(option)}
                  className={`flex-1 py-2.5 px-3 rounded-xl transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    feelingClearer === option
                      ? 'text-white'
                      : ''
                  }`}
                  style={{
                    background: feelingClearer === option ? 'linear-gradient(135deg, #1b5e20, #2e7d32)' : undefined,
                    backgroundColor: feelingClearer === option ? undefined : '#F0F5ED',
                    color: feelingClearer === option ? 'white' : '#4A5568',
                    focusRingColor: '#5C7F4F'
                  }}
                  onMouseEnter={(e) => {
                    if (feelingClearer !== option) {
                      e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (feelingClearer !== option) {
                      e.currentTarget.style.backgroundColor = '#F0F5ED';
                    }
                  }}
                  role="radio"
                  aria-checked={feelingClearer === option}
                >
                  {option}
                </button>
              ))}
            </div>
            <p className="text-xs mt-2 italic" style={{ color: '#4A5568' }}>
              All responses are valid
            </p>
          </fieldset>

          {/* Most helpful */}
          <fieldset className="mb-6">
            <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
              Most helpful part?
            </legend>
            <div className="grid grid-cols-2 gap-2" role="radiogroup">
              {[
                'Naming it',
                'Finding in body',
                'Understanding why',
                'Taking time'
              ].map(option => (
                <button
                  key={option}
                  onClick={() => setMostHelpful(option)}
                  className={`py-2.5 px-3 rounded-xl transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    mostHelpful === option
                      ? 'text-white'
                      : ''
                  }`}
                  style={{
                    background: mostHelpful === option ? 'linear-gradient(135deg, #1b5e20, #2e7d32)' : undefined,
                    backgroundColor: mostHelpful === option ? undefined : '#F0F5ED',
                    color: mostHelpful === option ? 'white' : '#4A5568',
                    focusRingColor: '#5C7F4F'
                  }}
                  onMouseEnter={(e) => {
                    if (mostHelpful !== option) {
                      e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (mostHelpful !== option) {
                      e.currentTarget.style.backgroundColor = '#F0F5ED';
                    }
                  }}
                  role="radio"
                  aria-checked={mostHelpful === option}
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
              {[
                "I'm good",
                'More time',
                'Talk to someone'
              ].map(option => (
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

          {needSupport === 'Talk to someone' && (
            <div 
              className="mb-6 p-4 rounded-xl"
              style={{ backgroundColor: '#F0F5ED' }}
              role="region"
              aria-label="Support resources"
            >
              <p className="text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                Support available:
              </p>
              <ul className="text-sm space-y-1" style={{ color: '#4A5568' }}>
                <li>• Colleague or supervisor</li>
                <li>• EAP services</li>
                <li>• Professional counseling</li>
                <li>• Peer support groups</li>
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
            aria-label="Complete emotion mapping and close"
          >
            Done
          </button>
        </div>
      </section>
    </div>

    {/* Why Emotion Mapping Works Modal */}
    {showWhyModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Why Emotion Mapping Works</h2>
              <button
                onClick={() => setShowWhyModal(false)}
                className="p-2 rounded-lg transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
                aria-label="Close why modal"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="text-gray-600 mb-4">
              The neuroscience behind emotional awareness for interpreter recovery
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Amygdala Regulation</h3>
                <p className="text-green-800">
                  <strong>Immediate stress reduction:</strong> When you name an emotion, brain imaging shows the amygdala (your brain's alarm system) decreases activity by up to 50%. This "name it to tame it" effect is particularly powerful for interpreters who absorb intense emotions during assignments. Simply labeling "frustration" or "compassion fatigue" begins the calming process instantly.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Prefrontal Cortex Engagement</h3>
                <p className="text-blue-800">
                  <strong>Cognitive control restoration:</strong> The act of identifying emotions activates the prefrontal cortex—your brain's CEO—which had been suppressed during high-stress interpreting. This reactivation restores executive function, helping you transition from reactive mode to reflective processing, essential for maintaining professional boundaries and preventing vicarious trauma.
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Neural Integration</h3>
                <p className="text-purple-800">
                  <strong>Whole-brain processing:</strong> Emotion mapping bridges the right brain (emotional experience) with the left brain (language and logic), creating neural integration. For interpreters who constantly navigate between languages and emotional contexts, this integration prevents emotional overwhelm and maintains cognitive flexibility throughout demanding assignments.
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg">
                <h3 className="font-semibold text-amber-900 mb-2">Emotional Granularity</h3>
                <p className="text-amber-800">
                  <strong>Precision reduces intensity:</strong> Research shows that people who distinguish between specific emotions ("disappointed" vs. just "bad") experience 30% less emotional dysregulation. Interpreters who develop rich emotional vocabularies can process complex assignment content more effectively, reducing burnout and secondary trauma symptoms.
                </p>
              </div>

              <div className="p-4 bg-indigo-50 rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-2">Default Mode Network Reset</h3>
                <p className="text-indigo-800">
                  <strong>Mental clarity restoration:</strong> The reflection phase of emotion mapping activates the default mode network, allowing your brain to process and file away emotional residue from interpreting sessions. This prevents emotional accumulation that can lead to interpreter fatigue, ensuring you start each new assignment with a clear cognitive and emotional slate.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowWhyModal(false)}
              className="mt-6 w-full py-3 text-white rounded-lg font-medium hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
// Export alias
export const EmotionMapping = EmotionMappingAccessible;
