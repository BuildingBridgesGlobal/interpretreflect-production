import React, { useState } from "react";
import { X, Lightbulb, Check, ChevronRight, Cloud, AlertCircle, Zap, Battery, HelpCircle, Sparkles, Heart, TrendingUp, Smile, Scale } from "lucide-react";
import { reflectionService } from "../services/reflectionService";
import { useAuth } from "../contexts/AuthContext";

interface EmotionClarityPracticeProps {
  onClose: () => void;
  onSave?: () => void;
}

// Emotion categories with nuanced options, colors, and icons
const emotionCategories = [
  {
    category: "Overwhelmed",
    subtitle: "When it all feels like too much",
    color: "from-red-50 to-orange-50",
    borderColor: "border-red-200",
    iconColor: "text-red-600",
    icon: Cloud,
    emotions: [
      { label: "Cognitively overloaded", description: "Too much information to process at once" },
      { label: "Emotionally flooded", description: "Intense feelings washing over you" },
      { label: "Physically exhausted", description: "Body feels drained and heavy" },
      { label: "Time-pressured", description: "Racing against the clock, can't keep up" },
      { label: "Responsibility-burdened", description: "Weight of obligations feels crushing" },
    ],
  },
  {
    category: "Anxious",
    subtitle: "When worry or unease takes over",
    color: "from-yellow-50 to-amber-50",
    borderColor: "border-yellow-300",
    iconColor: "text-yellow-600",
    icon: AlertCircle,
    emotions: [
      { label: "Anticipatory anxiety", description: "Worried about what's coming next" },
      { label: "Performance anxiety", description: "Nervous about making mistakes or being judged" },
      { label: "Social anxiety", description: "Uncomfortable in interpersonal situations" },
      { label: "Uncertain", description: "Don't know what to expect, seeking clarity" },
      { label: "On edge", description: "Hyper-alert, ready for something to go wrong" },
    ],
  },
  {
    category: "Frustrated",
    subtitle: "When things aren't going as hoped",
    color: "from-orange-50 to-amber-50",
    borderColor: "border-orange-300",
    iconColor: "text-orange-600",
    icon: Zap,
    emotions: [
      { label: "Annoyed", description: "Mildly irritated by small disruptions" },
      { label: "Blocked", description: "Want to move forward but can't find a way" },
      { label: "Misunderstood", description: "Feel like others aren't getting your message" },
      { label: "Impatient", description: "Want things to move faster than they are" },
      { label: "Resentful", description: "Frustrated about unfairness or unmet expectations" },
    ],
  },
  {
    category: "Drained",
    subtitle: "When energy reserves feel depleted",
    color: "from-gray-50 to-blue-50",
    borderColor: "border-gray-300",
    iconColor: "text-gray-600",
    icon: Battery,
    emotions: [
      { label: "Emotionally numb", description: "Can't access feelings, shut down" },
      { label: "Compassion fatigued", description: "Exhausted from caring for others" },
      { label: "Mentally foggy", description: "Can't think clearly or focus" },
      { label: "Depleted", description: "Nothing left in the tank" },
      { label: "Disconnected", description: "Feel removed from yourself or others" },
    ],
  },
  {
    category: "Concerned",
    subtitle: "When professional or ethical questions arise",
    color: "from-purple-50 to-indigo-50",
    borderColor: "border-purple-300",
    iconColor: "text-purple-600",
    icon: HelpCircle,
    emotions: [
      { label: "Ethically conflicted", description: "Torn between competing professional values" },
      { label: "Uncertain about boundaries", description: "Not sure where your role begins/ends" },
      { label: "Worried about accuracy", description: "Concerned you missed or misinterpreted something" },
      { label: "Protective of participants", description: "Want to shield others from harm" },
      { label: "Doubting yourself", description: "Questioning your skills or decisions" },
    ],
  },
  {
    category: "Energized & Motivated",
    subtitle: "When you feel engaged and driven",
    color: "from-green-50 to-emerald-50",
    borderColor: "border-green-300",
    iconColor: "text-green-600",
    icon: Sparkles,
    emotions: [
      { label: "Energized", description: "Feeling engaged and motivated" },
      { label: "Inspired", description: "Motivated by meaningful work or connection" },
      { label: "Confident", description: "Trust in your abilities and preparation" },
      { label: "Curious", description: "Interested and engaged with learning" },
      { label: "Empowered", description: "Feeling capable and in control" },
    ],
  },
  {
    category: "Accomplished & Fulfilled",
    subtitle: "When success and purpose align",
    color: "from-blue-50 to-cyan-50",
    borderColor: "border-blue-300",
    iconColor: "text-blue-600",
    icon: TrendingUp,
    emotions: [
      { label: "Proud", description: "Feeling accomplished about your work" },
      { label: "Satisfied", description: "Content with how things went" },
      { label: "Fulfilled", description: "Sense of purpose and meaning in your work" },
      { label: "Validated", description: "Your skills and efforts recognized" },
      { label: "Relieved", description: "Glad something difficult is over" },
    ],
  },
  {
    category: "Connected & Joyful",
    subtitle: "When warmth and positivity flow",
    color: "from-pink-50 to-rose-50",
    borderColor: "border-pink-300",
    iconColor: "text-pink-600",
    icon: Heart,
    emotions: [
      { label: "Joyful", description: "Genuine happiness and delight" },
      { label: "Grateful", description: "Appreciative of the opportunity or experience" },
      { label: "Connected", description: "Sense of alignment with participants or team" },
      { label: "Hopeful", description: "Optimistic about future possibilities" },
      { label: "Calm", description: "Centered and at peace" },
    ],
  },
  {
    category: "Mixed & Complex",
    subtitle: "When emotions blend or conflict",
    color: "from-amber-50 to-yellow-50",
    borderColor: "border-amber-300",
    iconColor: "text-amber-600",
    icon: Scale,
    emotions: [
      { label: "Bittersweet", description: "Both happy and sad at the same time" },
      { label: "Ambivalent", description: "Pulled in two different directions" },
      { label: "Cautiously optimistic", description: "Hopeful but guarded" },
      { label: "Guilty relief", description: "Relieved but feel bad about it" },
      { label: "Conflicted", description: "Torn between competing feelings or values" },
    ],
  },
];

