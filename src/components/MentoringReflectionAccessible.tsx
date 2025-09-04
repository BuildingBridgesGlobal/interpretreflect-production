import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Download, 
  Mail, 
  Target,
  Heart,
  TrendingUp,
  Shield,
  Lightbulb,
  Users,
  Star,
  Edit2,
  Calendar
} from 'lucide-react';

interface MentoringReflectionData {
  // Quick Insight
  sessionWord: string;
  mostSurprising: string;
  sessionSatisfaction: number;
  
  // Revisit Intentions
  askAddressed: string;
  successCriteriaMet: string;
  boundariesRespected: string;
  
  // Key Insights & Feedback
  topInsights: string;
  validation: string;
  freshPerspectives: string;
  
  // Emotional Processing
  emotionalJourney: string;
  currentEmotions: string;
  strongestReaction: string;
  
  // Action Plan
  actions48Hours: string;
  actionsOneWeek: string;
  actionsLongTerm: string;
  
  // Accountability & Support
  supportNeeded: string;
  mentorFollowUp: string;
  measuringProgress: string;
  
  // Post-Mentoring State
  clarityLevel: number;
  confidenceLevel: number;
  motivationLevel: number;
  gratitudeLevel: number;
  currentStateWord: string;
  
  // Comparative Reflection
  confidenceComparison: string;
  stressComparison: string;
  feedbackReception: string;
  
  // Closing Commitments
  actionCommitment: string;
  mindsetCommitment: string;
  payForwardCommitment: string;
}

interface MentoringReflectionProps {
  onComplete?: (data: MentoringReflectionData) => void;
  onClose?: () => void;
  prepData?: any; // Pre-session mentoring prep data for comparison
}

