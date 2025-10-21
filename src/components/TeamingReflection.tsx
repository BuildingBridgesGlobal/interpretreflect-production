import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reflectionService } from '../services/reflectionService';
import {
  X,
  Users,
  Trophy,
  BarChart3,
  Shield,
  MessageCircle,
  Target,
  TrendingUp,
  Check,
  ChevronRight,
  ChevronLeft,
  Heart,
  AlertTriangle,
} from 'lucide-react';

interface TeamingReflectionProps {
  onComplete: (results: TeamReflectionResults) => void;
  onClose: () => void;
}

interface TeamReflectionResults {
  teamVictory: {
    nailed: string;
    smoothestHandoff: string;
    clicked: string;
    acknowledgment: string;
  };
  coordination: {
    handoffs: string;
    bestMoment: string;
    whyItWorked: string;
    supportBehaviors: string;
    coordinationScore: number; // 1-10 scale
  };
  cognitiveLoad: {
    planned: string;
    actual: string;
    reason: string;
    nextTime: string;
    loadBalanceEffective: boolean; // Was the load balance effective?
  };
  errorRecovery: {
    errorsCaught: string;
    recoverySuccess: string;
    bestRecovery: string;
    improvement: string;
    nextTime: string;
    errorCount: number; // Numeric count of errors
    recoveryRate: number; // Percentage of successful recoveries
  };
  trust: {
    comfortable: string[];
    partnerSeemed: string;
    trustBuilders: string;
    trustStrains: string;
    trustScore: number; // 1-10 scale
    psychologicalSafety: number; // 1-10 scale
  };
  feedback: {
    forPartner: {
      helped: string;
      strength: string;
      idea: string;
    };
    forSelf: {
      proud: string;
      workOn: string;
      practice: string;
    };
    feedbackGiven: boolean; // Did they exchange feedback?
    actionableItems: number; // Count of specific action items
  };
  forward: {
    keepDoing: string[];
    tryDifferently: string;
    prepareBetter: string;
    improvedSignal: string;
    planMade: boolean; // Was a specific plan created?
    improvementGoals: number; // Number of goals set
  };
  patterns: string[];
  overallRating: string;
  teamEffectivenessScore: number; // 1-10 overall team score
  stressLevel: number;
  energyLevel: number;
  timestamp: Date;
}

