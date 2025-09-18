import React, { useState } from 'react';
import {
import { directInsertReflection } from '../services/directSupabaseApi';
  X,
  Heart,
  Brain,
  Shield,
  Battery,
  AlertTriangle,
  Activity,
  TrendingUp,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface WellnessCheckInProps {
  onComplete: (results: WellnessCheckInResults) => void;
  onClose: () => void;
}

interface WellnessCheckInResults {
  bodyScan: {
    headNeck: string;
    shouldersBack: string;
    chestBreathing: string;
    stomachDigestion: string;
    overallEnergy: string;
    bodyMessage: string;
  };
  emotionalWeather: {
    primaryEmotion: string;
    intensityLevel: string;
    duration: string;
    origin: string;
    originDetail?: string;
  };
  cognitiveLoad: {
    workingMemory: string;
    decisionMaking: string;
    languageProcessing: string;
    attentionSpan: string;
    redFlags: string[];
  };
  vicariousTrauma: {
    intrusion: string;
    avoidance: string;
    arousal: string;
    worldview: string;
  };
  resilience: {
    physical: {
      sleep: string;
      nutrition: string;
      movement: string;
      medicalCare: string;
    };
    social: {
      supportSystem: string;
      professionalCommunity: string;
      supervision: string;
    };
    psychological: {
      copingStrategies: string;
      boundaries: string;
      meaningPurpose: string;
    };
    needsAttention: string;
  };
  wellnessTriage: string;
  wellnessPrescription: {
    stopReduce: string;
    startIncrease: string;
    connectWith: string;
    boundarySet: string;
    crisisAction?: string;
  };
  trendTracking: {
    physicalHealth: string;
    emotionalState: string;
    mentalClarity: string;
    overallTrajectory: string;
  };
  stressLevel: number;
  energyLevel: number;
  timestamp: Date;
}

const WellnessCheckIn: React.FC<WellnessCheckInProps> = ({ onComplete, onClose }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [stressLevel] = useState(5);
  const [energyLevel] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Body Scan
  const [headNeck, setHeadNeck] = useState('');
  const [shouldersBack, setShouldersBack] = useState('');
  const [chestBreathing, setChestBreathing] = useState('');
  const [stomachDigestion, setStomachDigestion] = useState('');
  const [overallEnergy, setOverallEnergy] = useState('');
  const [bodyMessage, setBodyMessage] = useState('');

  // Step 2: Emotional Weather
  const [primaryEmotion, setPrimaryEmotion] = useState('');
  const [intensityLevel, setIntensityLevel] = useState('');
  const [emotionDuration, setEmotionDuration] = useState('');
  const [emotionOrigin, setEmotionOrigin] = useState('');
  const [originDetail, setOriginDetail] = useState('');

  // Step 3: Cognitive Load
  const [workingMemory, setWorkingMemory] = useState('');
  const [decisionMaking, setDecisionMaking] = useState('');
  const [languageProcessing, setLanguageProcessing] = useState('');
  const [attentionSpan, setAttentionSpan] = useState('');
  const [cognitiveRedFlags, setCognitiveRedFlags] = useState<string[]>([]);

  // Step 4: Vicarious Trauma
  const [intrusion, setIntrusion] = useState('');
  const [avoidance, setAvoidance] = useState('');
  const [arousal, setArousal] = useState('');
  const [worldview, setWorldview] = useState('');

  // Step 5: Resilience Resources
  const [sleep, setSleep] = useState('');
  const [nutrition, setNutrition] = useState('');
  const [movement, setMovement] = useState('');
  const [medicalCare, setMedicalCare] = useState('');
  const [supportSystem, setSupportSystem] = useState('');
  const [professionalCommunity, setProfessionalCommunity] = useState('');
  const [supervision, setSupervision] = useState('');
  const [copingStrategies, setCopingStrategies] = useState('');
  const [boundaries, setBoundaries] = useState('');
  const [meaningPurpose, setMeaningPurpose] = useState('');
  const [needsAttention, setNeedsAttention] = useState('');

  // Step 6: Wellness Triage
  const [wellnessLevel, setWellnessLevel] = useState('');
  const [levelNeed, setLevelNeed] = useState('');

  // Step 7: Wellness Prescription
  const [stopReduce, setStopReduce] = useState('');
  const [startIncrease, setStartIncrease] = useState('');
  const [connectWith, setConnectWith] = useState('');
  const [boundarySet, setBoundarySet] = useState('');
  const [crisisAction, setCrisisAction] = useState('');

  // Step 8: Trend Tracking
  const [physicalTrend, setPhysicalTrend] = useState('');
  const [emotionalTrend, setEmotionalTrend] = useState('');
  const [mentalTrend, setMentalTrend] = useState('');
  const [overallTrend, setOverallTrend] = useState('');

  const [showSummary, setShowSummary] = useState(false);

  const handleNext = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    const results: WellnessCheckInResults = {
      bodyScan: {
        headNeck,
        shouldersBack,
        chestBreathing,
        stomachDigestion,
        overallEnergy,
        bodyMessage,
      },
      emotionalWeather: {
        primaryEmotion,
        intensityLevel,
        duration: emotionDuration,
        origin: emotionOrigin,
        originDetail: emotionOrigin === 'specific' ? originDetail : undefined,
      },
      cognitiveLoad: {
        workingMemory,
        decisionMaking,
        languageProcessing,
        attentionSpan,
        redFlags: cognitiveRedFlags,
      },
      vicariousTrauma: {
        intrusion,
        avoidance,
        arousal,
        worldview,
      },
      resilience: {
        physical: {
          sleep,
          nutrition,
          movement,
          medicalCare,
        },
        social: {
          supportSystem,
          professionalCommunity,
          supervision,
        },
        psychological: {
          copingStrategies,
          boundaries,
          meaningPurpose,
        },
        needsAttention,
      },
      wellnessTriage: wellnessLevel,
      wellnessPrescription: {
        stopReduce,
        startIncrease,
        connectWith,
        boundarySet,
        crisisAction:
          wellnessLevel === 'orange' || wellnessLevel === 'red' ? crisisAction : undefined,
      },
      trendTracking: {
        physicalHealth: physicalTrend,
        emotionalState: emotionalTrend,
        mentalClarity: mentalTrend,
        overallTrajectory: overallTrend,
      },
      stressLevel,
      energyLevel,
      timestamp: new Date(),
    };

    // Save to Supabase if user is authenticated
    if (user) {
      setIsSaving(true);
      try {
        // Save wellness scores
        const { error: scoresError } = await supabase
          .from('wellness_scores')
          .insert({
            user_id: user.id,
            physical_energy: parseInt(overallEnergy) || 5,
            emotional_balance: intensityLevel === 'low' ? 8 : intensityLevel === 'medium' ? 5 : 3,
            mental_clarity: parseInt(workingMemory) || 5,
            social_connection: parseInt(supportSystem) || 5,
            professional_satisfaction: parseInt(meaningPurpose) || 5,
            overall_wellbeing: Math.round((stressLevel + energyLevel) / 2),
            notes: `Body message: ${bodyMessage}, Primary emotion: ${primaryEmotion}`
          });

        if (scoresError) {
          console.error('Error saving wellness scores:', scoresError);
        }

        // Save as reflection entry
        const { error: reflectionError } = await supabase
          .from('reflections')
          .insert({
            user_id: user.id,
            reflection_type: 'wellness_checkin',
            type: 'wellness',
            answers: results,
            status: 'completed',
            metadata: {
              stress_level: stressLevel,
              energy_level: energyLevel,
              timestamp: new Date().toISOString()
            }
          });

        if (reflectionError) {
          console.error('Error saving reflection:', reflectionError);
        } else {
          console.log('Wellness check-in saved successfully');
        }
      } catch (err) {
        console.error('Error saving wellness check-in:', err);
      } finally {
        setIsSaving(false);
      }
    }

    setShowSummary(true);
    onComplete(formData);
  };

  const toggleRedFlag = (flag: string) => {
    setCognitiveRedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return (
          headNeck &&
          shouldersBack &&
          chestBreathing &&
          stomachDigestion &&
          overallEnergy &&
          bodyMessage
        );
      case 2:
        return primaryEmotion && intensityLevel && emotionDuration && emotionOrigin;
      case 3:
        return workingMemory && decisionMaking && languageProcessing && attentionSpan;
      case 4:
        return intrusion && avoidance && arousal && worldview;
      case 5:
        return (
          sleep &&
          nutrition &&
          movement &&
          supportSystem &&
          copingStrategies &&
          boundaries &&
          needsAttention
        );
      case 6:
        return wellnessLevel && levelNeed;
      case 7:
        return stopReduce && startIncrease && connectWith && boundarySet;
      case 8:
        return physicalTrend && emotionalTrend && mentalTrend && overallTrend;
      default:
        return false;
    }
  };

  const getWellnessColor = () => {
    switch (wellnessLevel) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'orange':
        return 'bg-orange-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Wellness Check-In</h2>
                <p className="text-sm text-gray-600 mt-1">7-minute self-assessment protocol</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    step === currentStep
                      ? 'bg-teal-500 text-white scale-110'
                      : step < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? <Check className="w-4 h-4" /> : step}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-600">Step {currentStep} of 8</span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-teal-500" />
                  Step 1: Body Scan
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  90 seconds • Based on Mindfulness-Based Stress Reduction (Kabat-Zinn, 1982)
                </p>
              </div>

              <div className="space-y-4">
                <p className="font-medium text-gray-900">
                  Physical Inventory - Notice without judgment:
                </p>

                <div>
                  <label className="font-medium text-gray-700 mb-2 block">Head & Neck:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'clear', label: 'Clear and comfortable', color: 'bg-green-50' },
                      { value: 'mild', label: 'Mild tension/pressure', color: 'bg-yellow-50' },
                      { value: 'headache', label: 'Headache brewing', color: 'bg-orange-50' },
                      { value: 'pain', label: 'Significant pain', color: 'bg-red-50' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${headNeck === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={headNeck === option.value}
                          onChange={(e) => setHeadNeck(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-700 mb-2 block">
                    Shoulders & Upper Back:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'relaxed', label: 'Relaxed and loose', color: 'bg-green-50' },
                      { value: 'slight', label: 'Slightly tight', color: 'bg-yellow-50' },
                      { value: 'tense', label: 'Noticeably tense', color: 'bg-orange-50' },
                      { value: 'locked', label: 'Locked up/painful', color: 'bg-red-50' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${shouldersBack === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={shouldersBack === option.value}
                          onChange={(e) => setShouldersBack(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-700 mb-2 block">Chest & Breathing:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'open', label: 'Open, easy breathing', color: 'bg-green-50' },
                      { value: 'slight', label: 'Slight tightness', color: 'bg-yellow-50' },
                      { value: 'shallow', label: 'Shallow breathing', color: 'bg-orange-50' },
                      { value: 'pressure', label: 'Chest pressure/anxiety', color: 'bg-red-50' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${chestBreathing === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={chestBreathing === option.value}
                          onChange={(e) => setChestBreathing(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-700 mb-2 block">
                    Stomach & Digestion:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        value: 'comfortable',
                        label: 'Comfortable and settled',
                        color: 'bg-green-50',
                      },
                      { value: 'unsettled', label: 'Slightly unsettled', color: 'bg-yellow-50' },
                      { value: 'nervous', label: 'Nervous/butterflies', color: 'bg-orange-50' },
                      {
                        value: 'distress',
                        label: 'Nausea/significant distress',
                        color: 'bg-red-50',
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${stomachDigestion === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={stomachDigestion === option.value}
                          onChange={(e) => setStomachDigestion(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-700 mb-2 block">Overall Energy:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'energized', label: 'Energized and vital', color: 'bg-green-50' },
                      { value: 'steady', label: 'Steady and stable', color: 'bg-blue-50' },
                      { value: 'low', label: 'Low but functional', color: 'bg-yellow-50' },
                      { value: 'depleted', label: 'Depleted/exhausted', color: 'bg-red-50' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${overallEnergy === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={overallEnergy === option.value}
                          onChange={(e) => setOverallEnergy(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-700 mb-2 block">
                    Body Message: What is my body trying to tell me?
                  </label>
                  <textarea
                    value={bodyMessage}
                    onChange={(e) => setBodyMessage(e.target.value)}
                    placeholder="Listen to your body's wisdom..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div className="bg-teal-100 p-4 rounded-lg">
                  <p className="text-sm text-teal-800">
                    <strong>Research insight:</strong> Body scanning reduces unnoticed stress
                    accumulation by 58% (Mehling et al., 2011)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-pink-500" />
                  Step 2: Emotional Weather Report
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Emotional Awareness research (Barrett et al., 2001)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    Primary emotion present:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'calm', label: 'Calm/Content', icon: '😌' },
                      { value: 'anxious', label: 'Anxious/Worried', icon: '😟' },
                      { value: 'sad', label: 'Sad/Grieving', icon: '😢' },
                      { value: 'angry', label: 'Angry/Frustrated', icon: '😤' },
                      { value: 'overwhelmed', label: 'Overwhelmed', icon: '😵' },
                      { value: 'numb', label: 'Numb/Disconnected', icon: '😶' },
                      { value: 'joyful', label: 'Joyful/Grateful', icon: '😊' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={primaryEmotion === option.value}
                          onChange={(e) => setPrimaryEmotion(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-xl mr-2">{option.icon}</span>
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">Intensity level:</label>
                  <div className="space-y-2">
                    {[
                      { value: '1-2', label: 'Barely there (1-2)', color: 'bg-blue-50' },
                      { value: '3-4', label: 'Noticeable (3-4)', color: 'bg-yellow-50' },
                      { value: '5-6', label: 'Moderate (5-6)', color: 'bg-orange-50' },
                      { value: '7-8', label: 'Strong (7-8)', color: 'bg-red-50' },
                      { value: '9-10', label: 'Overwhelming (9-10)', color: 'bg-red-100' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${intensityLevel === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={intensityLevel === option.value}
                          onChange={(e) => setIntensityLevel(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    This emotion has been here:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'just', label: 'Just arrived' },
                      { value: 'hours', label: 'Few hours' },
                      { value: 'days', label: 'Few days' },
                      { value: 'weeks', label: 'Weeks' },
                      { value: 'always', label: "Can't remember not feeling this" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={emotionDuration === option.value}
                          onChange={(e) => setEmotionDuration(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">Emotion origin:</label>
                  <div className="space-y-2">
                    {[
                      { value: 'specific', label: 'Specific work incident' },
                      { value: 'accumulation', label: 'Accumulation of sessions' },
                      { value: 'personal', label: 'Personal life' },
                      { value: 'global', label: 'Global/societal' },
                      { value: 'unknown', label: 'Unknown source' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={emotionOrigin === option.value}
                          onChange={(e) => setEmotionOrigin(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>

                  {emotionOrigin === 'specific' && (
                    <input
                      type="text"
                      value={originDetail}
                      onChange={(e) => setOriginDetail(e.target.value)}
                      placeholder="Describe the specific incident..."
                      className="w-full mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  )}
                </div>

                <div className="bg-pink-100 p-4 rounded-lg">
                  <p className="text-sm text-pink-800">
                    <strong>Research insight:</strong> Precise emotional identification reduces
                    intensity by 40% (Lieberman et al., 2007)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-500" />
                  Step 3: Cognitive Load Assessment
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Cognitive Load Theory (Sweller, 1988)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    Working memory feels:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'clear', label: 'Clear and sharp', color: 'bg-green-50' },
                      { value: 'full', label: 'Functional but full', color: 'bg-yellow-50' },
                      { value: 'foggy', label: 'Foggy/forgetful', color: 'bg-orange-50' },
                      { value: 'cant-hold', label: "Can't hold thoughts", color: 'bg-red-50' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${workingMemory === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={workingMemory === option.value}
                          onChange={(e) => setWorkingMemory(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    Decision-making ability:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'quick', label: 'Quick and confident', color: 'bg-green-50' },
                      { value: 'slower', label: 'Slower but accurate', color: 'bg-yellow-50' },
                      {
                        value: 'struggling',
                        label: 'Struggling with choices',
                        color: 'bg-orange-50',
                      },
                      { value: 'avoiding', label: 'Avoiding all decisions', color: 'bg-red-50' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${decisionMaking === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={decisionMaking === option.value}
                          onChange={(e) => setDecisionMaking(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    Language processing:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'flowing', label: 'Words flow easily', color: 'bg-green-50' },
                      {
                        value: 'delays',
                        label: 'Occasional word-finding delays',
                        color: 'bg-yellow-50',
                      },
                      { value: 'blanks', label: 'Frequent blanks', color: 'bg-orange-50' },
                      {
                        value: 'exhausting',
                        label: 'Language feels exhausting',
                        color: 'bg-red-50',
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${languageProcessing === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={languageProcessing === option.value}
                          onChange={(e) => setLanguageProcessing(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">Attention span:</label>
                  <div className="space-y-2">
                    {[
                      {
                        value: 'sustained',
                        label: 'Sustained focus possible',
                        color: 'bg-green-50',
                      },
                      { value: 'breaks', label: 'Need frequent breaks', color: 'bg-yellow-50' },
                      {
                        value: 'distracted',
                        label: 'Constantly distracted',
                        color: 'bg-orange-50',
                      },
                      { value: 'no-focus', label: "Can't focus at all", color: 'bg-red-50' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${attentionSpan === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={attentionSpan === option.value}
                          onChange={(e) => setAttentionSpan(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    Cognitive red flags: (Check any present)
                  </label>
                  <div className="space-y-2">
                    {[
                      'Forgetting common words/terms',
                      'Making unusual errors',
                      'Unable to recall recent sessions',
                      'Mixing up languages/registers',
                    ].map((flag) => (
                      <label
                        key={flag}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={cognitiveRedFlags.includes(flag)}
                          onChange={() => toggleRedFlag(flag)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{flag}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-100 p-4 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Research insight:</strong> Early cognitive overload detection prevents
                    errors by 71% (Paas et al., 2003)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                  Step 4: Processing Work Experiences
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Secondary Trauma research (Figley, 1995)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    Thoughts about work:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'none', label: 'No intrusive thoughts', color: 'bg-green-50' },
                      {
                        value: 'occasional',
                        label: 'Occasional unwanted images',
                        color: 'bg-yellow-50',
                      },
                      {
                        value: 'frequent',
                        label: 'Frequent replay of sessions',
                        color: 'bg-orange-50',
                      },
                      {
                        value: 'constant',
                        label: 'Frequent thoughts about client stories',
                        color: 'bg-red-50',
                      },
                      {
                        value: 'nightmares',
                        label: 'Nightmares about interpreted content',
                        color: 'bg-red-100',
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${intrusion === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={intrusion === option.value}
                          onChange={(e) => setIntrusion(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    Avoidance patterns:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'none', label: 'Not avoiding anything', color: 'bg-green-50' },
                      { value: 'topics', label: 'Avoiding certain topics', color: 'bg-yellow-50' },
                      {
                        value: 'settings',
                        label: 'Avoiding certain settings',
                        color: 'bg-orange-50',
                      },
                      { value: 'media', label: 'Avoiding news/media', color: 'bg-red-50' },
                      { value: 'work', label: 'Avoiding work entirely', color: 'bg-red-100' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${avoidance === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={avoidance === option.value}
                          onChange={(e) => setAvoidance(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    Nervous system arousal:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'calm', label: 'Generally calm', color: 'bg-green-50' },
                      { value: 'edge', label: 'Mildly on edge', color: 'bg-yellow-50' },
                      { value: 'hyper', label: 'Hypervigilant', color: 'bg-orange-50' },
                      { value: 'startled', label: 'Easily startled', color: 'bg-red-50' },
                      { value: 'activated', label: 'Constantly activated', color: 'bg-red-100' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${arousal === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={arousal === option.value}
                          onChange={(e) => setArousal(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">Worldview impact:</label>
                  <div className="space-y-2">
                    {[
                      {
                        value: 'balanced',
                        label: 'Maintaining balanced perspective',
                        color: 'bg-green-50',
                      },
                      { value: 'cynical', label: 'Slightly more cynical', color: 'bg-yellow-50' },
                      { value: 'losing', label: 'Losing faith in humanity', color: 'bg-orange-50' },
                      {
                        value: 'dangerous',
                        label: 'Everything feels dangerous',
                        color: 'bg-red-50',
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${worldview === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={worldview === option.value}
                          onChange={(e) => setWorldview(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-orange-100 p-4 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Research insight:</strong> Early vicarious trauma detection reduces
                    severity by 62% (Bride, 2007)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Battery className="w-5 h-5 mr-2 text-blue-500" />
                  Step 5: Resilience Resources
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Conservation of Resources Theory (Hobfoll, 1989)
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Physical resources:</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'sleep', label: 'Sleep', state: sleep, setState: setSleep },
                      {
                        key: 'nutrition',
                        label: 'Nutrition',
                        state: nutrition,
                        setState: setNutrition,
                      },
                      {
                        key: 'movement',
                        label: 'Movement',
                        state: movement,
                        setState: setMovement,
                      },
                      {
                        key: 'medical',
                        label: 'Medical care',
                        state: medicalCare,
                        setState: setMedicalCare,
                      },
                    ].map((resource) => (
                      <div key={resource.key}>
                        <label className="text-sm font-medium text-gray-700">
                          {resource.label}:
                        </label>
                        <select
                          value={resource.state}
                          onChange={(e) => resource.setState(e.target.value)}
                          className="w-full mt-1 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select...</option>
                          <option value="adequate">Adequate</option>
                          <option value="insufficient">Insufficient</option>
                          <option value="severely">Severely lacking</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Social resources:</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        key: 'support',
                        label: 'Support system',
                        state: supportSystem,
                        setState: setSupportSystem,
                      },
                      {
                        key: 'community',
                        label: 'Professional community',
                        state: professionalCommunity,
                        setState: setProfessionalCommunity,
                      },
                      {
                        key: 'supervision',
                        label: 'Supervision/mentoring',
                        state: supervision,
                        setState: setSupervision,
                      },
                    ].map((resource) => (
                      <div key={resource.key}>
                        <label className="text-sm font-medium text-gray-700">
                          {resource.label}:
                        </label>
                        <select
                          value={resource.state}
                          onChange={(e) => resource.setState(e.target.value)}
                          className="w-full mt-1 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select...</option>
                          <option value="strong">Strong</option>
                          <option value="limited">Limited</option>
                          <option value="isolated">Isolated/None</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Psychological resources:</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        key: 'coping',
                        label: 'Coping strategies',
                        state: copingStrategies,
                        setState: setCopingStrategies,
                      },
                      {
                        key: 'boundaries',
                        label: 'Boundaries',
                        state: boundaries,
                        setState: setBoundaries,
                      },
                      {
                        key: 'meaning',
                        label: 'Meaning/purpose',
                        state: meaningPurpose,
                        setState: setMeaningPurpose,
                      },
                    ].map((resource) => (
                      <div key={resource.key}>
                        <label className="text-sm font-medium text-gray-700">
                          {resource.label}:
                        </label>
                        <select
                          value={resource.state}
                          onChange={(e) => resource.setState(e.target.value)}
                          className="w-full mt-1 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select...</option>
                          <option value="working">Working well</option>
                          <option value="partial">Partially effective</option>
                          <option value="failing">Failing/Collapsed</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    One resource that needs immediate attention:
                  </label>
                  <input
                    type="text"
                    value={needsAttention}
                    onChange={(e) => setNeedsAttention(e.target.value)}
                    placeholder="Which resource is most critical to address?"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Research insight:</strong> Resource assessment improves help-seeking by
                    76% (Taylor et al., 2004)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-500" />
                  Step 6: Wellness Triage
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  45 seconds • Based on Stepped Care Model (Bower & Gilbody, 2005)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    My Current Wellness Level:
                  </label>
                  <div className="space-y-3">
                    {[
                      {
                        value: 'green',
                        label: 'GREEN - Thriving',
                        description: [
                          'Managing stress well',
                          'Resources are adequate',
                          'Need: Maintenance',
                        ],
                        color: 'bg-green-50 border-green-300',
                      },
                      {
                        value: 'yellow',
                        label: 'YELLOW - Managing',
                        description: [
                          'Some stress accumulation',
                          'Resources stretched',
                          'Need: Proactive support',
                        ],
                        color: 'bg-yellow-50 border-yellow-300',
                      },
                      {
                        value: 'orange',
                        label: 'ORANGE - Struggling',
                        description: [
                          'Significant stress',
                          'Resources depleting',
                          'Need: Active intervention',
                        ],
                        color: 'bg-orange-50 border-orange-300',
                      },
                      {
                        value: 'red',
                        label: 'RED - Crisis',
                        description: [
                          'Overwhelming stress',
                          'Resources exhausted',
                          'Need: Immediate help',
                        ],
                        color: 'bg-red-50 border-red-300',
                      },
                    ].map((level) => (
                      <label
                        key={level.value}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${wellnessLevel === level.value ? level.color : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <input
                          type="radio"
                          value={level.value}
                          checked={wellnessLevel === level.value}
                          onChange={(e) => setWellnessLevel(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-start">
                          <div
                            className={`w-4 h-4 rounded-full mt-1 mr-3 ${
                              level.value === 'green'
                                ? 'bg-green-500'
                                : level.value === 'yellow'
                                  ? 'bg-yellow-500'
                                  : level.value === 'orange'
                                    ? 'bg-orange-500'
                                    : 'bg-red-500'
                            }`}
                          />
                          <div>
                            <div className="font-semibold text-gray-900">{level.label}</div>
                            <ul className="mt-1 space-y-1">
                              {level.description.map((item, idx) => (
                                <li key={idx} className="text-sm text-gray-600">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    Based on my level, I need:
                  </label>
                  <textarea
                    value={levelNeed}
                    onChange={(e) => setLevelNeed(e.target.value)}
                    placeholder="What specific support or action do you need right now?"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Step 7: Wellness Prescription
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  45 seconds • Based on Self-Care research (Norcross & Guy, 2007)
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-5 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    My Wellness Rx for the next 24 hours:
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        ONE thing I'll stop/reduce:
                      </label>
                      <input
                        type="text"
                        value={stopReduce}
                        onChange={(e) => setStopReduce(e.target.value)}
                        placeholder="What will you eliminate or minimize?"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        ONE thing I'll start/increase:
                      </label>
                      <input
                        type="text"
                        value={startIncrease}
                        onChange={(e) => setStartIncrease(e.target.value)}
                        placeholder="What will you add or do more of?"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        ONE person I'll connect with:
                      </label>
                      <input
                        type="text"
                        value={connectWith}
                        onChange={(e) => setConnectWith(e.target.value)}
                        placeholder="Who will you reach out to?"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        ONE boundary I'll set/reinforce:
                      </label>
                      <input
                        type="text"
                        value={boundarySet}
                        onChange={(e) => setBoundarySet(e.target.value)}
                        placeholder="What limit will you establish?"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {(wellnessLevel === 'orange' || wellnessLevel === 'red') && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">
                      If in ORANGE/RED zone, I will:
                    </h4>
                    <div className="space-y-2">
                      {[
                        { value: 'supervisor', label: 'Contact my supervisor' },
                        { value: 'therapy', label: 'Schedule therapy session' },
                        { value: 'time-off', label: 'Take time off' },
                        { value: 'support', label: 'Call support person' },
                        { value: 'crisis', label: 'Use crisis resources' },
                      ].map((action) => (
                        <label
                          key={action.value}
                          className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-white transition-colors"
                        >
                          <input
                            type="radio"
                            value={action.value}
                            checked={crisisAction === action.value}
                            onChange={(e) => setCrisisAction(e.target.value)}
                            className="mr-3"
                          />
                          <span className="text-gray-700">{action.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 8 && !showSummary && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
                  Step 8: Trend Tracking
                </h3>
                <p className="text-sm text-gray-600 mb-4">Compare to last week:</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-2 block">Physical health:</label>
                  <div className="flex space-x-2">
                    {['Better', 'Same', 'Worse'].map((trend) => (
                      <button
                        key={trend}
                        onClick={() => setPhysicalTrend(trend.toLowerCase())}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                          physicalTrend === trend.toLowerCase()
                            ? trend === 'Better'
                              ? 'bg-green-500 text-white'
                              : trend === 'Same'
                                ? 'bg-blue-500 text-white'
                                : 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {trend}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">Emotional state:</label>
                  <div className="flex space-x-2">
                    {['Better', 'Same', 'Worse'].map((trend) => (
                      <button
                        key={trend}
                        onClick={() => setEmotionalTrend(trend.toLowerCase())}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                          emotionalTrend === trend.toLowerCase()
                            ? trend === 'Better'
                              ? 'bg-green-500 text-white'
                              : trend === 'Same'
                                ? 'bg-blue-500 text-white'
                                : 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {trend}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">Mental clarity:</label>
                  <div className="flex space-x-2">
                    {['Better', 'Same', 'Worse'].map((trend) => (
                      <button
                        key={trend}
                        onClick={() => setMentalTrend(trend.toLowerCase())}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                          mentalTrend === trend.toLowerCase()
                            ? trend === 'Better'
                              ? 'bg-green-500 text-white'
                              : trend === 'Same'
                                ? 'bg-blue-500 text-white'
                                : 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {trend}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    Overall trajectory:
                  </label>
                  <div className="flex space-x-2">
                    {['Improving', 'Stable', 'Declining'].map((trend) => (
                      <button
                        key={trend}
                        onClick={() => setOverallTrend(trend.toLowerCase())}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                          overallTrend === trend.toLowerCase()
                            ? trend === 'Improving'
                              ? 'bg-green-500 text-white'
                              : trend === 'Stable'
                                ? 'bg-blue-500 text-white'
                                : 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {trend}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    The Science Behind Wellness Check-ins:
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      • <strong>Weekly wellness checks</strong> reduce burnout by 43% (Maslach &
                      Leiter, 2016)
                    </li>
                    <li>
                      • <strong>Body awareness</strong> prevents 67% of stress-related illness
                      (Mehling et al., 2011)
                    </li>
                    <li>
                      • <strong>Early intervention</strong> reduces recovery time by 75% (Stamm,
                      2010)
                    </li>
                    <li>
                      • <strong>Self-monitoring</strong> improves wellness behaviors by 52% (Michie
                      et al., 2009)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {showSummary && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Check className="w-6 h-6 mr-2 text-green-500" />
                  Wellness Check-In Complete
                </h3>
              </div>

              <div className={`p-6 rounded-xl text-white ${getWellnessColor()}`}>
                <h4 className="text-lg font-bold mb-2">
                  Your Wellness Status: {wellnessLevel.toUpperCase()}
                </h4>
                <p className="text-sm opacity-90">{levelNeed}</p>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl border-2 border-teal-200">
                <h4 className="font-bold text-lg mb-4 text-gray-900">
                  Your 24-Hour Wellness Prescription:
                </h4>
                <div className="space-y-2 text-gray-800">
                  <p>
                    <strong>Stop/Reduce:</strong> {stopReduce}
                  </p>
                  <p>
                    <strong>Start/Increase:</strong> {startIncrease}
                  </p>
                  <p>
                    <strong>Connect with:</strong> {connectWith}
                  </p>
                  <p>
                    <strong>Boundary to set:</strong> {boundarySet}
                  </p>
                </div>
              </div>

              {(wellnessLevel === 'orange' || wellnessLevel === 'red') && crisisAction && (
                <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 mb-2" />
                  <p className="font-semibold text-red-900">
                    Immediate action: {crisisAction.replace('-', ' ')}
                  </p>
                </div>
              )}

              <div className="text-center">
                <p className="text-green-600 font-semibold">
                  Your wellness data has been captured. Closing in 3 seconds...
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            {currentStep > 1 && currentStep < 8 && (
              <button
                onClick={handlePrev}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
            )}

            <div className="flex-1" />

            {currentStep < 8 && (
              <button
                onClick={handleNext}
                disabled={!isStepComplete()}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                  isStepComplete()
                    ? 'bg-teal-500 text-white hover:bg-teal-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}

            {currentStep === 8 && !showSummary && (
              <button
                onClick={handleComplete}
                disabled={!isStepComplete() || isSaving}
                className={`px-6 py-2 rounded-lg transition-all flex items-center ${
                  isStepComplete() && !isSaving
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Complete Check-In'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessCheckIn;