export const MentoringReflectionAccessible: React.FC<MentoringReflectionProps> = ({ 
  onComplete, 
  onClose,
  prepData 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isReviewing, setIsReviewing] = useState(false);
  const [formData, setFormData] = useState<MentoringReflectionData>({
    sessionWord: '',
    mostSurprising: '',
    sessionSatisfaction: 5,
    askAddressed: '',
    successCriteriaMet: '',
    boundariesRespected: '',
    topInsights: '',
    validation: '',
    freshPerspectives: '',
    emotionalJourney: '',
    currentEmotions: '',
    strongestReaction: '',
    actions48Hours: '',
    actionsOneWeek: '',
    actionsLongTerm: '',
    supportNeeded: '',
    mentorFollowUp: '',
    measuringProgress: '',
    clarityLevel: 5,
    confidenceLevel: 5,
    motivationLevel: 5,
    gratitudeLevel: 5,
    currentStateWord: '',
    confidenceComparison: '',
    stressComparison: '',
    feedbackReception: '',
    actionCommitment: '',
    mindsetCommitment: '',
    payForwardCommitment: ''
  });

  const steps = [
    { id: 1, title: 'Quick Insight', icon: Lightbulb },
    { id: 2, title: 'Revisit Intentions', icon: Target },
    { id: 3, title: 'Key Insights', icon: Star },
    { id: 4, title: 'Emotional Processing', icon: Heart },
    { id: 5, title: 'Action Plan', icon: TrendingUp },
    { id: 6, title: 'Accountability', icon: Shield },
    { id: 7, title: 'State Check', icon: Users },
    { id: 8, title: 'Comparison', icon: MessageCircle },
    { id: 9, title: 'Commitments', icon: CheckCircle }
  ];

  // Auto-save draft
  useEffect(() => {
    const draftKey = 'mentoringReflectionDraft';
    localStorage.setItem(draftKey, JSON.stringify(formData));
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const draftKey = 'mentoringReflectionDraft';
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.warn('Could not load mentoring reflection draft');
      }
    }
  }, []);

  const handleInputChange = (field: keyof MentoringReflectionData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    a.download = `mentoring-reflection-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEmailSummary = () => {
    const summary = generateSummaryText();
    const subject = 'Mentoring Reflection Summary';
    const body = encodeURIComponent(summary);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const generateSummaryText = () => {
    return `MENTORING REFLECTION SUMMARY
Generated: ${new Date().toLocaleDateString()}

QUICK INSIGHT
Session in One Word: ${formData.sessionWord || 'Not provided'}
Most Surprising: ${formData.mostSurprising || 'Not provided'}
Session Satisfaction: ${formData.sessionSatisfaction}/10

INTENTIONS REVISITED
Ask Addressed: ${formData.askAddressed || 'Not provided'}
Success Criteria Met: ${formData.successCriteriaMet || 'Not provided'}
Boundaries Respected: ${formData.boundariesRespected || 'Not provided'}

KEY INSIGHTS & FEEDBACK
Top Insights: ${formData.topInsights || 'Not provided'}
Validation Received: ${formData.validation || 'Not provided'}
Fresh Perspectives: ${formData.freshPerspectives || 'Not provided'}

EMOTIONAL PROCESSING
Emotional Journey: ${formData.emotionalJourney || 'Not provided'}
Current Emotions: ${formData.currentEmotions || 'Not provided'}
Strongest Reaction: ${formData.strongestReaction || 'Not provided'}

ACTION PLAN
48 Hours: ${formData.actions48Hours || 'Not provided'}
1 Week: ${formData.actionsOneWeek || 'Not provided'}
Long-term: ${formData.actionsLongTerm || 'Not provided'}

ACCOUNTABILITY & SUPPORT
Support Needed: ${formData.supportNeeded || 'Not provided'}
Mentor Follow-up: ${formData.mentorFollowUp || 'Not provided'}
Measuring Progress: ${formData.measuringProgress || 'Not provided'}

POST-MENTORING STATE
Clarity: ${formData.clarityLevel}/10
Confidence: ${formData.confidenceLevel}/10
Motivation: ${formData.motivationLevel}/10
Gratitude: ${formData.gratitudeLevel}/10
Current State: ${formData.currentStateWord || 'Not provided'}

BEFORE/AFTER COMPARISON
Confidence Change: ${formData.confidenceComparison || 'Not provided'}
Stress Change: ${formData.stressComparison || 'Not provided'}
Feedback Reception: ${formData.feedbackReception || 'Not provided'}

CLOSING COMMITMENTS
Action: ${formData.actionCommitment || 'Not provided'}
Mindset: ${formData.mindsetCommitment || 'Not provided'}
Pay It Forward: ${formData.payForwardCommitment || 'Not provided'}

🤖 Generated with Claude Code (https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
`;
  };

  const renderProgressNav = () => (
    <nav aria-label="Mentoring Reflection Progress" className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6" style={{ color: '#5C7F4F' }} />
          <h1 className="text-2xl font-bold" style={{ color: '#2D3748' }}>
            Mentoring Reflection
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
            <li key={step.id} className="flex-1 min-w-[100px]">
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

  const renderQuickInsight = () => (
    <section aria-labelledby="insight-heading">
      <h2 id="insight-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Quick Insight & Opening Context
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Let's capture your immediate impressions and overall satisfaction with the mentoring session.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          One word for this session:
        </legend>
        <input
          type="text"
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="e.g., enlightening, challenging, supportive, transformative..."
          value={formData.sessionWord}
          onChange={(e) => handleInputChange('sessionWord', e.target.value)}
          aria-describedby="session-word-help"
        />
        <div id="session-word-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          How would you sum up the essence of this mentoring session?
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Most surprising realization?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="What caught you off guard, changed your thinking, or opened new possibilities?"
          value={formData.mostSurprising}
          onChange={(e) => handleInputChange('mostSurprising', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Session satisfaction (1-10):
        </legend>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#6B7280' }}>Low</span>
            <div className="flex-1 flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <label key={num} className="relative">
                  <input
                    type="radio"
                    name="sessionSatisfaction"
                    value={num}
                    checked={formData.sessionSatisfaction === num}
                    onChange={() => handleInputChange('sessionSatisfaction', num)}
                    className="sr-only"
                  />
                  <span
                    className={`block w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 focus:ring-2 focus:ring-offset-2`}
                    style={{
                      backgroundColor: formData.sessionSatisfaction >= num ? '#F0F5ED' : '#F7FAFC',
                      borderColor: formData.sessionSatisfaction === num ? '#5C7F4F' : '#E2E8F0',
                      color: formData.sessionSatisfaction >= num ? '#5C7F4F' : '#A0AEC0',
                      focusRingColor: '#5C7F4F'
                    }}
                  >
                    {num}
                  </span>
                </label>
              ))}
            </div>
            <span className="text-sm" style={{ color: '#6B7280' }}>High</span>
          </div>
          <div className="text-center">
            <span className="text-lg font-semibold" style={{ color: '#5C7F4F' }}>
              {formData.sessionSatisfaction}/10
            </span>
          </div>
        </div>
      </fieldset>
    </section>
  );

  const renderRevisitIntentions = () => (
    <section aria-labelledby="intentions-heading">
      <h2 id="intentions-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Revisit Your Intentions
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Compare what you originally sought with what actually happened in the session.
      </p>

      {prepData?.clearRequest && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F0F5ED', border: '1px solid #5C7F4F' }}>
          <h3 className="text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
            Your Original Mentoring Ask:
          </h3>
          <p className="text-sm" style={{ color: '#4A5568' }}>
            "{prepData.clearRequest}"
          </p>
        </div>
      )}

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          How well was your original ask addressed?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Did your mentor understand and respond to what you were asking for? How completely was it addressed?"
          value={formData.askAddressed}
          onChange={(e) => handleInputChange('askAddressed', e.target.value)}
        />
      </fieldset>

      {prepData?.successDefinition && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F0F5ED', border: '1px solid #5C7F4F' }}>
          <h3 className="text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
            Your Success Definition:
          </h3>
          <p className="text-sm" style={{ color: '#4A5568' }}>
            "{prepData.successDefinition}"
          </p>
        </div>
      )}

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Were your success criteria met?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Thinking about what would make this session successful, how did it measure up?"
          value={formData.successCriteriaMet}
          onChange={(e) => handleInputChange('successCriteriaMet', e.target.value)}
        />
      </fieldset>

      {prepData?.boundaries && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F0F5ED', border: '1px solid #5C7F4F' }}>
          <h3 className="text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
            Your Stated Boundaries:
          </h3>
          <p className="text-sm" style={{ color: '#4A5568' }}>
            "{prepData.boundaries}"
          </p>
        </div>
      )}

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Were your boundaries respected?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Did the conversation stay within your comfort zones? Were any limits crossed or well-maintained?"
          value={formData.boundariesRespected}
          onChange={(e) => handleInputChange('boundariesRespected', e.target.value)}
        />
      </fieldset>
    </section>
  );

  const renderKeyInsights = () => (
    <section aria-labelledby="insights-heading">
      <h2 id="insights-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Key Insights & Feedback
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Capture the most valuable insights, feedback, and new perspectives you received.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Three most important things you learned:
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[120px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="What are the key takeaways that will stick with you? List the most significant insights or lessons..."
          value={formData.topInsights}
          onChange={(e) => handleInputChange('topInsights', e.target.value)}
          aria-describedby="insights-help"
        />
        <div id="insights-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Think about insights that changed your perspective or gave you clarity
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Validation or affirmation you received:
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="What did your mentor affirm, validate, or confirm about your thinking, abilities, or approach?"
          value={formData.validation}
          onChange={(e) => handleInputChange('validation', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          New perspectives offered?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="What alternative viewpoints, approaches, or ways of thinking did your mentor share?"
          value={formData.freshPerspectives}
          onChange={(e) => handleInputChange('freshPerspectives', e.target.value)}
        />
      </fieldset>
    </section>
  );

  const renderEmotionalProcessing = () => (
    <section aria-labelledby="emotional-heading">
      <h2 id="emotional-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Emotional Processing
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Process your emotional experience and reactions during the mentoring session.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Describe your emotional journey during the session:
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="How did you feel at the beginning, middle, and end? What emotional shifts occurred?"
          value={formData.emotionalJourney}
          onChange={(e) => handleInputChange('emotionalJourney', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What emotions are you experiencing now?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Relief, excitement, uncertainty, motivation, overwhelm, clarity, gratitude..."
          value={formData.currentEmotions}
          onChange={(e) => handleInputChange('currentEmotions', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Feedback or comment that triggered the strongest reaction:
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="What did your mentor say that hit you the hardest (positively or negatively)? Why do you think it had such impact?"
          value={formData.strongestReaction}
          onChange={(e) => handleInputChange('strongestReaction', e.target.value)}
          aria-describedby="reaction-help"
        />
        <div id="reaction-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Strong reactions often point to important areas for growth or healing
        </div>
      </fieldset>
    </section>
  );

  const renderActionPlan = () => (
    <section aria-labelledby="action-heading">
      <h2 id="action-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Action Plan
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Transform insights into concrete actions across different timeframes.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Next steps - 48 hours:
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="What specific actions will you take in the next two days while the session is still fresh?"
          value={formData.actions48Hours}
          onChange={(e) => handleInputChange('actions48Hours', e.target.value)}
          aria-describedby="48h-help"
        />
        <div id="48h-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Focus on immediate, concrete steps that maintain momentum
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Next steps - 1 week:
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="What will you work on over the next week to build on the session insights?"
          value={formData.actionsOneWeek}
          onChange={(e) => handleInputChange('actionsOneWeek', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Long-term commitments:
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="What longer-term changes, habits, or goals will you pursue based on this mentoring?"
          value={formData.actionsLongTerm}
          onChange={(e) => handleInputChange('actionsLongTerm', e.target.value)}
          aria-describedby="longterm-help"
        />
        <div id="longterm-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Think about sustainable changes that align with your bigger picture goals
        </div>
      </fieldset>
    </section>
  );

  const renderAccountability = () => (
    <section aria-labelledby="accountability-heading">
      <h2 id="accountability-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Accountability & Support
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Plan for the support and accountability you need to follow through on your commitments.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What support do you need to take action?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Resources, people, tools, or systems that will help you follow through..."
          value={formData.supportNeeded}
          onChange={(e) => handleInputChange('supportNeeded', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          When/How will you follow up with your mentor?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Timeline, method, and what you'll share about your progress..."
          value={formData.mentorFollowUp}
          onChange={(e) => handleInputChange('mentorFollowUp', e.target.value)}
          aria-describedby="followup-help"
        />
        <div id="followup-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Follow-up keeps the mentoring relationship active and shows respect for their investment in you
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          How will you measure success and progress?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Specific metrics, milestones, or indicators that will show you're making progress..."
          value={formData.measuringProgress}
          onChange={(e) => handleInputChange('measuringProgress', e.target.value)}
        />
      </fieldset>
    </section>
  );

  const renderStateCheck = () => (
    <section aria-labelledby="state-heading">
      <h2 id="state-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Post-Mentoring State Check
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Assess your current state to understand the impact of the mentoring session.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Clarity (1-10):
        </legend>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#6B7280' }}>Confused</span>
            <div className="flex-1 flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <label key={num} className="relative">
                  <input
                    type="radio"
                    name="clarityLevel"
                    value={num}
                    checked={formData.clarityLevel === num}
                    onChange={() => handleInputChange('clarityLevel', num)}
                    className="sr-only"
                  />
                  <span
                    className={`block w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 focus:ring-2 focus:ring-offset-2`}
                    style={{
                      backgroundColor: formData.clarityLevel >= num ? '#F0F5ED' : '#F7FAFC',
                      borderColor: formData.clarityLevel === num ? '#5C7F4F' : '#E2E8F0',
                      color: formData.clarityLevel >= num ? '#5C7F4F' : '#A0AEC0',
                      focusRingColor: '#5C7F4F'
                    }}
                  >
                    {num}
                  </span>
                </label>
              ))}
            </div>
            <span className="text-sm" style={{ color: '#6B7280' }}>Crystal Clear</span>
          </div>
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Confidence (1-10):
        </legend>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#6B7280' }}>Uncertain</span>
            <div className="flex-1 flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <label key={num} className="relative">
                  <input
                    type="radio"
                    name="confidenceLevel"
                    value={num}
                    checked={formData.confidenceLevel === num}
                    onChange={() => handleInputChange('confidenceLevel', num)}
                    className="sr-only"
                  />
                  <span
                    className={`block w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 focus:ring-2 focus:ring-offset-2`}
                    style={{
                      backgroundColor: formData.confidenceLevel >= num ? '#F0F5ED' : '#F7FAFC',
                      borderColor: formData.confidenceLevel === num ? '#5C7F4F' : '#E2E8F0',
                      color: formData.confidenceLevel >= num ? '#5C7F4F' : '#A0AEC0',
                      focusRingColor: '#5C7F4F'
                    }}
                  >
                    {num}
                  </span>
                </label>
              ))}
            </div>
            <span className="text-sm" style={{ color: '#6B7280' }}>Very Confident</span>
          </div>
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Motivation (1-10):
        </legend>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#6B7280' }}>Unmotivated</span>
            <div className="flex-1 flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <label key={num} className="relative">
                  <input
                    type="radio"
                    name="motivationLevel"
                    value={num}
                    checked={formData.motivationLevel === num}
                    onChange={() => handleInputChange('motivationLevel', num)}
                    className="sr-only"
                  />
                  <span
                    className={`block w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 focus:ring-2 focus:ring-offset-2`}
                    style={{
                      backgroundColor: formData.motivationLevel >= num ? '#F0F5ED' : '#F7FAFC',
                      borderColor: formData.motivationLevel === num ? '#5C7F4F' : '#E2E8F0',
                      color: formData.motivationLevel >= num ? '#5C7F4F' : '#A0AEC0',
                      focusRingColor: '#5C7F4F'
                    }}
                  >
                    {num}
                  </span>
                </label>
              ))}
            </div>
            <span className="text-sm" style={{ color: '#6B7280' }}>Highly Motivated</span>
          </div>
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Gratitude (1-10):
        </legend>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#6B7280' }}>Low</span>
            <div className="flex-1 flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <label key={num} className="relative">
                  <input
                    type="radio"
                    name="gratitudeLevel"
                    value={num}
                    checked={formData.gratitudeLevel === num}
                    onChange={() => handleInputChange('gratitudeLevel', num)}
                    className="sr-only"
                  />
                  <span
                    className={`block w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 focus:ring-2 focus:ring-offset-2`}
                    style={{
                      backgroundColor: formData.gratitudeLevel >= num ? '#F0F5ED' : '#F7FAFC',
                      borderColor: formData.gratitudeLevel === num ? '#5C7F4F' : '#E2E8F0',
                      color: formData.gratitudeLevel >= num ? '#5C7F4F' : '#A0AEC0',
                      focusRingColor: '#5C7F4F'
                    }}
                  >
                    {num}
                  </span>
                </label>
              ))}
            </div>
            <span className="text-sm" style={{ color: '#6B7280' }}>Very Grateful</span>
          </div>
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Current state in one word:
        </legend>
        <input
          type="text"
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="e.g., energized, focused, hopeful, determined..."
          value={formData.currentStateWord}
          onChange={(e) => handleInputChange('currentStateWord', e.target.value)}
          aria-describedby="current-state-help"
        />
        <div id="current-state-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Compare this with your pre-session state word to see the shift
        </div>
      </fieldset>
    </section>
  );

  const renderComparison = () => (
    <section aria-labelledby="comparison-heading">
      <h2 id="comparison-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Comparative Reflection
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Compare your before and after states to understand the mentoring session's impact.
      </p>

      {prepData?.confidenceInNeeds && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F0F5ED', border: '1px solid #5C7F4F' }}>
          <h3 className="text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
            Pre-Session Confidence in Stating Needs:
          </h3>
          <p className="text-sm" style={{ color: '#4A5568' }}>
            {prepData.confidenceInNeeds}/10
          </p>
        </div>
      )}

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Confidence before vs after:
        </legend>
        <input
          type="text"
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="e.g., 'Started at 4/10, now at 8/10' or describe the change you feel..."
          value={formData.confidenceComparison}
          onChange={(e) => handleInputChange('confidenceComparison', e.target.value)}
        />
      </fieldset>

      {prepData?.currentStress && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F0F5ED', border: '1px solid #5C7F4F' }}>
          <h3 className="text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
            Pre-Session Stress Level:
          </h3>
          <p className="text-sm" style={{ color: '#4A5568' }}>
            {prepData.currentStress}/10
          </p>
        </div>
      )}

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Stress before vs after:
        </legend>
        <input
          type="text"
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="How has your stress level changed? What contributed to this shift?"
          value={formData.stressComparison}
          onChange={(e) => handleInputChange('stressComparison', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          How well did you process the feedback you received?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Were you able to receive feedback openly? What made it easier or harder to process?"
          value={formData.feedbackReception}
          onChange={(e) => handleInputChange('feedbackReception', e.target.value)}
          aria-describedby="reception-help"
        />
        <div id="reception-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Reflect on your openness, defensiveness, curiosity, and ability to integrate new perspectives
        </div>
      </fieldset>
    </section>
  );

  const renderClosingCommitments = () => (
    <section aria-labelledby="commitments-heading">
      <h2 id="commitments-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Closing Commitment
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Make three specific commitments to carry the value of this mentoring forward.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          One action you'll take:
        </legend>
        <input
          type="text"
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="A specific, concrete action you commit to taking..."
          value={formData.actionCommitment}
          onChange={(e) => handleInputChange('actionCommitment', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          One mindset you'll adopt:
        </legend>
        <input
          type="text"
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="A new perspective, attitude, or way of thinking you'll embrace..."
          value={formData.mindsetCommitment}
          onChange={(e) => handleInputChange('mindsetCommitment', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-8">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          One way you'll pay it forward:
        </legend>
        <input
          type="text"
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="How you'll share this value with others or contribute to someone else's growth..."
          value={formData.payForwardCommitment}
          onChange={(e) => handleInputChange('payForwardCommitment', e.target.value)}
        />
      </fieldset>

      <div className="p-4 rounded-lg mb-8" style={{ backgroundColor: '#F0F5ED', border: '1px solid #5C7F4F' }}>
        <p className="text-sm" style={{ color: '#2D3748' }}>
          <strong>💡 Remember:</strong> Follow up with your mentor as planned. Growth is ongoing, and maintaining 
          the relationship shows respect for their investment in you.
        </p>
      </div>

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
          aria-label="Download reflection summary"
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
            // Future: Set reminder functionality
            alert('Follow-up reminder feature coming soon!');
          }}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 border-2"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#5C7F4F',
            borderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          aria-label="Set follow-up reminder"
        >
          <Calendar className="h-4 w-4" />
          Set Reminder
        </button>
      </div>
    </section>
  );

  const renderReviewStep = () => {
    const sections = [
      { title: 'Quick Insight', data: formData.sessionWord, field: 'sessionWord' },
      { title: 'Intentions Revisited', data: formData.askAddressed, field: 'askAddressed' },
      { title: 'Key Insights', data: formData.topInsights, field: 'topInsights' },
      { title: 'Emotional Processing', data: formData.emotionalJourney, field: 'emotionalJourney' },
      { title: 'Action Plan', data: formData.actions48Hours, field: 'actions48Hours' },
      { title: 'Accountability', data: formData.supportNeeded, field: 'supportNeeded' },
      { title: 'State Check', data: `Clarity: ${formData.clarityLevel}/10, Confidence: ${formData.confidenceLevel}/10`, field: 'clarityLevel' },
      { title: 'Comparison', data: formData.confidenceComparison, field: 'confidenceComparison' },
      { title: 'Commitments', data: formData.actionCommitment, field: 'actionCommitment' }
    ];

    return (
      <section aria-labelledby="review-heading">
        <h2 id="review-heading" className="text-xl font-bold mb-6" style={{ color: '#2D3748' }}>
          Review Your Mentoring Reflection
        </h2>
        <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
          Review and edit your responses before completing your reflection.
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

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => {
              if (onComplete) {
                onComplete(formData);
              }
              // Clear draft
              localStorage.removeItem('mentoringReflectionDraft');
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
              color: '#FFFFFF',
              focusRingColor: '#5C7F4F'
            }}
          >
            <CheckCircle className="h-5 w-5" />
            Complete Reflection
          </button>
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
        return renderQuickInsight();
      case 2:
        return renderRevisitIntentions();
      case 3:
        return renderKeyInsights();
      case 4:
        return renderEmotionalProcessing();
      case 5:
        return renderActionPlan();
      case 6:
        return renderAccountability();
      case 7:
        return renderStateCheck();
      case 8:
        return renderComparison();
      case 9:
        return renderClosingCommitments();
      default:
        return renderQuickInsight();
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
              aria-label="Close mentoring reflection"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          )}
        </div>

        <main className="px-8 py-6" aria-labelledby="mentoring-reflection-heading">
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

export default MentoringReflectionAccessible;