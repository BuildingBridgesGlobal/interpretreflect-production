import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Download, 
  Mail, 
  Activity,
  Brain,
  Shield,
  Users,
  Target,
  Smile,
  Calendar,
  Edit2
} from 'lucide-react';

interface WellnessCheckInData {
  // Check-In Reason
  reasonForCheckIn: string;
  lastBreak: string;
  lastBreakDate: string;
  
  // Emotional Landscape
  emotionsPresent: string[];
  strongestEmotion: string;
  emotionalDetails: string;
  
  // Physical Awareness
  bodyScan: string;
  physicalSymptoms: string[];
  physicalConcerns: string;
  
  // Professional Wellbeing
  workloadSustainability: number;
  energizingDraining: string;
  recentTraumaticContent: string;
  offClockStressor: string;
  
  // Support & Resources
  supportSystems: string;
  helpComfort: number;
  professionalSupport: string;
  
  // Needs & Intentions
  currentNeeds: string;
  wellbeingAction: string;
  todayGoal: string;
  weekGoal: string;
  
  // Wellness Metrics
  energyLevel: number;
  emotionalWellbeing: number;
  mentalClarity: number;
  socialConnection: number;
  professionalSatisfaction: number;
  overallWellbeing: number;
  
  // Closing & Gratitude
  selfCareAction24h: string;
  gratitude: string;
  shareWithPeer: boolean;
  needsSupport: boolean;
}

interface WellnessCheckInProps {
  onComplete?: (data: WellnessCheckInData) => void;
  onClose?: () => void;
}

