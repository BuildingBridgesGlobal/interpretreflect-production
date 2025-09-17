import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Download, 
  Mail, 
  Lightbulb,
  X,
  FileText,
  AlertCircle,
  Activity
} from 'lucide-react';
import { HeartPulseIcon, TargetIcon, SecureLockIcon, CommunityIcon, NotepadIcon } from './CustomIcon';
import { ModalNavigationHeader } from './ModalNavigationHeader';

interface PostAssignmentDebriefData {
  // Assignment Review
  assignmentContext: string;
  participants: string;
  duration: string;
  challenges: string;
  
  // Performance Assessment
  overallSatisfaction: number;
  technicalAccuracy: number;
  proudestMoment: string;
  challengesHandled: {
    environmental: string;
    interpersonal: string;
    paralinguistic: string;
    intrapersonal: string;
  };
  
  // Adaptations & Growth
  adaptationsMade: {
    environmental: string;
    interpersonal: string;
    paralinguistic: string;
    intrapersonal: string;
  };
  skillsStrengthened: string;
  
  // Learning Capture
  lessonsLearned: string;
  knowledgeGained: string;
  futureApplications: string;
  
  // Emotional Processing
  emotionalJourney: string;
  emotionalHighs: string;
  emotionalChallenges: string;
  emotionalSupport: string;
  
  // Physical & Self-Care
  physicalImpact: string;
  selfCareActions: string[];
  recoveryPlan: string;
  boundaries: string;
  
  // Integration & Celebration
  growthAchieved: string;
  celebrationPlan: string;
  gratitude: string;
  nextSteps: string;
  confidenceLevel: number;
  currentFeeling: string;
  
  timestamp: string;
}

interface PostAssignmentDebriefProps {
  onComplete?: (data: PostAssignmentDebriefData) => void;
  onClose?: () => void;
}

const steps = [
  { id: 1, title: 'Assignment Review', icon: FileText },
  { id: 2, title: 'Performance Assessment', icon: TargetIcon },
  { id: 3, title: 'Adaptations & Growth', icon: NotepadIcon },
  { id: 4, title: 'Learning Capture', icon: Lightbulb },
  { id: 5, title: 'Emotional Processing', icon: HeartPulseIcon },
  { id: 6, title: 'Physical & Self-Care', icon: SecureLockIcon },
  { id: 7, title: 'Integration & Celebration', icon: CheckCircle }
];

