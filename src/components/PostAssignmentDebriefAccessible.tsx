import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Edit2,
  Download,
  Mail,
  Save,
  Heart,
  Brain,
  Target,
  Shield,
  Users,
  Lightbulb,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  Circle,
  X,
  FileText,
  Sparkles,
  Activity,
  BarChart3,
  Clock
} from 'lucide-react';

interface PostAssignmentDebriefProps {
  onClose: () => void;
  onComplete?: (data: DebriefData) => void;
}

interface DebriefData {
  assignmentType: string;
  duration: string;
  overallSatisfaction: number;
  technicalAccuracy: number;
  communicationEffectiveness: number;
  proudestMoment: string;
  challengesFaced: string[];
  adaptations: string[];
  skillsStrengthened: string[];
  lessonsLearned: string;
  selfCareActions: string[];
  celebrationPlan: string;
  emotionalState: string;
  physicalState: string;
  confidenceForFuture: number;
  notes: string;
  timestamp: string;
}

interface PreAssignmentData {
  emotionalState?: string;
  physicalReadiness?: string;
  knowledgeGaps?: string[];
  selfCarePost?: string[];
  assignmentType?: string;
  duration?: string;
}

const ASSIGNMENT_TYPES = [
  { value: 'medical', label: 'Medical', icon: Heart },
  { value: 'legal', label: 'Legal', icon: Shield },
  { value: 'educational', label: 'Educational', icon: Brain },
  { value: 'conference', label: 'Conference', icon: Users },
  { value: 'community', label: 'Community', icon: Users },
  { value: 'mental-health', label: 'Mental Health', icon: Heart }
];

const EMOTIONAL_STATES = [
  { value: 'fulfilled', label: 'Fulfilled & Accomplished', emoji: '😊' },
  { value: 'satisfied', label: 'Satisfied', emoji: '🙂' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'drained', label: 'Drained but OK', emoji: '😔' },
  { value: 'exhausted', label: 'Exhausted', emoji: '😫' },
  { value: 'energized', label: 'Energized', emoji: '⚡' }
];

const PHYSICAL_STATES = [
  { value: 'great', label: 'Feeling Great', emoji: '💪' },
  { value: 'good', label: 'Good Energy', emoji: '👍' },
  { value: 'tired', label: 'Tired', emoji: '😴' },
  { value: 'sore', label: 'Physically Sore', emoji: '🤕' },
  { value: 'depleted', label: 'Depleted', emoji: '🔋' }
];

const steps = [
  { id: 1, title: 'Assignment Basics', icon: FileText },
  { id: 2, title: 'Performance Review', icon: BarChart3 },
  { id: 3, title: 'Proudest Moment', icon: Award },
  { id: 4, title: 'Challenges & Adaptations', icon: Brain },
  { id: 5, title: 'Skills & Learning', icon: TrendingUp },
  { id: 6, title: 'Emotional Check', icon: Heart },
  { id: 7, title: 'Physical State', icon: Activity },
  { id: 8, title: 'Self-Care Plan', icon: Shield },
  { id: 9, title: 'Celebration', icon: Sparkles },
  { id: 10, title: 'Review & Complete', icon: CheckCircle }
];

