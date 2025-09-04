import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Download, 
  Mail, 
  Share2,
  Target,
  MessageSquare,
  TrendingUp,
  Heart,
  Star,
  Edit2,
  BookOpen
} from 'lucide-react';

interface TeamReflectionData {
  assignmentSummary: string;
  settingDescription: string;
  teamSize: string;
  roleActual: string;
  roleExpected: string;
  roleComparison: string;
  dynamicsActual: string;
  dynamicsExpected: string;
  dynamicsComparison: string;
  communicationWorked: string;
  communicationChallenges: string;
  communicationImprove: string;
  feedbackReceived: string;
  feedbackProvided: string;
  feedbackReflection: string;
  growthMoments: string;
  skillsDeveloped: string;
  confidenceChange: string;
  strategiesLearned: string;
  futureStrategy1: string;
  futureStrategy2: string;
  futureStrategy3: string;
  confidenceLevel: number;
  oneWordCheckin: string;
  shareWithTeam: boolean;
}

interface TeamReflectionProps {
  onComplete?: (data: TeamReflectionData) => void;
  onClose?: () => void;
  preAssignmentData?: any;
}

export const TeamReflectionJourneyAccessible: React.FC<TeamReflectionProps> = ({ 
  onComplete, 
  onClose,
  preAssignmentData 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isReviewing, setIsReviewing] = useState(false);
  const [formData, setFormData] = useState<TeamReflectionData>({
    assignmentSummary: '',
    settingDescription: '',
    teamSize: '',
    roleActual: '',
    roleExpected: '',
    roleComparison: '',
    dynamicsActual: '',
    dynamicsExpected: '',
    dynamicsComparison: '',
    communicationWorked: '',
    communicationChallenges: '',
    communicationImprove: '',
    feedbackReceived: '',
    feedbackProvided: '',
    feedbackReflection: '',
    growthMoments: '',
    skillsDeveloped: '',
    confidenceChange: '',
    strategiesLearned: '',
    futureStrategy1: '',
    futureStrategy2: '',
    futureStrategy3: '',
    confidenceLevel: 5,
    oneWordCheckin: '',
    shareWithTeam: false
  });

  const steps = [
    { id: 1, title: 'Assignment Overview', icon: BookOpen },
    { id: 2, title: 'Role Reflection', icon: Users },
    { id: 3, title: 'Team Dynamics', icon: MessageSquare },
    { id: 4, title: 'Communication', icon: Share2 },
    { id: 5, title: 'Feedback Exchange', icon: Target },
    { id: 6, title: 'Growth & Learning', icon: TrendingUp },
    { id: 7, title: 'Future Strategies', icon: Star }
  ];

  // Auto-save draft
  useEffect(() => {
    const draftKey = 'teamReflectionDraft';
    localStorage.setItem(draftKey, JSON.stringify(formData));
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const draftKey = 'teamReflectionDraft';
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.warn('Could not load team reflection draft');
      }
    }
  }, []);

  const handleInputChange = (field: keyof TeamReflectionData, value: string | number | boolean) => {
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
    a.download = `team-reflection-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEmailSummary = () => {
    const summary = generateSummaryText();
    const subject = 'Team Reflection Summary';
    const body = encodeURIComponent(summary);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const generateSummaryText = () => {
    return `TEAM REFLECTION JOURNEY SUMMARY
Generated: ${new Date().toLocaleDateString()}

ASSIGNMENT OVERVIEW
Summary: ${formData.assignmentSummary || 'Not provided'}
Setting: ${formData.settingDescription || 'Not provided'}
Team Size: ${formData.teamSize || 'Not provided'}

ROLE REFLECTION
Expected Role: ${formData.roleExpected || 'Not provided'}
Actual Role: ${formData.roleActual || 'Not provided'}
Comparison: ${formData.roleComparison || 'Not provided'}

TEAM DYNAMICS
Expected Dynamics: ${formData.dynamicsExpected || 'Not provided'}
Actual Dynamics: ${formData.dynamicsActual || 'Not provided'}
Comparison: ${formData.dynamicsComparison || 'Not provided'}

COMMUNICATION
What Worked: ${formData.communicationWorked || 'Not provided'}
Challenges: ${formData.communicationChallenges || 'Not provided'}
Improvements: ${formData.communicationImprove || 'Not provided'}

FEEDBACK EXCHANGE
Received: ${formData.feedbackReceived || 'Not provided'}
Provided: ${formData.feedbackProvided || 'Not provided'}
Reflection: ${formData.feedbackReflection || 'Not provided'}

GROWTH & LEARNING
Growth Moments: ${formData.growthMoments || 'Not provided'}
Skills Developed: ${formData.skillsDeveloped || 'Not provided'}
Confidence Change: ${formData.confidenceChange || 'Not provided'}

FUTURE STRATEGIES
Strategy 1: ${formData.futureStrategy1 || 'Not provided'}
Strategy 2: ${formData.futureStrategy2 || 'Not provided'}
Strategy 3: ${formData.futureStrategy3 || 'Not provided'}

FINAL CHECK-IN
Confidence Level: ${formData.confidenceLevel}/10
One Word: ${formData.oneWordCheckin || 'Not provided'}
Share with Team: ${formData.shareWithTeam ? 'Yes' : 'No'}

🤖 Generated with Claude Code (https://claude.ai/code)
`;
  };

  const renderProgressNav = () => (
    <nav aria-label="Team Reflection Progress" className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6" style={{ color: '#5C7F4F' }} />
          <h1 className="text-2xl font-bold" style={{ color: '#2D3748' }}>
            Team Reflection Journey
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

  const renderAssignmentOverview = () => (
    <section aria-labelledby="overview-heading">
      <h2 id="overview-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Assignment Overview
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Let's start with the basics about this team assignment.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Assignment Summary
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Briefly describe the assignment, project, or team work you completed..."
          value={formData.assignmentSummary}
          onChange={(e) => handleInputChange('assignmentSummary', e.target.value)}
          aria-describedby="assignment-help"
        />
        <div id="assignment-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Include key details like duration, goals, and outcomes
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Setting & Context
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Describe the environment, context, or circumstances..."
          value={formData.settingDescription}
          onChange={(e) => handleInputChange('settingDescription', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Team Size
        </legend>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['2-3 people', '4-5 people', '6-10 people', '10+ people'].map(size => (
            <label
              key={size}
              className={`p-3 rounded-lg text-center cursor-pointer transition-all border-2 focus-within:ring-2 focus-within:ring-offset-2`}
              style={{
                backgroundColor: formData.teamSize === size ? '#F0F5ED' : '#FFFFFF',
                borderColor: formData.teamSize === size ? '#5C7F4F' : '#E2E8F0',
                focusRingColor: '#5C7F4F'
              }}
            >
              <input
                type="radio"
                name="teamSize"
                value={size}
                checked={formData.teamSize === size}
                onChange={(e) => handleInputChange('teamSize', e.target.value)}
                className="sr-only"
              />
              <span className="text-sm" style={{ color: '#2D3748' }}>{size}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );

  const renderRoleReflection = () => (
    <section aria-labelledby="role-heading">
      <h2 id="role-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Role Reflection
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Compare your expected role with what actually happened.
      </p>

      {preAssignmentData?.teamRole && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F0F5ED', border: '1px solid #5C7F4F' }}>
          <h3 className="text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
            Your Pre-Assignment Expectation:
          </h3>
          <p className="text-sm" style={{ color: '#4A5568' }}>
            "{preAssignmentData.teamRole}"
          </p>
        </div>
      )}

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What role did you expect to play?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Describe your expected role, responsibilities, or contributions..."
          value={formData.roleExpected}
          onChange={(e) => handleInputChange('roleExpected', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What role did you actually play?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Describe your actual role, what you ended up doing..."
          value={formData.roleActual}
          onChange={(e) => handleInputChange('roleActual', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          How do these compare?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Reflect on the differences, what surprised you, what you learned..."
          value={formData.roleComparison}
          onChange={(e) => handleInputChange('roleComparison', e.target.value)}
          aria-describedby="role-comparison-help"
        />
        <div id="role-comparison-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Consider: What worked well? What would you change? What did you learn about yourself in teams?
        </div>
      </fieldset>
    </section>
  );

  const renderTeamDynamics = () => (
    <section aria-labelledby="dynamics-heading">
      <h2 id="dynamics-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Team Dynamics
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Reflect on how the team worked together and interacted.
      </p>

      {preAssignmentData?.teamDynamics && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F0F5ED', border: '1px solid #5C7F4F' }}>
          <h3 className="text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
            Your Pre-Assignment Expectation:
          </h3>
          <p className="text-sm" style={{ color: '#4A5568' }}>
            "{preAssignmentData.teamDynamics}"
          </p>
        </div>
      )}

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What team dynamics did you expect?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Describe how you thought the team would work together..."
          value={formData.dynamicsExpected}
          onChange={(e) => handleInputChange('dynamicsExpected', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What were the actual team dynamics?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Describe how the team actually functioned together..."
          value={formData.dynamicsActual}
          onChange={(e) => handleInputChange('dynamicsActual', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          How do these compare?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Reflect on the team dynamics - what worked, what didn't, what you learned..."
          value={formData.dynamicsComparison}
          onChange={(e) => handleInputChange('dynamicsComparison', e.target.value)}
          aria-describedby="dynamics-comparison-help"
        />
        <div id="dynamics-comparison-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Consider: Leadership styles, decision-making, conflict resolution, collaboration patterns
        </div>
      </fieldset>
    </section>
  );

  const renderCommunication = () => (
    <section aria-labelledby="communication-heading">
      <h2 id="communication-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Communication
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Reflect on how communication worked within your team.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What communication strategies worked well?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Describe effective communication methods, tools, or approaches..."
          value={formData.communicationWorked}
          onChange={(e) => handleInputChange('communicationWorked', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What communication challenges did you face?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Describe communication difficulties, misunderstandings, or barriers..."
          value={formData.communicationChallenges}
          onChange={(e) => handleInputChange('communicationChallenges', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          How could team communication be improved?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Suggest improvements, alternative approaches, or lessons learned..."
          value={formData.communicationImprove}
          onChange={(e) => handleInputChange('communicationImprove', e.target.value)}
          aria-describedby="communication-improve-help"
        />
        <div id="communication-improve-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Think about: Frequency, methods, clarity, inclusivity, feedback mechanisms
        </div>
      </fieldset>
    </section>
  );

  const renderFeedbackExchange = () => (
    <section aria-labelledby="feedback-heading">
      <h2 id="feedback-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Feedback Exchange
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Reflect on how feedback was given and received within the team.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What feedback did you receive?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Describe feedback you received from team members..."
          value={formData.feedbackReceived}
          onChange={(e) => handleInputChange('feedbackReceived', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What feedback did you provide?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Describe feedback you gave to team members..."
          value={formData.feedbackProvided}
          onChange={(e) => handleInputChange('feedbackProvided', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          How did the feedback process work?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Reflect on how feedback was exchanged, received, and acted upon..."
          value={formData.feedbackReflection}
          onChange={(e) => handleInputChange('feedbackReflection', e.target.value)}
          aria-describedby="feedback-reflection-help"
        />
        <div id="feedback-reflection-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Consider: Timing, delivery method, constructiveness, follow-up actions
        </div>
      </fieldset>
    </section>
  );

  const renderGrowthLearning = () => (
    <section aria-labelledby="growth-heading">
      <h2 id="growth-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Growth & Learning
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Reflect on your personal development through this team experience.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What were your key growth moments?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Describe moments when you learned something new about yourself or teamwork..."
          value={formData.growthMoments}
          onChange={(e) => handleInputChange('growthMoments', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          What skills did you develop or strengthen?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="List specific skills, competencies, or abilities you developed..."
          value={formData.skillsDeveloped}
          onChange={(e) => handleInputChange('skillsDeveloped', e.target.value)}
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          How has your confidence in teamwork changed?
        </legend>
        <textarea
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[80px]"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="Reflect on changes in your confidence, comfort level, or perspective..."
          value={formData.confidenceChange}
          onChange={(e) => handleInputChange('confidenceChange', e.target.value)}
        />
      </fieldset>
    </section>
  );

  const renderFutureStrategies = () => (
    <section aria-labelledby="strategies-heading">
      <h2 id="strategies-heading" className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
        Future Strategies
      </h2>
      <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
        Identify key strategies and takeaways for future team experiences.
      </p>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Key Strategies for Future Teams
        </legend>
        <div className="space-y-4">
          <div>
            <label htmlFor="strategy1" className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
              Strategy 1:
            </label>
            <input
              id="strategy1"
              type="text"
              className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                borderColor: '#E2E8F0',
                focusBorderColor: '#5C7F4F',
                focusRingColor: '#5C7F4F'
              }}
              placeholder="Enter your first key strategy..."
              value={formData.futureStrategy1}
              onChange={(e) => handleInputChange('futureStrategy1', e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="strategy2" className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
              Strategy 2:
            </label>
            <input
              id="strategy2"
              type="text"
              className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                borderColor: '#E2E8F0',
                focusBorderColor: '#5C7F4F',
                focusRingColor: '#5C7F4F'
              }}
              placeholder="Enter your second key strategy..."
              value={formData.futureStrategy2}
              onChange={(e) => handleInputChange('futureStrategy2', e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="strategy3" className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
              Strategy 3:
            </label>
            <input
              id="strategy3"
              type="text"
              className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                borderColor: '#E2E8F0',
                focusBorderColor: '#5C7F4F',
                focusRingColor: '#5C7F4F'
              }}
              placeholder="Enter your third key strategy..."
              value={formData.futureStrategy3}
              onChange={(e) => handleInputChange('futureStrategy3', e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          Confidence Level for Future Team Work
        </legend>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#6B7280' }}>Low</span>
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
                    className={`block w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 focus:ring-2 focus:ring-offset-2 ${
                      formData.confidenceLevel >= num ? 'bg-green-100' : 'bg-gray-50'
                    }`}
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
            <span className="text-sm" style={{ color: '#6B7280' }}>High</span>
          </div>
          <div className="text-center">
            <span className="text-lg font-semibold" style={{ color: '#5C7F4F' }}>
              {formData.confidenceLevel}/10
            </span>
          </div>
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium mb-3" style={{ color: '#2D3748' }}>
          One-Word Check-in
        </legend>
        <input
          type="text"
          className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: '#E2E8F0',
            focusBorderColor: '#5C7F4F',
            focusRingColor: '#5C7F4F'
          }}
          placeholder="How do you feel about team work now? (one word)"
          value={formData.oneWordCheckin}
          onChange={(e) => handleInputChange('oneWordCheckin', e.target.value)}
          aria-describedby="one-word-help"
        />
        <div id="one-word-help" className="text-xs mt-1" style={{ color: '#6B7280' }}>
          Examples: Confident, Prepared, Curious, Optimistic, etc.
        </div>
      </fieldset>

      <fieldset className="mb-8">
        <legend className="sr-only">Share options</legend>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.shareWithTeam}
            onChange={(e) => handleInputChange('shareWithTeam', e.target.checked)}
            className="w-5 h-5 rounded border-2 focus:ring-2 focus:ring-offset-2"
            style={{
              accentColor: '#5C7F4F',
              focusRingColor: '#5C7F4F'
            }}
          />
          <span className="text-sm font-medium" style={{ color: '#2D3748' }}>
            Share summary with my team
          </span>
        </label>
        <div className="text-xs mt-1 ml-8" style={{ color: '#6B7280' }}>
          Your reflection summary can be shared to help improve future team dynamics
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
          aria-label="Download summary"
        >
          <Download className="h-4 w-4" />
          Download
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
          aria-label="Email summary to myself"
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
      </div>
    </section>
  );

  const renderReviewStep = () => {
    const sections = [
      { title: 'Assignment Overview', data: formData.assignmentSummary, field: 'assignmentSummary' },
      { title: 'Role Reflection', data: formData.roleComparison, field: 'roleComparison' },
      { title: 'Team Dynamics', data: formData.dynamicsComparison, field: 'dynamicsComparison' },
      { title: 'Communication', data: formData.communicationImprove, field: 'communicationImprove' },
      { title: 'Feedback Exchange', data: formData.feedbackReflection, field: 'feedbackReflection' },
      { title: 'Growth & Learning', data: formData.growthMoments, field: 'growthMoments' },
      { title: 'Future Strategies', data: `${formData.futureStrategy1}, ${formData.futureStrategy2}, ${formData.futureStrategy3}`, field: 'futureStrategy1' }
    ];

    return (
      <section aria-labelledby="review-heading">
        <h2 id="review-heading" className="text-xl font-bold mb-6" style={{ color: '#2D3748' }}>
          Review Your Team Reflection
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
              localStorage.removeItem('teamReflectionDraft');
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
        return renderAssignmentOverview();
      case 2:
        return renderRoleReflection();
      case 3:
        return renderTeamDynamics();
      case 4:
        return renderCommunication();
      case 5:
        return renderFeedbackExchange();
      case 6:
        return renderGrowthLearning();
      case 7:
        return renderFutureStrategies();
      default:
        return renderAssignmentOverview();
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
              aria-label="Close team reflection"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          )}
        </div>

        <main className="px-8 py-6" aria-labelledby="team-reflection-heading">
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

export default TeamReflectionJourneyAccessible;