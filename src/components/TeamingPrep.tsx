import React, { useState } from 'react';
import {
  X,
  Users,
  AlertCircle,
  Check,
  ChevronRight,
  ChevronLeft,
  Zap,
  Shield,
  RefreshCw,
  Battery,
} from 'lucide-react';

interface TeamingPrepProps {
  onComplete: (results: TeamPrepResults) => void;
  onClose: () => void;
}

interface TeamPrepResults {
  partnerType: string;
  context: string;
  leadAssignments: {
    technical: string;
    numbers: string;
    cultural: string;
    default: string;
  };
  switchSignal: string;
  supportProtocol: {
    whenImStruggling: string;
    whenYoureStruggling: string;
    helpSignal: string;
  };
  cognitiveLoad: {
    partnerA: string;
    partnerB: string;
    split: string;
  };
  errorRecovery: {
    minor: string;
    major: string;
    lostThread: string;
  };
  energyStrategy: string;
  timestamp: Date;
}

const TeamingPrep: React.FC<TeamingPrepProps> = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [partnerType, setPartnerType] = useState('');
  const [context, setContext] = useState('');
  const [leadTechnical, setLeadTechnical] = useState('');
  const [leadNumbers, setLeadNumbers] = useState('');
  const [leadCultural, setLeadCultural] = useState('');
  const [leadDefault, setLeadDefault] = useState('');
  const [switchSignal, setSwitchSignal] = useState('');
  const [customSwitch, setCustomSwitch] = useState('');
  const [struggleSupport, setStruggleSupport] = useState('');
  const [partnerSupport, setPartnerSupport] = useState('');
  const [helpSignal, setHelpSignal] = useState('');
  const [partnerACapacity, setPartnerACapacity] = useState('');
  const [partnerBCapacity, setPartnerBCapacity] = useState('');
  const [loadSplit, setLoadSplit] = useState('');
  const [minorErrors, setMinorErrors] = useState('');
  const [majorErrors, setMajorErrors] = useState('');
  const [lostThread, setLostThread] = useState('');
  const [energyStrategy, setEnergyStrategy] = useState('');
  const [showQuickReference, setShowQuickReference] = useState(false);

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
    const results: TeamPrepResults = {
      partnerType,
      context,
      leadAssignments: {
        technical: leadTechnical,
        numbers: leadNumbers,
        cultural: leadCultural,
        default: leadDefault,
      },
      switchSignal: switchSignal === 'other' ? customSwitch : switchSignal,
      supportProtocol: {
        whenImStruggling: struggleSupport,
        whenYoureStruggling: partnerSupport,
        helpSignal,
      },
      cognitiveLoad: {
        partnerA: partnerACapacity,
        partnerB: partnerBCapacity,
        split: loadSplit,
      },
      errorRecovery: {
        minor: minorErrors,
        major: majorErrors,
        lostThread,
      },
      energyStrategy,
      timestamp: new Date(),
    };

    setShowQuickReference(true);
    setTimeout(() => {
      onComplete(results);
    }, 3000);
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return partnerType && context;
      case 2:
        return (
          leadTechnical &&
          leadNumbers &&
          leadCultural &&
          leadDefault &&
          switchSignal &&
          (switchSignal !== 'other' || customSwitch)
        );
      case 3:
        return struggleSupport && partnerSupport && helpSignal;
      case 4:
        return partnerACapacity && partnerBCapacity && loadSplit;
      case 5:
        return minorErrors && majorErrors && lostThread;
      case 6:
        return energyStrategy;
      case 7:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Team Coordination Prep</h2>
                <p className="text-sm text-gray-600 mt-1">4-minute team sync protocol</p>
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
                      ? 'bg-blue-500 text-white scale-110'
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
                  <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
                  Step 1: Quick Team Assessment
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  30 seconds • Based on Swift Trust Theory (Meyerson et al., 1996)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">Working with:</label>
                  <div className="space-y-2">
                    {[
                      { value: 'regular', label: "Regular partner - we know each other's style" },
                      {
                        value: 'occasional',
                        label: "Occasional partner - we've worked together before",
                      },
                      { value: 'new', label: 'New partner - first time teaming' },
                      { value: 'emergency', label: 'Emergency pairing - no prior contact' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={partnerType === option.value}
                          onChange={(e) => setPartnerType(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">Context:</label>
                  <div className="space-y-2">
                    {[
                      { value: 'high-stakes', label: 'High-stakes (medical, legal, crisis)' },
                      { value: 'standard', label: 'Standard complexity' },
                      { value: 'routine', label: 'Routine assignment' },
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

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Research insight:</strong> Teams that acknowledge experience level
                    reduce errors by 31% (Salas et al., 2005)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-purple-500" />
                  Step 2: Rapid Role Clarity
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Role Theory (Biddle, 1986) & Team Coordination research
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    Who's taking lead on?
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-700">Technical terminology:</label>
                      <input
                        type="text"
                        value={leadTechnical}
                        onChange={(e) => setLeadTechnical(e.target.value)}
                        placeholder="Partner A, Partner B, or Both"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Numbers/dates/names:</label>
                      <input
                        type="text"
                        value={leadNumbers}
                        onChange={(e) => setLeadNumbers(e.target.value)}
                        placeholder="Partner A, Partner B, or Both"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Cultural references:</label>
                      <input
                        type="text"
                        value={leadCultural}
                        onChange={(e) => setLeadCultural(e.target.value)}
                        placeholder="Partner A, Partner B, or Both"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Default lead if unclear:</label>
                      <input
                        type="text"
                        value={leadDefault}
                        onChange={(e) => setLeadDefault(e.target.value)}
                        placeholder="Partner A or Partner B"
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    Our switch signal is?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'hand', label: 'Hand raise' },
                      { value: 'eye', label: 'Eye contact + nod' },
                      { value: 'verbal', label: 'Verbal ("colleague")' },
                      { value: 'time', label: 'Time-based (every X minutes)' },
                      { value: 'other', label: 'Other' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={switchSignal === option.value}
                          onChange={(e) => setSwitchSignal(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {switchSignal === 'other' && (
                    <input
                      type="text"
                      value={customSwitch}
                      onChange={(e) => setCustomSwitch(e.target.value)}
                      placeholder="Describe your switch signal"
                      className="w-full mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Research insight:</strong> Teams with explicit signals show 44% smoother
                    transitions (Kirchhoff, 2020)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <RefreshCw className="w-5 h-5 mr-2 text-green-500" />
                  Step 3: Support Protocol
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Team Backup Behavior research (Porter et al., 2003)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    When I'm struggling, I need:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'immediate', label: 'Take over immediately' },
                      { value: 'wait10', label: 'Give me 10 seconds to recover' },
                      { value: 'feed', label: 'Feed me the term/number' },
                      { value: 'write', label: 'Write it for me' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={struggleSupport === option.value}
                          onChange={(e) => setStruggleSupport(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    When you're struggling, should I:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'jump', label: 'Jump in immediately' },
                      { value: 'signal', label: 'Wait for your signal' },
                      { value: 'notes', label: 'Slide you notes' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={partnerSupport === option.value}
                          onChange={(e) => setPartnerSupport(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-2 block">Our "HELP" signal:</label>
                  <input
                    type="text"
                    value={helpSignal}
                    onChange={(e) => setHelpSignal(e.target.value)}
                    placeholder="Make it subtle but clear (e.g., tap twice, specific hand gesture)"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Make it subtle but clear</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Research insight:</strong> Teams with backup protocols recover from
                    errors 73% faster (McIntyre & Salas, 1995)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Battery className="w-5 h-5 mr-2 text-orange-500" />
                  Step 4: Cognitive Load Distribution
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  60 seconds • Based on Cognitive Load Theory in interpreting (Seeber, 2011)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    Mental Capacity Check
                  </label>

                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Partner A - Current state:
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          value: '100',
                          label: 'Fresh - at 100%',
                          color: 'bg-green-100 hover:bg-green-200',
                        },
                        {
                          value: '75',
                          label: 'Good - at 75%',
                          color: 'bg-blue-100 hover:bg-blue-200',
                        },
                        {
                          value: '50',
                          label: 'Managing - at 50%',
                          color: 'bg-yellow-100 hover:bg-yellow-200',
                        },
                        {
                          value: '25',
                          label: 'Struggling - below 50%',
                          color: 'bg-red-100 hover:bg-red-200',
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${partnerACapacity === option.value ? option.color : 'hover:bg-gray-50'}`}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={partnerACapacity === option.value}
                            onChange={(e) => setPartnerACapacity(e.target.value)}
                            className="mt-1 mr-3"
                          />
                          <span className="text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Partner B - Current state:
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          value: '100',
                          label: 'Fresh - at 100%',
                          color: 'bg-green-100 hover:bg-green-200',
                        },
                        {
                          value: '75',
                          label: 'Good - at 75%',
                          color: 'bg-blue-100 hover:bg-blue-200',
                        },
                        {
                          value: '50',
                          label: 'Managing - at 50%',
                          color: 'bg-yellow-100 hover:bg-yellow-200',
                        },
                        {
                          value: '25',
                          label: 'Struggling - below 50%',
                          color: 'bg-red-100 hover:bg-red-200',
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${partnerBCapacity === option.value ? option.color : 'hover:bg-gray-50'}`}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={partnerBCapacity === option.value}
                            onChange={(e) => setPartnerBCapacity(e.target.value)}
                            className="mt-1 mr-3"
                          />
                          <span className="text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">Adjustment needed:</label>
                  <div className="space-y-2">
                    {[
                      { value: '50-50', label: 'Standard 50/50 split' },
                      { value: '60-40', label: 'Stronger partner takes 60/40' },
                      { value: '70-30', label: 'Stronger partner takes 70/30' },
                      { value: 'support', label: 'Need to request break/support' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={loadSplit === option.value}
                          onChange={(e) => setLoadSplit(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Research insight:</strong> Teams that openly assess capacity show 52%
                    better performance (Gile, 2009)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                  Step 5: Error Recovery Plan
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  45 seconds • Based on High Reliability Team research (Weick & Sutcliffe, 2001)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    Minor errors (word choice, etc.):
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'let-go', label: 'Let it go, keep flowing' },
                      { value: 'self-correct', label: 'Quick self-correct if critical' },
                      { value: 'partner-correct', label: 'Partner corrects only if essential' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={minorErrors === option.value}
                          onChange={(e) => setMinorErrors(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    Major errors (numbers, medical doses, legal terms):
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'stop', label: 'Stop and correct immediately' },
                      { value: 'jump', label: 'Partner jumps in with correction' },
                      { value: 'write', label: 'Write correction and slide over' },
                      { value: 'repeat', label: 'Request repetition from speaker' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={majorErrors === option.value}
                          onChange={(e) => setMajorErrors(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    If we lose the thread completely:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'takeover', label: 'Partner takes over immediately' },
                      { value: 'ask', label: 'Ask for repetition' },
                      { value: 'consult', label: 'Quick whispered consultation' },
                      { value: 'break', label: 'Signal for break needed' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={lostThread === option.value}
                          onChange={(e) => setLostThread(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Research insight:</strong> Teams with error protocols maintain 89%
                    accuracy vs 72% without (Napier, 2015)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  Step 6: Energy Management
                </h3>
                <p className="text-sm text-gray-600 mb-4 italic">
                  30 seconds • Based on Team Energy Cycles (Marks et al., 2001)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-900 mb-3 block">
                    Planned energy strategy:
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        value: 'sprint',
                        label: 'Sprint Mode',
                        description: 'Critical short assignment, both give 100%',
                        icon: '🏃',
                      },
                      {
                        value: 'marathon',
                        label: 'Marathon Mode',
                        description: 'Long assignment, planned switches',
                        icon: '🏃‍♀️',
                      },
                      {
                        value: 'conservation',
                        label: 'Conservation Mode',
                        description: 'One preserves energy while other leads',
                        icon: '🔋',
                      },
                      {
                        value: 'tag',
                        label: 'Tag Team',
                        description: 'Clear on/off switches, full recovery between',
                        icon: '🏷️',
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all hover:border-yellow-400"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={energyStrategy === option.value}
                          onChange={(e) => setEnergyStrategy(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{option.icon}</span>
                            <span className="font-medium text-gray-900">{option.label}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Research insight:</strong> Teams using energy strategies maintain
                    performance 40% longer (Hale, 2007)
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 7 && !showQuickReference && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Check className="w-5 h-5 mr-2 text-green-500" />
                  Final Sync Checklist
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  'We know who leads on what',
                  'Switch signals are clear',
                  'Support protocol agreed',
                  'Capacity honestly assessed',
                  'Error plan established',
                  'Energy strategy selected',
                ].map((item, index) => (
                  <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-gray-800">{item}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-xl text-white">
                <h4 className="font-semibold mb-2">Team Affirmation</h4>
                <p className="text-lg italic">
                  "We are professional partners. We support without judgment. We succeed together."
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">The Science Behind Team Prep:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>
                    • <strong>Role clarity</strong> reduces cognitive overhead by 35% (Cannon-Bowers
                    et al., 1993)
                  </li>
                  <li>
                    • <strong>Explicit coordination</strong> improves accuracy by 28% (Hutchins,
                    1995)
                  </li>
                  <li>
                    • <strong>Shared mental models</strong> decrease errors by 45% (Mohammed et al.,
                    2010)
                  </li>
                  <li>
                    • <strong>Energy management</strong> extends team endurance by 50%
                    (Blickensderfer et al., 2010)
                  </li>
                </ul>
              </div>
            </div>
          )}

          {showQuickReference && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Check className="w-6 h-6 mr-2 text-green-500" />
                  Quick Reference Card
                </h3>
                <p className="text-sm text-gray-600 mb-4">Screenshot or write these down!</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
                <h4 className="font-bold text-lg mb-4 text-gray-900">Our Signals Today:</h4>
                <div className="space-y-2 text-gray-800">
                  <p>
                    <strong>Switch:</strong>{' '}
                    {switchSignal === 'other' ? customSwitch : switchSignal}
                  </p>
                  <p>
                    <strong>Help needed:</strong> {helpSignal}
                  </p>
                  <p>
                    <strong>Take over:</strong>{' '}
                    {partnerSupport === 'jump' ? 'Immediate' : 'Wait for signal'}
                  </p>
                </div>

                <h4 className="font-bold text-lg mt-6 mb-4 text-gray-900">Our Agreement:</h4>
                <div className="space-y-2 text-gray-800">
                  <p>
                    <strong>Lead split:</strong> {loadSplit}
                  </p>
                  <p>
                    <strong>Error handling:</strong> Minor: {minorErrors}, Major: {majorErrors}
                  </p>
                  <p>
                    <strong>Energy mode:</strong> {energyStrategy}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-green-600 font-semibold">
                  Team prep complete! Closing in 3 seconds...
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
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}

            {currentStep === 7 && !showQuickReference && (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Complete Team Prep
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamingPrep;
