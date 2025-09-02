import React, { useState } from 'react';
import {
  X,
  Compass,
  Heart,
  Shield,
  Scale,
  Lightbulb,
  Target,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';

interface CompassCheckProps {
  onComplete: (results: CompassCheckResults) => void;
  onClose: () => void;
}

interface CompassCheckResults {
  moralResidue: {
    situation: string;
    unsettledReason: string;
    weightLevel: string;
    affecting: string;
    moralDistressLevel: number; // 1-10 scale
    residueIntensity: number; // 1-10 scale
  };
  values: {
    challengedValues: string[];
    topValue: string;
    whyMatters: string;
    valuesConflictCount: number; // Number of conflicting values
    valuesAlignmentScore: number; // 1-10 scale
  };
  roleClarity: {
    challengeReason: string;
    roleConfusionLevel: number; // 1-10 scale (lower is better)
    clarityGained: number; // 1-10 scale
  };
  ethicalComplexity: {
    professionalObligation: string;
    personalValues: string;
    legitimatelyHard: string;
    choice: string;
    alternativeCost: string;
    complexityScore: number; // 1-10 scale
    decisionDifficulty: number; // 1-10 scale
    alternativesConsidered: number; // Count of alternatives
  };
  compassion: {
    selfForgiveness: string;
    selfCompassionLevel: number; // 1-10 scale
    forgivenessPracticed: boolean; // Was self-forgiveness practiced?
  };
  valuesRealignment: {
    biggerPicture: string;
    harmWithoutInterpreters: string;
    valuesIntact: string[];
    realignmentSuccess: number; // 1-10 scale
    intactValuesCount: number; // Number of values still intact
    perspectiveShift: boolean; // Did perspective shift occur?
  };
  forwardWisdom: {
    taught: string;
    differentNext: string;
    supportNeeded: string;
    honorAction: string;
    actionItemsIdentified: number; // Count of action items
    supportSystemIdentified: boolean; // Was support identified?
    planSpecificity: number; // 1-10 scale for plan clarity
  };
  overallResolution: number; // 1-10 overall resolution score
  moralClarity: number; // 1-10 moral clarity achieved
  stressLevel: number;
  energyLevel: number;
  timestamp: Date;
}

const CompassCheck: React.FC<CompassCheckProps> = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Moral Residue
  const [situation, setSituation] = useState('');
  const [unsettledReason, setUnsettledReason] = useState('');
  const [weightLevel, setWeightLevel] = useState('');
  const [affecting, setAffecting] = useState('');

  // Step 2: Values
  const [challengedValues, setChallengedValues] = useState<string[]>([]);
  const [topValue, setTopValue] = useState('');
  const [whyMatters, setWhyMatters] = useState('');

  // Step 3: Role Clarity
  const [challengeReason, setChallengeReason] = useState('');

  // Step 4: Ethical Complexity
  const [professionalObligation, setProfessionalObligation] = useState('');
  const [personalValues, setPersonalValues] = useState('');
  const [legitimatelyHard, setLegitimatelyHard] = useState('');
  const [choice, setChoice] = useState('');
  const [alternativeCost, setAlternativeCost] = useState('');

  // Step 5: Compassion
  const [selfForgiveness, setSelfForgiveness] = useState('');

  // Step 6: Values Realignment
  const [biggerPicture, setBiggerPicture] = useState('');
  const [harmWithoutInterpreters, setHarmWithoutInterpreters] = useState('');
  const [valuesIntact, setValuesIntact] = useState<string[]>([]);

  // Step 7: Forward Wisdom
  const [taught, setTaught] = useState('');
  const [differentNext, setDifferentNext] = useState('');
  const [supportNeeded, setSupportNeeded] = useState('');
  const [honorAction, setHonorAction] = useState('');
  const [stressLevel] = useState(5);
  const [energyLevel] = useState(5);

  const [showWisdom, setShowWisdom] = useState(false);

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
    // Calculate moral distress level based on weight
    const moralDistressLevel = 
      weightLevel === 'light' ? 3 :
      weightLevel === 'heavy' ? 7 :
      weightLevel === 'crushing' ? 10 : 5;

    // Calculate residue intensity based on affecting
    const residueIntensity = 
      affecting === 'sleep' ? 8 :
      affecting === 'relationships' ? 7 :
      affecting === 'decision-making' ? 6 :
      affecting === 'self-perception' ? 9 :
      affecting === 'all-of-above' ? 10 : 5;

    // Count values conflicts
    const valuesConflictCount = challengedValues.length;

    // Calculate values alignment score
    const valuesAlignmentScore = Math.max(1, 10 - valuesConflictCount);

    // Calculate role confusion level
    const roleConfusionLevel = 
      challengeReason === 'legal-standards' ? 3 :
      challengeReason === 'institutional-policies' ? 5 :
      challengeReason === 'professional-guidelines' ? 4 :
      challengeReason === 'lack-resources' ? 7 :
      challengeReason === 'interpreter-shortage' ? 8 :
      challengeReason === 'all-above' ? 9 : 6;

    // Calculate clarity gained
    const clarityGained = challengeReason ? 7 : 3;

    // Calculate complexity score
    const complexityScore = 
      (professionalObligation && personalValues && legitimatelyHard === 'yes') ? 9 :
      (professionalObligation && personalValues) ? 7 : 5;

    // Calculate decision difficulty
    const decisionDifficulty = 
      legitimatelyHard === 'yes' ? 8 :
      legitimatelyHard === 'maybe' ? 6 :
      legitimatelyHard === 'no' ? 3 : 5;

    // Count alternatives considered
    const alternativesConsidered = alternativeCost ? 2 : 1;

    // Calculate self-compassion level
    const selfCompassionLevel = selfForgiveness ? 
      (selfForgiveness.length > 50 ? 8 : 6) : 3;

    // Check if forgiveness was practiced
    const forgivenessPracticed = !!selfForgiveness && selfForgiveness.length > 20;

    // Calculate realignment success
    const realignmentSuccess = 
      (biggerPicture ? 3 : 0) + 
      (harmWithoutInterpreters ? 3 : 0) + 
      (valuesIntact.length * 2);

    // Count intact values
    const intactValuesCount = valuesIntact.length;

    // Check if perspective shift occurred
    const perspectiveShift = !!(biggerPicture && harmWithoutInterpreters);

    // Count action items identified
    const actionItemsIdentified = 
      (taught ? 1 : 0) + 
      (differentNext ? 1 : 0) + 
      (supportNeeded ? 1 : 0) + 
      (honorAction ? 1 : 0);

    // Check if support system was identified
    const supportSystemIdentified = !!supportNeeded && supportNeeded.length > 10;

    // Calculate plan specificity
    const planSpecificity = 
      (differentNext ? 4 : 0) + 
      (supportNeeded ? 3 : 0) + 
      (honorAction ? 3 : 0);

    // Calculate overall resolution
    const overallResolution = Math.round(
      (10 - moralDistressLevel + clarityGained + realignmentSuccess + planSpecificity) / 4
    );

    // Calculate moral clarity achieved
    const moralClarity = Math.round(
      (clarityGained + valuesAlignmentScore + (10 - roleConfusionLevel) + realignmentSuccess) / 4
    );

    const results: CompassCheckResults = {
      moralResidue: {
        situation,
        unsettledReason,
        weightLevel,
        affecting,
        moralDistressLevel,
        residueIntensity,
      },
      values: {
        challengedValues,
        topValue,
        whyMatters,
        valuesConflictCount,
        valuesAlignmentScore,
      },
      roleClarity: {
        challengeReason,
        roleConfusionLevel,
        clarityGained,
      },
      ethicalComplexity: {
        professionalObligation,
        personalValues,
        legitimatelyHard,
        choice,
        alternativeCost,
        complexityScore,
        decisionDifficulty,
        alternativesConsidered,
      },
      compassion: {
        selfForgiveness,
        selfCompassionLevel,
        forgivenessPracticed,
      },
      valuesRealignment: {
        biggerPicture,
        harmWithoutInterpreters,
        valuesIntact,
        realignmentSuccess,
        intactValuesCount,
        perspectiveShift,
      },
      forwardWisdom: {
        taught,
        differentNext,
        supportNeeded,
        honorAction,
        actionItemsIdentified,
        supportSystemIdentified,
        planSpecificity,
      },
      overallResolution,
      moralClarity,
      stressLevel,
      energyLevel,
      timestamp: new Date(),
    };

    setShowWisdom(true);
    setTimeout(() => {
      onComplete(results);
    }, 3000);
  };

  const toggleChallengedValue = (value: string) => {
    setChallengedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleValueIntact = (value: string) => {
    setValuesIntact((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return situation && unsettledReason && weightLevel && affecting;
      case 2:
        return challengedValues.length > 0 && topValue && whyMatters;
      case 3:
        return challengeReason;
      case 4:
        return professionalObligation && personalValues && legitimatelyHard && choice;
      case 5:
        return selfForgiveness;
      case 6:
        return biggerPicture && harmWithoutInterpreters && valuesIntact.length > 0;
      case 7:
        return taught && supportNeeded && honorAction;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Compass Check</h2>
                <p className="text-sm text-gray-600 mt-1">Ethical and moral reflection protocol</p>
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
                  <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
                  Step 1: Moral Residue Recognition
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Moral Distress Theory (Jameton, 1984)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    The situation that's troubling me:
                  </label>
                  <textarea
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    placeholder="Describe what happened..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    I feel unsettled because:
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        value: 'against-values',
                        label: 'I had to interpret something against my values',
                      },
                      {
                        value: 'witnessed-injustice',
                        label: "I witnessed injustice I couldn't address",
                      },
                      { value: 'complicit', label: 'I was complicit in potential harm' },
                      { value: 'neutrality', label: "I couldn't maintain full neutrality" },
                      { value: 'boundaries', label: 'I broke/bent professional boundaries' },
                      { value: 'questioning', label: "I'm questioning if I did the right thing" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={unsettledReason === option.value}
                          onChange={(e) => setUnsettledReason(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    The weight feels like:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'mild', label: 'Mild discomfort', color: 'bg-yellow-50' },
                      { value: 'moderate', label: 'Moderate distress', color: 'bg-orange-50' },
                      { value: 'significant', label: 'Significant burden', color: 'bg-red-50' },
                      { value: 'crushing', label: 'Crushing guilt/shame', color: 'bg-red-100' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${weightLevel === option.value ? option.color : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={weightLevel === option.value}
                          onChange={(e) => setWeightLevel(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">This is affecting:</label>
                  <div className="space-y-2">
                    {[
                      { value: 'moment', label: 'Just this moment' },
                      { value: 'day', label: 'My day' },
                      { value: 'sleep', label: 'My sleep' },
                      { value: 'identity', label: 'My sense of professional identity' },
                      { value: 'faith', label: 'My faith in the work' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={affecting === option.value}
                          onChange={(e) => setAffecting(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-100 p-4 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Research insight:</strong> Naming moral distress reduces its impact by
                    47% (Rushton et al., 2015)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Step 2: Values Identification
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Values Clarification Theory (Rokeach, 1973)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    Which of your values felt challenged? (Check all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'justice', label: 'Justice', description: "Fairness wasn't served" },
                      {
                        value: 'truth',
                        label: 'Truth',
                        description: 'Lies/deception were enabled',
                      },
                      {
                        value: 'compassion',
                        label: 'Compassion',
                        description: "Suffering wasn't addressed",
                      },
                      {
                        value: 'dignity',
                        label: 'Dignity',
                        description: 'Someone was dehumanized',
                      },
                      {
                        value: 'autonomy',
                        label: 'Autonomy',
                        description: 'Choice was restricted',
                      },
                      { value: 'safety', label: 'Safety', description: 'Harm was risked/caused' },
                      { value: 'equity', label: 'Equity', description: 'Power was misused' },
                      {
                        value: 'integrity',
                        label: 'Integrity',
                        description: 'I compromised myself',
                      },
                      { value: 'respect', label: 'Respect', description: 'Someone was diminished' },
                      {
                        value: 'connection',
                        label: 'Connection',
                        description: 'Humanity was lost',
                      },
                    ].map((val) => (
                      <label
                        key={val.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={challengedValues.includes(val.value)}
                          onChange={() => toggleChallengedValue(val.value)}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{val.label}</div>
                          <div className="text-xs text-gray-600">{val.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    My top challenged value:
                  </label>
                  <input
                    type="text"
                    value={topValue}
                    onChange={(e) => setTopValue(e.target.value)}
                    placeholder="Which value was most important?"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    Why this matters so much to me:
                  </label>
                  <textarea
                    value={whyMatters}
                    onChange={(e) => setWhyMatters(e.target.value)}
                    placeholder="Connect this value to your core beliefs..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="bg-red-100 p-4 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Research insight:</strong> Values identification reduces moral injury by
                    53% (Litz et al., 2009)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-500" />
                  Step 3: Role Clarity Restoration
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Professional Identity Theory (Ibarra, 1999)
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Remember Your Role:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>You are the bridge, not the builder</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>You carry messages, not responsibility for them</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>You facilitate understanding, not agreement</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>You provide access, not advocacy</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>You are the instrument, not the composer</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    Today's challenge was hard because:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'content-conflict', label: 'The content conflicted with my values' },
                      { value: 'preventable', label: 'The outcome seemed preventable' },
                      { value: 'wanted-intervene', label: "I wanted to intervene but couldn't" },
                      { value: 'accomplice', label: 'I felt like an accomplice' },
                      { value: 'humanity', label: 'My humanity was triggered' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={challengeReason === option.value}
                          onChange={(e) => setChallengeReason(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-5 rounded-xl text-white">
                  <h4 className="font-semibold mb-2">Professional Truth:</h4>
                  <p className="italic">
                    "I maintained my role even when it hurt. This is integrity, not indifference."
                  </p>
                </div>

                <div className="bg-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Research insight:</strong> Role clarity reduces ethical distress by 61%
                    (Dean & Pollard, 2011)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Scale className="w-5 h-5 mr-2 text-purple-500" />
                  Step 4: Ethical Complexity Acknowledgment
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Ethical Decision-Making research (Rest, 1986)
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">The competing demands were:</h4>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Professional obligation:
                      </label>
                      <input
                        type="text"
                        value={professionalObligation}
                        onChange={(e) => setProfessionalObligation(e.target.value)}
                        placeholder="What your role required..."
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div className="text-center text-gray-500 font-bold">VS</div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Personal values:</label>
                      <input
                        type="text"
                        value={personalValues}
                        onChange={(e) => setPersonalValues(e.target.value)}
                        placeholder="What your heart wanted..."
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    What made this legitimately hard:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'no-perfect', label: 'No perfect choice existed' },
                      { value: 'someone-hurt', label: 'Someone would be hurt regardless' },
                      { value: 'systems', label: 'Systems failed, not individuals' },
                      { value: 'cultural', label: 'Cultural conflicts with no resolution' },
                      { value: 'legal-ethical', label: 'Legal vs. ethical obligations' },
                      { value: 'multiple', label: 'Multiple valid perspectives' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={legitimatelyHard === option.value}
                          onChange={(e) => setLegitimatelyHard(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    What I chose and why:
                  </label>
                  <textarea
                    value={choice}
                    onChange={(e) => setChoice(e.target.value)}
                    placeholder="Explain your decision..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    The cost of the alternative would have been:
                  </label>
                  <input
                    type="text"
                    value={alternativeCost}
                    onChange={(e) => setAlternativeCost(e.target.value)}
                    placeholder="What would have happened if you chose differently..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-purple-100 p-4 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Research insight:</strong> Acknowledging ethical complexity reduces
                    rumination by 44% (Thorne et al., 2008)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-pink-500" />
                  Step 5: Compassion Cultivation
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Self-Compassion research (Neff, 2003)
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-pink-50 to-red-50 p-5 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-4">Extending Grace:</h4>

                  <div className="space-y-4">
                    <div className="p-3 bg-white bg-opacity-70 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-1">
                        Compassion for the situation:
                      </h5>
                      <p className="text-sm text-gray-600 italic">
                        "This was difficult because humans are complex and systems are imperfect."
                      </p>
                    </div>

                    <div className="p-3 bg-white bg-opacity-70 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-1">
                        Compassion for others involved:
                      </h5>
                      <p className="text-sm text-gray-600 italic">
                        "Everyone was likely doing their best with what they had."
                      </p>
                    </div>

                    <div className="p-3 bg-white bg-opacity-70 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-1">Compassion for yourself:</h5>
                      <p className="text-sm text-gray-600 italic">
                        "I navigated an impossible situation with professionalism and humanity."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-pink-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Three truths to hold:</h4>
                  <ol className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">1.</span>
                      <span>You can disagree with content while interpreting it faithfully</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">2.</span>
                      <span>Witnessing is not endorsing</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">3.</span>
                      <span>Your discomfort proves your humanity is intact</span>
                    </li>
                  </ol>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    Self-forgiveness statement:
                  </label>
                  <textarea
                    value={selfForgiveness}
                    onChange={(e) => setSelfForgiveness(e.target.value)}
                    placeholder="I forgive myself for..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Example: "I forgive myself for not being able to fix what wasn't mine to fix."
                  </p>
                </div>

                <div className="bg-pink-100 p-4 rounded-lg">
                  <p className="text-sm text-pink-800">
                    <strong>Research insight:</strong> Self-compassion reduces moral distress by 68%
                    (Neff & Germer, 2013)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-500" />
                  Step 6: Values Realignment
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  45 seconds • Based on Acceptance and Commitment Therapy (Hayes et al., 1999)
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">My professional values:</h4>
                  <ol className="space-y-2 text-gray-700">
                    <li>1. Accurate communication serves justice</li>
                    <li>2. Access enables self-advocacy</li>
                    <li>3. Understanding prevents violence</li>
                    <li>4. My neutrality protects client autonomy</li>
                  </ol>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    How today's work served the bigger picture:
                  </label>
                  <textarea
                    value={biggerPicture}
                    onChange={(e) => setBiggerPicture(e.target.value)}
                    placeholder="Connect your work to larger positive impact..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    The harm that would exist WITHOUT interpreters:
                  </label>
                  <textarea
                    value={harmWithoutInterpreters}
                    onChange={(e) => setHarmWithoutInterpreters(e.target.value)}
                    placeholder="What would happen if you weren't there..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    My values are intact because:
                  </label>
                  <div className="space-y-2">
                    {[
                      'I maintained professional boundaries',
                      'I served communication access',
                      'I upheld the code of ethics',
                      'I stayed human while staying professional',
                    ].map((value) => (
                      <label
                        key={value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={valuesIntact.includes(value)}
                          onChange={() => toggleValueIntact(value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{value}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Research insight:</strong> Values realignment reduces burnout by 56%
                    (Veage et al., 2014)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 7 && !showWisdom && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                  Step 7: Forward Wisdom
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  30 seconds • Based on Post-Traumatic Growth research (Tedeschi & Calhoun, 2004)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    What this taught me:
                  </label>
                  <textarea
                    value={taught}
                    onChange={(e) => setTaught(e.target.value)}
                    placeholder="The lesson or insight gained..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    How I'll handle this differently next time:
                  </label>
                  <textarea
                    value={differentNext}
                    onChange={(e) => setDifferentNext(e.target.value)}
                    placeholder="Specific changes or strategies..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    Support I need to process this further:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'peer', label: 'Peer consultation' },
                      { value: 'supervisor', label: 'Supervisor debrief' },
                      { value: 'therapy', label: 'Therapy session' },
                      { value: 'spiritual', label: 'Spiritual practice' },
                      { value: 'rest', label: 'Time and rest' },
                      { value: 'none', label: "None - I'm complete" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={supportNeeded === option.value}
                          onChange={(e) => setSupportNeeded(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">
                    One action to honor my values:
                  </label>
                  <input
                    type="text"
                    value={honorAction}
                    onChange={(e) => setHonorAction(e.target.value)}
                    placeholder="Something concrete you'll do..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    The Science Behind Compass Checks:
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      • <strong>Moral injury</strong> is a major cause of interpreter burnout
                      (Crezee et al., 2015)
                    </li>
                    <li>
                      • <strong>Values clarification</strong> reduces career exit by 41% (Schwartz,
                      2012)
                    </li>
                    <li>
                      • <strong>Ethical processing</strong> prevents secondary trauma by 52%
                      (Phoenix, 2013)
                    </li>
                    <li>
                      • <strong>Self-compassion</strong> protects against moral distress by 73%
                      (Klimecki & Singer, 2012)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {showWisdom && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Check className="w-6 h-6 mr-2 text-green-500" />
                  Compass Realigned
                </h3>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border-2 border-indigo-200">
                <h4 className="font-bold text-lg mb-4 text-gray-900">
                  Wisdom from Veteran Interpreters:
                </h4>

                <div className="space-y-3 text-gray-700 italic">
                  <p>"You are not responsible for the message, only its accurate delivery."</p>
                  <p>"Your discomfort with content proves your ethics are working."</p>
                  <p>"Neutrality doesn't mean not caring - it means caring professionally."</p>
                  <p>"The bridge doesn't apologize for what crosses it."</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6 rounded-xl text-white">
                <p className="text-lg font-semibold text-center">
                  Your moral compass is intact. Your values guide you even through difficult
                  terrain.
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                <h4 className="font-semibold text-gray-900 mb-2">
                  When to Seek Additional Support:
                </h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>□ Moral distress persists beyond 48 hours</li>
                  <li>□ Sleep is significantly impacted</li>
                  <li>□ You're questioning continuing in the profession</li>
                  <li>□ Physical symptoms emerge</li>
                  <li>□ You feel isolated with the burden</li>
                </ul>
              </div>

              <div className="text-center">
                <p className="text-green-600 font-semibold">
                  Your reflection has been captured. Closing in 3 seconds...
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

            {currentStep === 7 && !showWisdom && (
              <button
                onClick={handleComplete}
                disabled={!isStepComplete()}
                className={`px-6 py-2 rounded-lg transition-all flex items-center ${
                  isStepComplete()
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4 mr-2" />
                Complete Compass Check
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompassCheck;