export const PostAssignmentDebriefAccessible: React.FC<PostAssignmentDebriefProps> = ({ 
  onClose, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<DebriefData>({
    assignmentType: '',
    duration: '',
    overallSatisfaction: 5,
    technicalAccuracy: 5,
    communicationEffectiveness: 5,
    proudestMoment: '',
    challengesFaced: [],
    adaptations: [],
    skillsStrengthened: [],
    lessonsLearned: '',
    selfCareActions: [],
    celebrationPlan: '',
    emotionalState: '',
    physicalState: '',
    confidenceForFuture: 5,
    notes: '',
    timestamp: new Date().toISOString()
  });

  const [preAssignmentData, setPreAssignmentData] = useState<PreAssignmentData | null>(null);
  const [previousDebriefs, setPreviousDebriefs] = useState<DebriefData[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);

  // Load pre-assignment data and previous debriefs
  useEffect(() => {
    // Load pre-assignment data for comparison
    const preData = localStorage.getItem('lastPreAssignmentPrep');
    if (preData) {
      setPreAssignmentData(JSON.parse(preData));
    }

    // Load previous debriefs for trend analysis
    const savedDebriefs = localStorage.getItem('postAssignmentDebriefs');
    if (savedDebriefs) {
      setPreviousDebriefs(JSON.parse(savedDebriefs));
    }
    
    // Load draft if exists
    const draft = localStorage.getItem('postAssignmentDebriefDraft');
    if (draft) {
      const parsed = JSON.parse(draft);
      setFormData(parsed);
      // Resume from where they left off
      const lastStep = localStorage.getItem('postAssignmentDebriefStep');
      if (lastStep) {
        setCurrentStep(parseInt(lastStep));
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      localStorage.setItem('postAssignmentDebriefDraft', JSON.stringify(formData));
      localStorage.setItem('postAssignmentDebriefStep', currentStep.toString());
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 1000);
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [formData, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      progressRef.current?.focus();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      progressRef.current?.focus();
    }
  };

  const handleStepJump = (step: number) => {
    setCurrentStep(step);
    setIsReviewing(false);
  };

  const handleComplete = () => {
    const completedData = {
      ...formData,
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    const existingDebriefs = JSON.parse(localStorage.getItem('postAssignmentDebriefs') || '[]');
    existingDebriefs.push(completedData);
    localStorage.setItem('postAssignmentDebriefs', JSON.stringify(existingDebriefs));
    
    // Clear draft
    localStorage.removeItem('postAssignmentDebriefDraft');
    localStorage.removeItem('postAssignmentDebriefStep');
    
    if (onComplete) {
      onComplete(completedData);
    }
    
    onClose();
  };

  const handleDownloadSummary = () => {
    const summary = generateSummary();
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `post-assignment-debrief-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEmailSummary = () => {
    const summary = generateSummary();
    const subject = `Post-Assignment Debrief - ${new Date().toLocaleDateString()}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
    window.open(mailtoUrl);
  };

  const generateSummary = () => {
    return `POST-ASSIGNMENT DEBRIEF SUMMARY
Date: ${new Date().toLocaleString()}

ASSIGNMENT DETAILS
Type: ${formData.assignmentType}
Duration: ${formData.duration}

PERFORMANCE METRICS
Overall Satisfaction: ${formData.overallSatisfaction}/10
Technical Accuracy: ${formData.technicalAccuracy}/10
Communication Effectiveness: ${formData.communicationEffectiveness}/10
Confidence for Future: ${formData.confidenceForFuture}/10

PROUDEST MOMENT
${formData.proudestMoment}

CHALLENGES FACED
${formData.challengesFaced.map(c => `• ${c}`).join('\n') || 'None recorded'}

ADAPTATIONS MADE
${formData.adaptations.map(a => `• ${a}`).join('\n') || 'None recorded'}

SKILLS STRENGTHENED
${formData.skillsStrengthened.map(s => `• ${s}`).join('\n') || 'None recorded'}

LESSONS LEARNED
${formData.lessonsLearned}

WELLNESS CHECK
Emotional State: ${formData.emotionalState}
Physical State: ${formData.physicalState}

SELF-CARE PLAN
${formData.selfCareActions.map(a => `• ${a}`).join('\n') || 'None recorded'}

CELEBRATION
${formData.celebrationPlan}

NOTES
${formData.notes || 'No additional notes'}

---
Generated by InterpretReflect™`;
  };

  const calculateGrowth = () => {
    if (previousDebriefs.length === 0) return null;
    
    const lastDebrief = previousDebriefs[previousDebriefs.length - 1];
    return {
      satisfaction: formData.overallSatisfaction - (lastDebrief.overallSatisfaction || 5),
      accuracy: formData.technicalAccuracy - (lastDebrief.technicalAccuracy || 5),
      communication: formData.communicationEffectiveness - (lastDebrief.communicationEffectiveness || 5),
      confidence: formData.confidenceForFuture - (lastDebrief.confidenceForFuture || 5)
    };
  };

  const renderProgressIndicator = () => (
    <nav aria-label="Progress through debrief steps" className="mb-6">
      <ol className="flex items-center justify-between" role="list">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const Icon = step.icon;

          return (
            <li key={step.id} className="flex-1">
              <button
                onClick={() => isCompleted && handleStepJump(step.id)}
                disabled={!isCompleted && !isCurrent}
                className={`w-full flex flex-col items-center p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCompleted ? 'cursor-pointer hover:bg-gray-50' : ''
                }`}
                style={{ focusRingColor: '#5C7F4F' }}
                aria-label={`${step.title} - ${isCompleted ? 'Completed' : isCurrent ? 'Current step' : 'Not yet reached'}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-1`}
                  style={{
                    backgroundColor: isCompleted ? '#F0F5ED' : isCurrent ? '#E8F2FE' : '#F7FAFC',
                    color: isCompleted ? '#5C7F4F' : isCurrent ? '#3182CE' : '#718096'
                  }}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className="text-xs hidden md:block"
                  style={{
                    color: isCompleted ? '#5C7F4F' : isCurrent ? '#2D3748' : '#A0AEC0'
                  }}
                >
                  {step.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div
        ref={progressRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="mt-4 text-center text-sm"
        style={{ color: '#4A5568' }}
        tabIndex={-1}
      >
        Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
      </div>
    </nav>
  );

  const renderAssignmentBasics = () => (
    <section aria-labelledby="basics-heading">
      <h3 id="basics-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Assignment Basics
      </h3>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Let's capture the basic details of your assignment.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What type of assignment was this?
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {ASSIGNMENT_TYPES.map(type => {
            const Icon = type.icon;
            return (
              <label
                key={type.value}
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 focus-within:ring-2 focus-within:ring-offset-2`}
                style={{
                  backgroundColor: formData.assignmentType === type.value ? '#F0F5ED' : '#FFFFFF',
                  borderColor: formData.assignmentType === type.value ? '#5C7F4F' : '#E2E8F0',
                  focusRingColor: '#5C7F4F'
                }}
              >
                <input
                  type="radio"
                  name="assignmentType"
                  value={type.value}
                  checked={formData.assignmentType === type.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignmentType: e.target.value }))}
                  className="absolute opacity-0 pointer-events-none"
                />
                <Icon className="h-5 w-5" style={{ color: '#5C7F4F' }} />
                <span style={{ color: '#2D3748' }}>{type.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          How long was the assignment?
        </legend>
        <div className="grid grid-cols-3 gap-3">
          {['30 min', '1 hour', '2 hours', '3 hours', '4+ hours', 'All day'].map(duration => (
            <label
              key={duration}
              className={`p-3 rounded-lg text-center cursor-pointer transition-all border-2 focus-within:ring-2 focus-within:ring-offset-2`}
              style={{
                backgroundColor: formData.duration === duration ? '#F0F5ED' : '#FFFFFF',
                borderColor: formData.duration === duration ? '#5C7F4F' : '#E2E8F0',
                focusRingColor: '#5C7F4F'
              }}
            >
              <input
                type="radio"
                name="duration"
                value={duration}
                checked={formData.duration === duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className="absolute opacity-0 pointer-events-none"
              />
              <span className="text-sm" style={{ color: '#2D3748' }}>{duration}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );

  const renderPerformanceReview = () => (
    <section aria-labelledby="performance-heading">
      <h3 id="performance-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Performance Review
      </h3>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Rate different aspects of your performance today.
      </p>

      {[
        { key: 'overallSatisfaction', label: 'Overall Satisfaction', icon: Heart },
        { key: 'technicalAccuracy', label: 'Technical Accuracy', icon: Target },
        { key: 'communicationEffectiveness', label: 'Communication Effectiveness', icon: Users },
        { key: 'confidenceForFuture', label: 'Confidence for Future', icon: TrendingUp }
      ].map(metric => {
        const Icon = metric.icon;
        const value = formData[metric.key as keyof DebriefData] as number;
        
        return (
          <fieldset key={metric.key} className="mb-6">
            <legend className="flex items-center gap-2 text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
              <Icon className="h-4 w-4" style={{ color: '#5C7F4F' }} />
              {metric.label}
            </legend>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <label
                  key={num}
                  className="relative"
                >
                  <input
                    type="radio"
                    name={metric.key}
                    value={num}
                    checked={value === num}
                    onChange={() => setFormData(prev => ({ ...prev, [metric.key]: num }))}
                    className="absolute opacity-0 pointer-events-none"
                  />
                  <span
                    className={`block w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 focus:ring-2 focus:ring-offset-2 ${
                      value >= num ? 'bg-green-100' : 'bg-gray-50'
                    }`}
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
              <span className="ml-2 text-sm font-medium" style={{ color: '#5C7F4F' }}>
                {value}/10
              </span>
            </div>
          </fieldset>
        );
      })}
    </section>
  );

  const renderProudestMoment = () => (
    <section aria-labelledby="proud-heading">
      <h3 id="proud-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Proudest Moment
      </h3>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        What moment from today's assignment are you most proud of?
      </p>

      <fieldset>
        <legend className="sr-only">Describe your proudest moment</legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            borderColor: '#E2E8F0',
            focusRingColor: '#5C7F4F'
          }}
          rows={4}
          placeholder="Describe a moment that made you feel proud, accomplished, or satisfied..."
          value={formData.proudestMoment}
          onChange={(e) => setFormData(prev => ({ ...prev, proudestMoment: e.target.value }))}
          aria-label="Describe your proudest moment"
        />
      </fieldset>
    </section>
  );

  const renderChallenges = () => (
    <section aria-labelledby="challenges-heading">
      <h3 id="challenges-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Challenges & Adaptations
      </h3>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        What challenges did you face, and how did you adapt?
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Challenges faced (one per line)
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            borderColor: '#E2E8F0',
            focusRingColor: '#5C7F4F'
          }}
          rows={3}
          placeholder="E.g., Technical terminology, Fast pace, Emotional content..."
          value={formData.challengesFaced.join('\n')}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            challengesFaced: e.target.value.split('\n').filter(Boolean)
          }))}
          aria-label="List challenges faced"
        />
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Adaptations you made (one per line)
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            borderColor: '#E2E8F0',
            focusRingColor: '#5C7F4F'
          }}
          rows={3}
          placeholder="E.g., Asked for clarification, Adjusted positioning, Used context clues..."
          value={formData.adaptations.join('\n')}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            adaptations: e.target.value.split('\n').filter(Boolean)
          }))}
          aria-label="List adaptations made"
        />
      </fieldset>
    </section>
  );

  const renderSkillsLearning = () => (
    <section aria-labelledby="skills-heading">
      <h3 id="skills-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Skills & Learning
      </h3>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        What skills did you strengthen? What can you carry forward?
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Skills strengthened today
        </legend>
        <div className="space-y-2 mb-3">
          {['Active listening', 'Cultural mediation', 'Technical vocabulary', 'Emotional regulation', 'Time management', 'Advocacy'].map(skill => (
            <label
              key={skill}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.skillsStrengthened.includes(skill)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({
                      ...prev,
                      skillsStrengthened: [...prev.skillsStrengthened, skill]
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      skillsStrengthened: prev.skillsStrengthened.filter(s => s !== skill)
                    }));
                  }
                }}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#5C7F4F' }}
              />
              <span style={{ color: '#2D3748' }}>{skill}</span>
            </label>
          ))}
        </div>
        <input
          type="text"
          className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            borderColor: '#E2E8F0',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Add another skill..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const value = (e.target as HTMLInputElement).value;
              if (value && !formData.skillsStrengthened.includes(value)) {
                setFormData(prev => ({
                  ...prev,
                  skillsStrengthened: [...prev.skillsStrengthened, value]
                }));
                (e.target as HTMLInputElement).value = '';
              }
            }
          }}
          aria-label="Add custom skill"
        />
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Key lesson to carry forward
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            borderColor: '#E2E8F0',
            focusRingColor: '#5C7F4F'
          }}
          rows={3}
          placeholder="What's the most important thing you learned today?"
          value={formData.lessonsLearned}
          onChange={(e) => setFormData(prev => ({ ...prev, lessonsLearned: e.target.value }))}
          aria-label="Key lesson learned"
        />
      </fieldset>
    </section>
  );

  const renderEmotionalCheck = () => (
    <section aria-labelledby="emotional-heading">
      <h3 id="emotional-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Emotional Check-In
      </h3>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        How are you feeling emotionally after this assignment?
      </p>

      <fieldset>
        <legend className="sr-only">Select your emotional state</legend>
        <div className="space-y-3">
          {EMOTIONAL_STATES.map(state => (
            <label
              key={state.value}
              className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 focus-within:ring-2 focus-within:ring-offset-2`}
              style={{
                backgroundColor: formData.emotionalState === state.value ? '#F0F5ED' : '#FFFFFF',
                borderColor: formData.emotionalState === state.value ? '#5C7F4F' : '#E2E8F0',
                focusRingColor: '#5C7F4F'
              }}
            >
              <input
                type="radio"
                name="emotionalState"
                value={state.value}
                checked={formData.emotionalState === state.value}
                onChange={(e) => setFormData(prev => ({ ...prev, emotionalState: e.target.value }))}
                className="absolute opacity-0 pointer-events-none"
              />
              <span className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{state.emoji}</span>
                <span style={{ color: '#2D3748' }}>{state.label}</span>
              </span>
              <Circle
                className={`h-5 w-5 ${
                  formData.emotionalState === state.value ? 'fill-current' : ''
                }`}
                style={{ color: formData.emotionalState === state.value ? '#5C7F4F' : '#CBD5E0' }}
              />
            </label>
          ))}
        </div>
      </fieldset>

      {preAssignmentData && preAssignmentData.emotionalState && (
        <aside
          aria-labelledby="emotional-comparison"
          className="mt-4 p-4 rounded-lg"
          style={{ backgroundColor: '#F7FAFC' }}
        >
          <h4 id="emotional-comparison" className="text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
            Compare to Pre-Assignment
          </h4>
          <p className="text-sm" style={{ color: '#4A5568' }}>
            Before: <strong>{preAssignmentData.emotionalState}</strong><br />
            After: <strong>{formData.emotionalState || 'Not selected'}</strong>
          </p>
        </aside>
      )}
    </section>
  );

  const renderPhysicalState = () => (
    <section aria-labelledby="physical-heading">
      <h3 id="physical-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Physical State
      </h3>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        How is your body feeling after this assignment?
      </p>

      <fieldset>
        <legend className="sr-only">Select your physical state</legend>
        <div className="space-y-3">
          {PHYSICAL_STATES.map(state => (
            <label
              key={state.value}
              className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 focus-within:ring-2 focus-within:ring-offset-2`}
              style={{
                backgroundColor: formData.physicalState === state.value ? '#F0F5ED' : '#FFFFFF',
                borderColor: formData.physicalState === state.value ? '#5C7F4F' : '#E2E8F0',
                focusRingColor: '#5C7F4F'
              }}
            >
              <input
                type="radio"
                name="physicalState"
                value={state.value}
                checked={formData.physicalState === state.value}
                onChange={(e) => setFormData(prev => ({ ...prev, physicalState: e.target.value }))}
                className="absolute opacity-0 pointer-events-none"
              />
              <span className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{state.emoji}</span>
                <span style={{ color: '#2D3748' }}>{state.label}</span>
              </span>
              <Circle
                className={`h-5 w-5 ${
                  formData.physicalState === state.value ? 'fill-current' : ''
                }`}
                style={{ color: formData.physicalState === state.value ? '#5C7F4F' : '#CBD5E0' }}
              />
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );

  const renderSelfCare = () => (
    <section aria-labelledby="selfcare-heading">
      <h3 id="selfcare-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Self-Care & Recovery
      </h3>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        What self-care or recovery actions will you take now?
      </p>

      <fieldset>
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Select or add self-care activities
        </legend>
        
        <div className="space-y-2 mb-3">
          {['Rest and relax', 'Hydrate', 'Stretch or move', 'Connect with loved ones', 'Practice breathing', 'Take a walk', 'Journal', 'Listen to music'].map(activity => (
            <label
              key={activity}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.selfCareActions.includes(activity)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({
                      ...prev,
                      selfCareActions: [...prev.selfCareActions, activity]
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      selfCareActions: prev.selfCareActions.filter(a => a !== activity)
                    }));
                  }
                }}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#5C7F4F' }}
              />
              <span style={{ color: '#2D3748' }}>{activity}</span>
            </label>
          ))}
        </div>
        
        <input
          type="text"
          className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            borderColor: '#E2E8F0',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Add your own self-care activity..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const value = (e.target as HTMLInputElement).value;
              if (value && !formData.selfCareActions.includes(value)) {
                setFormData(prev => ({
                  ...prev,
                  selfCareActions: [...prev.selfCareActions, value]
                }));
                (e.target as HTMLInputElement).value = '';
              }
            }
          }}
          aria-label="Add custom self-care activity"
        />
      </fieldset>
    </section>
  );

  const renderCelebration = () => (
    <section aria-labelledby="celebration-heading">
      <h3 id="celebration-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Celebration & Honor
      </h3>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        How can you honor what went well today?
      </p>

      <fieldset>
        <legend className="sr-only">Describe how you'll celebrate</legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            borderColor: '#E2E8F0',
            focusRingColor: '#5C7F4F'
          }}
          rows={3}
          placeholder="How will you celebrate your accomplishments today? (E.g., share with a friend, treat yourself, reflect in journal...)"
          value={formData.celebrationPlan}
          onChange={(e) => setFormData(prev => ({ ...prev, celebrationPlan: e.target.value }))}
          aria-label="How will you celebrate"
        />
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Any additional notes or reflections?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            borderColor: '#E2E8F0',
            focusRingColor: '#5C7F4F'
          }}
          rows={3}
          placeholder="Any other thoughts or reflections..."
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          aria-label="Additional notes"
        />
      </fieldset>
    </section>
  );

  const renderReviewStep = () => {
    const growth = calculateGrowth();
    
    return (
      <section aria-labelledby="review-heading">
        <h3 id="review-heading" className="text-xl font-bold mb-6" style={{ color: '#2D3748' }}>
          Review Your Debrief
        </h3>

        {/* Growth Summary */}
        <div
          className="mb-6 p-6 rounded-xl"
          style={{
            backgroundColor: '#F0F5ED',
            border: '2px solid #7A9B6E'
          }}
          aria-labelledby="growth-summary-heading"
        >
          <h4 id="growth-summary-heading" className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#5C7F4F' }}>
            <TrendingUp className="h-5 w-5" />
            Growth Summary
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#5C7F4F' }}>
                {formData.overallSatisfaction}/10
              </div>
              <div className="text-xs" style={{ color: '#4A5568' }}>Satisfaction</div>
              {growth && (
                <div className={`text-xs mt-1 ${growth.satisfaction >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growth.satisfaction > 0 ? '+' : ''}{growth.satisfaction} from last
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#5C7F4F' }}>
                {formData.technicalAccuracy}/10
              </div>
              <div className="text-xs" style={{ color: '#4A5568' }}>Accuracy</div>
              {growth && (
                <div className={`text-xs mt-1 ${growth.accuracy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growth.accuracy > 0 ? '+' : ''}{growth.accuracy} from last
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#5C7F4F' }}>
                {formData.communicationEffectiveness}/10
              </div>
              <div className="text-xs" style={{ color: '#4A5568' }}>Communication</div>
              {growth && (
                <div className={`text-xs mt-1 ${growth.communication >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growth.communication > 0 ? '+' : ''}{growth.communication} from last
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#5C7F4F' }}>
                {formData.confidenceForFuture}/10
              </div>
              <div className="text-xs" style={{ color: '#4A5568' }}>Confidence</div>
              {growth && (
                <div className={`text-xs mt-1 ${growth.confidence >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growth.confidence > 0 ? '+' : ''}{growth.confidence} from last
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownloadSummary}
              className="flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#5C7F4F',
                border: '1px solid #7A9B6E'
              }}
              aria-label="Download summary"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              onClick={handleEmailSummary}
              className="flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#5C7F4F',
                border: '1px solid #7A9B6E'
              }}
              aria-label="Email summary to myself"
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
          </div>
        </div>

        {/* Debrief Summary */}
        <div className="space-y-4">
          {formData.proudestMoment && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F7FAFC' }}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium" style={{ color: '#2D3748' }}>Proudest Moment</h4>
                <button
                  onClick={() => handleStepJump(3)}
                  className="p-1 hover:bg-gray-200 rounded transition-all"
                  aria-label="Edit proudest moment"
                >
                  <Edit2 className="h-4 w-4" style={{ color: '#5C7F4F' }} />
                </button>
              </div>
              <p className="text-sm" style={{ color: '#4A5568' }}>{formData.proudestMoment}</p>
            </div>
          )}

          {formData.skillsStrengthened.length > 0 && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F7FAFC' }}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium" style={{ color: '#2D3748' }}>Skills Strengthened</h4>
                <button
                  onClick={() => handleStepJump(5)}
                  className="p-1 hover:bg-gray-200 rounded transition-all"
                  aria-label="Edit skills"
                >
                  <Edit2 className="h-4 w-4" style={{ color: '#5C7F4F' }} />
                </button>
              </div>
              <ul className="list-disc list-inside text-sm" style={{ color: '#4A5568' }}>
                {formData.skillsStrengthened.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {formData.selfCareActions.length > 0 && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F7FAFC' }}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium" style={{ color: '#2D3748' }}>Self-Care Plan</h4>
                <button
                  onClick={() => handleStepJump(8)}
                  className="p-1 hover:bg-gray-200 rounded transition-all"
                  aria-label="Edit self-care plan"
                >
                  <Edit2 className="h-4 w-4" style={{ color: '#5C7F4F' }} />
                </button>
              </div>
              <ul className="list-disc list-inside text-sm" style={{ color: '#4A5568' }}>
                {formData.selfCareActions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderStepContent = () => {
    if (currentStep === 10 || isReviewing) {
      return renderReviewStep();
    }

    switch (currentStep) {
      case 1:
        return renderAssignmentBasics();
      case 2:
        return renderPerformanceReview();
      case 3:
        return renderProudestMoment();
      case 4:
        return renderChallenges();
      case 5:
        return renderSkillsLearning();
      case 6:
        return renderEmotionalCheck();
      case 7:
        return renderPhysicalState();
      case 8:
        return renderSelfCare();
      case 9:
        return renderCelebration();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <form
          aria-labelledby="debrief-form-heading"
          className="p-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleComplete();
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 id="debrief-form-heading" className="text-2xl font-bold" style={{ color: '#2D3748' }}>
                Post-Assignment Debrief
              </h2>
              {isSaving && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#5C7F4F' }}>
                  <Save className="h-3 w-3" />
                  Auto-saved
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-50 rounded-lg transition-all"
              aria-label="Close debrief form"
            >
              <X className="h-5 w-5" style={{ color: '#4A5568' }} />
            </button>
          </div>

          {/* Progress Indicator */}
          {renderProgressIndicator()}

          {/* Step Content */}
          <div className="mb-6">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50"
              style={{
                backgroundColor: '#F7FAFC',
                color: '#4A5568'
              }}
              aria-label="Go to previous step"
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </button>

            {currentStep === 10 && (
              <button
                type="button"
                onClick={() => setIsReviewing(true)}
                className="px-4 py-3 rounded-xl font-medium transition-all"
                style={{
                  backgroundColor: '#FFF9F0',
                  color: '#8B7355',
                  border: '1px solid #C4A57B'
                }}
              >
                Review All
              </button>
            )}

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 text-white transition-all"
                style={{ backgroundColor: '#5C7F4F' }}
                aria-label="Go to next step"
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 text-white transition-all"
                style={{ backgroundColor: '#5C7F4F' }}
                aria-label="Complete debrief"
              >
                <CheckCircle className="h-5 w-5" />
                Complete Debrief
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostAssignmentDebriefAccessible;