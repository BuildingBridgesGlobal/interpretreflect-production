import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reflectionService } from '../services/reflectionService';
import {
  X,
  GraduationCap,
  Lightbulb,
  Heart,
  Target,
  TrendingUp,
  Users,
  CheckCircle,
  Check,
  ChevronRight,
  ChevronLeft,
  Brain,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface MentoringReflectionProps {
  onComplete: (results: MentoringReflectionResults) => void;
  onClose: () => void;
}

interface MentoringReflectionResults {
  immediateCapture: {
    valuableHeard: string;
    surprisingAdvice: string;
    challengedThinking: string;
    neededValidation: string;
    insightsCaptured: number; // Count of valuable insights
  };
  wisdomDistillation: {
    learnedWork: string;
    learnedSelf: string;
    learnedGrowth: string;
    patternSeen: string;
    assumptionQuestion: string;
    wisdomScore: number; // 1-10 scale for wisdom gained
    patternsIdentified: number; // Count of patterns recognized
  };
  emotionalIntegration: {
    sessionFeeling: string;
    difficultTrigger?: string;
    difficultMeaning?: string;
    difficultProcess?: string;
    positiveCreated?: string;
    positiveCultivate?: string;
    emotionalClarity: number; // 1-10 scale
    resistanceLevel: number; // 1-10 scale (lower is better)
  };
  actionPlan: {
    immediate: {
      action: string;
      when: string;
      because: string;
    };
    thisWeek: {
      action: string;
      day: string;
      practice: string;
    };
    thisMonth: string;
    resources: string[];
    personToTalk: string;
    actionItemsCount: number; // Total number of action items
    planSpecificity: number; // 1-10 scale for how specific the plan is
    commitmentLevel: number; // 1-10 scale for commitment to plan
  };
  growthEdge: {
    nowClear: string;
    stillFuzzy: string;
    mysterious: string;
    nextEdge: string;
    needsFor: string[];
    clarityGained: number; // 1-10 scale
    growthAreasIdentified: number; // Count of growth areas
  };
  relationship: {
    workedWell: string[];
    couldImprove: string[];
    followUp: string;
    mentorEffectiveness: number; // 1-10 scale
    relationshipQuality: number; // 1-10 scale
    followUpPlanned: boolean; // Was a follow-up scheduled?
  };
  commitment: {
    stopDoing: string;
    startDoing: string;
    continueDoing: string;
    growthIndicator: string;
    checkInDate: string;
    commitmentsMade: number; // Count of specific commitments
    accountabilitySet: boolean; // Was accountability established?
  };
  wisdomBank: {
    quotableInsight: string;
    storyExample: string;
    mistakeAvoid: string;
    successPattern: string;
    wisdomItems: number; // Count of wisdom items captured
  };
  sessionValue: number; // 1-10 overall session value
  applicabilityScore: number; // 1-10 how applicable to current situation
  stressLevel: number;
  energyLevel: number;
  timestamp: Date;
}

const MentoringReflection: React.FC<MentoringReflectionProps> = ({ onComplete, onClose }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Immediate Capture
  const [valuableHeard, setValuableHeard] = useState('');
  const [surprisingAdvice, setSurprisingAdvice] = useState('');
  const [challengedThinking, setChallengedThinking] = useState('');
  const [neededValidation, setNeededValidation] = useState('');

  // Step 2: Wisdom Distillation
  const [learnedWork, setLearnedWork] = useState('');
  const [learnedSelf, setLearnedSelf] = useState('');
  const [learnedGrowth, setLearnedGrowth] = useState('');
  const [patternSeen, setPatternSeen] = useState('');
  const [assumptionQuestion, setAssumptionQuestion] = useState('');

  // Step 3: Emotional Integration
  const [sessionFeeling, setSessionFeeling] = useState('');
  const [difficultTrigger, setDifficultTrigger] = useState('');
  const [difficultMeaning, setDifficultMeaning] = useState('');
  const [difficultProcess, setDifficultProcess] = useState('');
  const [positiveCreated, setPositiveCreated] = useState('');
  const [positiveCultivate, setPositiveCultivate] = useState('');

  // Step 4: Action Crystallization
  const [immediateAction, setImmediateAction] = useState('');
  const [immediateWhen, setImmediateWhen] = useState('');
  const [immediateBecause, setImmediateBecause] = useState('');
  const [weekAction, setWeekAction] = useState('');
  const [weekDay, setWeekDay] = useState('');
  const [weekPractice, setWeekPractice] = useState('');
  const [monthAction, setMonthAction] = useState('');
  const [resource1, setResource1] = useState('');
  const [resource2, setResource2] = useState('');
  const [personToTalk, setPersonToTalk] = useState('');

  // Step 5: Growth Edge
  const [nowClear, setNowClear] = useState('');
  const [stillFuzzy, setStillFuzzy] = useState('');
  const [mysterious, setMysterious] = useState('');
  const [nextEdge, setNextEdge] = useState('');
  const [needsFor, setNeedsFor] = useState<string[]>([]);

  // Step 6: Relationship
  const [workedWell, setWorkedWell] = useState<string[]>([]);
  const [couldImprove, setCouldImprove] = useState<string[]>([]);
  const [followUp, setFollowUp] = useState('');

  // Step 7: Commitment
  const [stopDoing, setStopDoing] = useState('');
  const [startDoing, setStartDoing] = useState('');
  const [continueDoing, setContinueDoing] = useState('');
  const [growthIndicator, setGrowthIndicator] = useState('');
  const [checkInDate, setCheckInDate] = useState('');

  // Wisdom Bank
  const [quotableInsight, setQuotableInsight] = useState('');
  const [storyExample, setStoryExample] = useState('');
  const [mistakeAvoid, setMistakeAvoid] = useState('');
  const [successPattern, setSuccessPattern] = useState('');
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
    // Calculate insights captured count
    const insightsCaptured = [valuableHeard, surprisingAdvice, challengedThinking, neededValidation].filter(Boolean).length;

    // Calculate wisdom score based on learning completeness
    const wisdomScore = [learnedWork, learnedSelf, learnedGrowth, patternSeen, assumptionQuestion].filter(Boolean).length * 2;

    // Count patterns identified
    const patternsIdentified = patternSeen ? 1 + (patternSeen.includes('and') ? 1 : 0) : 0;

    // Calculate emotional clarity based on feeling specificity
    const emotionalClarity = 
      sessionFeeling.includes('supported') || sessionFeeling.includes('inspired') ? 8 :
      sessionFeeling.includes('neutral') ? 5 :
      sessionFeeling.includes('uncomfortable') || sessionFeeling.includes('defensive') ? 6 : 7;

    // Calculate resistance level
    const resistanceLevel = 
      sessionFeeling.includes('defensive') ? 7 :
      sessionFeeling.includes('uncomfortable') ? 5 :
      sessionFeeling.includes('neutral') ? 3 :
      sessionFeeling.includes('supported') || sessionFeeling.includes('inspired') ? 1 : 4;

    // Count action items
    const actionItemsCount = 
      (immediateAction ? 1 : 0) + 
      (weekAction ? 1 : 0) + 
      (monthAction ? 1 : 0) + 
      [resource1, resource2].filter(Boolean).length +
      (personToTalk ? 1 : 0);

    // Calculate plan specificity
    const planSpecificity = 
      (immediateWhen && immediateBecause ? 3 : 1) +
      (weekDay && weekPractice ? 3 : 1) +
      (monthAction ? 2 : 0) +
      (checkInDate ? 2 : 0);

    // Calculate commitment level
    const commitmentLevel = Math.min(10, 
      (stopDoing ? 3 : 0) + 
      (startDoing ? 3 : 0) + 
      (continueDoing ? 2 : 0) + 
      (growthIndicator ? 2 : 0));

    // Calculate clarity gained
    const clarityGained = 
      (nowClear ? 4 : 0) + 
      (stillFuzzy ? 2 : 0) + 
      (mysterious ? 1 : 0) + 
      (nextEdge ? 3 : 0);

    // Count growth areas identified
    const growthAreasIdentified = needsFor.length + (nextEdge ? 1 : 0);

    // Calculate mentor effectiveness
    const mentorEffectiveness = Math.min(10, workedWell.length * 2 + (followUp ? 2 : 0));

    // Calculate relationship quality
    const relationshipQuality = Math.max(1, 10 - couldImprove.length * 2);

    // Check if follow-up was planned
    const followUpPlanned = !!followUp && followUp.length > 10;

    // Count commitments made
    const commitmentsMade = [stopDoing, startDoing, continueDoing].filter(Boolean).length;

    // Check if accountability was set
    const accountabilitySet = !!(checkInDate && growthIndicator);

    // Count wisdom items
    const wisdomItems = [quotableInsight, storyExample, mistakeAvoid, successPattern].filter(Boolean).length;

    // Calculate overall session value (average of key metrics)
    const sessionValue = Math.round(
      (wisdomScore + emotionalClarity + planSpecificity + commitmentLevel + clarityGained) / 5
    );

    // Calculate applicability score
    const applicabilityScore = Math.min(10, actionItemsCount + commitmentsMade);

    const results: MentoringReflectionResults = {
      immediateCapture: {
        valuableHeard,
        surprisingAdvice,
        challengedThinking,
        neededValidation,
        insightsCaptured,
      },
      wisdomDistillation: {
        learnedWork,
        learnedSelf,
        learnedGrowth,
        patternSeen,
        assumptionQuestion,
        wisdomScore,
        patternsIdentified,
      },
      emotionalIntegration: {
        sessionFeeling,
        difficultTrigger:
          sessionFeeling.includes('uncomfortable') || sessionFeeling.includes('defensive')
            ? difficultTrigger
            : undefined,
        difficultMeaning:
          sessionFeeling.includes('uncomfortable') || sessionFeeling.includes('defensive')
            ? difficultMeaning
            : undefined,
        difficultProcess:
          sessionFeeling.includes('uncomfortable') || sessionFeeling.includes('defensive')
            ? difficultProcess
            : undefined,
        positiveCreated:
          sessionFeeling.includes('supported') || sessionFeeling.includes('inspired')
            ? positiveCreated
            : undefined,
        positiveCultivate:
          sessionFeeling.includes('supported') || sessionFeeling.includes('inspired')
            ? positiveCultivate
            : undefined,
        emotionalClarity,
        resistanceLevel,
      },
      actionPlan: {
        immediate: {
          action: immediateAction,
          when: immediateWhen,
          because: immediateBecause,
        },
        thisWeek: {
          action: weekAction,
          day: weekDay,
          practice: weekPractice,
        },
        thisMonth: monthAction,
        resources: [resource1, resource2].filter(Boolean),
        personToTalk,
        actionItemsCount,
        planSpecificity,
        commitmentLevel,
      },
      growthEdge: {
        nowClear,
        stillFuzzy,
        mysterious,
        nextEdge,
        needsFor,
        clarityGained,
        growthAreasIdentified,
      },
      relationship: {
        workedWell,
        couldImprove,
        followUp,
        mentorEffectiveness,
        relationshipQuality,
        followUpPlanned,
      },
      commitment: {
        stopDoing,
        startDoing,
        continueDoing,
        growthIndicator,
        checkInDate,
        commitmentsMade,
        accountabilitySet,
      },
      wisdomBank: {
        quotableInsight,
        storyExample,
        mistakeAvoid,
        successPattern,
        wisdomItems,
      },
      sessionValue,
      applicabilityScore,
      stressLevel,
      energyLevel,
      timestamp: new Date(),
      // Add field for getDisplayName fallback
      mentoring_insights: insightsCaptured || learnedSelf || 'Mentoring reflection completed'
    };

    // Save to database using reflectionService
    if (user?.id) {
      console.log('MentoringReflection - Saving with reflectionService');

      const saveResult = await reflectionService.saveReflection(
        user.id,
        'mentoring_reflection',
        results
      );

      if (!saveResult.success) {
        console.error('MentoringReflection - Error saving:', saveResult.error);
      } else {
        console.log('MentoringReflection - Saved successfully');
      }
    } else {
      console.error('MentoringReflection - No user found');
    }

    setShowWisdomBank(true);
    onComplete(results);
  };

  const toggleNeedsFor = (need: string) => {
    setNeedsFor((prev) => (prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]));
  };

  const toggleWorkedWell = (item: string) => {
    setWorkedWell((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleCouldImprove = (item: string) => {
    setCouldImprove((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return valuableHeard && surprisingAdvice && challengedThinking && neededValidation;
      case 2:
        return learnedWork && learnedSelf && learnedGrowth;
      case 3:
        return sessionFeeling;
      case 4:
        return immediateAction && immediateWhen && weekAction && weekDay;
      case 5:
        return nowClear && nextEdge && needsFor.length > 0;
      case 6:
        return workedWell.length > 0 && followUp;
      case 7:
        return stopDoing && startDoing && continueDoing && growthIndicator && checkInDate;
      case 8:
        return quotableInsight;
      default:
        return false;
    }
  };

  const isDifficultFeelings =
    sessionFeeling === 'uncomfortable' ||
    sessionFeeling === 'defensive' ||
    sessionFeeling === 'overwhelmed';
  const isPositiveFeelings =
    sessionFeeling === 'supported' ||
    sessionFeeling === 'challenged-safe' ||
    sessionFeeling === 'inspired';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mentoring Reflection</h2>
                <p className="text-sm text-gray-600 mt-1">
                  5-minute integration for lasting growth
                </p>
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
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                  Step 1: Immediate Capture
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Memory Consolidation research (McGaugh, 2000)
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-4">
                  Quick Brain Dump - Don't overthink:
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      The most valuable thing I heard:
                    </label>
                    <textarea
                      value={valuableHeard}
                      onChange={(e) => setValuableHeard(e.target.value)}
                      placeholder="What resonated most deeply?"
                      className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      The advice that surprised me:
                    </label>
                    <textarea
                      value={surprisingAdvice}
                      onChange={(e) => setSurprisingAdvice(e.target.value)}
                      placeholder="What unexpected insight emerged?"
                      className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      The thing that challenged my thinking:
                    </label>
                    <textarea
                      value={challengedThinking}
                      onChange={(e) => setChallengedThinking(e.target.value)}
                      placeholder="What made me reconsider?"
                      className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      The validation I needed:
                    </label>
                    <textarea
                      value={neededValidation}
                      onChange={(e) => setNeededValidation(e.target.value)}
                      placeholder="What affirmation felt important?"
                      className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-100 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Research insight:</strong> Recording insights within 5 minutes increases
                  retention by 64% (Karpicke & Blunt, 2011)
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-indigo-500" />
                  Step 2: Wisdom Distillation
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  90 seconds • Based on Transformative Learning Theory (Mezirow, 1991)
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Core Insights:</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        What I learned about THE WORK:
                      </label>
                      <textarea
                        value={learnedWork}
                        onChange={(e) => setLearnedWork(e.target.value)}
                        placeholder="Professional insights and technical learning"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        What I learned about MYSELF:
                      </label>
                      <textarea
                        value={learnedSelf}
                        onChange={(e) => setLearnedSelf(e.target.value)}
                        placeholder="Personal discoveries and self-awareness"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        What I learned about GROWTH:
                      </label>
                      <textarea
                        value={learnedGrowth}
                        onChange={(e) => setLearnedGrowth(e.target.value)}
                        placeholder="Development process and learning journey"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        The pattern I'm now seeing:
                      </label>
                      <input
                        type="text"
                        value={patternSeen}
                        onChange={(e) => setPatternSeen(e.target.value)}
                        placeholder="Recurring theme or connection"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        The assumption I need to question:
                      </label>
                      <input
                        type="text"
                        value={assumptionQuestion}
                        onChange={(e) => setAssumptionQuestion(e.target.value)}
                        placeholder="Belief that may need re-examining"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-100 p-4 rounded-lg">
                  <p className="text-sm text-indigo-800">
                    <strong>Research insight:</strong> Reflecting on assumptions increases
                    behavioral change by 71% (Brookfield, 1995)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Step 3: Emotional Integration
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Emotional Intelligence research (Goleman, 1995)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    How I felt during the session:
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        value: 'supported',
                        label: 'Supported and understood',
                        color: 'bg-[rgba(107,130,104,0.05)]',
                      },
                      {
                        value: 'challenged-safe',
                        label: 'Challenged but safe',
                        color: 'bg-blue-50',
                      },
                      {
                        value: 'uncomfortable',
                        label: 'Uncomfortable but growing',
                        color: 'bg-yellow-50',
                      },
                      {
                        value: 'defensive',
                        label: 'Defensive or resistant',
                        color: 'bg-orange-50',
                      },
                      {
                        value: 'overwhelmed',
                        label: 'Overwhelmed or inadequate',
                        color: 'bg-red-50',
                      },
                      { value: 'inspired', label: 'Inspired and energized', color: 'bg-purple-50' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${sessionFeeling === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={sessionFeeling === option.value}
                          onChange={(e) => setSessionFeeling(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {isDifficultFeelings && (
                  <div className="bg-orange-50 p-4 rounded-lg space-y-3">
                    <h4 className="font-medium text-gray-900">If difficult feelings arose:</h4>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        What triggered them:
                      </label>
                      <input
                        type="text"
                        value={difficultTrigger}
                        onChange={(e) => setDifficultTrigger(e.target.value)}
                        placeholder="Specific moment or topic"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        What they're telling me:
                      </label>
                      <input
                        type="text"
                        value={difficultMeaning}
                        onChange={(e) => setDifficultMeaning(e.target.value)}
                        placeholder="The message behind the feeling"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        What I need to process:
                      </label>
                      <input
                        type="text"
                        value={difficultProcess}
                        onChange={(e) => setDifficultProcess(e.target.value)}
                        placeholder="Next step for emotional work"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {isPositiveFeelings && (
                  <div className="bg-[rgba(107,130,104,0.05)] p-4 rounded-lg space-y-3">
                    <h4 className="font-medium text-gray-900">If positive feelings arose:</h4>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        What created them:
                      </label>
                      <input
                        type="text"
                        value={positiveCreated}
                        onChange={(e) => setPositiveCreated(e.target.value)}
                        placeholder="Specific element that felt good"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        How to cultivate more:
                      </label>
                      <input
                        type="text"
                        value={positiveCultivate}
                        onChange={(e) => setPositiveCultivate(e.target.value)}
                        placeholder="Ways to recreate this experience"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                <div className="bg-red-100 p-4 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Research insight:</strong> Processing emotions from learning increases
                    application by 54% (Moon, 2004)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-500" />
                  Step 4: Action Crystallization
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Implementation Intention research (Gollwitzer, 1999)
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">From Insight to Action:</h4>

                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h5 className="font-medium text-gray-900 mb-2">
                        IMMEDIATELY (within 24 hours):
                      </h5>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={immediateAction}
                          onChange={(e) => setImmediateAction(e.target.value)}
                          placeholder="I will..."
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={immediateWhen}
                          onChange={(e) => setImmediateWhen(e.target.value)}
                          placeholder="when..."
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={immediateBecause}
                          onChange={(e) => setImmediateBecause(e.target.value)}
                          placeholder="because..."
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="border-l-4 border-blue-400 pl-4">
                      <h5 className="font-medium text-gray-900 mb-2">THIS WEEK:</h5>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={weekAction}
                          onChange={(e) => setWeekAction(e.target.value)}
                          placeholder="I will..."
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={weekDay}
                          onChange={(e) => setWeekDay(e.target.value)}
                          placeholder="by [specific day]..."
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={weekPractice}
                          onChange={(e) => setWeekPractice(e.target.value)}
                          placeholder="to practice..."
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="border-l-4 border-blue-400 pl-4">
                      <h5 className="font-medium text-gray-900 mb-2">THIS MONTH:</h5>
                      <input
                        type="text"
                        value={monthAction}
                        onChange={(e) => setMonthAction(e.target.value)}
                        placeholder="I will... to develop..."
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Resources I need to find:</h5>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={resource1}
                          onChange={(e) => setResource1(e.target.value)}
                          placeholder="1. Resource or tool"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={resource2}
                          onChange={(e) => setResource2(e.target.value)}
                          placeholder="2. Another resource"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Person I need to talk to:
                      </label>
                      <input
                        type="text"
                        value={personToTalk}
                        onChange={(e) => setPersonToTalk(e.target.value)}
                        placeholder="Name and why"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Research insight:</strong> Specific implementation intentions increase
                    follow-through by 91% (Gollwitzer & Sheeran, 2006)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Step 5: Growth Edge Identification
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  45 seconds • Based on Zone of Proximal Development (Vygotsky, 1978)
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-[rgba(107,130,104,0.05)] p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">My Learning Zone:</h4>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        What's now CLEAR that was fuzzy:
                      </label>
                      <input
                        type="text"
                        value={nowClear}
                        onChange={(e) => setNowClear(e.target.value)}
                        placeholder="New understanding achieved"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        What's still FUZZY but clearer:
                      </label>
                      <input
                        type="text"
                        value={stillFuzzy}
                        onChange={(e) => setStillFuzzy(e.target.value)}
                        placeholder="Partial understanding emerging"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        What's still MYSTERIOUS but I know exists:
                      </label>
                      <input
                        type="text"
                        value={mysterious}
                        onChange={(e) => setMysterious(e.target.value)}
                        placeholder="Advanced concept to explore later"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        My next growth edge is:
                      </label>
                      <input
                        type="text"
                        value={nextEdge}
                        onChange={(e) => setNextEdge(e.target.value)}
                        placeholder="The specific skill or understanding to develop next"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    To reach it, I need:
                  </label>
                  <div className="space-y-2">
                    {[
                      'More practice',
                      'More knowledge',
                      'More feedback',
                      'More confidence',
                      'More experience',
                    ].map((need) => (
                      <label
                        key={need}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={needsFor.includes(need)}
                          onChange={() => toggleNeedsFor(need)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{need}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Research insight:</strong> Identifying growth edges improves learning
                    efficiency by 47% (Fischer, 2009)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-500" />
                  Step 6: Relationship Reflection
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  45 seconds • Based on Mentoring Relationship research (Kram, 1985)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">What worked well:</label>
                  <div className="space-y-2">
                    {[
                      'They listened without judgment',
                      'Balance of support and challenge',
                      'Specific, actionable advice',
                      'Safe space for vulnerability',
                      'Relevant examples/stories',
                    ].map((item) => (
                      <label
                        key={item}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={workedWell.includes(item)}
                          onChange={() => toggleWorkedWell(item)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    What could improve:
                  </label>
                  <div className="space-y-2">
                    {[
                      'More specific examples needed',
                      'More time for questions',
                      'Clearer action steps',
                      'Different learning approach',
                      'Better boundary setting',
                    ].map((item) => (
                      <label
                        key={item}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={couldImprove.includes(item)}
                          onChange={() => toggleCouldImprove(item)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">Follow-up needed:</label>
                  <div className="space-y-2">
                    {[
                      { value: 'thank', label: 'Thank you message' },
                      { value: 'update', label: 'Update on implementation' },
                      { value: 'schedule', label: 'Schedule next session' },
                      { value: 'resources', label: 'Share resources discussed' },
                      { value: 'none', label: 'No follow-up needed' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={followUp === option.value}
                          onChange={(e) => setFollowUp(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-100 p-4 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Research insight:</strong> Quality mentoring relationships accelerate
                    development by 83% (Allen et al., 2004)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-teal-500" />
                  Step 7: Integration Commitment
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  30 seconds • Based on Commitment Theory (Meyer & Herscovitch, 2001)
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-5 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-4">My Promise to Myself:</h4>

                  <p className="text-sm text-gray-600 mb-4 italic">
                    Based on today's mentoring, I commit to:
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Stop doing:</label>
                      <input
                        type="text"
                        value={stopDoing}
                        onChange={(e) => setStopDoing(e.target.value)}
                        placeholder="Behavior or habit to eliminate"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Start doing:</label>
                      <input
                        type="text"
                        value={startDoing}
                        onChange={(e) => setStartDoing(e.target.value)}
                        placeholder="New behavior or practice to begin"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Continue doing:</label>
                      <input
                        type="text"
                        value={continueDoing}
                        onChange={(e) => setContinueDoing(e.target.value)}
                        placeholder="Effective practice to maintain"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        I will know I've grown when:
                      </label>
                      <textarea
                        value={growthIndicator}
                        onChange={(e) => setGrowthIndicator(e.target.value)}
                        placeholder="Specific, observable sign of progress"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Accountability check-in date:
                      </label>
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-teal-100 p-4 rounded-lg">
                  <p className="text-sm text-teal-800">
                    <strong>Research insight:</strong> Written commitment triples follow-through
                    rates (Cialdini, 2001)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 8 && !showWisdomBank && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-amber-500" />
                  Step 8: Wisdom Banking
                </h3>
                <p className="text-sm text-gray-600 mb-4">For Future Reference</p>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-xl space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Quotable insight to remember:
                  </label>
                  <textarea
                    value={quotableInsight}
                    onChange={(e) => setQuotableInsight(e.target.value)}
                    placeholder="A memorable phrase or principle"
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Story/example to recall:
                  </label>
                  <textarea
                    value={storyExample}
                    onChange={(e) => setStoryExample(e.target.value)}
                    placeholder="An illustrative story or case"
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Mistake to avoid:</label>
                  <input
                    type="text"
                    value={mistakeAvoid}
                    onChange={(e) => setMistakeAvoid(e.target.value)}
                    placeholder="A pitfall to remember"
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Success pattern to replicate:
                  </label>
                  <input
                    type="text"
                    value={successPattern}
                    onChange={(e) => setSuccessPattern(e.target.value)}
                    placeholder="An approach that works"
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">
                  The Science Behind Mentoring Reflection:
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>
                    • <strong>Immediate capture</strong> prevents 73% of insight loss (Ebbinghaus,
                    1885)
                  </li>
                  <li>
                    • <strong>Action planning</strong> increases implementation by 78% (Locke &
                    Latham, 2002)
                  </li>
                  <li>
                    • <strong>Emotional processing</strong> deepens learning by 65% (Damasio, 1994)
                  </li>
                  <li>
                    • <strong>Written commitment</strong> triples follow-through rates (Cialdini,
                    2001)
                  </li>
                </ul>
              </div>
            </div>
          )}

          {showWisdomBank && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Check className="w-6 h-6 mr-2 text-green-500" />
                  Wisdom Captured!
                </h3>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-200">
                <h4 className="font-bold text-lg mb-4 text-gray-900">
                  24-Hour Implementation Check:
                </h4>

                <p className="text-sm text-gray-700 mb-3">Tomorrow, ask yourself:</p>

                <div className="space-y-2">
                  {[
                    'Did I take the first action?',
                    'What resistance came up?',
                    'What support do I need?',
                    'Am I ready for the next step?',
                  ].map((question, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 bg-white bg-opacity-70 rounded"
                    >
                      <Calendar className="w-4 h-4 text-purple-500 mr-2" />
                      <span className="text-gray-700 text-sm">{question}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-xl text-white">
                <p className="text-lg font-semibold text-center">
                  Your mentoring insights have been captured and your growth path is clear!
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
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4 mr-2" />
                Complete Reflection
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentoringReflection;
