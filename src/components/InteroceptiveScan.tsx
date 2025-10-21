import React, { useState } from "react";
import { X, Heart, Brain, Lightbulb, Check, ChevronRight } from "lucide-react";

interface InteroceptiveScanProps {
  onClose: () => void;
}

const bodyZones = [
  {
    name: "Head & Face",
    prompts: [
      "Notice your forehead. Is it tense or relaxed?",
      "Feel your jaw. Is it clenched or loose?",
      "Notice your eyes. Are they straining or resting?",
    ],
  },
  {
    name: "Neck & Shoulders",
    prompts: [
      "Feel your neck. Is it tight or flexible?",
      "Notice your shoulders. Are they raised or dropped?",
      "Feel the weight of your arms. Heavy or light?",
    ],
  },
  {
    name: "Chest & Heart",
    prompts: [
      "Notice your breathing. Shallow or deep?",
      "Feel your heartbeat. Fast, slow, or steady?",
      "Sense the space in your chest. Open or constricted?",
    ],
  },
  {
    name: "Stomach & Core",
    prompts: [
      "Feel your belly. Tight or soft?",
      "Notice any sensations. Butterflies, knots, or calm?",
      "Sense your core. Stable or unsettled?",
    ],
  },
  {
    name: "Legs & Feet",
    prompts: [
      "Feel your legs. Tense or relaxed?",
      "Notice your feet. Grounded or restless?",
      "Sense the contact with the floor. Connected or disconnected?",
    ],
  },
];

export const InteroceptiveScan: React.FC<InteroceptiveScanProps> = ({ onClose }) => {
  const [currentZone, setCurrentZone] = useState(0);
  const [completedZones, setCompletedZones] = useState<number[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const handleNext = () => {
    if (!completedZones.includes(currentZone)) {
      setCompletedZones([...completedZones, currentZone]);
    }

    if (currentZone < bodyZones.length - 1) {
      setCurrentZone(currentZone + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrevious = () => {
    if (currentZone > 0) {
      setCurrentZone(currentZone - 1);
    }
  };

  const progress = ((currentZone + 1) / bodyZones.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Interoceptive Awareness Scan</h2>
            <p className="text-sm text-gray-600 mt-1">
              Connect with your body's internal signals to stay grounded and focused
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-all hover:scale-110"
            style={{ background: "linear-gradient(135deg, #5C7F4F, #5B9378)" }}
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {!showSummary ? (
          <>
            {/* Progress Bar */}
            <div className="px-6 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Zone {currentZone + 1} of {bodyZones.length}
                </span>
                <span className="text-sm text-gray-600">{Math.round(progress)}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {/* Instructions */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">How to practice:</p>
                    <p className="text-sm text-gray-700">
                      Take 30 seconds for each prompt. Simply notice what you feel without trying to change it.
                      There's no right or wrong—just awareness.
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Zone */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{bodyZones[currentZone].name}</h3>
                </div>

                <div className="space-y-4">
                  {bodyZones[currentZone].prompts.map((prompt, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                      <p className="text-gray-800 leading-relaxed">{prompt}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Take Your Time Reminder */}
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 italic text-center">
                  Take your time. Breathe naturally. Simply notice what's there.
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentZone === 0}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentZone === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {bodyZones.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        completedZones.includes(index)
                          ? "bg-green-600"
                          : index === currentZone
                          ? "bg-green-400"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  {currentZone === bodyZones.length - 1 ? "Complete" : "Next"}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Summary */
          <div className="px-6 py-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Scan Complete</h3>
              <p className="text-gray-600">You've connected with all 5 body zones.</p>
            </div>

            {/* Reflection */}
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-gray-900 mb-2">Reflection:</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  What did you notice? Were any areas holding more tension than others? Did you discover
                  any sensations you weren't aware of before?
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900 mb-2">What to do now:</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>If you found tension, take 3 slow breaths into that area</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>If you felt calm, notice that sense of grounding before your next task</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Return to this practice anytime you need to reconnect with your body</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Why This Works */}
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Why this works:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Research shows that <strong>interoceptive awareness</strong> (tuning into internal body signals)
                    activates the anterior insular cortex, which helps you notice, label, and regulate emotions
                    (Craig, 2009). Mindful attention to body sensations preserves activation in language and attention
                    networks, maintaining cognitive flexibility even under pressure (Farb et al., 2023).
                  </p>
                </div>
              </div>
            </div>

            {/* Done Button */}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