export const PostAssignmentDebriefAccessible: React.FC<PostAssignmentDebriefProps> = ({ 
  onComplete, 
  onClose 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PostAssignmentDebriefData>({
    assignmentContext: '',
    participants: '',
    duration: '',
    challenges: '',
    overallSatisfaction: 5,
    technicalAccuracy: 5,
    proudestMoment: '',
    challengesHandled: {
      environmental: '',
      interpersonal: '',
      paralinguistic: '',
      intrapersonal: ''
    },
    adaptationsMade: {
      environmental: '',
      interpersonal: '',
      paralinguistic: '',
      intrapersonal: ''
    },
    skillsStrengthened: '',
    lessonsLearned: '',
    knowledgeGained: '',
    futureApplications: '',
    emotionalJourney: '',
    emotionalHighs: '',
    emotionalChallenges: '',
    emotionalSupport: '',
    physicalImpact: '',
    selfCareActions: [],
    recoveryPlan: '',
    boundaries: '',
    growthAchieved: '',
    celebrationPlan: '',
    gratitude: '',
    nextSteps: '',
    confidenceLevel: 5,
    currentFeeling: '',
    timestamp: new Date().toISOString()
  });

  // Auto-save draft
  useEffect(() => {
    const draftKey = 'postAssignmentDebriefDraft';
    localStorage.setItem(draftKey, JSON.stringify(formData));
    localStorage.setItem('postAssignmentDebriefStep', currentStep.toString());
  }, [formData, currentStep]);

  // Load draft on mount
  useEffect(() => {
    const draftKey = 'postAssignmentDebriefDraft';
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.warn('Could not load post-assignment debrief draft');
      }
    }
    
    const savedStep = localStorage.getItem('postAssignmentDebriefStep');
    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }
  }, []);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
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

  const handleComplete = () => {
    const completedData = {
      ...formData,
      timestamp: new Date().toISOString()
    };
    
    if (onComplete) {
      onComplete(completedData);
    }
    
    // Clear draft
    localStorage.removeItem('postAssignmentDebriefDraft');
    localStorage.removeItem('postAssignmentDebriefStep');
    
    if (onClose) {
      onClose();
    }
  };

  const handleDownloadSummary = () => {
    const summary = generateSummaryText();
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `post-assignment-debrief-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEmailSummary = () => {
    const summary = generateSummaryText();
    const subject = 'Post-Assignment Debrief Summary';
    const body = encodeURIComponent(summary);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const generateSummaryText = () => {
    return `POST-ASSIGNMENT DEBRIEF SUMMARY
Generated: ${new Date().toLocaleDateString()}

ASSIGNMENT REVIEW
Context: ${formData.assignmentContext || 'Not provided'}
Participants: ${formData.participants || 'Not provided'}
Duration: ${formData.duration || 'Not provided'}
Challenges: ${formData.challenges || 'Not provided'}

PERFORMANCE ASSESSMENT
Overall Satisfaction: ${formData.overallSatisfaction}/10
Technical Accuracy: ${formData.technicalAccuracy}/10
Proudest Moment: ${formData.proudestMoment || 'Not provided'}

Challenges Handled:
- Environmental: ${formData.challengesHandled.environmental || 'Not provided'}
- Interpersonal: ${formData.challengesHandled.interpersonal || 'Not provided'}
- Paralinguistic: ${formData.challengesHandled.paralinguistic || 'Not provided'}
- Intrapersonal: ${formData.challengesHandled.intrapersonal || 'Not provided'}

ADAPTATIONS & GROWTH
Adaptations Made:
- Environmental: ${formData.adaptationsMade.environmental || 'Not provided'}
- Interpersonal: ${formData.adaptationsMade.interpersonal || 'Not provided'}
- Paralinguistic: ${formData.adaptationsMade.paralinguistic || 'Not provided'}
- Intrapersonal: ${formData.adaptationsMade.intrapersonal || 'Not provided'}

Skills Strengthened: ${formData.skillsStrengthened || 'Not provided'}

LEARNING CAPTURE
Lessons Learned: ${formData.lessonsLearned || 'Not provided'}
Knowledge Gained: ${formData.knowledgeGained || 'Not provided'}
Future Applications: ${formData.futureApplications || 'Not provided'}

EMOTIONAL PROCESSING
Emotional Journey: ${formData.emotionalJourney || 'Not provided'}
Emotional Highs: ${formData.emotionalHighs || 'Not provided'}
Emotional Challenges: ${formData.emotionalChallenges || 'Not provided'}
Emotional Support: ${formData.emotionalSupport || 'Not provided'}

PHYSICAL & SELF-CARE
Physical Impact: ${formData.physicalImpact || 'Not provided'}
Self-Care Actions: ${formData.selfCareActions.join(', ') || 'Not provided'}
Recovery Plan: ${formData.recoveryPlan || 'Not provided'}
Boundaries: ${formData.boundaries || 'Not provided'}

INTEGRATION & CELEBRATION
Growth Achieved: ${formData.growthAchieved || 'Not provided'}
Celebration Plan: ${formData.celebrationPlan || 'Not provided'}
Gratitude: ${formData.gratitude || 'Not provided'}
Next Steps: ${formData.nextSteps || 'Not provided'}
Confidence Level: ${formData.confidenceLevel}/10
Current Feeling: ${formData.currentFeeling || 'Not provided'}
`;
  };

  const renderProgressIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Activity className="h-6 w-6" style={{ color: '#5C7F4F' }} />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Post-Assignment Debrief</h2>
          <p className="text-sm text-gray-600">Reflect and integrate your interpreting experience</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          
          return (
            <div
              key={step.id}
              className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                isCompleted || isCurrent ? '' : 'bg-gray-200'
              }`}
              style={{
                background: isCompleted || isCurrent 
                  ? 'linear-gradient(135deg, #1b5e20, #2e7d32)' 
                  : undefined
              }}
            />
          );
        })}
      </div>
      
      <div className="text-right">
        <span className="text-sm text-gray-500">
          {currentStep} of {steps.length}
        </span>
      </div>
    </div>
  );

  const renderAssignmentReview = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Assignment Review
      </h3>
      
      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Describe the assignment context
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={4}
          placeholder="What was the nature and purpose of this assignment?"
          value={formData.assignmentContext}
          onChange={(e) => handleInputChange('assignmentContext', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Who were the participants?
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={3}
          placeholder="Describe the people involved in this assignment"
          value={formData.participants}
          onChange={(e) => handleInputChange('participants', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Duration and timeline
        </label>
        <input
          type="text"
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
          placeholder="How long did the assignment take?"
          value={formData.duration}
          onChange={(e) => handleInputChange('duration', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Initial challenges encountered
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={4}
          placeholder="What challenges did you face during this assignment?"
          value={formData.challenges}
          onChange={(e) => handleInputChange('challenges', e.target.value)}
        />
      </div>
    </div>
  );

  const renderPerformanceAssessment = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Performance Assessment
      </h3>
      
      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-4">
          Overall Satisfaction (1-10)
        </label>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Low</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.overallSatisfaction}
            onChange={(e) => handleInputChange('overallSatisfaction', parseInt(e.target.value))}
            className="flex-1"
            style={{
              accentColor: '#2e7d32',
              height: '2px',
              cursor: 'pointer'
            }}
          />
          <span className="text-sm text-gray-500">High</span>
          <span className="ml-4 font-bold text-green-700">
            {formData.overallSatisfaction}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-4">
          Technical Accuracy (1-10)
        </label>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Low</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.technicalAccuracy}
            onChange={(e) => handleInputChange('technicalAccuracy', parseInt(e.target.value))}
            className="flex-1"
            style={{
              accentColor: '#2e7d32',
              height: '2px',
              cursor: 'pointer'
            }}
          />
          <span className="text-sm text-gray-500">High</span>
          <span className="ml-4 font-bold text-green-700">
            {formData.technicalAccuracy}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          What was your proudest moment?
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={4}
          placeholder="Describe a moment when you felt particularly proud of your work"
          value={formData.proudestMoment}
          onChange={(e) => handleInputChange('proudestMoment', e.target.value)}
        />
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-700 mb-3">
          How did you handle challenges?
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-600 mb-2">
              Environmental Challenges
            </label>
            <textarea
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
              rows={2}
              placeholder="How did you handle environmental challenges?"
              value={formData.challengesHandled.environmental}
              onChange={(e) => handleInputChange('challengesHandled.environmental', e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-600 mb-2">
              Interpersonal Challenges
            </label>
            <textarea
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
              rows={2}
              placeholder="How did you handle interpersonal challenges?"
              value={formData.challengesHandled.interpersonal}
              onChange={(e) => handleInputChange('challengesHandled.interpersonal', e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-600 mb-2">
              Paralinguistic Challenges
            </label>
            <textarea
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
              rows={2}
              placeholder="How did you handle communication challenges?"
              value={formData.challengesHandled.paralinguistic}
              onChange={(e) => handleInputChange('challengesHandled.paralinguistic', e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-600 mb-2">
              Intrapersonal Challenges
            </label>
            <textarea
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
              rows={2}
              placeholder="How did you handle personal challenges?"
              value={formData.challengesHandled.intrapersonal}
              onChange={(e) => handleInputChange('challengesHandled.intrapersonal', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdaptationsGrowth = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Adaptations & Growth
      </h3>
      
      <div>
        <h4 className="text-lg font-semibold text-gray-700 mb-3">
          What adaptations did you make?
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-600 mb-2">
              Environmental Adaptations
            </label>
            <textarea
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
              rows={2}
              placeholder="How did you adapt to environmental factors?"
              value={formData.adaptationsMade.environmental}
              onChange={(e) => handleInputChange('adaptationsMade.environmental', e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-600 mb-2">
              Interpersonal Adaptations
            </label>
            <textarea
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
              rows={2}
              placeholder="How did you adapt your interpersonal approach?"
              value={formData.adaptationsMade.interpersonal}
              onChange={(e) => handleInputChange('adaptationsMade.interpersonal', e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-600 mb-2">
              Paralinguistic Adaptations
            </label>
            <textarea
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
              rows={2}
              placeholder="How did you adapt your communication style?"
              value={formData.adaptationsMade.paralinguistic}
              onChange={(e) => handleInputChange('adaptationsMade.paralinguistic', e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-600 mb-2">
              Intrapersonal Adaptations
            </label>
            <textarea
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
              rows={2}
              placeholder="How did you adapt internally?"
              value={formData.adaptationsMade.intrapersonal}
              onChange={(e) => handleInputChange('adaptationsMade.intrapersonal', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          What skills were strengthened?
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={4}
          placeholder="List the skills you developed or strengthened during this assignment"
          value={formData.skillsStrengthened}
          onChange={(e) => handleInputChange('skillsStrengthened', e.target.value)}
        />
      </div>
    </div>
  );

  const renderLearningCapture = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Learning Capture
      </h3>
      
      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Key lessons learned
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={4}
          placeholder="What are the most important lessons from this assignment?"
          value={formData.lessonsLearned}
          onChange={(e) => handleInputChange('lessonsLearned', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          New knowledge gained
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={4}
          placeholder="What new knowledge or insights did you gain?"
          value={formData.knowledgeGained}
          onChange={(e) => handleInputChange('knowledgeGained', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Future applications
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={4}
          placeholder="How will you apply these learnings in future assignments?"
          value={formData.futureApplications}
          onChange={(e) => handleInputChange('futureApplications', e.target.value)}
        />
      </div>
    </div>
  );

  const renderEmotionalProcessing = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Emotional Processing
      </h3>
      
      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Describe your emotional journey
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={4}
          placeholder="How did your emotions evolve throughout the assignment?"
          value={formData.emotionalJourney}
          onChange={(e) => handleInputChange('emotionalJourney', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Emotional highs
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={3}
          placeholder="What were the emotional high points?"
          value={formData.emotionalHighs}
          onChange={(e) => handleInputChange('emotionalHighs', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Emotional challenges
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={3}
          placeholder="What emotional challenges did you face?"
          value={formData.emotionalChallenges}
          onChange={(e) => handleInputChange('emotionalChallenges', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          What emotional support do you need?
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={3}
          placeholder="Describe any emotional support you need after this assignment"
          value={formData.emotionalSupport}
          onChange={(e) => handleInputChange('emotionalSupport', e.target.value)}
        />
      </div>
    </div>
  );

  const renderPhysicalSelfCare = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Physical & Self-Care
      </h3>
      
      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Physical impact of the assignment
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={3}
          placeholder="How did this assignment affect you physically?"
          value={formData.physicalImpact}
          onChange={(e) => handleInputChange('physicalImpact', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-3">
          Select self-care actions needed
        </label>
        <div className="space-y-2">
          {['Rest and sleep', 'Physical exercise', 'Healthy nutrition', 'Relaxation activities', 'Social connection', 'Time in nature', 'Creative expression'].map(action => (
            <label key={action} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.selfCareActions.includes(action)}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleInputChange('selfCareActions', [...formData.selfCareActions, action]);
                  } else {
                    handleInputChange('selfCareActions', formData.selfCareActions.filter(a => a !== action));
                  }
                }}
                className="rounded border-gray-300 focus:ring-green-600 focus:ring-1"
                style={{
                  width: '12px',
                  height: '12px',
                  accentColor: '#2e7d32',
                  transform: 'scale(0.65)',
                  transformOrigin: 'center'
                }}
              />
              <span className="text-gray-700">{action}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Recovery plan
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={3}
          placeholder="How will you recover and recharge after this assignment?"
          value={formData.recoveryPlan}
          onChange={(e) => handleInputChange('recoveryPlan', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Boundaries for future assignments
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={3}
          placeholder="What boundaries will you set for future assignments?"
          value={formData.boundaries}
          onChange={(e) => handleInputChange('boundaries', e.target.value)}
        />
      </div>
    </div>
  );

  const renderIntegrationCelebration = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Integration & Celebration
      </h3>
      
      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          What growth did you achieve?
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={4}
          placeholder="Describe the personal and professional growth from this assignment"
          value={formData.growthAchieved}
          onChange={(e) => handleInputChange('growthAchieved', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          How will you celebrate this accomplishment?
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={3}
          placeholder="Describe how you'll acknowledge and celebrate your work"
          value={formData.celebrationPlan}
          onChange={(e) => handleInputChange('celebrationPlan', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Express gratitude
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={3}
          placeholder="What are you grateful for from this experience?"
          value={formData.gratitude}
          onChange={(e) => handleInputChange('gratitude', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Next steps
        </label>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
          rows={3}
          placeholder="What are your immediate next steps?"
          value={formData.nextSteps}
          onChange={(e) => handleInputChange('nextSteps', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-4">
          Confidence for future assignments (1-10)
        </label>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Low</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.confidenceLevel}
            onChange={(e) => handleInputChange('confidenceLevel', parseInt(e.target.value))}
            className="flex-1"
            style={{
              accentColor: '#2e7d32',
              height: '2px',
              cursor: 'pointer'
            }}
          />
          <span className="text-sm text-gray-500">High</span>
          <span className="ml-4 font-bold text-green-700">
            {formData.confidenceLevel}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Describe your current feeling in one word
        </label>
        <input
          type="text"
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
          placeholder="e.g., accomplished, grateful, tired, energized..."
          value={formData.currentFeeling}
          onChange={(e) => handleInputChange('currentFeeling', e.target.value)}
        />
      </div>

    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderAssignmentReview();
      case 2:
        return renderPerformanceAssessment();
      case 3:
        return renderAdaptationsGrowth();
      case 4:
        return renderLearningCapture();
      case 5:
        return renderEmotionalProcessing();
      case 6:
        return renderPhysicalSelfCare();
      case 7:
        return renderIntegrationCelebration();
      default:
        return renderAssignmentReview();
    }
  };

  const renderNavigationButtons = () => (
    <div className="flex justify-between gap-4 mt-8">
      <button
        onClick={handlePrevious}
        disabled={currentStep === 1}
        className="flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: currentStep === 1 ? '#e5e7eb' : '#ffffff',
          color: currentStep === 1 ? '#9ca3af' : '#5C7F4F',
          border: `2px solid ${currentStep === 1 ? '#e5e7eb' : '#5C7F4F'}`
        }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {currentStep < steps.length ? (
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 font-semibold rounded-lg text-white transition-all hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #1b5e20, #2e7d32)'
          }}
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={handleComplete}
          className="flex items-center gap-2 px-6 py-4 font-semibold rounded-lg text-white transition-all hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #1b5e20, #2e7d32)'
          }}
        >
          <CheckCircle className="h-5 w-5" />
          Complete Debrief
        </button>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-8 py-6 z-10">
          <ModalNavigationHeader
            title="Post-Assignment Debrief"
            subtitle="Reflect and integrate your interpreting experience"
            onClose={onClose || (() => {})}
            showAutoSave={false}
          />
          {renderProgressIndicator()}
        </div>

        <main className="px-8 py-6">
          <form onSubmit={(e) => e.preventDefault()}>
            {renderCurrentStep()}
            {renderNavigationButtons()}
          </form>
        </main>
      </div>
    </div>
  );
};

export default PostAssignmentDebriefAccessible;