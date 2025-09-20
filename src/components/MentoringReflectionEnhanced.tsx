import React, { useState, useEffect } from 'react';
import {
  X, Users, ChevronRight, ChevronLeft, Save, Heart, Brain,
  Target, MessageSquare, Zap, CheckCircle, TrendingUp,
  ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import { supabase, MentoringReflectionData, MentoringPrepData, ReflectionEntry } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { reflectionService } from '../services/reflectionService';

interface MentoringReflectionEnhancedProps {
  onComplete?: (data: MentoringReflectionData) => void;
  onClose: () => void;
  prepDataId?: string;
}

export const MentoringReflectionEnhanced: React.FC<MentoringReflectionEnhancedProps> = ({ 
  onComplete, 
  onClose,
  prepDataId
}) => {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prepData, setPrepData] = useState<MentoringPrepData | null>(null);
  const [showPrepData, setShowPrepData] = useState(false);
  const startTime = Date.now();
  
  // Form state for all fields
  const [formData, setFormData] = useState<MentoringReflectionData>({
    linked_prep_id: prepDataId,
    
    // Quick Insight
    session_word: '',
    most_surprising: '',
    satisfaction_rating: 7,
    
    // Section 1: Revisiting Intentions
    ask_addressed: '',
    success_criteria_met: '',
    questions_answered: '',
    boundaries_respected: '',
    
    // Section 2: Key Insights
    three_important_things: ['', '', ''],
    hard_but_valuable: '',
    new_perspectives: '',
    patterns_spotted: '',
    validation_received: '',
    
    // Section 3: Emotional Processing
    emotional_journey: '',
    current_emotions: '',
    strongest_reaction: '',
    needs_processing: '',
    confidence_change: '',
    
    // Section 4: Action Planning
    specific_next_steps: '',
    next_48_hours: '',
    next_week: '',
    longer_term: '',
    support_needed: '',
    
    // Section 5: Application Strategy
    application_plan: '',
    potential_obstacles: '',
    accountability_plan: '',
    mentor_checkin: '',
    progress_measurement: '',
    
    // Post-Mentoring State Check
    clarity_level: 7,
    confidence_forward: 7,
    motivation_level: 7,
    gratitude_level: 8,
    current_state_word: '',
    
    // Comparative Reflection
    confidence_comparison: '',
    stress_comparison: '',
    feedback_reception: '',
    
    // Closing Commitment
    action_commitment: '',
    mindset_commitment: '',
    payforward_commitment: '',
    
    // Metadata
    timestamp: new Date().toISOString()
  });

  // Load prep data if available
  useEffect(() => {
    const loadPrepData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('reflection_entries')
          .select('*')
          .eq('user_id', user.id)
          .eq('entry_kind', 'mentoring_prep')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data && !error) {
          const prepContent = data.data as MentoringPrepData;
          setPrepData(prepContent);
          setFormData(prev => ({
            ...prev,
            linked_prep_id: data.id,
            prep_data_referenced: prepContent,
            session_id: prepContent.session_id
          }));
        }
      } catch (err) {
        console.error('Error loading prep data:', err);
      }
    };

    loadPrepData();
  }, [user]);

  const handleFieldChange = (field: keyof MentoringReflectionData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImportantThingChange = (index: number, value: string) => {
    const things = [...formData.three_important_things];
    things[index] = value;
    handleFieldChange('three_important_things', things);
  };

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (sectionIndex) {
      case 0: // Quick Insight
        if (!formData.session_word.trim()) {
          newErrors.session_word = 'Please provide one word';
        }
        if (!formData.most_surprising.trim()) {
          newErrors.most_surprising = 'Please describe what surprised you';
        }
        break;
      case 1: // Revisiting Intentions
        if (!formData.ask_addressed.trim()) {
          newErrors.ask_addressed = 'Please reflect on how your ask was addressed';
        }
        break;
      case 2: // Key Insights
        const filledThings = formData.three_important_things.filter(t => t.trim()).length;
        if (filledThings < 3) {
          newErrors.three_important_things = 'Please provide three important things';
        }
        break;
      case 3: // Emotional Processing
        if (!formData.emotional_journey.trim()) {
          newErrors.emotional_journey = 'Please describe your emotional journey';
        }
        if (!formData.current_emotions.trim()) {
          newErrors.current_emotions = 'Please describe your current emotions';
        }
        break;
      case 4: // Action Planning
        if (!formData.specific_next_steps.trim()) {
          newErrors.specific_next_steps = 'Please identify next steps';
        }
        if (!formData.next_48_hours.trim()) {
          newErrors.next_48_hours = 'Please specify immediate actions';
        }
        break;
      case 5: // Application Strategy
        if (!formData.application_plan.trim()) {
          newErrors.application_plan = 'Please describe your application plan';
        }
        break;
      case 6: // State Check
        if (!formData.current_state_word.trim()) {
          newErrors.current_state_word = 'Please provide one word';
        }
        break;
      case 7: // Comparative Reflection
        // Optional section
        break;
      case 8: // Closing Commitment
        if (!formData.action_commitment.trim()) {
          newErrors.action_commitment = 'Please write your action commitment';
        }
        if (!formData.mindset_commitment.trim()) {
          newErrors.mindset_commitment = 'Please write your mindset commitment';
        }
        if (!formData.payforward_commitment.trim()) {
          newErrors.payforward_commitment = 'Please write how you\'ll pay it forward';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSave = async () => {
    if (!validateSection(currentSection)) return;
    if (hasSaved) return; // Prevent double-save

    setIsSaving(true);
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const finalData = {
        ...formData,
        completion_time: duration,
        // Add field for getDisplayName fallback
        mentoring_insights: formData.three_important_things?.[0] || formData.new_perspectives || 'Mentoring reflection completed'
      };

      console.log('MentoringReflectionEnhanced - Saving with reflectionService');
      const result = await reflectionService.saveReflection(
        user.id,
        'mentoring_reflection',
        finalData
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to save reflection');
      }

      setHasSaved(true);

      if (onComplete) {
        onComplete(finalData);
      }
    } catch (error) {
      console.error('Error saving mentoring reflection:', error);
      setErrors({ save: error instanceof Error ? error.message : 'Failed to save reflection. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    {
      title: "Quick Insight Capture",
      icon: <Brain className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.2)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#7C3AED' }}>
              Opening Context
            </h3>
            <p className="mb-6" style={{ color: '#5A5A5A' }}>
              Now that you've completed your mentoring session, let's consolidate insights, 
              process the feedback, and create an action plan for moving forward.
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  In one word, how would you describe the mentoring session?
                </label>
                <input
                  type="text"
                  value={formData.session_word}
                  onChange={(e) => handleFieldChange('session_word', e.target.value)}
                  placeholder="Enter one word..."
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  style={{
                    borderColor: errors.session_word ? '#ef4444' : '#E5E7EB'
                  }}
                />
                {errors.session_word && (
                  <p className="text-sm text-red-500 mt-1">{errors.session_word}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  What was the most surprising thing you heard or realized?
                </label>
                <textarea
                  value={formData.most_surprising}
                  onChange={(e) => handleFieldChange('most_surprising', e.target.value)}
                  placeholder="Describe what surprised you most..."
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
                  style={{
                    borderColor: errors.most_surprising ? '#ef4444' : '#E5E7EB'
                  }}
                />
                {errors.most_surprising && (
                  <p className="text-sm text-red-500 mt-1">{errors.most_surprising}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  How satisfied are you with the session? (1-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.satisfaction_rating}
                    onChange={(e) => handleFieldChange('satisfaction_rating', Number(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: '#A855F7' }}
                  />
                  <span className="w-12 text-center font-semibold text-lg" style={{ color: '#1A1A1A' }}>
                    {formData.satisfaction_rating}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Revisiting Your Intentions",
      icon: <Target className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          {/* Show prep data if available */}
          {prepData && (
            <div className="mb-6">
              <button
                onClick={() => setShowPrepData(!showPrepData)}
                className="flex items-center space-x-2 text-sm font-medium"
                style={{ color: '#7C3AED' }}
              >
                {showPrepData ? <ChevronUp /> : <ChevronDown />}
                <span>View Your Mentoring Prep Responses</span>
              </button>
              
              {showPrepData && (
                <div 
                  className="mt-4 p-4 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'rgba(168, 85, 247, 0.05)',
                    border: '1px solid rgba(168, 85, 247, 0.2)'
                  }}
                >
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Your Ask:</span> {prepData.specific_situation}
                    </div>
                    <div>
                      <span className="font-medium">Success Criteria:</span> {prepData.success_definition}
                    </div>
                    <div>
                      <span className="font-medium">Your Questions:</span>
                      <ul className="ml-4 mt-1">
                        {prepData.top_questions.filter(q => q).map((q, i) => (
                          <li key={i}>• {q}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium">Boundaries Set:</span> {prepData.conversation_boundaries}
                    </div>
                    <div>
                      <span className="font-medium">Your Request:</span> {prepData.clear_request}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              {prepData ? (
                <>You wanted to clarify: "<strong>{prepData.specific_situation}</strong>". How well was this addressed?</>
              ) : (
                "How well was your main ask addressed?"
              )}
            </label>
            <textarea
              value={formData.ask_addressed}
              onChange={(e) => handleFieldChange('ask_addressed', e.target.value)}
              placeholder="Reflect on how your main concern was handled..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
              style={{
                borderColor: errors.ask_addressed ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.ask_addressed && (
              <p className="text-sm text-red-500 mt-1">{errors.ask_addressed}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              {prepData ? (
                <>Your success criteria were: "<strong>{prepData.success_definition}</strong>". Were these met?</>
              ) : (
                "Were your success criteria met?"
              )}
            </label>
            <textarea
              value={formData.success_criteria_met}
              onChange={(e) => handleFieldChange('success_criteria_met', e.target.value)}
              placeholder="Evaluate against your success criteria..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              Which of your main questions got answered?
            </label>
            <textarea
              value={formData.questions_answered}
              onChange={(e) => handleFieldChange('questions_answered', e.target.value)}
              placeholder="Review which questions were addressed..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              {prepData && prepData.conversation_boundaries ? (
                <>You set boundaries around: "<strong>{prepData.conversation_boundaries}</strong>". Were these respected?</>
              ) : (
                "Were your boundaries respected?"
              )}
            </label>
            <textarea
              value={formData.boundaries_respected}
              onChange={(e) => handleFieldChange('boundaries_respected', e.target.value)}
              placeholder="Reflect on boundary management..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Key Insights & Feedback",
      icon: <MessageSquare className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What were the 3 most important things you heard?
            </label>
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <input
                  key={index}
                  type="text"
                  value={formData.three_important_things[index] || ''}
                  onChange={(e) => handleImportantThingChange(index, e.target.value)}
                  placeholder={`Important insight ${index + 1}...`}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  style={{
                    borderColor: errors.three_important_things && !formData.three_important_things[index]?.trim() 
                      ? '#ef4444' 
                      : '#E5E7EB'
                  }}
                />
              ))}
              {errors.three_important_things && (
                <p className="text-sm text-red-500">{errors.three_important_things}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What feedback was hard to hear but valuable?
            </label>
            <textarea
              value={formData.hard_but_valuable}
              onChange={(e) => handleFieldChange('hard_but_valuable', e.target.value)}
              placeholder="Describe difficult but important feedback..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What new perspectives did your mentor offer?
            </label>
            <textarea
              value={formData.new_perspectives}
              onChange={(e) => handleFieldChange('new_perspectives', e.target.value)}
              placeholder="Describe fresh viewpoints or approaches..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What patterns or blind spots did they help you see?
            </label>
            <textarea
              value={formData.patterns_spotted}
              onChange={(e) => handleFieldChange('patterns_spotted', e.target.value)}
              placeholder="Identify patterns or blind spots revealed..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What validation or affirmation did you receive?
            </label>
            <textarea
              value={formData.validation_received}
              onChange={(e) => handleFieldChange('validation_received', e.target.value)}
              placeholder="Note positive reinforcement or validation..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Emotional Processing",
      icon: <Heart className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              How did you feel during different parts of the conversation?
            </label>
            <textarea
              value={formData.emotional_journey}
              onChange={(e) => handleFieldChange('emotional_journey', e.target.value)}
              placeholder="Describe your emotional journey through the session..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
              style={{
                borderColor: errors.emotional_journey ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.emotional_journey && (
              <p className="text-sm text-red-500 mt-1">{errors.emotional_journey}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What emotions are you experiencing now?
            </label>
            <textarea
              value={formData.current_emotions}
              onChange={(e) => handleFieldChange('current_emotions', e.target.value)}
              placeholder="Describe your current emotional state..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
              style={{
                borderColor: errors.current_emotions ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.current_emotions && (
              <p className="text-sm text-red-500 mt-1">{errors.current_emotions}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What feedback triggered the strongest reaction? Why?
            </label>
            <textarea
              value={formData.strongest_reaction}
              onChange={(e) => handleFieldChange('strongest_reaction', e.target.value)}
              placeholder="Identify what hit you hardest and explore why..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What do you need to sit with before taking action?
            </label>
            <textarea
              value={formData.needs_processing}
              onChange={(e) => handleFieldChange('needs_processing', e.target.value)}
              placeholder="Identify what needs more processing time..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              How has your confidence about the situation changed?
            </label>
            <textarea
              value={formData.confidence_change}
              onChange={(e) => handleFieldChange('confidence_change', e.target.value)}
              placeholder="Describe shifts in your confidence level..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Action Planning",
      icon: <Target className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What specific next steps did you identify?
            </label>
            <textarea
              value={formData.specific_next_steps}
              onChange={(e) => handleFieldChange('specific_next_steps', e.target.value)}
              placeholder="List concrete action items..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
              style={{
                borderColor: errors.specific_next_steps ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.specific_next_steps && (
              <p className="text-sm text-red-500 mt-1">{errors.specific_next_steps}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What will you do in the next 48 hours?
            </label>
            <textarea
              value={formData.next_48_hours}
              onChange={(e) => handleFieldChange('next_48_hours', e.target.value)}
              placeholder="Immediate actions to take..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
              style={{
                borderColor: errors.next_48_hours ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.next_48_hours && (
              <p className="text-sm text-red-500 mt-1">{errors.next_48_hours}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What will you do in the next week?
            </label>
            <textarea
              value={formData.next_week}
              onChange={(e) => handleFieldChange('next_week', e.target.value)}
              placeholder="Actions for the coming week..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What longer-term changes will you pursue?
            </label>
            <textarea
              value={formData.longer_term}
              onChange={(e) => handleFieldChange('longer_term', e.target.value)}
              placeholder="Long-term goals and changes..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What support do you need for implementation?
            </label>
            <textarea
              value={formData.support_needed}
              onChange={(e) => handleFieldChange('support_needed', e.target.value)}
              placeholder="Resources, people, or systems needed..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Application Strategy",
      icon: <Zap className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              How will you apply what you learned?
            </label>
            <textarea
              value={formData.application_plan}
              onChange={(e) => handleFieldChange('application_plan', e.target.value)}
              placeholder="Describe your implementation approach..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
              style={{
                borderColor: errors.application_plan ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.application_plan && (
              <p className="text-sm text-red-500 mt-1">{errors.application_plan}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What might get in the way of taking action?
            </label>
            <textarea
              value={formData.potential_obstacles}
              onChange={(e) => handleFieldChange('potential_obstacles', e.target.value)}
              placeholder="Identify potential barriers..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              How will you maintain accountability?
            </label>
            <textarea
              value={formData.accountability_plan}
              onChange={(e) => handleFieldChange('accountability_plan', e.target.value)}
              placeholder="Describe your accountability system..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              When will you check in with your mentor again?
            </label>
            <textarea
              value={formData.mentor_checkin}
              onChange={(e) => handleFieldChange('mentor_checkin', e.target.value)}
              placeholder="Specify follow-up timeline..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              How will you measure progress?
            </label>
            <textarea
              value={formData.progress_measurement}
              onChange={(e) => handleFieldChange('progress_measurement', e.target.value)}
              placeholder="Define success metrics..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Post-Mentoring State Check",
      icon: <Heart className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.2)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#7C3AED' }}>
              Current State Assessment
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  Clarity on your situation (1-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.clarity_level}
                    onChange={(e) => handleFieldChange('clarity_level', Number(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: '#A855F7' }}
                  />
                  <span className="w-12 text-center font-semibold text-lg" style={{ color: '#1A1A1A' }}>
                    {formData.clarity_level}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  Confidence in your path forward (1-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.confidence_forward}
                    onChange={(e) => handleFieldChange('confidence_forward', Number(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: '#A855F7' }}
                  />
                  <span className="w-12 text-center font-semibold text-lg" style={{ color: '#1A1A1A' }}>
                    {formData.confidence_forward}
                  </span>
                </div>
                {prepData && (
                  <p className="text-sm text-gray-600 mt-1">
                    Pre-session confidence: {prepData.needs_articulation_confidence}/10 → Post: {formData.confidence_forward}/10
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  Motivation to take action (1-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.motivation_level}
                    onChange={(e) => handleFieldChange('motivation_level', Number(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: '#A855F7' }}
                  />
                  <span className="w-12 text-center font-semibold text-lg" style={{ color: '#1A1A1A' }}>
                    {formData.motivation_level}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  Gratitude for the mentoring (1-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.gratitude_level}
                    onChange={(e) => handleFieldChange('gratitude_level', Number(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: '#A855F7' }}
                  />
                  <span className="w-12 text-center font-semibold text-lg" style={{ color: '#1A1A1A' }}>
                    {formData.gratitude_level}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  One word describing how you feel now
                </label>
                <input
                  type="text"
                  value={formData.current_state_word}
                  onChange={(e) => handleFieldChange('current_state_word', e.target.value)}
                  placeholder="Enter one word..."
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  style={{
                    borderColor: errors.current_state_word ? '#ef4444' : '#E5E7EB'
                  }}
                />
                {errors.current_state_word && (
                  <p className="text-sm text-red-500 mt-1">{errors.current_state_word}</p>
                )}
                {prepData && prepData.current_state_word && (
                  <p className="text-sm text-gray-600 mt-1">
                    Pre-session word: "{prepData.current_state_word}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Comparative Reflection",
      icon: <TrendingUp className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          {prepData && (
            <div 
              className="p-4 rounded-lg mb-6"
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.05)',
                border: '1px solid rgba(168, 85, 247, 0.2)'
              }}
            >
              <h4 className="font-medium mb-3" style={{ color: '#7C3AED' }}>
                Pre vs. Post Comparison
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Confidence:</span> {prepData.needs_articulation_confidence}/10 → {formData.confidence_forward}/10
                </div>
                <div>
                  <span className="font-medium">Stress:</span> {prepData.current_stress_level}/10 → Current state
                </div>
                <div>
                  <span className="font-medium">Openness:</span> {prepData.openness_to_perspectives}/10
                </div>
                <div>
                  <span className="font-medium">Feedback readiness:</span> {prepData.feedback_openness}/10
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              Compare your pre-session confidence to post-session confidence
            </label>
            <textarea
              value={formData.confidence_comparison}
              onChange={(e) => handleFieldChange('confidence_comparison', e.target.value)}
              placeholder="Reflect on your confidence journey..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              Compare your initial stress level to your current state
            </label>
            <textarea
              value={formData.stress_comparison}
              onChange={(e) => handleFieldChange('stress_comparison', e.target.value)}
              placeholder="Describe changes in stress or tension..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              {prepData ? (
                <>Your openness to feedback was {prepData.feedback_openness}/10. How did you actually receive feedback?</>
              ) : (
                "How well did you receive and process feedback?"
              )}
            </label>
            <textarea
              value={formData.feedback_reception}
              onChange={(e) => handleFieldChange('feedback_reception', e.target.value)}
              placeholder="Reflect on your feedback reception..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Closing Commitment",
      icon: <Sparkles className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.2)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#7C3AED' }}>
              Three Commitments
            </h3>
            <p className="mb-6" style={{ color: '#5A5A5A' }}>
              Based on this mentoring session, write three specific commitments: one action you'll take, 
              one mindset you'll adopt, and one way you'll pay it forward.
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  One action I commit to taking:
                </label>
                <textarea
                  value={formData.action_commitment}
                  onChange={(e) => handleFieldChange('action_commitment', e.target.value)}
                  placeholder="Write a specific, measurable action..."
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
                  style={{
                    borderColor: errors.action_commitment ? '#ef4444' : '#E5E7EB'
                  }}
                />
                {errors.action_commitment && (
                  <p className="text-sm text-red-500 mt-1">{errors.action_commitment}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  One mindset I will adopt:
                </label>
                <textarea
                  value={formData.mindset_commitment}
                  onChange={(e) => handleFieldChange('mindset_commitment', e.target.value)}
                  placeholder="Describe a new perspective or attitude..."
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
                  style={{
                    borderColor: errors.mindset_commitment ? '#ef4444' : '#E5E7EB'
                  }}
                />
                {errors.mindset_commitment && (
                  <p className="text-sm text-red-500 mt-1">{errors.mindset_commitment}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  One way I'll pay it forward:
                </label>
                <textarea
                  value={formData.payforward_commitment}
                  onChange={(e) => handleFieldChange('payforward_commitment', e.target.value)}
                  placeholder="How will you help or mentor others..."
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
                  style={{
                    borderColor: errors.payforward_commitment ? '#ef4444' : '#E5E7EB'
                  }}
                />
                {errors.payforward_commitment && (
                  <p className="text-sm text-red-500 mt-1">{errors.payforward_commitment}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <p className="text-sm text-purple-700">
              <strong>Remember:</strong> Follow up with your mentor as planned. Your growth is a journey, 
              and this session is just one important step along the way.
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentSectionData = sections[currentSection];
  const isLastSection = currentSection === sections.length - 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        style={{ backgroundColor: '#FAFAFA' }}
      >
        {/* Header */}
        <div 
          className="p-6 border-b"
          style={{ 
            borderColor: '#E5E7EB',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(139, 92, 246, 0.02) 100%)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, #A855F7 0%, #8B5CF6 100%)',
                  boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)'
                }}
              >
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                  Mentoring Reflection
                </h2>
                <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                  Processing your mentoring session
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex space-x-2">
              {sections.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    index <= currentSection ? 'opacity-100' : 'opacity-30'
                  }`}
                  style={{
                    backgroundColor: index <= currentSection ? '#A855F7' : '#E5E7EB',
                    minWidth: '30px'
                  }}
                />
              ))}
            </div>
            <span className="text-sm ml-4" style={{ color: '#5A5A5A' }}>
              {currentSection + 1} of {sections.length}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
          <div className="mb-4 flex items-center space-x-2">
            {currentSectionData.icon}
            <h3 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
              {currentSectionData.title}
            </h3>
          </div>

          {currentSectionData.content}
        </div>

        {/* Footer */}
        <div 
          className="p-6 border-t flex justify-between items-center"
          style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}
        >
          {currentSection > 0 && (
            <button
              onClick={handlePrev}
              className="px-6 py-2 rounded-lg flex items-center transition-colors"
              style={{
                backgroundColor: '#F3F4F6',
                color: '#A855F7',
                border: '1px solid #A855F7'
              }}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
          )}

          <div className="flex-1" />

          {errors.save && (
            <p className="text-sm text-red-500 mr-4">{errors.save}</p>
          )}

          {!isLastSection ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-lg flex items-center transition-all"
              style={{
                background: 'linear-gradient(145deg, #A855F7 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)'
              }}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving || hasSaved}
              className="px-6 py-2 rounded-lg flex items-center transition-all"
              style={{
                background: isSaving 
                  ? 'linear-gradient(145deg, #9CA3AF 0%, #6B7280 100%)'
                  : 'linear-gradient(145deg, #A855F7 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)',
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Complete Reflection'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentoringReflectionEnhanced;