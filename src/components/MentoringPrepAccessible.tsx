import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Download, 
  Mail, 
  MessageCircle,
  Target,
  Lightbulb,
  Shield,
  TrendingUp,
  Heart,
  BookOpen,
  Edit2
} from 'lucide-react';

interface MentoringPrepData {
  // Quick Insight Capture & Opening Context
  mentoringType: string;
  meetingFormat: string;
  whyNow: string;
  
  // Clarifying Your Ask
  situation: string;
  context: string;
  alreadyTried: string;
  impact: string;
  urgency: string;
  
  // Defining Success
  successDefinition: string;
  hopedOutcomes: string;
  supportType: string;
  unwantedSupport: string;
  
  // Preparation & Questions
  mentorQuestions: string;
  materialsToShare: string;
  patternsToExplore: string;
  assumptionsToCheck: string;
  
  // Openness & Boundaries
  opennessToFeedback: number;
  valuableFeedback: string;
  boundaries: string;
  privateTopics: string;
  directnessPreference: string;
  
  // Action Plan & Follow-Up
  commitments: string;
  resources: string;
  obstacles: string;
  trackProgress: string;
  followUpPlan: string;
  
  // Pre-Mentoring State
  confidenceInNeeds: number;
  opennessToNewPerspectives: number;
  readinessForFeedback: number;
  currentStress: number;
  currentStateWord: string;
  
  // Closing Intention
  clearRequest: string;
  whatOffering: string;
}

interface MentoringPrepProps {
  onComplete?: (data: MentoringPrepData) => void;
  onClose?: () => void;
}