export const EmotionClarityPractice: React.FC<EmotionClarityPracticeProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<"select" | "reflect">("select");
  const [strongestEmotion, setStrongestEmotion] = useState("");
  const [bodyLocation, setBodyLocation] = useState("");
  const [whatINeed, setWhatINeed] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const toggleEmotion = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter((e) => e !== emotion));
    } else {
      setSelectedEmotions([...selectedEmotions, emotion]);
    }
  };

  const handleContinue = () => {
    if (selectedEmotions.length > 0) {
      setCurrentStep("reflect");
    }
  };

  const handleSaveAndClose = async () => {
    console.log("🎭 EmotionClarityPractice - handleSaveAndClose called");
    console.log("🎭 User:", user?.id);
    console.log("🎭 Selected emotions:", selectedEmotions);

    if (!user) {
      console.log("🎭 No user found, closing without saving");
      onClose();
      return;
    }

    setIsSaving(true);
    console.log("🎭 Setting isSaving to true");

    try {
      const reflectionData = {
        emotions_identified: selectedEmotions.join(", "),
        strongest_emotion: strongestEmotion,
        body_location: bodyLocation,
        what_i_need: whatINeed,
        next_step: nextStep,
      };

      console.log("🎭 Reflection data to save:", reflectionData);
      console.log("🎭 Calling reflectionService.saveReflection...");

      const result = await reflectionService.saveReflection(
        user.id,
        "emotion-clarity",
        reflectionData
      );

      console.log("🎭 Save result:", result);

      // Dispatch event to notify Growth Insights to refresh
      console.log("🎭 Dispatching emotion-clarity-saved event");
      window.dispatchEvent(new CustomEvent("emotion-clarity-saved"));

      // Call onSave callback if provided
      if (onSave) {
        console.log("🎭 Calling onSave callback");
        await onSave();
      }

      console.log("🎭 Closing modal");
      onClose();
    } catch (error) {
      console.error("🎭 Error saving emotion clarity reflection:", error);
      alert("There was an error saving your reflection. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-gray-900">Emotion Clarity Practice</h2>
            <p className="text-sm text-gray-600 mt-1">
              Building emotional granularity improves regulation and reduces stress
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-all flex-shrink-0 hover:scale-110"
            style={{ background: "linear-gradient(135deg, #5C7F4F, #5B9378)" }}
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {currentStep === "select" && (
            <>
              {/* Instructions */}
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      How to use this tool:
                    </p>
                    <p className="text-sm text-gray-700">
                      Instead of feeling "bad" or "stressed," try to identify the specific emotions you're experiencing.
                      The more precisely you can name your emotions, the better you can regulate them. Select all that apply.
                    </p>
                  </div>
                </div>
              </div>

              {/* Emotion Categories - 3 Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emotionCategories.map((cat) => {
                  const IconComponent = cat.icon;
                  return (
                    <div
                      key={cat.category}
                      className={`bg-gradient-to-br ${cat.color} ${cat.borderColor} border-2 rounded-lg p-4`}
                    >
                      {/* Category Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 bg-white rounded-lg ${cat.iconColor}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-gray-900">{cat.category}</h3>
                          <p className="text-xs text-gray-600">{cat.subtitle}</p>
                        </div>
                      </div>

                      {/* Emotions */}
                      <div className="space-y-2">
                        {cat.emotions.map((emotion) => (
                          <button
                            key={emotion.label}
                            onClick={() => toggleEmotion(emotion.label)}
                            className={`text-left w-full p-3 rounded-lg border-2 transition-all min-h-[72px] flex items-center ${
                              selectedEmotions.includes(emotion.label)
                                ? "border-green-500 bg-green-50 shadow-sm"
                                : "border-white/50 bg-white/70 hover:border-green-300 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-start gap-2 w-full">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900 text-sm leading-tight">{emotion.label}</span>
                                  {selectedEmotions.includes(emotion.label) && (
                                    <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 leading-snug">{emotion.description}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Button */}
              {selectedEmotions.length > 0 && (
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleContinue}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Continue to Reflection
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}

          {currentStep === "reflect" && (
            <>
              {/* Summary */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">You identified:</h3>
                <ul className="space-y-1">
                  {selectedEmotions.map((emotion) => (
                    <li key={emotion} className="text-sm text-gray-700 flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-600" />
                      {emotion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reflection Form */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Reflection: Now that you've named your emotions...
                  </h3>

                  <div className="space-y-6">
                    {/* Question 1 */}
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        1. Which emotion feels strongest right now?
                      </label>
                      <input
                        type="text"
                        value={strongestEmotion}
                        onChange={(e) => setStrongestEmotion(e.target.value)}
                        placeholder="e.g., Emotionally flooded, Annoyed, Relieved..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        Take a moment to notice where you feel it in your body.
                      </p>
                    </div>

                    {/* Question 1b - Body Location */}
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Where do you feel it in your body?
                      </label>
                      <input
                        type="text"
                        value={bodyLocation}
                        onChange={(e) => setBodyLocation(e.target.value)}
                        placeholder="e.g., Tightness in my chest, tension in my shoulders..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Question 2 */}
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        2. What do these emotions tell you about what you need?
                      </label>
                      <textarea
                        value={whatINeed}
                        onChange={(e) => setWhatINeed(e.target.value)}
                        placeholder="Do you need a break, support, clearer boundaries, or a different strategy?"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Question 3 */}
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        3. What's one small step you can take right now?
                      </label>
                      <textarea
                        value={nextStep}
                        onChange={(e) => setNextStep(e.target.value)}
                        placeholder="This could be taking 3 deep breaths, stepping outside, or messaging a colleague for support..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Why This Works */}
                <div className="bg-green-50 border-l-4 border-green-500 p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Why this works:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Research shows that <strong>emotional granularity</strong> (the ability to make fine-grained distinctions
                    between emotions) predicts better emotion regulation, reduced anxiety and depression, and less maladaptive
                    coping (Barrett et al., 2001; Kashdan et al., 2015). By building your emotional vocabulary, you're training
                    your brain to respond more adaptively to stress.
                  </p>
                </div>
              </div>

              {/* Done Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSaveAndClose}
                  disabled={isSaving}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save & Close"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
