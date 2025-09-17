import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Heart, Sparkles } from 'lucide-react';

// Define the structure for each breathing technique
// This interface allows the component to be reused for different reset practices
interface Technique {
  id: string;
  name: string;
  description: string;
  benefits: string; // Neuroscience-backed benefits
  steps: string[]; // Step-by-step instructions
  duration: number; // Total duration in seconds
  researchNote?: string; // Optional research citation
}

// Sample techniques array - can be extended or passed as props for reusability
const breathingTechniques: Technique[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    description: 'Equal inhale, hold, exhale, and rest periods create a calming rhythm.',
    benefits: 'Research shows this technique activates the parasympathetic nervous system, reducing stress hormones and improving focus. Studies from the Journal of Alternative and Complementary Medicine indicate it can lower cortisol levels by up to 20%.',
    steps: [
      'Inhale slowly through your nose for 4 seconds',
      'Hold your breath for 4 seconds',
      'Exhale slowly through your mouth for 4 seconds',
      'Hold empty for 4 seconds',
      'Repeat the cycle'
    ],
    duration: 120, // 2 minutes for demonstration
    researchNote: 'Supported by research from the American Journal of Physiology'
  },
  {
    id: 'physiological-sigh',
    name: 'Physiological Sigh',
    description: 'A natural stress-relief mechanism that resets your breathing pattern.',
    benefits: 'This technique, discovered by Stanford researchers, can reduce anxiety by up to 90% in just 1 minute. It works by rapidly exhaling carbon dioxide, triggering the vagus nerve to calm the nervous system.',
    steps: [
      'Take a normal breath in through your nose',
      'Take a second quick inhale to fill your lungs completely',
      'Exhale forcefully through your mouth',
      'Repeat 2-3 times or until you feel calmer'
    ],
    duration: 60, // 1 minute
    researchNote: 'Stanford University research published in Cell Reports Medicine'
  },
  {
    id: '4-7-8-breathing',
    name: '4-7-8 Breathing',
    description: 'A relaxation technique that promotes sleep and reduces anxiety.',
    benefits: 'Developed by Dr. Andrew Weil, this method has been shown to reduce insomnia and anxiety. The extended exhale activates the relaxation response, lowering heart rate and blood pressure.',
    steps: [
      'Inhale quietly through your nose for 4 seconds',
      'Hold your breath for 7 seconds',
      'Exhale completely through your mouth for 8 seconds',
      'Repeat 4 times or as needed'
    ],
    duration: 180, // 3 minutes
    researchNote: 'Based on Dr. Andrew Weil\'s integrative medicine research'
  }
];

interface BreathingPracticeEnhancedProps {
  onClose: () => void;
  onComplete?: (techniqueId: string, duration: number) => void;
  // Optional: allow passing custom techniques for reusability
  techniques?: Technique[];
}