const TeamingReflection: React.FC<TeamingReflectionProps> = ({ onComplete, onClose }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [nailed, setNailed] = useState('');
  const [smoothestHandoff, setSmoothestHandoff] = useState('');
  const [clicked, setClicked] = useState('');
  const [acknowledgment, setAcknowledgment] = useState('');
  const [handoffs, setHandoffs] = useState('');
  const [bestMoment, setBestMoment] = useState('');
  const [whyItWorked, setWhyItWorked] = useState('');
  const [supportBehaviors, setSupportBehaviors] = useState('');
  const [plannedLoad, setPlannedLoad] = useState('');
  const [actualLoad, setActualLoad] = useState('');
  const [loadReason, setLoadReason] = useState('');
  const [loadNextTime, setLoadNextTime] = useState('');
  const [errorsCaught, setErrorsCaught] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [bestRecovery, setBestRecovery] = useState('');
  const [recoveryImprovement, setRecoveryImprovement] = useState('');
  const [recoveryNextTime, setRecoveryNextTime] = useState('');
  const [comfortableWith, setComfortableWith] = useState<string[]>([]);
  const [partnerSeemed, setPartnerSeemed] = useState('');
  const [trustBuilders, setTrustBuilders] = useState('');
  const [trustStrains, setTrustStrains] = useState('');
  const [partnerHelped, setPartnerHelped] = useState('');
  const [partnerStrength, setPartnerStrength] = useState('');
  const [partnerIdea, setPartnerIdea] = useState('');
  const [selfProud, setSelfProud] = useState('');
  const [selfWorkOn, setSelfWorkOn] = useState('');
  const [selfPractice, setSelfPractice] = useState('');
  const [keepDoing1, setKeepDoing1] = useState('');
  const [keepDoing2, setKeepDoing2] = useState('');
  const [tryDifferently, setTryDifferently] = useState('');
  const [prepareBetter, setPrepareBetter] = useState('');
  const [improvedSignal, setImprovedSignal] = useState('');
  const [teamPatterns, setTeamPatterns] = useState<string[]>([]);
  const [overallRating, setOverallRating] = useState('');
  const [stressLevel] = useState(5);
  const [energyLevel] = useState(5);
  const [showWisdomBank, setShowWisdomBank] = useState(false);

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
    // Calculate coordination score based on handoffs quality
    const coordinationScore =
      handoffs === 'seamless' ? 10 :
      handoffs === 'smooth' ? 8 :
      handoffs === 'choppy' ? 5 :
      handoffs === 'rough' ? 3 : 7;

    // Check if load balance was effective
    const loadBalanceEffective = plannedLoad === actualLoad || actualLoad === '50-50';

    // Calculate error count from errorsCaught string
    const errorCount =
      errorsCaught === 'none' ? 0 :
      errorsCaught === '1-2-minor' ? 2 :
      errorsCaught === '3-5-minor' ? 4 :
      errorsCaught === '1-2-major' ? 2 :
      errorsCaught === 'several-major' ? 5 : 0;

    // Calculate recovery rate based on recovery success
    const recoveryRate =
      recoverySuccess === 'smooth' ? 100 :
      recoverySuccess === 'adequate' ? 75 :
      recoverySuccess === 'struggled' ? 40 :
      recoverySuccess === 'failed' ? 0 : 50;

    // Calculate trust score based on partner seemed and comfortable items
    const trustScore =
      partnerSeemed === 'supportive' ? 10 :
      partnerSeemed === 'professional' ? 8 :
      partnerSeemed === 'critical' ? 5 :
      partnerSeemed === 'judgmental' ? 3 :
      partnerSeemed === 'unavailable' ? 1 : 7;

    // Calculate psychological safety based on comfortable items checked
    const psychologicalSafety = Math.min(10, comfortableWith.length * 2);

    // Check if feedback was given
    const feedbackGiven = !!(partnerHelped && partnerStrength && selfProud);

    // Count actionable items from feedback
    const actionableItems = [partnerIdea, selfWorkOn, selfPractice].filter(Boolean).length;

    // Check if a plan was made
    const planMade = !!(keepDoing1 && tryDifferently && prepareBetter);

    // Count improvement goals
    const improvementGoals = [tryDifferently, prepareBetter, improvedSignal, selfWorkOn, selfPractice].filter(Boolean).length;

    // Calculate overall team effectiveness score
    const teamEffectivenessScore =
      overallRating === 'exceptional' ? 10 :
      overallRating === 'strong' ? 8 :
      overallRating === 'good' ? 6 :
      overallRating === 'adequate' ? 4 :
      overallRating === 'struggled' ? 2 : 5;

    const results: TeamReflectionResults = {
      teamVictory: {
        nailed,
        smoothestHandoff,
        clicked,
        acknowledgment,
      },
      coordination: {
        handoffs,
        bestMoment,
        whyItWorked,
        supportBehaviors,
        coordinationScore,
      },
      cognitiveLoad: {
        planned: plannedLoad,
        actual: actualLoad,
        reason: loadReason,
        nextTime: loadNextTime,
        loadBalanceEffective,
      },
      errorRecovery: {
        errorsCaught,
        recoverySuccess,
        bestRecovery,
        improvement: recoveryImprovement,
        nextTime: recoveryNextTime,
        errorCount,
        recoveryRate,
      },
      trust: {
        comfortable: comfortableWith,
        partnerSeemed,
        trustBuilders,
        trustStrains,
        trustScore,
        psychologicalSafety,
      },
      feedback: {
        forPartner: {
          helped: partnerHelped,
          strength: partnerStrength,
          idea: partnerIdea,
        },
        forSelf: {
          proud: selfProud,
          workOn: selfWorkOn,
          practice: selfPractice,
        },
        feedbackGiven,
        actionableItems,
      },
      forward: {
        keepDoing: [keepDoing1, keepDoing2].filter(Boolean),
        tryDifferently,
        prepareBetter,
        improvedSignal,
        planMade,
        improvementGoals,
      },
      patterns: teamPatterns,
      overallRating,
      teamEffectivenessScore,
      team_effectiveness: teamEffectivenessScore, // Add field for getDisplayName fallback
      stressLevel,
      energyLevel,
      timestamp: new Date(),
    };

    // Save to database using reflectionService
    if (user?.id) {
      console.log('TeamingReflection - Saving with reflectionService');

      const result = await reflectionService.saveReflection(
        user.id,
        'teaming_reflection',
        results
      );

      if (!result.success) {
        console.error('TeamingReflection - Error saving:', result.error);
      } else {
        console.log('TeamingReflection - Saved successfully');
      }
    } else {
      console.error('TeamingReflection - No user found');
    }

    setShowWisdomBank(true);
    onComplete(results);
  };

  const toggleComfortable = (item: string) => {
    setComfortableWith((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const togglePattern = (pattern: string) => {
    setTeamPatterns((prev) =>
      prev.includes(pattern) ? prev.filter((p) => p !== pattern) : [...prev, pattern]
    );
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return nailed && smoothestHandoff && clicked && acknowledgment;
      case 2:
        return handoffs && bestMoment && supportBehaviors;
      case 3:
        return (
          plannedLoad &&
          actualLoad &&
          (actualLoad !== plannedLoad ? loadReason : true) &&
          loadNextTime
        );
      case 4:
        return errorsCaught && recoverySuccess;
      case 5:
        return comfortableWith.length > 0 && partnerSeemed;
      case 6:
        return partnerHelped && partnerStrength && selfProud;
      case 7:
        return keepDoing1 && tryDifferently;
      case 8:
        return overallRating;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Team Reflection</h2>
                <p className="text-sm text-gray-600 mt-1">5-minute team debrief protocol</p>
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
                      ? 'bg-purple-500 text-white scale-110'
                      : step < currentStep
                        ? 'bg-[rgba(107,130,104,0.05)]0 text-white'
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
                  <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                  Step 1: Immediate Team Discharge
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  45 seconds • Based on Collective Efficacy research (Bandura, 1997)
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-yellow-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-4">Team Victory Lap:</h4>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        One thing we nailed:
                      </label>
                      <input
                        type="text"
                        value={nailed}
                        onChange={(e) => setNailed(e.target.value)}
                        placeholder="What went exceptionally well?"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Smoothest handoff moment:
                      </label>
                      <input
                        type="text"
                        value={smoothestHandoff}
                        onChange={(e) => setSmoothestHandoff(e.target.value)}
                        placeholder="When did transitions flow perfectly?"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        When we really clicked:
                      </label>
                      <input
                        type="text"
                        value={clicked}
                        onChange={(e) => setClicked(e.target.value)}
                        placeholder="Moment of perfect synchronization"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    Quick Pressure Release:
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        value: 'high-five',
                        label: 'High-five / fist bump / head nod (if together)',
                        icon: '🤝',
                      },
                      { value: 'emoji', label: 'Text emoji to partner (if remote)', icon: '📱' },
                      {
                        value: 'internal',
                        label: 'Internal acknowledgment (if solo debrief)',
                        icon: '💭',
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={acknowledgment === option.value}
                          onChange={(e) => setAcknowledgment(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-2xl mr-2">{option.icon}</span>
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-100 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Research insight:</strong> Teams that celebrate wins show 34% better
                    performance in future sessions (Gully et al., 2002)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                  Step 2: Coordination Analysis
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  90 seconds • Based on Team Coordination Dynamics (Rico et al., 2008)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">Handoffs:</label>
                  <div className="space-y-2">
                    {[
                      {
                        value: 'seamless',
                        label: 'Seamless - we read each other perfectly',
                        color: 'bg-[rgba(107,130,104,0.05)] hover:bg-green-100',
                      },
                      {
                        value: 'smooth',
                        label: 'Smooth - minor adjustments needed',
                        color: 'bg-blue-50 hover:bg-blue-100',
                      },
                      {
                        value: 'choppy',
                        label: 'Choppy - several awkward moments',
                        color: 'bg-yellow-50 hover:bg-yellow-100',
                      },
                      {
                        value: 'rough',
                        label: 'Rough - multiple coordination breaks',
                        color: 'bg-red-50 hover:bg-red-100',
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${handoffs === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={handoffs === option.value}
                          onChange={(e) => setHandoffs(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Best coordination moment:
                      </label>
                      <input
                        type="text"
                        value={bestMoment}
                        onChange={(e) => setBestMoment(e.target.value)}
                        placeholder="Describe your best teamwork moment"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Why it worked:</label>
                      <textarea
                        value={whyItWorked}
                        onChange={(e) => setWhyItWorked(e.target.value)}
                        placeholder="What made this moment successful?"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">Support Behaviors:</label>
                  <div className="space-y-2">
                    {[
                      {
                        value: 'anticipated',
                        label: 'Partner caught my struggles before I signaled',
                      },
                      { value: 'timely', label: 'Support came right when requested' },
                      { value: 'delayed', label: 'Some delays but recovered' },
                      { value: 'failed', label: "Support system didn't work today" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={supportBehaviors === option.value}
                          onChange={(e) => setSupportBehaviors(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Research insight:</strong> Teams analyzing coordination improve by 41%
                    within 5 sessions (Kozlowski & Ilgen, 2006)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-purple-500" />
                  Step 3: Cognitive Load Balance
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Distributed Cognition Theory (Hutchins, 1995)
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-900 mb-2 block">What we planned:</label>
                    <select
                      value={plannedLoad}
                      onChange={(e) => setPlannedLoad(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="50-50">50/50</option>
                      <option value="60-40">60/40</option>
                      <option value="70-30">70/30</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-gray-900 mb-2 block">
                      What actually happened:
                    </label>
                    <select
                      value={actualLoad}
                      onChange={(e) => setActualLoad(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="50-50">50/50</option>
                      <option value="60-40">60/40</option>
                      <option value="70-30">70/30</option>
                      <option value="90-10">90/10</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {plannedLoad && actualLoad && plannedLoad !== actualLoad && (
                  <div>
                    <label className="font-medium text-gray-900 mb-3 block">
                      If different, why:
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'complexity', label: 'Content complexity surprised us' },
                        { value: 'energy', label: "One partner's energy dropped" },
                        { value: 'technical', label: 'Technical terminology imbalance' },
                        { value: 'speed', label: 'Speed overwhelmed one partner' },
                        { value: 'emotional', label: 'Emotional content impact' },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={loadReason === option.value}
                            onChange={(e) => setLoadReason(e.target.value)}
                            className="mt-1 mr-3"
                          />
                          <span className="text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">For next time:</label>
                  <textarea
                    value={loadNextTime}
                    onChange={(e) => setLoadNextTime(e.target.value)}
                    placeholder="How will we adjust our load distribution?"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div className="bg-purple-100 p-4 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Research insight:</strong> Teams that adjust load distribution based on
                    reality show 55% less burnout (Seeber, 2011)
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
                  Step 4: Error Recovery Assessment
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on High Reliability Teams research (Weick & Sutcliffe, 2001)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">Errors We Caught:</label>
                  <div className="space-y-2">
                    {[
                      { value: 'none', label: 'None needed', color: 'bg-[rgba(107,130,104,0.05)]' },
                      { value: '1-2-minor', label: '1-2 minor', color: 'bg-blue-50' },
                      { value: '3-5-minor', label: '3-5 minor', color: 'bg-yellow-50' },
                      { value: '1-2-major', label: '1-2 major', color: 'bg-orange-50' },
                      { value: 'several-major', label: 'Several major', color: 'bg-red-50' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${errorsCaught === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={errorsCaught === option.value}
                          onChange={(e) => setErrorsCaught(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">Recovery Success:</label>
                  <div className="space-y-2">
                    {[
                      {
                        value: 'smooth',
                        label: "Smooth recoveries - audience likely didn't notice",
                      },
                      { value: 'adequate', label: 'Adequate - minor disruption' },
                      { value: 'struggled', label: 'Struggled - obvious difficulties' },
                      { value: 'failed', label: 'Failed to recover - errors remained' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={recoverySuccess === option.value}
                          onChange={(e) => setRecoverySuccess(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Best recovery moment:
                    </label>
                    <input
                      type="text"
                      value={bestRecovery}
                      onChange={(e) => setBestRecovery(e.target.value)}
                      placeholder="Describe a smooth error recovery"
                      className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      One recovery that could've been smoother:
                    </label>
                    <input
                      type="text"
                      value={recoveryImprovement}
                      onChange={(e) => setRecoveryImprovement(e.target.value)}
                      placeholder="What happened?"
                      className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Next time we'll:</label>
                    <input
                      type="text"
                      value={recoveryNextTime}
                      onChange={(e) => setRecoveryNextTime(e.target.value)}
                      placeholder="How will we handle this better?"
                      className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="bg-orange-100 p-4 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Research insight:</strong> Teams that debrief errors reduce repeat
                    mistakes by 67% (Gersick & Hackman, 1990)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Step 5: Trust & Psychological Safety
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Team Psychological Safety (Edmondson, 1999)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    I felt comfortable:
                  </label>
                  <div className="space-y-2">
                    {[
                      'Asking for help when needed',
                      'Admitting when I lost the thread',
                      'Making minor mistakes',
                      'Taking risks with difficult content',
                      'Being vulnerable about my limits',
                    ].map((item) => (
                      <label
                        key={item}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={comfortableWith.includes(item)}
                          onChange={() => toggleComfortable(item)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">My partner seemed:</label>
                  <div className="space-y-2">
                    {[
                      {
                        value: 'supportive',
                        label: 'Supportive without judgment',
                        color: 'bg-[rgba(107,130,104,0.05)]',
                      },
                      {
                        value: 'professional',
                        label: 'Professional and helpful',
                        color: 'bg-blue-50',
                      },
                      { value: 'critical', label: 'Somewhat critical', color: 'bg-yellow-50' },
                      {
                        value: 'judgmental',
                        label: 'Judgmental or frustrated',
                        color: 'bg-orange-50',
                      },
                      {
                        value: 'unavailable',
                        label: 'Checked out / unavailable',
                        color: 'bg-red-50',
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${partnerSeemed === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={partnerSeemed === option.value}
                          onChange={(e) => setPartnerSeemed(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Trust builders from today:
                    </label>
                    <input
                      type="text"
                      value={trustBuilders}
                      onChange={(e) => setTrustBuilders(e.target.value)}
                      placeholder="What strengthened our partnership?"
                      className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Trust strains (if any):
                    </label>
                    <input
                      type="text"
                      value={trustStrains}
                      onChange={(e) => setTrustStrains(e.target.value)}
                      placeholder="Any moments of tension or concern?"
                      className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="bg-red-100 p-4 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Research insight:</strong> Teams with high psychological safety perform
                    47% better (Edmondson, 2012)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-green-500" />
                  Step 6: Specific Feedback Exchange
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  45 seconds • Based on Effective Feedback research (Kluger & DeNisi, 1996)
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-[rgba(107,130,104,0.05)] p-5 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-4">For My Partner:</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        You really helped when you:
                      </label>
                      <input
                        type="text"
                        value={partnerHelped}
                        onChange={(e) => setPartnerHelped(e.target.value)}
                        placeholder="Specific helpful action"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Your strength today was:
                      </label>
                      <input
                        type="text"
                        value={partnerStrength}
                        onChange={(e) => setPartnerStrength(e.target.value)}
                        placeholder="What they did exceptionally well"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        One idea for next time:
                      </label>
                      <input
                        type="text"
                        value={partnerIdea}
                        onChange={(e) => setPartnerIdea(e.target.value)}
                        placeholder='Frame as "What if we try..." not "You should..."'
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Frame as "What if we try..." not "You should..."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-5 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-4">For Myself:</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">I'm proud that I:</label>
                      <input
                        type="text"
                        value={selfProud}
                        onChange={(e) => setSelfProud(e.target.value)}
                        placeholder="Personal achievement today"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        I want to work on:
                      </label>
                      <input
                        type="text"
                        value={selfWorkOn}
                        onChange={(e) => setSelfWorkOn(e.target.value)}
                        placeholder="Area for improvement"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        I need to practice:
                      </label>
                      <input
                        type="text"
                        value={selfPractice}
                        onChange={(e) => setSelfPractice(e.target.value)}
                        placeholder="Specific skill to develop"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Research insight:</strong> Specific behavioral feedback improves
                    performance 39% more than general feedback (Hattie & Timperley, 2007)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-indigo-500" />
                  Step 7: Forward Planning
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  30 seconds • Based on Team Learning Theory (Argote et al., 2001)
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-indigo-50 p-5 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-4">Next Time With This Partner:</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Keep doing:
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={keepDoing1}
                          onChange={(e) => setKeepDoing1(e.target.value)}
                          placeholder="1. Success to repeat"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={keepDoing2}
                          onChange={(e) => setKeepDoing2(e.target.value)}
                          placeholder="2. Another success to repeat"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Try differently:</label>
                      <input
                        type="text"
                        value={tryDifferently}
                        onChange={(e) => setTryDifferently(e.target.value)}
                        placeholder="One thing to change"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Prepare better for:
                      </label>
                      <input
                        type="text"
                        value={prepareBetter}
                        onChange={(e) => setPrepareBetter(e.target.value)}
                        placeholder="What caught us off guard today?"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Our improved signal for:
                      </label>
                      <input
                        type="text"
                        value={improvedSignal}
                        onChange={(e) => setImprovedSignal(e.target.value)}
                        placeholder="What signal needs clarification?"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 8 && !showWisdomBank && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                  Step 8: Team Pattern Tracking
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    This partnership tends to:
                  </label>
                  <div className="space-y-2">
                    {[
                      'Excel with technical content',
                      'Excel with emotional content',
                      'Work best in short sprints',
                      'Maintain energy in long sessions',
                      'Recover quickly from errors',
                      'Need more prep time',
                    ].map((pattern) => (
                      <label
                        key={pattern}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={teamPatterns.includes(pattern)}
                          onChange={() => togglePattern(pattern)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{pattern}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    Overall team rating today:
                  </label>
                  <div className="flex space-x-2">
                    {[
                      { value: 'exceptional', label: 'Exceptional', color: 'bg-[rgba(107,130,104,0.05)]0' },
                      { value: 'strong', label: 'Strong', color: 'bg-blue-500' },
                      { value: 'good', label: 'Good', color: 'bg-yellow-500' },
                      { value: 'adequate', label: 'Adequate', color: 'bg-orange-500' },
                      { value: 'struggled', label: 'Struggled', color: 'bg-red-500' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setOverallRating(option.value)}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                          overallRating === option.value
                            ? `${option.color} text-white`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    The Science Behind Team Reflection:
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      • <strong>Team debriefs</strong> improve next performance by 25% (Tannenbaum &
                      Cerasoli, 2013)
                    </li>
                    <li>
                      • <strong>Trust assessment</strong> predicts team success with 82% accuracy
                      (De Jong et al., 2016)
                    </li>
                    <li>
                      • <strong>Specific feedback</strong> accelerates skill development by 40%
                      (Villado & Arthur, 2013)
                    </li>
                    <li>
                      • <strong>Pattern recognition</strong> reduces team errors by 58% over time
                      (Schippers et al., 2013)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {showWisdomBank && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Check className="w-6 h-6 mr-2 text-green-500" />
                  Team Wisdom Bank
                </h3>
                <p className="text-sm text-gray-600 mb-4">Your team insights have been saved!</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border-2 border-purple-200">
                <h4 className="font-bold text-lg mb-4 text-gray-900">
                  Best practices with this partner:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-800">
                  <li>{keepDoing1}</li>
                  {keepDoing2 && <li>{keepDoing2}</li>}
                </ul>

                <h4 className="font-bold text-lg mt-6 mb-4 text-gray-900">
                  Watch-outs for next time:
                </h4>
                <p className="text-gray-800">{prepareBetter}</p>

                <h4 className="font-bold text-lg mt-6 mb-4 text-gray-900">
                  Our superpower as a team:
                </h4>
                <p className="text-gray-800">{partnerStrength}</p>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 rounded-xl text-white">
                <p className="text-lg font-semibold text-center">
                  Team reflection complete! Your partnership insights have been captured.
                </p>
              </div>

              <div className="text-center">
                <p className="text-green-600 font-semibold">Closing in 3 seconds...</p>
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
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}

            {currentStep === 8 && !showWisdomBank && (
              <button
                onClick={handleComplete}
                disabled={!isStepComplete()}
                className={`px-6 py-2 rounded-lg transition-all flex items-center ${
                  isStepComplete()
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4 mr-2" />
                Complete Team Reflection
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamingReflection;