export const MentoringPrepAccessible: React.FC<MentoringPrepProps> = ({ 
  onComplete, 
  onClose 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isReviewing, setIsReviewing] = useState(false);
  const [formData, setFormData] = useState<MentoringPrepData>({
    mentoringType: '',
    meetingFormat: '',
    whyNow: '',
    situation: '',
    context: '',
    alreadyTried: '',
    impact: '',
    urgency: '',
    successDefinition: '',
    hopedOutcomes: '',
    supportType: '',
    unwantedSupport: '',
    mentorQuestions: '',
    materialsToShare: '',
    patternsToExplore: '',
    assumptionsToCheck: '',
    opennessToFeedback: 5,
    valuableFeedback: '',
    boundaries: '',
    privateTopics: '',
    directnessPreference: '',
    commitments: '',
    resources: '',
    obstacles: '',
    trackProgress: '',
    followUpPlan: '',
    confidenceInNeeds: 5,
    opennessToNewPerspectives: 5,
    readinessForFeedback: 5,
    currentStress: 5,
    currentStateWord: '',
    clearRequest: '',
    whatOffering: ''
  });

  const steps = [
    { id: 1, title: 'Opening Context', icon: BookOpen },
    { id: 2, title: 'Clarifying Your Ask', icon: MessageCircle },
    { id: 3, title: 'Defining Success', icon: Target },
    { id: 4, title: 'Preparation & Questions', icon: Lightbulb },
    { id: 5, title: 'Openness & Boundaries', icon: Shield },
    { id: 6, title: 'Action Plan', icon: TrendingUp },
    { id: 7, title: 'Pre-Mentoring State', icon: Heart },
    { id: 8, title: 'Closing Intention', icon: CheckCircle }
  ];

  // Auto-save draft
  useEffect(() => {
    const draftKey = 'mentoringPrepDraft';
    localStorage.setItem(draftKey, JSON.stringify(formData));
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const draftKey = 'mentoringPrepDraft';
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.warn('Could not load mentoring prep draft');
      }
    }
  }, []);

  const handleInputChange = (field: keyof MentoringPrepData, value: string | number) => {
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
    a.download = `mentoring-prep-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEmailSummary = () => {
    const summary = generateSummaryText();
    const subject = 'Mentoring Preparation Summary';
    const body = encodeURIComponent(summary);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const generateSummaryText = () => {
    return `MENTORING PREPARATION SUMMARY
Generated: ${new Date().toLocaleDateString()}

OPENING CONTEXT
Type of Mentoring: ${formData.mentoringType || 'Not specified'}
Meeting Format: ${formData.meetingFormat || 'Not specified'}
Why Mentoring Now: ${formData.whyNow || 'Not provided'}

CLARIFYING YOUR ASK
Situation: ${formData.situation || 'Not provided'}
Context for Mentor: ${formData.context || 'Not provided'}
Already Tried: ${formData.alreadyTried || 'Not provided'}
What's at Stake: ${formData.impact || 'Not provided'}
Urgency/Timeline: ${formData.urgency || 'Not provided'}

DEFINING SUCCESS
Success Definition: ${formData.successDefinition || 'Not provided'}
Hoped Outcomes: ${formData.hopedOutcomes || 'Not provided'}
Support Type Wanted: ${formData.supportType || 'Not provided'}
Support NOT Wanted: ${formData.unwantedSupport || 'Not provided'}

PREPARATION & QUESTIONS
Questions for Mentor: ${formData.mentorQuestions || 'Not provided'}
Materials to Share: ${formData.materialsToShare || 'Not provided'}
Patterns to Explore: ${formData.patternsToExplore || 'Not provided'}
Assumptions to Check: ${formData.assumptionsToCheck || 'Not provided'}

OPENNESS & BOUNDARIES
Openness to Feedback: ${formData.opennessToFeedback}/10
Most Valuable Feedback: ${formData.valuableFeedback || 'Not provided'}
Boundaries Needed: ${formData.boundaries || 'Not provided'}
Off-Limits Topics: ${formData.privateTopics || 'Not provided'}
Directness Preference: ${formData.directnessPreference || 'Not provided'}

ACTION PLAN & FOLLOW-UP
Post-Session Commitments: ${formData.commitments || 'Not provided'}
Resources Needed: ${formData.resources || 'Not provided'}
Potential Obstacles: ${formData.obstacles || 'Not provided'}
Progress Tracking: ${formData.trackProgress || 'Not provided'}
Follow-Up Plan: ${formData.followUpPlan || 'Not provided'}

PRE-MENTORING STATE
Confidence in Stating Needs: ${formData.confidenceInNeeds}/10
Openness to New Perspectives: ${formData.opennessToNewPerspectives}/10
Readiness for Feedback: ${formData.readinessForFeedback}/10
Current Stress Level: ${formData.currentStress}/10
Current State (one word): ${formData.currentStateWord || 'Not provided'}

CLOSING INTENTION
Clear Request to Mentor: ${formData.clearRequest || 'Not provided'}
What You'll Offer in Return: ${formData.whatOffering || 'Not provided'}

🤖 Generated with Claude Code (https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
`;
  };

  const renderProgressNav = () => (
    <nav aria-label="Mentoring Preparation Progress" className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6" style={{ color: '#5C7F4F' }} />
          <h1 className="text-2xl font-bold" style={{ color: '#2D3748' }}>
            Mentoring Preparation
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

  const renderOpeningContext = () => (
    <section aria-labelledby="context-heading">
      <h2 id="context-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Quick Insight Capture & Opening Context
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Let's start by understanding the basics of your mentoring session.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What type of mentoring is this?
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Career Guidance',
            'Skill Development', 
            'Problem Solving',
            'Emotional Support',
            'Other'
          ].map(type => (
            <label
              key={type}
              className={`p-3 rounded-lg text-center cursor-pointer transition-all border-2 focus-within:ring-2 focus-within:ring-offset-2`}
              style={{
                backgroundColor: formData.mentoringType === type ? '#F0F5ED' : '#FFFFFF',
                borderColor: formData.mentoringType === type ? '#5C7F4F' : '#E2E8F0',
                focusRingColor: '#5C7F4F'
              }}
            >
              <input
                type="radio"
                name="mentoringType"
                value={type}
                checked={formData.mentoringType === type}
                onChange={(e) => handleInputChange('mentoringType', e.target.value)}
                className="sr-only"
              />
              <span className="text-sm" style={{ color: '#2D3748' }}>{type}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Meeting format?
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {['In-Person', 'Virtual'].map(format => (
            <label
              key={format}
              className={`p-3 rounded-lg text-center cursor-pointer transition-all border-2 focus-within:ring-2 focus-within:ring-offset-2`}
              style={{
                backgroundColor: formData.meetingFormat === format ? '#F0F5ED' : '#FFFFFF',
                borderColor: formData.meetingFormat === format ? '#5C7F4F' : '#E2E8F0',
                focusRingColor: '#5C7F4F'
              }}
            >
              <input
                type="radio"
                name="meetingFormat"
                value={format}
                checked={formData.meetingFormat === format}
                onChange={(e) => handleInputChange('meetingFormat', e.target.value)}
                className="sr-only"
              />
              <span className="text-sm" style={{ color: '#2D3748' }}>{format}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Why mentoring now?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="What's prompting you to seek mentoring at this time? What's changed or what opportunity has emerged?"
          value={formData.whyNow}
          onChange={(e) => handleInputChange('whyNow', e.target.value)}
          aria-describedby="why-now-help"
        />
        <div id="why-now-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Consider timing, recent changes, or specific catalysts that brought you here
        </div>
      </fieldset>
    </section>
  );

  const renderClarifyingAsk = () => (
    <section aria-labelledby="ask-heading">
      <h2 id="ask-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Clarifying Your Ask
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Help your mentor understand your specific situation and needs.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What brings you to mentoring today?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Describe the main situation, challenge, or opportunity you're facing..."
          value={formData.situation}
          onChange={(e) => handleInputChange('situation', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What context does your mentor need?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Background information, history, relationships, or circumstances that would help your mentor understand..."
          value={formData.context}
          onChange={(e) => handleInputChange('context', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What have you already tried?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Previous attempts, solutions you've explored, resources you've consulted..."
          value={formData.alreadyTried}
          onChange={(e) => handleInputChange('alreadyTried', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What's at stake?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Impact if this isn't resolved, opportunities that might be missed, consequences to consider..."
          value={formData.impact}
          onChange={(e) => handleInputChange('impact', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Urgency/Timeline?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[60px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="When do you need to make decisions or take action? Any deadlines or time-sensitive factors?"
          value={formData.urgency}
          onChange={(e) => handleInputChange('urgency', e.target.value)}
        />
      </fieldset>
    </section>
  );

  const renderDefiningSuccess = () => (
    <section aria-labelledby="success-heading">
      <h2 id="success-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Defining Success
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Be clear about what a successful mentoring session looks like to you.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Define a successful session:
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="What would make you leave this session feeling like it was worthwhile and valuable?"
          value={formData.successDefinition}
          onChange={(e) => handleInputChange('successDefinition', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Hoped-for outcomes:
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Specific results, insights, decisions, or clarity you're hoping to achieve..."
          value={formData.hopedOutcomes}
          onChange={(e) => handleInputChange('hopedOutcomes', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Type of support wanted:
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Do you want advice, brainstorming, emotional support, skill guidance, connections, accountability?"
          value={formData.supportType}
          onChange={(e) => handleInputChange('supportType', e.target.value)}
          aria-describedby="support-help"
        />
        <div id="support-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Be specific about the kind of help that would be most valuable
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What don't you want from this session?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[60px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Types of responses or approaches that wouldn't be helpful right now..."
          value={formData.unwantedSupport}
          onChange={(e) => handleInputChange('unwantedSupport', e.target.value)}
        />
      </fieldset>
    </section>
  );

  const renderPreparationQuestions = () => (
    <section aria-labelledby="questions-heading">
      <h2 id="questions-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Preparation & Questions
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Come prepared with thoughtful questions and topics to explore.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          List 3-5 questions for your mentor:
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[120px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Write specific, open-ended questions that will generate meaningful discussion..."
          value={formData.mentorQuestions}
          onChange={(e) => handleInputChange('mentorQuestions', e.target.value)}
          aria-describedby="questions-help"
        />
        <div id="questions-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Good questions often start with "How do you..." "What would you..." "When have you..."
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What materials or info to share beforehand?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Documents, examples, or background information that would help your mentor prepare..."
          value={formData.materialsToShare}
          onChange={(e) => handleInputChange('materialsToShare', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Patterns/themes to explore:
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Recurring challenges, themes in your work/life, patterns you've noticed..."
          value={formData.patternsToExplore}
          onChange={(e) => handleInputChange('patternsToExplore', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Assumptions to check:
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Beliefs or assumptions you hold that might be worth questioning or validating..."
          value={formData.assumptionsToCheck}
          onChange={(e) => handleInputChange('assumptionsToCheck', e.target.value)}
        />
      </fieldset>
    </section>
  );

  const renderOpennessBoundaries = () => (
    <section aria-labelledby="openness-heading">
      <h2 id="openness-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Openness & Boundaries
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Set the stage for productive feedback and establish your comfort zones.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Openness to feedback (1-10)?
        </legend>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#6B7280' }}>Low</span>
            <div className="flex-1 flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <label key={num} className="relative">
                  <input
                    type="radio"
                    name="opennessToFeedback"
                    value={num}
                    checked={formData.opennessToFeedback === num}
                    onChange={() => handleInputChange('opennessToFeedback', num)}
                    className="sr-only"
                  />
                  <span
                    className={`block w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 focus:ring-2 focus:ring-offset-2 ${
                      formData.opennessToFeedback >= num ? 'bg-green-100' : 'bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: formData.opennessToFeedback >= num ? '#F0F5ED' : '#F7FAFC',
                      borderColor: formData.opennessToFeedback === num ? '#5C7F4F' : '#E2E8F0',
                      color: formData.opennessToFeedback >= num ? '#5C7F4F' : '#A0AEC0',
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
              {formData.opennessToFeedback}/10
            </span>
          </div>
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Feedback most valuable to you:
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="What kinds of feedback or perspectives would be most helpful right now?"
          value={formData.valuableFeedback}
          onChange={(e) => handleInputChange('valuableFeedback', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Boundaries needed?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[60px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Any limits on time, topics, or approach that would help you feel comfortable..."
          value={formData.boundaries}
          onChange={(e) => handleInputChange('boundaries', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Topics off-limits?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[60px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Areas you prefer not to discuss or explore in this session..."
          value={formData.privateTopics}
          onChange={(e) => handleInputChange('privateTopics', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Preference for direct feedback:
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[60px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Do you prefer gentle, direct, or somewhere in between? Any specific communication style preferences?"
          value={formData.directnessPreference}
          onChange={(e) => handleInputChange('directnessPreference', e.target.value)}
        />
      </fieldset>
    </section>
  );

  const renderActionPlan = () => (
    <section aria-labelledby="action-heading">
      <h2 id="action-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Action Plan & Follow-Up
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Think ahead about how you'll implement what you learn.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Commitments after session:
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="What are you prepared to commit to doing after this session?"
          value={formData.commitments}
          onChange={(e) => handleInputChange('commitments', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Resources/support for follow-through:
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="What resources, people, or support systems will help you follow through?"
          value={formData.resources}
          onChange={(e) => handleInputChange('resources', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Barriers?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="What obstacles or challenges might prevent you from taking action?"
          value={formData.obstacles}
          onChange={(e) => handleInputChange('obstacles', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          How will you track progress?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[60px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Methods for measuring progress and staying accountable..."
          value={formData.trackProgress}
          onChange={(e) => handleInputChange('trackProgress', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          When/How to follow up with mentor?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[60px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Timeline and method for checking back in with your mentor..."
          value={formData.followUpPlan}
          onChange={(e) => handleInputChange('followUpPlan', e.target.value)}
        />
      </fieldset>
    </section>
  );

  const renderPreMentoringState = () => (
    <section aria-labelledby="state-heading">
      <h2 id="state-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Pre-Mentoring State
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Capture your current state to compare with your post-mentoring reflection.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Confidence in stating needs (1-10)
        </legend>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#6B7280' }}>Low</span>
            <div className="flex-1 flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <label key={num} className="relative">
                  <input
                    type="radio"
                    name="confidenceInNeeds"
                    value={num}
                    checked={formData.confidenceInNeeds === num}
                    onChange={() => handleInputChange('confidenceInNeeds', num)}
                    className="sr-only"
                  />
                  <span
                    className={`block w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 focus:ring-2 focus:ring-offset-2`}
                    style={{
                      backgroundColor: formData.confidenceInNeeds >= num ? '#F0F5ED' : '#F7FAFC',
                      borderColor: formData.confidenceInNeeds === num ? '#5C7F4F' : '#E2E8F0',
                      color: formData.confidenceInNeeds >= num ? '#5C7F4F' : '#A0AEC0',
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
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Openness to new perspectives (1-10)
        </legend>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#6B7280' }}>Low</span>
            <div className="flex-1 flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <label key={num} className="relative">
                  <input
                    type="radio"
                    name="opennessToNewPerspectives"
                    value={num}
                    checked={formData.opennessToNewPerspectives === num}
                    onChange={() => handleInputChange('opennessToNewPerspectives', num)}
                    className="sr-only"
                  />
                  <span
                    className={`block w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 focus:ring-2 focus:ring-offset-2`}
                    style={{
                      backgroundColor: formData.opennessToNewPerspectives >= num ? '#F0F5ED' : '#F7FAFC',
                      borderColor: formData.opennessToNewPerspectives === num ? '#5C7F4F' : '#E2E8F0',
                      color: formData.opennessToNewPerspectives >= num ? '#5C7F4F' : '#A0AEC0',
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
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Readiness for feedback (1-10)
        </legend>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#6B7280' }}>Low</span>
            <div className="flex-1 flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <label key={num} className="relative">
                  <input
                    type="radio"
                    name="readinessForFeedback"
                    value={num}
                    checked={formData.readinessForFeedback === num}
                    onChange={() => handleInputChange('readinessForFeedback', num)}
                    className="sr-only"
                  />
                  <span
                    className={`block w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 focus:ring-2 focus:ring-offset-2`}
                    style={{
                      backgroundColor: formData.readinessForFeedback >= num ? '#F0F5ED' : '#F7FAFC',
                      borderColor: formData.readinessForFeedback === num ? '#5C7F4F' : '#E2E8F0',
                      color: formData.readinessForFeedback >= num ? '#5C7F4F' : '#A0AEC0',
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
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Current stress (1-10)
        </legend>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#6B7280' }}>Low</span>
            <div className="flex-1 flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <label key={num} className="relative">
                  <input
                    type="radio"
                    name="currentStress"
                    value={num}
                    checked={formData.currentStress === num}
                    onChange={() => handleInputChange('currentStress', num)}
                    className="sr-only"
                  />
                  <span
                    className={`block w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 focus:ring-2 focus:ring-offset-2`}
                    style={{
                      backgroundColor: formData.currentStress >= num ? '#F0F5ED' : '#F7FAFC',
                      borderColor: formData.currentStress === num ? '#5C7F4F' : '#E2E8F0',
                      color: formData.currentStress >= num ? '#5C7F4F' : '#A0AEC0',
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
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Describe your current state in one word:
        </legend>
        <input
          type="text"
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="e.g., hopeful, overwhelmed, curious, determined..."
          value={formData.currentStateWord}
          onChange={(e) => handleInputChange('currentStateWord', e.target.value)}
          aria-describedby="state-word-help"
        />
        <div id="state-word-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          This will be useful to compare with your post-mentoring state
        </div>
      </fieldset>
    </section>
  );

  const renderClosingIntention = () => (
    <section aria-labelledby="intention-heading">
      <h2 id="intention-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Closing Intention
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Crystallize your clear request and what you bring to this mentoring relationship.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Clear request to mentor:
        </legend>
        <input
          type="text"
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="In one sentence, what are you asking your mentor for?"
          value={formData.clearRequest}
          onChange={(e) => handleInputChange('clearRequest', e.target.value)}
          aria-describedby="request-help"
        />
        <div id="request-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Make it specific and actionable - this is your opening statement
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What you'll offer in return:
        </legend>
        <input
          type="text"
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="What value, follow-through, or reciprocity can you provide?"
          value={formData.whatOffering}
          onChange={(e) => handleInputChange('whatOffering', e.target.value)}
          aria-describedby="offer-help"
        />
        <div id="offer-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Mentoring relationships work best when there's mutual value exchange
        </div>
      </fieldset>

      <div className="p-4 rounded-lg mb-8" style={{ backgroundColor: '#F0F5ED', border: '1px solid #5C7F4F' }}>
        <p className="text-sm" style={{ color: '#2D3748' }}>
          <strong>💡 Tip:</strong> Share this summary with your mentor if appropriate for a productive relationship. 
          These responses will return in your Mentoring Reflection to support before/after growth tracking.
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
          aria-label="Download prep summary"
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
      </div>
    </section>
  );

  const renderReviewStep = () => {
    const sections = [
      { title: 'Opening Context', data: formData.mentoringType, field: 'mentoringType' },
      { title: 'Your Ask', data: formData.situation, field: 'situation' },
      { title: 'Success Definition', data: formData.successDefinition, field: 'successDefinition' },
      { title: 'Questions', data: formData.mentorQuestions, field: 'mentorQuestions' },
      { title: 'Openness & Boundaries', data: `Feedback openness: ${formData.opennessToFeedback}/10`, field: 'opennessToFeedback' },
      { title: 'Action Plan', data: formData.commitments, field: 'commitments' },
      { title: 'Current State', data: `${formData.currentStateWord} (${formData.currentStress}/10 stress)`, field: 'currentStateWord' },
      { title: 'Clear Request', data: formData.clearRequest, field: 'clearRequest' }
    ];

    return (
      <section aria-labelledby="review-heading">
        <h2 id="review-heading" className="text-xl font-bold mb-6" style={{ color: '#2D3748' }}>
          Review Your Mentoring Preparation
        </h2>
        <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
          Review and edit your responses before completing your preparation.
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
            <strong>Ready for your mentoring session?</strong> After your meeting, start your Mentoring Reflection 
            to capture insights and track your growth.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (onComplete) {
                  onComplete(formData);
                }
                // Clear draft
                localStorage.removeItem('mentoringPrepDraft');
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                color: '#FFFFFF',
                focusRingColor: '#5C7F4F'
              }}
            >
              <CheckCircle className="h-5 w-5" />
              Complete Mentoring Prep
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
        return renderOpeningContext();
      case 2:
        return renderClarifyingAsk();
      case 3:
        return renderDefiningSuccess();
      case 4:
        return renderPreparationQuestions();
      case 5:
        return renderOpennessBoundaries();
      case 6:
        return renderActionPlan();
      case 7:
        return renderPreMentoringState();
      case 8:
        return renderClosingIntention();
      default:
        return renderOpeningContext();
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
              aria-label="Close mentoring preparation"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          )}
        </div>

        <main className="px-8 py-6" aria-labelledby="mentoring-prep-heading">
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

export default MentoringPrepAccessible;