export const BreathingPracticeEnhanced: React.FC<BreathingPracticeEnhancedProps> = ({
  onClose,
  onComplete,
  techniques = breathingTechniques
}) => {
  // State management for the enhanced interface
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showAffirmation, setShowAffirmation] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  // Refs for timers and accessibility
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, []);

  // Handle technique selection with smooth transition
  const selectTechnique = (technique: Technique) => {
    setTransitioning(true);
    setTimeout(() => {
      setSelectedTechnique(technique);
      setTransitioning(false);
    }, 300); // Match CSS transition duration
  };

  // Start the breathing practice
  const startPractice = () => {
    if (!selectedTechnique) return;

    setIsPracticing(true);
    setTimeRemaining(selectedTechnique.duration);
    setCurrentStep(0);

    // Main timer for overall duration
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          completePractice();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Step progression timer (cycle through steps)
    const stepDuration = selectedTechnique.duration / selectedTechnique.steps.length;
    stepTimerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        if (nextStep >= selectedTechnique.steps.length) {
          return 0; // Loop back to first step
        }
        return nextStep;
      });
    }, stepDuration * 1000);
  };

  // Stop the current practice
  const stopPractice = () => {
    setIsPracticing(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    setTimeRemaining(0);
    setCurrentStep(0);
  };

  // Complete the practice and show affirmation
  const completePractice = () => {
    setIsPracticing(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);

    // Show affirmation after a brief delay
    setTimeout(() => {
      setShowAffirmation(true);
    }, 1000);

    // Notify parent component
    if (onComplete && selectedTechnique) {
      onComplete(selectedTechnique.id, selectedTechnique.duration);
    }
  };

  // Reset to technique selection
  const resetToSelection = () => {
    setSelectedTechnique(null);
    setIsPracticing(false);
    setShowAffirmation(false);
    setCurrentStep(0);
    setTimeRemaining(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
  };

  // Handle keyboard navigation for technique cards
  const handleKeyDown = (event: React.KeyboardEvent, technique: Technique) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectTechnique(technique);
    }
  };

  // Format time remaining
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render technique selection screen
  const renderTechniqueSelection = () => (
    <div className="flex flex-col h-full">
      {/* Introductory line as requested */}
      <div className="text-center mb-8">
        <p className="text-lg text-gray-700 font-medium">
          Choose a research-based technique below to begin.
        </p>
      </div>

      {/* Technique cards grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
        {techniques.map((technique) => (
          <div
            key={technique.id}
            className={`
              relative bg-white rounded-xl shadow-md p-6 cursor-pointer
              transition-all duration-300 ease-in-out
              hover:shadow-xl hover:scale-105 hover:bg-sage-50
              focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2
              border-2 border-transparent hover:border-sage-200
              ${transitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
            `}
            onClick={() => selectTechnique(technique)}
            onKeyDown={(e) => handleKeyDown(e, technique)}
            tabIndex={0}
            role="button"
            aria-label={`Select ${technique.name} breathing technique`}
            aria-describedby={`${technique.id}-description`}
          >
            {/* Technique name and icon */}
            <div className="flex items-center mb-4">
              <Heart className="w-6 h-6 text-sage-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">
                {technique.name}
              </h3>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-4" id={`${technique.id}-description`}>
              {technique.description}
            </p>

            {/* Duration indicator */}
            <div className="text-sm text-gray-500 mb-4">
              Duration: {formatTime(technique.duration)}
            </div>

            {/* Hover cue - subtle animation */}
            <div className="absolute bottom-4 right-4 opacity-0 hover:opacity-100 transition-opacity duration-200">
              <Sparkles className="w-5 h-5 text-sage-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom spacing for better visual separation */}
      <div className="h-8"></div>
    </div>
  );

  // Render practice screen
  const renderPracticeScreen = () => {
    if (!selectedTechnique) return null;

    return (
      <div className={`
        flex flex-col h-full transition-all duration-500 ease-in-out
        ${transitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}
      `}>
        {/* Practice header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedTechnique.name}
          </h2>
          <div className="text-lg text-gray-600 mb-4">
            {isPracticing ? formatTime(timeRemaining) : 'Ready to begin'}
          </div>
        </div>

        {/* Current step display */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="max-w-2xl w-full">
            {/* Step indicator */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-2 bg-sage-100 px-4 py-2 rounded-full">
                <span className="text-sage-700 font-medium">
                  Step {currentStep + 1} of {selectedTechnique.steps.length}
                </span>
              </div>
            </div>

            {/* Current instruction */}
            <div className="text-center mb-8">
              <p className="text-2xl font-medium text-gray-800 leading-relaxed">
                {selectedTechnique.steps[currentStep]}
              </p>
            </div>

            {/* Visual breathing guide */}
            <div className="flex justify-center mb-8">
              <div className={`
                w-32 h-32 rounded-full bg-sage-200 transition-all duration-1000 ease-in-out
                ${isPracticing ? 'scale-110 bg-sage-300' : 'scale-100 bg-sage-200'}
              `}>
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-sage-800">
                      {isPracticing ? 'Breathe' : 'Ready'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Neuroscience-backed benefits */}
            <div className="bg-sage-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-sage-800 mb-3">
                Why This Works:
              </h3>
              <p className="text-sage-700 leading-relaxed">
                {selectedTechnique.benefits}
              </p>
              {selectedTechnique.researchNote && (
                <p className="text-sm text-sage-600 mt-3 italic">
                  {selectedTechnique.researchNote}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Control buttons */}
        <div className="px-8 pb-8">
          <div className="flex justify-center space-x-4">
            {!isPracticing ? (
              <button
                onClick={startPractice}
                className="flex items-center px-8 py-4 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors shadow-lg"
                aria-label="Start breathing practice"
              >
                <Play className="w-6 h-6 mr-2" />
                Start Practice
              </button>
            ) : (
              <button
                onClick={stopPractice}
                className="flex items-center px-8 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                aria-label="Stop breathing practice"
              >
                <Pause className="w-6 h-6 mr-2" />
                Stop Practice
              </button>
            )}

            <button
              onClick={resetToSelection}
              className="flex items-center px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              aria-label="Choose different technique"
            >
              <RotateCcw className="w-6 h-6 mr-2" />
              Choose Different
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render completion affirmation
  const renderAffirmation = () => (
    <div className="flex flex-col h-full items-center justify-center px-8">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Affirmation message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          You just gave your body a reset—well done!
        </h2>

        <p className="text-gray-600 mb-8 leading-relaxed">
          Taking time for these practices shows real care for your well-being.
          Your nervous system is finding its natural rhythm again.
        </p>

        {/* Action buttons */}
        <div className="space-y-4">
          <button
            onClick={resetToSelection}
            className="w-full px-6 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
            aria-label="Try another technique"
          >
            Try Another Technique
          </button>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            aria-label="Close practice"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedTechnique ? selectedTechnique.name : 'Breathing Practice'}
            </h1>
            <p className="text-gray-600">
              {selectedTechnique
                ? `${formatTime(selectedTechnique.duration)} • Research-backed technique`
                : 'Choose your practice'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            aria-label="Close breathing practice"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {showAffirmation
            ? renderAffirmation()
            : selectedTechnique
              ? renderPracticeScreen()
              : renderTechniqueSelection()
          }
        </div>

        {/* Footer with soothing colors */}
        {!showAffirmation && (
          <div className="p-4 bg-sage-50 border-t border-sage-200">
            <p className="text-sm text-sage-700 text-center">
              Remember: This is your practice. Adjust as needed for comfort.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};