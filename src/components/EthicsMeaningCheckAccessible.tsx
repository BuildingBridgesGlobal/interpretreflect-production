import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Mail, Users, AlertTriangle, Heart, Shield, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface EthicsMeaningData {
  // Emotional Landscape
  emotionTriggers: string;
  traumaSymptoms: string[];
  traumaDetails: string;
  
  // Ethics, Boundaries, and Professional Voice
  ethicalPressure: string;
  boundaries: string;
  professionalVoice: string;
  soughtSupport: string;
  supportDetails: string;
  
  // Meaning, Purpose, and Growth
  meaningPride: string;
  aiTechnologyImpact: string;
  growthCommitment: string;
  
  // Wellbeing Metrics
  ethicalClarity: number;
  boundaryStrength: number;
  professionalEmpowerment: number;
  meaningConnection: number;
  overallResilience: number;
  
  // Support & Next Steps
  peerDebriefInterest: boolean;
  supervisorConsultation: boolean;
  downloadReflection: boolean;
  emailReminder: boolean;
}

interface EthicsMeaningCheckAccessibleProps {
  onComplete: (data: EthicsMeaningData) => void;
  onClose: () => void;
}

export const EthicsMeaningCheckAccessible: React.FC<EthicsMeaningCheckAccessibleProps> = ({ 
  onComplete, 
  onClose 
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const announcementRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<EthicsMeaningData>({
    // Emotional Landscape
    emotionTriggers: '',
    traumaSymptoms: [],
    traumaDetails: '',
    
    // Ethics, Boundaries, and Professional Voice
    ethicalPressure: '',
    boundaries: '',
    professionalVoice: '',
    soughtSupport: '',
    supportDetails: '',
    
    // Meaning, Purpose, and Growth
    meaningPride: '',
    aiTechnologyImpact: '',
    growthCommitment: '',
    
    // Wellbeing Metrics
    ethicalClarity: 5,
    boundaryStrength: 5,
    professionalEmpowerment: 5,
    meaningConnection: 5,
    overallResilience: 5,
    
    // Support & Next Steps
    peerDebriefInterest: false,
    supervisorConsultation: false,
    downloadReflection: false,
    emailReminder: false,
  });

  // Auto-save draft
  useEffect(() => {
    const draftKey = `ethics_meaning_draft_${user?.id || 'anonymous'}`;
    localStorage.setItem(draftKey, JSON.stringify(formData));
  }, [formData, user]);

  const updateFormData = (field: keyof EthicsMeaningData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field: keyof EthicsMeaningData, value: string) => {
    const currentValues = formData[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    updateFormData(field, newValues);
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      announceStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      announceStepChange(currentStep - 1);
    }
  };

  const announceStepChange = (step: number) => {
    const stepNames = [
      '', 'Emotional Landscape', 'Ethics & Boundaries', 
      'Meaning & Growth', 'Wellbeing Assessment', 'Support & Next Steps'
    ];
    if (announcementRef.current) {
      announcementRef.current.textContent = `Now on step ${step} of 5: ${stepNames[step]}`;
    }
  };

  const generateSummary = () => {
    const date = new Date().toLocaleDateString();
    return `Ethics & Meaning Check-In - ${date}

EMOTIONAL LANDSCAPE
Challenging Situations: ${formData.emotionTriggers || 'None noted'}
Trauma/Fatigue Symptoms: ${formData.traumaSymptoms.join(', ') || 'None reported'}
Additional Details: ${formData.traumaDetails || 'None provided'}

ETHICS, BOUNDARIES & VOICE
Ethical Challenges: ${formData.ethicalPressure || 'None reported'}
Boundary Experiences: ${formData.boundaries || 'None noted'}
Professional Advocacy: ${formData.professionalVoice || 'None specified'}
Support Seeking: ${formData.soughtSupport || 'Not specified'}

MEANING & GROWTH
Sources of Pride/Meaning: ${formData.meaningPride || 'None specified'}
Technology Impact: ${formData.aiTechnologyImpact || 'None noted'}
Wellbeing Commitment: ${formData.growthCommitment || 'None set'}

WELLBEING METRICS (1-10)
Ethical Clarity: ${formData.ethicalClarity}/10
Boundary Strength: ${formData.boundaryStrength}/10
Professional Empowerment: ${formData.professionalEmpowerment}/10
Meaning Connection: ${formData.meaningConnection}/10
Overall Resilience: ${formData.overallResilience}/10

SUPPORT PREFERENCES
Peer Debrief Interest: ${formData.peerDebriefInterest ? 'Yes' : 'No'}
Supervisor Consultation: ${formData.supervisorConsultation ? 'Yes' : 'No'}

Remember: This reflection is private and designed to help you recognize patterns and maintain wellbeing over time.`;
  };

  const downloadReflection = () => {
    const summary = generateSummary();
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ethics-meaning-checkin-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const emailReflection = () => {
    const summary = generateSummary();
    const subject = encodeURIComponent('Ethics & Meaning Check-In Reflection');
    const body = encodeURIComponent(summary);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      if (formData.downloadReflection) {
        downloadReflection();
      }
      
      if (formData.emailReminder) {
        emailReflection();
      }
      
      // Save to database if user is logged in
      if (user) {
        const { error } = await supabase
          .from('ethics_meaning_checkins')
          .insert([{
            user_id: user.id,
            ...formData,
            completed_at: new Date().toISOString(),
          }]);
        
        if (error) throw error;
      }
      
      // Clear draft
      const draftKey = `ethics_meaning_draft_${user?.id || 'anonymous'}`;
      localStorage.removeItem(draftKey);
      
      onComplete(formData);
    } catch (error) {
      console.error('Error saving ethics & meaning check-in:', error);
      alert('There was an error saving your reflection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressTracker = () => (
    <nav aria-label="Ethics & Meaning Check-in Progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {[1, 2, 3, 4, 5].map((step) => (
          <li key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium
                ${currentStep === step 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : currentStep > step 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-gray-100 text-gray-400 border-gray-300'
                }`}
              aria-current={currentStep === step ? 'step' : undefined}
            >
              {step}
            </div>
            {step < 5 && (
              <div className={`w-full h-1 mx-4 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />
            )}
          </li>
        ))}
      </ol>
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span>Emotional</span>
        <span>Ethics</span>
        <span>Meaning</span>
        <span>Wellbeing</span>
        <span>Support</span>
      </div>
    </nav>
  );

  const renderSlider = (
    label: string, 
    field: keyof EthicsMeaningData, 
    lowLabel: string, 
    highLabel: string
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}: {formData[field] as number}/10
      </label>
      <div className="flex items-center space-x-4">
        <span className="text-xs text-gray-500 min-w-16">{lowLabel}</span>
        <input
          type="range"
          min="1"
          max="10"
          value={formData[field] as number}
          onChange={(e) => updateFormData(field, parseInt(e.target.value))}
          className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none slider-thumb"
          aria-label={`${label} rating from 1 to 10`}
          style={{ minHeight: '44px', padding: '15px 0' }}
        />
        <span className="text-xs text-gray-500 min-w-16 text-right">{highLabel}</span>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <section aria-labelledby="emotional-landscape">
            <h3 id="emotional-landscape" className="text-xl font-semibold mb-6 flex items-center">
              <Heart className="mr-3 text-red-500" size={24} />
              Today's Emotional Landscape
            </h3>
            
            <fieldset className="space-y-6">
              <legend className="sr-only">Emotional challenges and trauma assessment</legend>
              
              <div>
                <label htmlFor="emotion-triggers" className="block text-sm font-medium text-gray-700 mb-2">
                  Did you encounter any distressing or emotionally challenging situations today?
                </label>
                <textarea
                  id="emotion-triggers"
                  value={formData.emotionTriggers}
                  onChange={(e) => updateFormData('emotionTriggers', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe any challenging content, difficult interactions, or emotional triggers..."
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div>
                <fieldset>
                  <legend className="text-sm font-medium text-gray-700 mb-3">
                    Are you experiencing any signs of fatigue, trauma, or compassion fatigue? (Select all that apply)
                  </legend>
                  <div className="space-y-2">
                    {[
                      'Physical fatigue or exhaustion',
                      'Intrusive thoughts about work content',
                      'Emotional numbness or detachment',
                      'Avoidance of certain topics or clients',
                      'Sleep difficulties',
                      'Increased irritability or anxiety',
                      'None of these'
                    ].map((symptom) => (
                      <label key={symptom} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.traumaSymptoms.includes(symptom)}
                          onChange={() => handleMultiSelectChange('traumaSymptoms', symptom)}
                          className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                          style={{ minWidth: '44px', minHeight: '44px' }}
                        />
                        <span className="text-sm text-gray-700">{symptom}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div>
                <label htmlFor="trauma-details" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional details about your emotional state or any concerning patterns:
                </label>
                <textarea
                  id="trauma-details"
                  value={formData.traumaDetails}
                  onChange={(e) => updateFormData('traumaDetails', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Share any additional context about your emotional wellbeing..."
                  style={{ minHeight: '44px' }}
                />
              </div>
            </fieldset>
          </section>
        );

      case 2:
        return (
          <section aria-labelledby="ethics-boundaries">
            <h3 id="ethics-boundaries" className="text-xl font-semibold mb-6 flex items-center">
              <Shield className="mr-3 text-blue-500" size={24} />
              Ethics, Boundaries, and Professional Voice
            </h3>
            
            <fieldset className="space-y-6">
              <legend className="sr-only">Professional ethics and boundary experiences</legend>
              
              <div>
                <label htmlFor="ethical-pressure" className="block text-sm font-medium text-gray-700 mb-2">
                  Was your ethical judgment challenged today? How?
                </label>
                <textarea
                  id="ethical-pressure"
                  value={formData.ethicalPressure}
                  onChange={(e) => updateFormData('ethicalPressure', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe any ethical dilemmas, conflicts of interest, or pressure to compromise standards..."
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div>
                <label htmlFor="boundaries" className="block text-sm font-medium text-gray-700 mb-2">
                  Were your professional boundaries respected, or did you need to reinforce them?
                </label>
                <textarea
                  id="boundaries"
                  value={formData.boundaries}
                  onChange={(e) => updateFormData('boundaries', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Reflect on boundary challenges, scope creep, or times you successfully maintained limits..."
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div>
                <label htmlFor="professional-voice" className="block text-sm font-medium text-gray-700 mb-2">
                  Did you feel empowered to advocate for yourself, a client, or best practices?
                </label>
                <textarea
                  id="professional-voice"
                  value={formData.professionalVoice}
                  onChange={(e) => updateFormData('professionalVoice', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Share moments when you spoke up for quality, accessibility, or professional standards..."
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div>
                <label htmlFor="support-seeking" className="block text-sm font-medium text-gray-700 mb-2">
                  Did you seek support, consultation, or debrief after any challenge?
                </label>
                <select
                  id="support-seeking"
                  value={formData.soughtSupport}
                  onChange={(e) => updateFormData('soughtSupport', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ minHeight: '44px' }}
                >
                  <option value="">Select one</option>
                  <option value="yes-peer">Yes, with a peer</option>
                  <option value="yes-supervisor">Yes, with supervisor/mentor</option>
                  <option value="yes-both">Yes, with both peer and supervisor</option>
                  <option value="no-available">No, but support was available</option>
                  <option value="no-unavailable">No, support wasn't available</option>
                  <option value="no-needed">No support was needed</option>
                </select>
              </div>

              <div>
                <label htmlFor="support-details" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional details about support seeking or professional challenges:
                </label>
                <textarea
                  id="support-details"
                  value={formData.supportDetails}
                  onChange={(e) => updateFormData('supportDetails', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Share context about support systems or barriers to seeking help..."
                  style={{ minHeight: '44px' }}
                />
              </div>
            </fieldset>
          </section>
        );

      case 3:
        return (
          <section aria-labelledby="meaning-growth">
            <h3 id="meaning-growth" className="text-xl font-semibold mb-6 flex items-center">
              <Star className="mr-3 text-yellow-500" size={24} />
              Meaning, Purpose, and Growth
            </h3>
            
            <fieldset className="space-y-6">
              <legend className="sr-only">Professional meaning and growth reflection</legend>
              
              <div>
                <label htmlFor="meaning-pride" className="block text-sm font-medium text-gray-700 mb-2">
                  What gave you a sense of meaning or pride in your work today?
                </label>
                <textarea
                  id="meaning-pride"
                  value={formData.meaningPride}
                  onChange={(e) => updateFormData('meaningPride', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Reflect on moments of impact, connection, skill development, or professional fulfillment..."
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div>
                <label htmlFor="ai-impact" className="block text-sm font-medium text-gray-700 mb-2">
                  Is new technology (AI, remote platforms, digital tools) affecting your stress, motivation, or boundaries?
                </label>
                <textarea
                  id="ai-impact"
                  value={formData.aiTechnologyImpact}
                  onChange={(e) => updateFormData('aiTechnologyImpact', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Share how technology changes are impacting your work experience, both positively and negatively..."
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div>
                <label htmlFor="growth-commitment" className="block text-sm font-medium text-gray-700 mb-2">
                  What's one action or intention you will set to protect your wellbeing and sustain meaning in your work?
                </label>
                <input
                  type="text"
                  id="growth-commitment"
                  value={formData.growthCommitment}
                  onChange={(e) => updateFormData('growthCommitment', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="A specific, kind, and actionable commitment to yourself..."
                  style={{ minHeight: '44px' }}
                />
              </div>
            </fieldset>
          </section>
        );

      case 4:
        return (
          <section aria-labelledby="wellbeing-metrics">
            <h3 id="wellbeing-metrics" className="text-xl font-semibold mb-6 flex items-center">
              <AlertTriangle className="mr-3 text-orange-500" size={24} />
              Wellbeing Assessment
            </h3>
            
            <fieldset className="space-y-6">
              <legend className="text-sm text-gray-600 mb-4">
                Rate each area on a scale from 1-10, where 1 is very challenging and 10 is very strong.
              </legend>
              
              {renderSlider(
                'Ethical Clarity',
                'ethicalClarity',
                'Very unclear',
                'Very clear'
              )}
              
              {renderSlider(
                'Boundary Strength',
                'boundaryStrength',
                'Very weak',
                'Very strong'
              )}
              
              {renderSlider(
                'Professional Empowerment',
                'professionalEmpowerment',
                'Powerless',
                'Empowered'
              )}
              
              {renderSlider(
                'Meaning Connection',
                'meaningConnection',
                'Disconnected',
                'Connected'
              )}
              
              {renderSlider(
                'Overall Resilience',
                'overallResilience',
                'Depleted',
                'Resilient'
              )}
            </fieldset>
          </section>
        );

      case 5:
        return (
          <section aria-labelledby="support-next-steps">
            <h3 id="support-next-steps" className="text-xl font-semibold mb-6 flex items-center">
              <Users className="mr-3 text-green-500" size={24} />
              Support & Next Steps
            </h3>
            
            <fieldset className="space-y-6">
              <legend className="sr-only">Support preferences and next steps</legend>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium text-blue-900 mb-2">Professional Support Options</h4>
                <p className="text-sm text-blue-800 mb-4">
                  Consider connecting with colleagues or supervisors if you experienced significant challenges today.
                </p>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.peerDebriefInterest}
                      onChange={(e) => updateFormData('peerDebriefInterest', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                      style={{ minWidth: '44px', minHeight: '44px' }}
                    />
                    <span className="text-sm text-gray-700">
                      I'm interested in scheduling a peer debrief session
                    </span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.supervisorConsultation}
                      onChange={(e) => updateFormData('supervisorConsultation', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                      style={{ minWidth: '44px', minHeight: '44px' }}
                    />
                    <span className="text-sm text-gray-700">
                      I would like to consult with a supervisor or mentor
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-md">
                <h4 className="font-medium text-green-900 mb-2">Reflection Export Options</h4>
                <p className="text-sm text-green-800 mb-4">
                  This reflection is private. You can download or email it to track patterns over time.
                </p>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.downloadReflection}
                      onChange={(e) => updateFormData('downloadReflection', e.target.checked)}
                      className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                      style={{ minWidth: '44px', minHeight: '44px' }}
                    />
                    <span className="text-sm text-gray-700 flex items-center">
                      <Download className="mr-2" size={16} />
                      Download my reflection as a text file
                    </span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailReminder}
                      onChange={(e) => updateFormData('emailReminder', e.target.checked)}
                      className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                      style={{ minWidth: '44px', minHeight: '44px' }}
                    />
                    <span className="text-sm text-gray-700 flex items-center">
                      <Mail className="mr-2" size={16} />
                      Email this reflection to myself
                    </span>
                  </label>
                </div>
              </div>
            </fieldset>

            <div className="mt-8 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Remember</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Recognizing trauma and fatigue is a sign of professional awareness, not weakness</li>
                <li>• Your ethical standards and boundaries protect both you and those you serve</li>
                <li>• Finding meaning in challenging work is essential for long-term sustainability</li>
                <li>• Seeking support demonstrates professional responsibility and self-care</li>
              </ul>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="ethics-meaning-heading">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 id="ethics-meaning-heading" className="text-2xl font-bold text-gray-900">
              Ethics & Meaning Check-In
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              A reflective space for your professional wellbeing and growth
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close ethics and meaning check-in"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderProgressTracker()}
            
            <div aria-live="polite" className="sr-only" ref={announcementRef} />
            
            <main>
              {renderStep()}
            </main>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ minHeight: '44px' }}
            >
              Previous
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                style={{ minHeight: '44px' }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ minHeight: '44px' }}
              >
                {isSubmitting ? 'Completing...' : 'Finish Check-In'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};