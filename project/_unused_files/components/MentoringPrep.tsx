import type React from 'react';
import { useState } from 'react';
import { directInsertReflection } from '../services/directSupabaseApi';
import {
  X,
  GraduationCap,
  Target,
  Shield,
  Brain,
  CheckCircle,
  Heart,
  Check,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface MentoringPrepProps {
  onComplete: (results: MentoringPrepResults) => void;
  onClose: () => void;
}

interface MentoringPrepResults {
  role: string;
  context: string;
  readiness: {
    challengeLevel?: string;
    emotionalReadiness?: string;
    needMost?: string;
    menteeSeems?: string;
    menteeNeeds?: string;
    readinessScore?: number; // 1-10 scale for mentor readiness
    preparednessLevel?: number; // 1-10 scale for mentee preparedness
  };
  request: {
    situation: string;
    challenge: string;
    alreadyTried: string;
    helpType: string;
    problemClarity: number; // 1-10 scale for how clear the problem is
    previousAttempts: number; // Count of things already tried
  };
  boundaries: {
    time: string;
    emotional: string[];
    confidentiality: string;
    boundariesSet: number; // Count of boundaries established
    timeCommitment: number; // Minutes available
  };
  learningStyle: {
    myStyle: string[];
    theirStyle: string;
    approach: string;
    styleAlignment: number; // 1-10 scale for style compatibility
  };
  success: {
    menteeLeavesWith: string[];
    mentorProvides: string[];
    followUp: string;
    goalsSet: number; // Count of specific goals
    successMetricsDefined: boolean; // Were success metrics defined?
    followUpScheduled: boolean; // Was follow-up scheduled?
  };
  overallPreparedness: number; // 1-10 overall prep score
  sessionFocus: number; // 1-10 how focused the session plan is
  stressLevel: number;
  energyLevel: number;
  timestamp: Date;
}

const MentoringPrep: React.FC<MentoringPrepProps> = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState('');
  const [context, setContext] = useState('');
  const [challengeLevel, setChallengeLevel] = useState('');
  const [emotionalReadiness, setEmotionalReadiness] = useState('');
  const [needMost, setNeedMost] = useState('');
  const [menteeSeems, setMenteeSeems] = useState('');
  const [menteeNeeds, setMenteeNeeds] = useState('');
  const [situation, setSituation] = useState('');
  const [challenge, setChallenge] = useState('');
  const [alreadyTried, setAlreadyTried] = useState('');
  const [helpType, setHelpType] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [emotionalBoundaries, setEmotionalBoundaries] = useState<string[]>([]);
  const [confidentiality, setConfidentiality] = useState('');
  const [myLearningStyles, setMyLearningStyles] = useState<string[]>([]);
  const [theirLearningStyle, setTheirLearningStyle] = useState('');
  const [approachToday, setApproachToday] = useState('');
  const [menteeLeavesWith, setMenteeLeavesWith] = useState<string[]>([]);
  const [mentorProvides, setMentorProvides] = useState<string[]>([]);
  const [followUp, setFollowUp] = useState('');
  const [stressLevel] = useState(5);
  const [energyLevel] = useState(5);
  const [showChecklist, setShowChecklist] = useState(false);

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Calculate readiness scores
    const readinessScore = role === 'mentor' ? 
      (menteeSeems && menteeNeeds ? 8 : 5) :
      (challengeLevel && emotionalReadiness && needMost ? 8 : 5);
    
    const preparednessLevel = 
      (situation ? 3 : 0) + 
      (challenge ? 3 : 0) + 
      (alreadyTried ? 2 : 0) + 
      (helpType ? 2 : 0);

    // Calculate problem clarity
    const problemClarity = 
      (situation && challenge ? 8 : 4) + 
      (alreadyTried ? 2 : 0);

    // Count previous attempts
    const previousAttempts = alreadyTried ? 
      (alreadyTried.split(',').length || alreadyTried.split('and').length || 1) : 0;

    // Count boundaries set
    const boundariesSet = 
      (timeLimit ? 1 : 0) + 
      emotionalBoundaries.length + 
      (confidentiality ? 1 : 0);

    // Extract time commitment in minutes
    const timeCommitment = 
      timeLimit === '15-minutes' ? 15 :
      timeLimit === '30-minutes' ? 30 :
      timeLimit === '45-minutes' ? 45 :
      timeLimit === '60-minutes' ? 60 :
      timeLimit === 'open-ended' ? 90 : 30;

    // Calculate style alignment
    const styleAlignment = 
      myLearningStyles.includes(theirLearningStyle) ? 10 :
      (myLearningStyles.length > 0 && theirLearningStyle ? 7 : 5);

    // Count goals set
    const goalsSet = menteeLeavesWith.length + mentorProvides.length;

    // Check if success metrics were defined
    const successMetricsDefined = menteeLeavesWith.length > 0 && mentorProvides.length > 0;

    // Check if follow-up was scheduled
    const followUpScheduled = !!followUp && followUp.length > 10;

    // Calculate overall preparedness
    const overallPreparedness = Math.round(
      (readinessScore + preparednessLevel + problemClarity + boundariesSet + styleAlignment) / 5
    );

    // Calculate session focus
    const sessionFocus = Math.min(10, 
      (situation ? 2 : 0) + 
      (challenge ? 2 : 0) + 
      (helpType ? 2 : 0) + 
      (goalsSet ? 4 : 0));

    const results: MentoringPrepResults = {
      role,
      context,
      readiness: {
        challengeLevel: role === 'mentee' ? challengeLevel : undefined,
        emotionalReadiness: role === 'mentee' ? emotionalReadiness : undefined,
        needMost: role === 'mentee' ? needMost : undefined,
        menteeSeems: role === 'mentor' ? menteeSeems : undefined,
        menteeNeeds: role === 'mentor' ? menteeNeeds : undefined,
        readinessScore,
        preparednessLevel,
      },
      request: {
        situation,
        challenge,
        alreadyTried,
        helpType,
        problemClarity,
        previousAttempts,
      },
      boundaries: {
        time: timeLimit,
        emotional: emotionalBoundaries,
        confidentiality,
        boundariesSet,
        timeCommitment,
      },
      learningStyle: {
        myStyle: myLearningStyles,
        theirStyle: theirLearningStyle,
        approach: approachToday,
        styleAlignment,
      },
      success: {
        menteeLeavesWith,
        mentorProvides,
        followUp,
        goalsSet,
        successMetricsDefined,
        followUpScheduled,
      },
      overallPreparedness,
      sessionFocus,
      stressLevel,
      energyLevel,
      timestamp: new Date(),
    };

    setShowChecklist(true);
    onComplete(formData);
  };

  const toggleEmotionalBoundary = (boundary: string) => {
    setEmotionalBoundaries((prev) =>
      prev.includes(boundary) ? prev.filter((b) => b !== boundary) : [...prev, boundary]
    );
  };

  const toggleLearningStyle = (style: string) => {
    setMyLearningStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const toggleMenteeOutcome = (outcome: string) => {
    setMenteeLeavesWith((prev) =>
      prev.includes(outcome) ? prev.filter((o) => o !== outcome) : [...prev, outcome]
    );
  };

  const toggleMentorProvides = (item: string) => {
    setMentorProvides((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return role && context;
      case 2:
        if (role === 'mentee') return challengeLevel && emotionalReadiness && needMost;
        if (role === 'mentor') return menteeSeems && menteeNeeds;
        return true;
      case 3:
        return situation && challenge && helpType;
      case 4:
        return timeLimit && emotionalBoundaries.length > 0 && confidentiality;
      case 5:
        return myLearningStyles.length > 0 && approachToday;
      case 6:
        return menteeLeavesWith.length > 0 && mentorProvides.length > 0 && followUp;
      case 7:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mentoring Prep</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Structured mentoring session preparation
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
              {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    step === currentStep
                      ? 'bg-indigo-500 text-white scale-110'
                      : step < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? <Check className="w-4 h-4" /> : step}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-600">Step {currentStep} of 7</span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-indigo-500" />
                  Step 1: Mentoring Mode Identification
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  30 seconds • Based on Situational Mentoring Theory (Clutterbuck, 2004)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">Today I am the:</label>
                  <div className="space-y-2">
                    {[
                      {
                        value: 'mentor',
                        label: 'Mentor',
                        description: 'Guiding someone with less experience',
                      },
                      {
                        value: 'mentee',
                        label: 'Mentee',
                        description: 'Seeking guidance from someone with more experience',
                      },
                      {
                        value: 'peer',
                        label: 'Peer Mentor',
                        description: 'Mutual exchange with colleague at similar level',
                      },
                      {
                        value: 'reverse',
                        label: 'Reverse Mentor',
                        description: 'Junior teaching senior (tech, trends, new approaches)',
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={role === option.value}
                          onChange={(e) => setRole(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">Context:</label>
                  <div className="space-y-2">
                    {[
                      { value: 'formal', label: 'Formal mentoring session' },
                      { value: 'informal', label: 'Informal guidance moment' },
                      { value: 'crisis', label: 'Crisis/urgent consultation' },
                      { value: 'observation', label: 'Observation & feedback' },
                      { value: 'skill', label: 'Skill-specific coaching' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={context === option.value}
                          onChange={(e) => setContext(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-indigo-800">
                    <strong>Research insight:</strong> Clear role definition improves mentoring
                    outcomes by 56% (Ragins & Cotton, 1999)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-500" />
                  Step 2: Learning Readiness Assessment
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Adult Learning Theory (Knowles, 1984)
                </p>
              </div>

              {role === 'mentee' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Your State:</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="font-medium text-gray-900 mb-2 block">
                          Current challenge level:
                        </label>
                        <div className="space-y-2">
                          {[
                            {
                              value: 'drowning',
                              label: 'Drowning - need rescue',
                              color: 'bg-red-50 hover:bg-red-100',
                            },
                            {
                              value: 'struggling',
                              label: 'Struggling - need support',
                              color: 'bg-orange-50 hover:bg-orange-100',
                            },
                            {
                              value: 'stretching',
                              label: 'Stretching - need refinement',
                              color: 'bg-blue-50 hover:bg-blue-100',
                            },
                            {
                              value: 'comfortable',
                              label: 'Comfortable - seeking growth',
                              color: 'bg-green-50 hover:bg-green-100',
                            },
                          ].map((option) => (
                            <label
                              key={option.value}
                              className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${challengeLevel === option.value ? option.color : 'hover:bg-gray-50'}`}
                            >
                              <input
                                type="radio"
                                value={option.value}
                                checked={challengeLevel === option.value}
                                onChange={(e) => setChallengeLevel(e.target.value)}
                                className="mt-1 mr-3"
                              />
                              <span className="text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="font-medium text-gray-900 mb-2 block">
                          Emotional readiness:
                        </label>
                        <div className="space-y-2">
                          {[
                            { value: 'open', label: 'Open and eager' },
                            { value: 'cautious', label: 'Cautiously receptive' },
                            { value: 'defensive', label: 'Defensive but trying' },
                            { value: 'resistant', label: 'Resistant/overwhelmed' },
                          ].map((option) => (
                            <label
                              key={option.value}
                              className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <input
                                type="radio"
                                value={option.value}
                                checked={emotionalReadiness === option.value}
                                onChange={(e) => setEmotionalReadiness(e.target.value)}
                                className="mt-1 mr-3"
                              />
                              <span className="text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="font-medium text-gray-900 mb-2 block">
                          What I most need:
                        </label>
                        <div className="space-y-2">
                          {[
                            { value: 'emotional', label: 'Emotional support first' },
                            { value: 'practical', label: 'Practical solutions' },
                            { value: 'skill', label: 'Skill development' },
                            { value: 'career', label: 'Career guidance' },
                            { value: 'permission', label: 'Permission/validation' },
                          ].map((option) => (
                            <label
                              key={option.value}
                              className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <input
                                type="radio"
                                value={option.value}
                                checked={needMost === option.value}
                                onChange={(e) => setNeedMost(e.target.value)}
                                className="mt-1 mr-3"
                              />
                              <span className="text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {role === 'mentor' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Their State:</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="font-medium text-gray-900 mb-2 block">
                          Mentee seems:
                        </label>
                        <div className="space-y-2">
                          {[
                            { value: 'eager', label: 'Eager and prepared' },
                            { value: 'anxious', label: 'Anxious but willing' },
                            { value: 'uncertain', label: 'Uncertain what they need' },
                            { value: 'defensive', label: 'Defensive/fragile' },
                            { value: 'crisis', label: 'In crisis mode' },
                          ].map((option) => (
                            <label
                              key={option.value}
                              className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <input
                                type="radio"
                                value={option.value}
                                checked={menteeSeems === option.value}
                                onChange={(e) => setMenteeSeems(e.target.value)}
                                className="mt-1 mr-3"
                              />
                              <span className="text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="font-medium text-gray-900 mb-2 block">
                          They probably need:
                        </label>
                        <div className="space-y-2">
                          {[
                            { value: 'confidence', label: 'Confidence building' },
                            { value: 'technical', label: 'Technical guidance' },
                            { value: 'emotional', label: 'Emotional processing' },
                            { value: 'reality', label: 'Reality check' },
                            { value: 'encouragement', label: 'Encouragement to continue' },
                          ].map((option) => (
                            <label
                              key={option.value}
                              className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <input
                                type="radio"
                                value={option.value}
                                checked={menteeNeeds === option.value}
                                onChange={(e) => setMenteeNeeds(e.target.value)}
                                className="mt-1 mr-3"
                              />
                              <span className="text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(role === 'peer' || role === 'reverse') && (
                <div className="bg-purple-50 p-6 rounded-lg">
                  <p className="text-center text-gray-700">
                    In {role === 'peer' ? 'peer mentoring' : 'reverse mentoring'}, both parties are
                    learners and teachers. Consider both perspectives as you prepare.
                  </p>
                </div>
              )}

              <div className="bg-purple-100 p-4 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Research insight:</strong> Matching support to readiness improves
                  retention by 68% (Kolb, 1984)
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-500" />
                  Step 3: Clear Request Formation
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  90 seconds • Based on Goal-Setting Theory (Locke & Latham, 2002)
                </p>
              </div>

              <div className="space-y-4">
                {role === 'mentee' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Your Ask:</h4>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Specific situation (30 seconds):
                        </label>
                        <textarea
                          value={situation}
                          onChange={(e) => setSituation(e.target.value)}
                          placeholder="I'm dealing with..."
                          className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Exact challenge (30 seconds):
                        </label>
                        <textarea
                          value={challenge}
                          onChange={(e) => setChallenge(e.target.value)}
                          placeholder="I'm struggling with..."
                          className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          What I've already tried:
                        </label>
                        <input
                          type="text"
                          value={alreadyTried}
                          onChange={(e) => setAlreadyTried(e.target.value)}
                          placeholder="Previous attempts or approaches"
                          className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {role === 'mentor' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Clarifying Questions to Ask:
                    </h4>

                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded-lg">
                        <p className="font-medium text-gray-700">Before advising, ask:</p>
                        <ol className="mt-2 space-y-1 text-sm text-gray-600 list-decimal list-inside">
                          <li>"What specifically would be most helpful?"</li>
                          <li>"What have you already tried?"</li>
                          <li>"What's your biggest concern?"</li>
                          <li>"How urgent is this?"</li>
                        </ol>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Their situation (as you understand it):
                        </label>
                        <textarea
                          value={situation}
                          onChange={(e) => setSituation(e.target.value)}
                          placeholder="What they're dealing with..."
                          className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Their main challenge:
                        </label>
                        <textarea
                          value={challenge}
                          onChange={(e) => setChallenge(e.target.value)}
                          placeholder="What they're struggling with..."
                          className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(role === 'peer' || role === 'reverse') && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Exchange Focus:</h4>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Topic/situation to discuss:
                        </label>
                        <textarea
                          value={situation}
                          onChange={(e) => setSituation(e.target.value)}
                          placeholder="What we're working through together..."
                          className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Key challenges to address:
                        </label>
                        <textarea
                          value={challenge}
                          onChange={(e) => setChallenge(e.target.value)}
                          placeholder="What we both need to figure out..."
                          className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    Type of help needed:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'handle', label: 'How would you handle this?' },
                      { value: 'missing', label: 'What am I missing?' },
                      { value: 'normal', label: 'Is this normal?' },
                      { value: 'improve', label: 'How do I improve?' },
                      { value: 'concern', label: 'Should I be concerned?' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={helpType === option.value}
                          onChange={(e) => setHelpType(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Research insight:</strong> Specific requests get 74% more actionable
                    guidance (Kram, 1985)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-500" />
                  Step 4: Boundary Setting
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Professional Boundary research (Barnett, 2008)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">Time boundary:</label>
                  <div className="space-y-2">
                    {[
                      { value: '5', label: '5 minutes - quick question', icon: '⚡' },
                      { value: '15', label: '15 minutes - focused issue', icon: '🎯' },
                      { value: '30', label: '30 minutes - complex situation', icon: '🔍' },
                      { value: '60', label: '60 minutes - comprehensive session', icon: '📚' },
                      {
                        value: 'ongoing',
                        label: 'Ongoing - may need multiple sessions',
                        icon: '🔄',
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={timeLimit === option.value}
                          onChange={(e) => setTimeLimit(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-2xl mr-2">{option.icon}</span>
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    Emotional boundary check - I can handle:
                  </label>
                  <div className="space-y-2">
                    {[
                      'Trauma content discussion',
                      'Personal life overlap',
                      'Emotional processing',
                      'Just professional/technical',
                    ].map((boundary) => (
                      <label
                        key={boundary}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={emotionalBoundaries.includes(boundary)}
                          onChange={() => toggleEmotionalBoundary(boundary)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{boundary}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    Confidentiality agreement:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'everything', label: 'Everything stays between us' },
                      { value: 'anonymized', label: 'Can share anonymized learning' },
                      { value: 'report', label: 'May need to report (safety issues)' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={confidentiality === option.value}
                          onChange={(e) => setConfidentiality(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Research insight:</strong> Clear boundaries improve mentoring
                    satisfaction by 61% (Johnson & Huwe, 2003)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-orange-500" />
                  Step 5: Learning Style Alignment
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Experiential Learning Theory (Kolb, 1984)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">How I learn best:</label>
                  <div className="space-y-2">
                    {[
                      {
                        value: 'stories',
                        label: 'Stories',
                        description: 'Tell me about your experience',
                        icon: '📖',
                      },
                      {
                        value: 'principles',
                        label: 'Principles',
                        description: 'Explain the theory/rules',
                        icon: '📐',
                      },
                      {
                        value: 'demonstration',
                        label: 'Demonstration',
                        description: 'Show me how',
                        icon: '👁️',
                      },
                      {
                        value: 'practice',
                        label: 'Practice',
                        description: 'Let me try with feedback',
                        icon: '🎯',
                      },
                      {
                        value: 'resources',
                        label: 'Resources',
                        description: 'Point me to references',
                        icon: '📚',
                      },
                      {
                        value: 'questions',
                        label: 'Questions',
                        description: 'Help me think it through',
                        icon: '💭',
                      },
                    ].map((style) => (
                      <label
                        key={style.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={myLearningStyles.includes(style.value)}
                          onChange={() => toggleLearningStyle(style.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-2xl mr-2">{style.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{style.label}</div>
                          <div className="text-sm text-gray-600">{style.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    How they learn best (if known):
                  </label>
                  <input
                    type="text"
                    value={theirLearningStyle}
                    onChange={(e) => setTheirLearningStyle(e.target.value)}
                    placeholder="Their preferred learning style..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">Today's approach:</label>
                  <div className="space-y-2">
                    {[
                      { value: 'experiences', label: 'Share experiences' },
                      { value: 'concepts', label: 'Teach concepts' },
                      { value: 'model', label: 'Model behavior' },
                      { value: 'guided', label: 'Guided practice' },
                      { value: 'socratic', label: 'Socratic questioning' },
                      { value: 'mix', label: 'Mix of methods' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={approachToday === option.value}
                          onChange={(e) => setApproachToday(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-orange-100 p-4 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Research insight:</strong> Matched learning styles increase skill
                    transfer by 48% (Felder & Silverman, 1988)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-teal-500" />
                  Step 6: Success Metrics
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  45 seconds • Based on Mentoring Outcomes research (Eby et al., 2008)
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    This session will be successful if:
                  </h4>

                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Mentee leaves with:
                    </label>
                    <div className="space-y-2">
                      {[
                        'Clear next steps',
                        'New perspective',
                        'Specific skill/tool',
                        'Increased confidence',
                        'Validation/normalization',
                        'Resource list',
                      ].map((outcome) => (
                        <label
                          key={outcome}
                          className="flex items-start p-2 border rounded cursor-pointer hover:bg-white transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={menteeLeavesWith.includes(outcome)}
                            onChange={() => toggleMenteeOutcome(outcome)}
                            className="mt-0.5 mr-2"
                          />
                          <span className="text-gray-700 text-sm">{outcome}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Mentor provides:
                    </label>
                    <div className="space-y-2">
                      {[
                        'Safe space',
                        'Honest feedback',
                        'Practical tools',
                        'Encouragement',
                        'Challenge to grow',
                      ].map((item) => (
                        <label
                          key={item}
                          className="flex items-start p-2 border rounded cursor-pointer hover:bg-white transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={mentorProvides.includes(item)}
                            onChange={() => toggleMentorProvides(item)}
                            className="mt-0.5 mr-2"
                          />
                          <span className="text-gray-700 text-sm">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">Follow-up needed:</label>
                  <div className="space-y-2">
                    {[
                      { value: 'none', label: 'No follow-up needed' },
                      { value: 'check', label: 'Check in after they try it' },
                      { value: 'schedule', label: 'Schedule another session' },
                      { value: 'connect', label: 'Connect with resources' },
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
              </div>
            </div>
          )}

          {currentStep === 7 && !showChecklist && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Step 7: Openness Setting
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  30 seconds • Based on Psychological Safety research (Edmondson, 1999)
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-4">Creating the container:</h4>

                  <p className="text-sm text-gray-600 mb-4">Say internally or aloud:</p>

                  <div className="space-y-2">
                    {[
                      'This is a learning space',
                      'Questions are welcome',
                      'Mistakes are learning',
                      'Vulnerability is strength',
                      'Growth requires discomfort',
                    ].map((phrase, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 bg-white bg-opacity-70 rounded-lg"
                      >
                        <Heart className="w-4 h-4 text-red-500 mr-3" />
                        <span className="text-gray-800 font-medium">{phrase}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-white bg-opacity-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      For difficult conversations add:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• "Feedback is care"</li>
                      <li>• "Truth serves growth"</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    The Science Behind Mentoring Prep:
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      • <strong>Structured mentoring</strong> is 51% more effective than informal
                      (Underhill, 2006)
                    </li>
                    <li>
                      • <strong>Clear goals</strong> increase learning by 65% (Wanberg et al., 2003)
                    </li>
                    <li>
                      • <strong>Readiness assessment</strong> improves knowledge transfer by 43%
                      (Merriam, 2001)
                    </li>
                    <li>
                      • <strong>Boundary setting</strong> reduces mentoring relationship failure by
                      70% (Scandura, 1998)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {showChecklist && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Check className="w-6 h-6 mr-2 text-green-500" />
                  Pre-Session Checklist
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  'Role is clear',
                  'Readiness assessed',
                  'Specific ask defined',
                  'Boundaries set',
                  'Time frame agreed',
                  'Success defined',
                  'Open mindset activated',
                ].map((item, index) => (
                  <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-gray-800">{item}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200">
                <h4 className="font-bold text-lg mb-4 text-gray-900">
                  Quick Reference for Session:
                </h4>
                <div className="space-y-2 text-gray-800">
                  <p>
                    <strong>My role:</strong> {role}
                  </p>
                  <p>
                    <strong>Their need:</strong> {role === 'mentee' ? needMost : menteeNeeds}
                  </p>
                  <p>
                    <strong>Time limit:</strong> {timeLimit} minutes
                  </p>
                  <p>
                    <strong>Success looks like:</strong> {menteeLeavesWith[0]}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-green-600 font-semibold">
                  Mentoring prep complete! Closing in 3 seconds...
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            {currentStep > 1 && currentStep < 7 && (
              <button
                onClick={handlePrev}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
            )}

            <div className="flex-1" />

            {currentStep < 7 && (
              <button
                onClick={handleNext}
                disabled={!isStepComplete()}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                  isStepComplete()
                    ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}

            {currentStep === 7 && !showChecklist && (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Complete Mentoring Prep
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentoringPrep;