export const WellnessCheckInAccessible: React.FC<WellnessCheckInProps> = ({ 
  onComplete, 
  onClose 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isReviewing, setIsReviewing] = useState(false);
  const [formData, setFormData] = useState<WellnessCheckInData>({
    reasonForCheckIn: '',
    lastBreak: '',
    lastBreakDate: '',
    emotionsPresent: [],
    strongestEmotion: '',
    emotionalDetails: '',
    bodyScan: '',
    physicalSymptoms: [],
    physicalConcerns: '',
    workloadSustainability: 5,
    energizingDraining: '',
    recentTraumaticContent: '',
    offClockStressor: '',
    supportSystems: '',
    helpComfort: 5,
    professionalSupport: '',
    currentNeeds: '',
    wellbeingAction: '',
    todayGoal: '',
    weekGoal: '',
    energyLevel: 5,
    emotionalWellbeing: 5,
    mentalClarity: 5,
    socialConnection: 5,
    professionalSatisfaction: 5,
    overallWellbeing: 5,
    selfCareAction24h: '',
    gratitude: '',
    shareWithPeer: false,
    needsSupport: false
  });

  const steps = [
    { id: 1, title: 'Check-In Reason', icon: Heart },
    { id: 2, title: 'Emotional Landscape', icon: Smile },
    { id: 3, title: 'Physical Awareness', icon: Activity },
    { id: 4, title: 'Professional Wellbeing', icon: Target },
    { id: 5, title: 'Support & Resources', icon: Users },
    { id: 6, title: 'Needs & Intentions', icon: Brain },
    { id: 7, title: 'Wellness Metrics', icon: Shield },
    { id: 8, title: 'Closing & Gratitude', icon: CheckCircle }
  ];

  const emotionOptions = [
    'Overwhelmed', 'Stressed', 'Anxious', 'Frustrated', 'Tired', 'Sad',
    'Angry', 'Worried', 'Lonely', 'Confused', 'Hopeful', 'Grateful',
    'Calm', 'Happy', 'Confident', 'Energized', 'Focused', 'Peaceful'
  ];

  const physicalSymptomOptions = [
    'Headaches', 'Tension in neck/shoulders', 'Back pain', 'Fatigue',
    'Difficulty sleeping', 'Changes in appetite', 'Digestive issues',
    'Muscle aches', 'Eye strain', 'Frequent colds', 'Heart racing',
    'Difficulty breathing', 'Restlessness'
  ];

  // Auto-save draft
  useEffect(() => {
    const draftKey = 'wellnessCheckInDraft';
    localStorage.setItem(draftKey, JSON.stringify(formData));
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const draftKey = 'wellnessCheckInDraft';
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.warn('Could not load wellness check-in draft');
      }
    }
  }, []);

  const handleInputChange = (field: keyof WellnessCheckInData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: keyof WellnessCheckInData, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const handleDownloadSummary = () => {
    const summary = generateSummaryText();
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellness-checkin-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEmailSummary = () => {
    const summary = generateSummaryText();
    const subject = 'Wellness Check-In Summary';
    const body = encodeURIComponent(summary);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const generateSummaryText = () => {
    return `WELLNESS CHECK-IN SUMMARY
Generated: ${new Date().toLocaleDateString()}

CHECK-IN REASON
Why Here Today: ${formData.reasonForCheckIn || 'Not provided'}
Last Deliberate Break: ${formData.lastBreak || 'Not provided'}
${formData.lastBreakDate ? `Date: ${formData.lastBreakDate}` : ''}

EMOTIONAL LANDSCAPE
Emotions Present: ${formData.emotionsPresent.join(', ') || 'None selected'}
Strongest Emotion: ${formData.strongestEmotion || 'Not selected'}
Additional Details: ${formData.emotionalDetails || 'Not provided'}

PHYSICAL AWARENESS
Body Scan: ${formData.bodyScan || 'Not provided'}
Physical Symptoms: ${formData.physicalSymptoms.join(', ') || 'None selected'}
Concerns: ${formData.physicalConcerns || 'Not provided'}

PROFESSIONAL WELLBEING
Workload Sustainability: ${formData.workloadSustainability}/10
Energizing/Draining Aspects: ${formData.energizingDraining || 'Not provided'}
Recent Traumatic Content: ${formData.recentTraumaticContent || 'Not provided'}
Off-Clock Stressor: ${formData.offClockStressor || 'Not provided'}

SUPPORT & RESOURCES
Support Systems: ${formData.supportSystems || 'Not provided'}
Comfort Asking for Help: ${formData.helpComfort}/10
Professional Support: ${formData.professionalSupport || 'Not provided'}

NEEDS & INTENTIONS
Current Needs: ${formData.currentNeeds || 'Not provided'}
Wellbeing Action: ${formData.wellbeingAction || 'Not provided'}
Today's Goal: ${formData.todayGoal || 'Not provided'}
Week's Goal: ${formData.weekGoal || 'Not provided'}

WELLNESS METRICS
Energy Level: ${formData.energyLevel}/10
Emotional Wellbeing: ${formData.emotionalWellbeing}/10
Mental Clarity: ${formData.mentalClarity}/10
Social Connection: ${formData.socialConnection}/10
Professional Satisfaction: ${formData.professionalSatisfaction}/10
Overall Wellbeing: ${formData.overallWellbeing}/10

CLOSING & GRATITUDE
24-Hour Self-Care Action: ${formData.selfCareAction24h || 'Not provided'}
Gratitude: ${formData.gratitude || 'Not provided'}
Share with Peer: ${formData.shareWithPeer ? 'Yes' : 'No'}
Needs Support: ${formData.needsSupport ? 'Yes' : 'No'}

🤖 Generated with Claude Code (https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
`;
  };

  const renderProgressNav = () => (
    <nav aria-label="Wellness Check-In Progress" className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6" style={{ color: '#5C7F4F' }} />
          <h1 className="text-2xl font-bold" style={{ color: '#2D3748' }}>
            Wellness Check-In
          </h1>
        </div>
        <div 
          className="text-sm font-medium px-3 py-1 rounded-full" 
          style={{ backgroundColor: '#F0F5ED', color: '#5C7F4F' }}
          aria-live="polite"
        >
          Step {currentStep} of {steps.length}
        </div>
      </div>
      
      <ol className="flex flex-wrap gap-2 mb-4" role="list">
        {steps.map((step, index) => {
          const isCompleted = index + 1 < currentStep;
          const isCurrent = index + 1 === currentStep;
          const Icon = step.icon;
          
          return (
            <li key={step.id} className="flex-1 min-w-[120px]">
              <button
                onClick={() => handleStepClick(step.id)}
                className={`w-full p-3 rounded-lg text-xs font-medium transition-all border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCompleted ? 'cursor-pointer' : 'cursor-default'
                }`}
                style={{
                  backgroundColor: isCurrent ? '#5C7F4F' : isCompleted ? '#F0F5ED' : '#FFFFFF',
                  color: isCurrent ? '#FFFFFF' : isCompleted ? '#5C7F4F' : '#A0AEC0',
                  borderColor: isCurrent ? '#5C7F4F' : isCompleted ? '#5C7F4F' : '#E2E8F0',
                  focusRingColor: '#5C7F4F'
                }}
                disabled={!isCompleted && !isCurrent}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div className="flex flex-col items-center gap-1">
                  <Icon className="h-4 w-4" />
                  <span>{step.title}</span>
                  {isCompleted && (
                    <CheckCircle className="h-3 w-3" style={{ color: '#5C7F4F' }} />
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      {!isReviewing && (
        <button
          onClick={() => setIsReviewing(true)}
          className="mb-4 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#5C7F4F',
            borderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          aria-label="Review all responses"
        >
          <Edit2 className="h-4 w-4 inline mr-2" />
          Review All
        </button>
      )}
    </nav>
  );

  const renderCheckInReason = () => (
    <section aria-labelledby="reason-heading">
      <h2 id="reason-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Check-In Reason
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Understanding what brought you here helps us provide the most relevant support.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What brought you here today?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="What prompted this wellness check-in? Feeling stressed, need to process something, routine self-care..."
          value={formData.reasonForCheckIn}
          onChange={(e) => handleInputChange('reasonForCheckIn', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          When was your most recent deliberate break?
        </legend>
        <div className="space-y-4">
          <textarea
            className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
            style={{ 
              borderColor: '#E2E8F0',
              focusBorderColor: '#5C7F4F',
              focusRingColor: '#5C7F4F'
            }}
            placeholder="Describe your last real break - not just between assignments, but time truly for yourself..."
            value={formData.lastBreak}
            onChange={(e) => handleInputChange('lastBreak', e.target.value)}
            aria-describedby="break-help"
          />
          <div id="break-help" className="text-xs" style={{ color: '#6B7280' }}>
            Think about time when you weren't thinking about work, planning, or problem-solving
          </div>
          
          <div>
            <label htmlFor="last-break-date" className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
              Approximate date (if you can remember):
            </label>
            <input
              type="date"
              id="last-break-date"
              className="p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                borderColor: '#E2E8F0',
                focusBorderColor: '#5C7F4F',
                focusRingColor: '#5C7F4F'
              }}
              value={formData.lastBreakDate}
              onChange={(e) => handleInputChange('lastBreakDate', e.target.value)}
            />
          </div>
        </div>
      </fieldset>
    </section>
  );

  const renderEmotionalLandscape = () => (
    <section aria-labelledby="emotional-heading">
      <h2 id="emotional-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Emotional Landscape
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Emotions are information. Let's identify what you're experiencing right now.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Which emotions are present? (check all that apply)
        </legend>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="group" aria-labelledby="emotions-present">
          {emotionOptions.map(emotion => (
            <label
              key={emotion}
              className={`p-3 rounded-lg text-center cursor-pointer transition-all border-2 focus-within:ring-2 focus-within:ring-offset-2`}
              style={{
                backgroundColor: formData.emotionsPresent.includes(emotion) ? '#F0F5ED' : '#FFFFFF',
                borderColor: formData.emotionsPresent.includes(emotion) ? '#5C7F4F' : '#E2E8F0',
                focusRingColor: '#5C7F4F'
              }}
            >
              <input
                type="checkbox"
                checked={formData.emotionsPresent.includes(emotion)}
                onChange={() => handleArrayToggle('emotionsPresent', emotion)}
                className="sr-only"
              />
              <span className="text-sm" style={{ color: '#2D3748' }}>{emotion}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What's your strongest emotion right now?
        </legend>
        <select
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          value={formData.strongestEmotion}
          onChange={(e) => handleInputChange('strongestEmotion', e.target.value)}
        >
          <option value="">Select the most dominant emotion...</option>
          {emotionOptions.map(emotion => (
            <option key={emotion} value={emotion}>{emotion}</option>
          ))}
        </select>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Anything else about your emotional state?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Emotional patterns, triggers you've noticed, or context around these feelings..."
          value={formData.emotionalDetails}
          onChange={(e) => handleInputChange('emotionalDetails', e.target.value)}
        />
      </fieldset>
    </section>
  );

  const renderPhysicalAwareness = () => (
    <section aria-labelledby="physical-heading">
      <h2 id="physical-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Physical Awareness
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Your body holds valuable information about your overall wellbeing.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          How does your body feel right now?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Take a moment to scan from head to toe. What sensations do you notice? Tension, relaxation, pain, comfort..."
          value={formData.bodyScan}
          onChange={(e) => handleInputChange('bodyScan', e.target.value)}
          aria-describedby="body-scan-help"
        />
        <div id="body-scan-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Include energy levels, areas of tension or comfort, any physical sensations
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Physical symptoms you've been experiencing (check all that apply)
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="group" aria-labelledby="physical-symptoms">
          {physicalSymptomOptions.map(symptom => (
            <label
              key={symptom}
              className={`p-3 rounded-lg cursor-pointer transition-all border-2 focus-within:ring-2 focus-within:ring-offset-2 flex items-center gap-3`}
              style={{
                backgroundColor: formData.physicalSymptoms.includes(symptom) ? '#F0F5ED' : '#FFFFFF',
                borderColor: formData.physicalSymptoms.includes(symptom) ? '#5C7F4F' : '#E2E8F0',
                focusRingColor: '#5C7F4F'
              }}
            >
              <input
                type="checkbox"
                checked={formData.physicalSymptoms.includes(symptom)}
                onChange={() => handleArrayToggle('physicalSymptoms', symptom)}
                className="sr-only"
              />
              <div 
                className="w-4 h-4 rounded border-2 flex items-center justify-center"
                style={{ 
                  borderColor: formData.physicalSymptoms.includes(symptom) ? '#5C7F4F' : '#CBD5E0',
                  backgroundColor: formData.physicalSymptoms.includes(symptom) ? '#5C7F4F' : 'transparent'
                }}
              >
                {formData.physicalSymptoms.includes(symptom) && (
                  <CheckCircle className="h-3 w-3 text-white" />
                )}
              </div>
              <span className="text-sm" style={{ color: '#2D3748' }}>{symptom}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Any other physical concerns or observations?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Changes in sleep, appetite, energy patterns, or other physical aspects of wellness..."
          value={formData.physicalConcerns}
          onChange={(e) => handleInputChange('physicalConcerns', e.target.value)}
        />
      </fieldset>
    </section>
  );

  const renderProfessionalWellbeing = () => (
    <section aria-labelledby="professional-heading">
      <h2 id="professional-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Professional Wellbeing
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Your work as an interpreter brings unique stressors and rewards. Let's explore both.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Workload sustainability (1-10):
        </legend>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#6B7280' }}>Unsustainable</span>
            <div className="flex-1 flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <label key={num} className="relative">
                  <input
                    type="radio"
                    name="workloadSustainability"
                    value={num}
                    checked={formData.workloadSustainability === num}
                    onChange={() => handleInputChange('workloadSustainability', num)}
                    className="sr-only"
                  />
                  <span
                    className={`block w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 focus:ring-2 focus:ring-offset-2`}
                    style={{
                      backgroundColor: formData.workloadSustainability >= num ? '#F0F5ED' : '#F7FAFC',
                      borderColor: formData.workloadSustainability === num ? '#5C7F4F' : '#E2E8F0',
                      color: formData.workloadSustainability >= num ? '#5C7F4F' : '#A0AEC0',
                      focusRingColor: '#5C7F4F'
                    }}
                  >
                    {num}
                  </span>
                </label>
              ))}
            </div>
            <span className="text-sm" style={{ color: '#6B7280' }}>Very Sustainable</span>
          </div>
          <div className="text-center">
            <span className="text-lg font-semibold" style={{ color: '#5C7F4F' }}>
              {formData.workloadSustainability}/10
            </span>
          </div>
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What aspects of your work energize or drain you?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Types of assignments, client interactions, work environments, administrative tasks..."
          value={formData.energizingDraining}
          onChange={(e) => handleInputChange('energizingDraining', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Have you experienced content that was difficult or traumatic recently?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Medical procedures, legal cases, emotional testimony, violence, etc. How are you processing this?"
          value={formData.recentTraumaticContent}
          onChange={(e) => handleInputChange('recentTraumaticContent', e.target.value)}
          aria-describedby="trauma-help"
        />
        <div id="trauma-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          It's normal for interpreters to be affected by difficult content. Consider professional support if needed.
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What's one ongoing stressor you think about even when off the clock?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Work situations, client concerns, professional development, certification, business aspects..."
          value={formData.offClockStressor}
          onChange={(e) => handleInputChange('offClockStressor', e.target.value)}
        />
      </fieldset>
    </section>
  );

  const renderSupportResources = () => (
    <section aria-labelledby="support-heading">
      <h2 id="support-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Support & Resources
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Understanding your support network helps identify areas where you might need more connection.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What support systems are available to you?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Family, friends, colleagues, mentors, professional associations, therapy, peer groups..."
          value={formData.supportSystems}
          onChange={(e) => handleInputChange('supportSystems', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Comfort level asking for help (1-10):
        </legend>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#6B7280' }}>Very Uncomfortable</span>
            <div className="flex-1 flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <label key={num} className="relative">
                  <input
                    type="radio"
                    name="helpComfort"
                    value={num}
                    checked={formData.helpComfort === num}
                    onChange={() => handleInputChange('helpComfort', num)}
                    className="sr-only"
                  />
                  <span
                    className={`block w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 focus:ring-2 focus:ring-offset-2`}
                    style={{
                      backgroundColor: formData.helpComfort >= num ? '#F0F5ED' : '#F7FAFC',
                      borderColor: formData.helpComfort === num ? '#5C7F4F' : '#E2E8F0',
                      color: formData.helpComfort >= num ? '#5C7F4F' : '#A0AEC0',
                      focusRingColor: '#5C7F4F'
                    }}
                  >
                    {num}
                  </span>
                </label>
              ))}
            </div>
            <span className="text-sm" style={{ color: '#6B7280' }}>Very Comfortable</span>
          </div>
          <div className="text-center">
            <span className="text-lg font-semibold" style={{ color: '#5C7F4F' }}>
              {formData.helpComfort}/10
            </span>
          </div>
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Professional support resources you're aware of or have used?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="EAP programs, interpreter organizations, professional development, supervision, therapy..."
          value={formData.professionalSupport}
          onChange={(e) => handleInputChange('professionalSupport', e.target.value)}
          aria-describedby="professional-support-help"
        />
        <div id="professional-support-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Professional support is a sign of strength and professionalism, not weakness
        </div>
      </fieldset>
    </section>
  );

  const renderNeedsIntentions = () => (
    <section aria-labelledby="needs-heading">
      <h2 id="needs-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Needs & Intentions
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Identifying what you need and setting intentions helps create a path forward.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What do you need most right now?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Rest, connection, validation, problem-solving, boundaries, fun, creative expression..."
          value={formData.currentNeeds}
          onChange={(e) => handleInputChange('currentNeeds', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          One small step for your wellbeing today:
        </legend>
        <input
          type="text"
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Something achievable that will support your wellbeing today..."
          value={formData.wellbeingAction}
          onChange={(e) => handleInputChange('wellbeingAction', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Goal for today:
        </legend>
        <input
          type="text"
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="What would make today feel successful or meaningful?"
          value={formData.todayGoal}
          onChange={(e) => handleInputChange('todayGoal', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Goal for the week:
        </legend>
        <input
          type="text"
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="A broader goal or intention for the coming week..."
          value={formData.weekGoal}
          onChange={(e) => handleInputChange('weekGoal', e.target.value)}
        />
      </fieldset>
    </section>
  );

  const renderWellnessMetrics = () => (
    <section aria-labelledby="metrics-heading">
      <h2 id="metrics-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Wellness Metrics
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Rate different aspects of your current wellbeing to get a comprehensive picture.
      </p>

      {[
        { key: 'energyLevel', label: 'Energy Level', lowLabel: 'Exhausted', highLabel: 'Energized' },
        { key: 'emotionalWellbeing', label: 'Emotional Wellbeing', lowLabel: 'Struggling', highLabel: 'Thriving' },
        { key: 'mentalClarity', label: 'Mental Clarity', lowLabel: 'Foggy', highLabel: 'Sharp' },
        { key: 'socialConnection', label: 'Social Connection', lowLabel: 'Isolated', highLabel: 'Connected' },
        { key: 'professionalSatisfaction', label: 'Professional Satisfaction', lowLabel: 'Dissatisfied', highLabel: 'Fulfilled' },
        { key: 'overallWellbeing', label: 'Overall Wellbeing', lowLabel: 'Poor', highLabel: 'Excellent' }
      ].map(metric => {
        const value = formData[metric.key as keyof WellnessCheckInData] as number;
        
        return (
          <fieldset key={metric.key} className="mb-6">
            <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
              {metric.label}:
            </legend>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm" style={{ color: '#6B7280' }}>{metric.lowLabel}</span>
                <div className="flex-1 flex items-center gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <label key={num} className="relative">
                      <input
                        type="radio"
                        name={metric.key}
                        value={num}
                        checked={value === num}
                        onChange={() => handleInputChange(metric.key as keyof WellnessCheckInData, num)}
                        className="sr-only"
                      />
                      <span
                        className={`block w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 focus:ring-2 focus:ring-offset-2`}
                        style={{
                          backgroundColor: value >= num ? '#F0F5ED' : '#F7FAFC',
                          borderColor: value === num ? '#5C7F4F' : '#E2E8F0',
                          color: value >= num ? '#5C7F4F' : '#A0AEC0',
                          focusRingColor: '#5C7F4F'
                        }}
                      >
                        {num}
                      </span>
                    </label>
                  ))}
                </div>
                <span className="text-sm" style={{ color: '#6B7280' }}>{metric.highLabel}</span>
              </div>
              <div className="text-center">
                <span className="text-lg font-semibold" style={{ color: '#5C7F4F' }}>
                  {value}/10
                </span>
              </div>
            </div>
          </fieldset>
        );
      })}
    </section>
  );

  const renderClosingGratitude = () => (
    <section aria-labelledby="closing-heading">
      <h2 id="closing-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Closing & Gratitude
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Complete your wellness check-in with commitments and gratitude.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Your next 24-hour self-care action:
        </legend>
        <input
          type="text"
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="One specific thing you'll do to care for yourself in the next 24 hours..."
          value={formData.selfCareAction24h}
          onChange={(e) => handleInputChange('selfCareAction24h', e.target.value)}
          aria-describedby="selfcare-help"
        />
        <div id="selfcare-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Make it specific and achievable - even 5 minutes counts
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Something you're grateful for right now:
        </legend>
        <input
          type="text"
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Large or small - what brings you gratitude in this moment?"
          value={formData.gratitude}
          onChange={(e) => handleInputChange('gratitude', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-8">
        <legend className="text-sm font-medium mb-4" style={{ color: '#2D3748' }}>
          Support Options
        </legend>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.shareWithPeer}
              onChange={(e) => handleInputChange('shareWithPeer', e.target.checked)}
              className="w-5 h-5 rounded border-2 focus:ring-2 focus:ring-offset-2 mt-0.5"
              style={{
                accentColor: '#5C7F4F',
                focusRingColor: '#5C7F4F'
              }}
            />
            <div>
              <span className="text-sm font-medium" style={{ color: '#2D3748' }}>
                Share summary with a peer or supervisor
              </span>
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                Interpreters deserve wellness support. Consider sharing if you need connection or accountability.
              </p>
            </div>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.needsSupport}
              onChange={(e) => handleInputChange('needsSupport', e.target.checked)}
              className="w-5 h-5 rounded border-2 focus:ring-2 focus:ring-offset-2 mt-0.5"
              style={{
                accentColor: '#5C7F4F',
                focusRingColor: '#5C7F4F'
              }}
            />
            <div>
              <span className="text-sm font-medium" style={{ color: '#2D3748' }}>
                I may need additional support
              </span>
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                Consider reaching out to a professional counselor, EAP, or trusted colleague
              </p>
            </div>
          </label>
        </div>
      </fieldset>

      <div className="flex gap-4">
        <button
          onClick={handleDownloadSummary}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 border-2"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#5C7F4F',
            borderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          aria-label="Download wellness summary"
        >
          <Download className="h-4 w-4" />
          Download Summary
        </button>
        
        <button
          onClick={handleEmailSummary}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 border-2"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#5C7F4F',
            borderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          aria-label="Email summary"
        >
          <Mail className="h-4 w-4" />
          Email Summary
        </button>

        <button
          onClick={() => {
            // Future: Set recurring reminder functionality
            alert('Wellness check-in reminder feature coming soon!');
          }}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 border-2"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#5C7F4F',
            borderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          aria-label="Set recurring reminder"
        >
          <Calendar className="h-4 w-4" />
          Set Reminder
        </button>
      </div>
    </section>
  );

  const renderReviewStep = () => {
    const sections = [
      { title: 'Check-In Reason', data: formData.reasonForCheckIn, field: 'reasonForCheckIn' },
      { title: 'Emotional Landscape', data: `${formData.emotionsPresent.join(', ')} (strongest: ${formData.strongestEmotion})`, field: 'emotionsPresent' },
      { title: 'Physical Awareness', data: formData.bodyScan, field: 'bodyScan' },
      { title: 'Professional Wellbeing', data: `Workload: ${formData.workloadSustainability}/10`, field: 'workloadSustainability' },
      { title: 'Support & Resources', data: `Help comfort: ${formData.helpComfort}/10`, field: 'helpComfort' },
      { title: 'Needs & Intentions', data: formData.currentNeeds, field: 'currentNeeds' },
      { title: 'Wellness Metrics', data: `Overall: ${formData.overallWellbeing}/10, Energy: ${formData.energyLevel}/10`, field: 'overallWellbeing' },
      { title: 'Closing & Gratitude', data: formData.selfCareAction24h, field: 'selfCareAction24h' }
    ];

    return (
      <section aria-labelledby="review-heading">
        <h2 id="review-heading" className="text-xl font-bold mb-6" style={{ color: '#2D3748' }}>
          Review Your Wellness Check-In
        </h2>
        <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
          Review and edit your responses before completing your check-in.
        </p>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border-2"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium" style={{ color: '#2D3748' }}>
                  {section.title}
                </h3>
                <button
                  onClick={() => {
                    setCurrentStep(index + 1);
                    setIsReviewing(false);
                  }}
                  className="p-2 rounded-lg transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ focusRingColor: '#5C7F4F' }}
                  aria-label={`Edit ${section.title}`}
                >
                  <Edit2 className="h-4 w-4" style={{ color: '#5C7F4F' }} />
                </button>
              </div>
              <p className="text-sm" style={{ color: '#4A5568' }}>
                {section.data || 'Not completed yet'}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: '#F0F5ED', border: '1px solid #5C7F4F' }}>
          <p className="text-sm mb-4" style={{ color: '#2D3748' }}>
            <strong>🌿 You've completed your wellness check-in!</strong> Remember that taking care of yourself 
            isn't selfish—it's essential for sustainable service as an interpreter.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (onComplete) {
                  onComplete(formData);
                }
                // Clear draft
                localStorage.removeItem('wellnessCheckInDraft');
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                color: '#FFFFFF',
                focusRingColor: '#5C7F4F'
              }}
            >
              <CheckCircle className="h-5 w-5" />
              Complete Wellness Check-In
            </button>
          </div>
        </div>
      </section>
    );
  };

  const renderCurrentStep = () => {
    if (isReviewing) {
      return renderReviewStep();
    }

    switch (currentStep) {
      case 1:
        return renderCheckInReason();
      case 2:
        return renderEmotionalLandscape();
      case 3:
        return renderPhysicalAwareness();
      case 4:
        return renderProfessionalWellbeing();
      case 5:
        return renderSupportResources();
      case 6:
        return renderNeedsIntentions();
      case 7:
        return renderWellnessMetrics();
      case 8:
        return renderClosingGratitude();
      default:
        return renderCheckInReason();
    }
  };

  const renderNavigationButtons = () => {
    if (isReviewing) {
      return (
        <div className="flex gap-4">
          <button
            onClick={() => setIsReviewing(false)}
            className="flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 border-2"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#5C7F4F',
              borderColor: '#5C7F4F',
              focusRingColor: '#5C7F4F'
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Steps
          </button>
        </div>
      );
    }

    return (
      <div className="flex justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#5C7F4F',
            borderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
              color: '#FFFFFF',
              focusRingColor: '#5C7F4F'
            }}
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setIsReviewing(true)}
            className="flex items-center gap-2 px-6 py-4 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
              color: '#FFFFFF',
              focusRingColor: '#5C7F4F'
            }}
          >
            <CheckCircle className="h-5 w-5" />
            Review & Complete
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 z-10">
          {renderProgressNav()}
          
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ focusRingColor: '#5C7F4F' }}
              aria-label="Close wellness check-in"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          )}
        </div>

        <main className="px-8 py-6" aria-labelledby="wellness-checkin-heading">
          <form onSubmit={(e) => e.preventDefault()}>
            {renderCurrentStep()}
          </form>
        </main>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4">
          {renderNavigationButtons()}
        </div>
      </div>
    </div>
  );
};

export default WellnessCheckInAccessible;