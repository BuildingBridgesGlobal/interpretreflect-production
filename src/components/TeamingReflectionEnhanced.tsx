import React, { useState, useEffect } from 'react';
import {
  X, ChevronRight, ChevronLeft, Check, Eye,
  AlertTriangle, TrendingUp, MessageCircle, Share2, Download,
  ChevronDown, ChevronUp, CheckCircle, Copy
} from 'lucide-react';
import { CommunityIcon, HeartPulseIcon } from './CustomIcon';
import { supabase, TeamingReflectionData, TeamingPrepData, TeamingPrepEnhancedData, ReflectionEntry } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface TeamingReflectionEnhancedProps {
  onComplete?: (data: TeamingReflectionData) => void;
  onClose: () => void;
  prepDataId?: string; // Optional ID to link to specific prep session
}

export const TeamingReflectionEnhanced: React.FC<TeamingReflectionEnhancedProps> = ({ 
  onComplete, 
  onClose,
  prepDataId
}) => {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [prepData, setPrepData] = useState<TeamingPrepData | TeamingPrepEnhancedData | null>(null);
  const [showPrepData, setShowPrepData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completionTime, setCompletionTime] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sharingLink, setSharingLink] = useState<string>('');
  const startTime = Date.now();
  
  // Form state for all fields
  const [formData, setFormData] = useState<TeamingReflectionData>({
    linked_prep_id: prepDataId,
    // Quick Insight
    most_surprised: '',
    assignment_type: 'in-person',
    // Section 1: Revisiting Predictions
    expectations_accuracy: '',
    handoff_signal_practice: '',
    stress_handling_actual: '',
    technical_aspects: '',
    physical_aspects: '',
    // Section 2: Team Dynamics
    team_function_actual: '',
    role_evolution: '',
    communication_patterns: '',
    exceptional_moment: '',
    transition_management: '',
    // Section 3: Challenges & Growth
    significant_challenge: '',
    unexpected_skills: '',
    issue_resolution: '',
    collaboration_solutions: '',
    environmental_solutions: '',
    do_differently: '',
    // Section 4: Key Learnings
    learned_about_self: '',
    collaboration_insights: '',
    approach_changed: '',
    handoff_techniques: '',
    advice_for_others: '',
    // Section 5: Then vs Now
    then_thought_now_know: '',
    then_worried_now_understand: '',
    then_planned_actually_worked: '',
    confidence_change: '',
    experience_rating: 5,
    rating_explanation: '',
    // Closing Synthesis
    three_strategies: [],
    // Post-Reflection Metrics
    confidence_rating: 5,
    feeling_word: '',
    // Sharing preferences
    share_enabled: false,
    shared_highlights: []
  });

  // Load prep data if available
  useEffect(() => {
    const loadPrepData = async () => {
      if (!user || !prepDataId) return;
      
      try {
        const { data, error } = await supabase
          .from('reflection_entries')
          .select('*')
          .eq('id', prepDataId)
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          const prepDataContent = data.data as TeamingPrepData | TeamingPrepEnhancedData;
          setPrepData(prepDataContent);
          setFormData(prev => ({
            ...prev,
            linked_prep_id: prepDataId,
            prep_data_referenced: 'self_focus' in prepDataContent ? prepDataContent : undefined
          }));
        }
      } catch (err) {
        console.error('Error loading prep data:', err);
      }
    };

    loadPrepData();
  }, [user, prepDataId]);

  const handleFieldChange = (field: keyof TeamingReflectionData, value: string | number | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (sectionIndex) {
      case 0: // Quick Insight
        if (!formData.most_surprised.trim()) {
          newErrors.most_surprised = 'Please share what surprised you';
        }
        break;
      case 1: // Revisiting Predictions
        if (!formData.expectations_accuracy.trim()) {
          newErrors.expectations_accuracy = 'Please reflect on your expectations';
        }
        if (!formData.handoff_signal_practice.trim()) {
          newErrors.handoff_signal_practice = 'Please describe how your handoff signal worked';
        }
        break;
      case 2: // Team Dynamics
        if (!formData.team_function_actual.trim()) {
          newErrors.team_function_actual = 'Please describe your team dynamics';
        }
        if (!formData.exceptional_moment.trim()) {
          newErrors.exceptional_moment = 'Please share an exceptional moment';
        }
        break;
      // Add more validation as needed
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
    setIsSaving(true);
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000); // in seconds
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const finalData = {
        ...formData,
        completion_time: duration
      };

      const entry: ReflectionEntry = {
        user_id: user.id,
        reflection_id: 'teaming_reflection_enhanced',
        entry_kind: 'teaming_reflection',
        team_id: undefined,
        session_id: undefined,
        data: finalData,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('reflection_entries')
        .insert([entry]);

      if (error) throw error;

      // Generate sharing link if enabled
      if (formData.share_enabled) {
        const link = `${window.location.origin}/share/reflection/${entry.reflection_id}`;
        setSharingLink(link);
      }
      
      // Show success modal
      setShowSuccessModal(true);
      
      if (onComplete) {
        onComplete(finalData);
      }
    } catch (error) {
      console.error('Error saving reflection:', error);
      setErrors({ save: 'Failed to save reflection. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    {
      title: "Quick Insight Capture",
      icon: <Eye className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)',
              border: '1px solid rgba(107, 139, 96, 0.2)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#2D5F3F' }}>
              Opening Context
            </h3>
            <p className="mb-6" style={{ color: '#5A5A5A' }}>
              Now that you've completed your team interpreting assignment, let's reflect on how your experience 
              compared to your initial expectations and what you've learned about working in interpreting teams.
            </p>
            
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What most surprised you about this team interpreting experience?
            </label>
            <textarea
              value={formData.most_surprised}
              onChange={(e) => handleFieldChange('most_surprised', e.target.value)}
              placeholder="Describe what caught you off guard, exceeded expectations, or was completely different than anticipated..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.most_surprised ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.most_surprised && (
              <p className="text-sm text-red-500 mt-1">{errors.most_surprised}</p>
            )}
            
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
                Was this a virtual or in-person assignment?
              </label>
              <select
                value={formData.assignment_type}
                onChange={(e) => handleFieldChange('assignment_type', e.target.value as 'virtual' | 'in-person' | 'hybrid')}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500"
                style={{ borderColor: '#E8E5E0' }}
              >
                <option value="in-person">In-Person</option>
                <option value="virtual">Virtual</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Revisiting Your Predictions",
      icon: <TrendingUp className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          {/* Show prep data if available */}
          {prepData && (
            <div className="mb-6">
              <button
                onClick={() => setShowPrepData(!showPrepData)}
                className="flex items-center space-x-2 text-sm font-medium"
                style={{ color: '#6B8B60' }}
              >
                {showPrepData ? <ChevronUp /> : <ChevronDown />}
                <span>View Your Pre-Assignment Responses</span>
              </button>
              
              {showPrepData && (
                <div 
                  className="mt-4 p-4 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'rgba(107, 139, 96, 0.05)',
                    border: '1px solid rgba(107, 139, 96, 0.2)'
                  }}
                >
                  <div className="space-y-3">
                    {'self_focus' in prepData ? (
                      // Legacy TeamingPrepData format
                      <>
                        <div>
                          <span className="font-medium">Your focus level:</span> {prepData.self_focus}/10
                        </div>
                        <div>
                          <span className="font-medium">Partner's focus:</span> {prepData.partner_focus}/10
                        </div>
                        <div>
                          <span className="font-medium">Initial feeling:</span> {prepData.one_word_feeling}
                        </div>
                        <div>
                          <span className="font-medium">Planned signal:</span> {prepData.signal_type}
                          {prepData.signal_custom && ` - ${prepData.signal_custom}`}
                        </div>
                        <div>
                          <span className="font-medium">Anticipated stressors:</span> {prepData.stressors.join(', ')}
                        </div>
                        <div>
                          <span className="font-medium">Fallback plan:</span> {prepData.plan_if_sideways}
                        </div>
                        <div>
                          <span className="font-medium">Your intention:</span> {prepData.micro_intention}
                        </div>
                      </>
                    ) : (
                      // Enhanced TeamingPrepEnhancedData format
                      <>
                        <div>
                          <span className="font-medium">Assignment Type:</span> {prepData.assignment_type}
                        </div>
                        <div>
                          <span className="font-medium">What excited you most:</span> {prepData.excites_most}
                        </div>
                        <div>
                          <span className="font-medium">Main concerns:</span> {prepData.concerns_most}
                        </div>
                        <div>
                          <span className="font-medium">Ideal team dynamic:</span> {prepData.ideal_team_dynamic}
                        </div>
                        <div>
                          <span className="font-medium">Your natural role:</span> {prepData.natural_role}
                        </div>
                        <div>
                          <span className="font-medium">Handoff signal:</span> {prepData.handoff_signal}
                        </div>
                        <div>
                          <span className="font-medium">Communication style:</span> {prepData.communication_style}
                        </div>
                        <div>
                          <span className="font-medium">Typical stressor:</span> {prepData.typical_stressor}
                        </div>
                        <div>
                          <span className="font-medium">Unique strengths:</span> {prepData.unique_strengths}
                        </div>
                        <div>
                          <span className="font-medium">Success vision:</span> {prepData.success_description}
                        </div>
                        <div>
                          <span className="font-medium">Pre-assignment confidence:</span> {prepData.confidence_rating}/10
                        </div>
                        <div>
                          <span className="font-medium">Initial feeling:</span> {prepData.feeling_word}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Looking back at your pre-assignment responses, which expectations proved most accurate? 
              Which were most different?
            </label>
            <textarea
              value={formData.expectations_accuracy}
              onChange={(e) => handleFieldChange('expectations_accuracy', e.target.value)}
              placeholder="Compare what you thought would happen with what actually happened..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.expectations_accuracy ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.expectations_accuracy && (
              <p className="text-sm text-red-500 mt-1">{errors.expectations_accuracy}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              {prepData ? (
                'self_focus' in prepData ? (
                  <>You said your handoff signal would be: <strong>{prepData.signal_type}</strong>. How did that actually work in practice?</>
                ) : (
                  <>You planned to use: <strong>{prepData.handoff_signal}</strong> as your handoff signal. How did that actually work in practice?</>
                )
              ) : (
                "How did your planned handoff signal work in practice?"
              )}
            </label>
            <textarea
              value={formData.handoff_signal_practice}
              onChange={(e) => handleFieldChange('handoff_signal_practice', e.target.value)}
              placeholder="Describe how your communication signals evolved during the actual work..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.handoff_signal_practice ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.handoff_signal_practice && (
              <p className="text-sm text-red-500 mt-1">{errors.handoff_signal_practice}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              {prepData ? (
                'self_focus' in prepData && prepData.stressors.length > 0 ? (
                  <>You anticipated: <strong>{prepData.stressors.join(', ')}</strong>. How did you actually handle stress/pressure as a team?</>
                ) : 'typical_stressor' in prepData ? (
                  <>You mentioned <strong>{prepData.typical_stressor}</strong> as a typical stressor. How did you actually handle stress/pressure as a team?</>
                ) : (
                  "How did you handle stress and pressure as a team?"
                )
              ) : (
                "How did you handle stress and pressure as a team?"
              )}
            </label>
            <textarea
              value={formData.stress_handling_actual}
              onChange={(e) => handleFieldChange('stress_handling_actual', e.target.value)}
              placeholder="Reflect on your team's stress management and support..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
          
          {/* Assignment type specific questions */}
          {(formData.assignment_type === 'virtual' || formData.assignment_type === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
                How did the technical aspects compare to your expectations?
              </label>
              <textarea
                value={formData.technical_aspects || ''}
                onChange={(e) => handleFieldChange('technical_aspects', e.target.value)}
                placeholder="Describe connectivity, platform features, audio/video quality, and technical challenges..."
                rows={3}
                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
          )}
          
          {(formData.assignment_type === 'in-person' || formData.assignment_type === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
                How did the physical/environmental aspects compare to what you anticipated?
              </label>
              <textarea
                value={formData.physical_aspects || ''}
                onChange={(e) => handleFieldChange('physical_aspects', e.target.value)}
                placeholder="Describe room setup, positioning, acoustics, and environmental factors..."
                rows={3}
                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
          )}
        </div>
      )
    },
    {
      title: "Team Dynamics & Roles",
      icon: <CommunityIcon size={64} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Describe how your interpreting team actually functioned during the assignment vs. what you imagined
            </label>
            <textarea
              value={formData.team_function_actual}
              onChange={(e) => handleFieldChange('team_function_actual', e.target.value)}
              placeholder="Compare your expectations with the reality of daily teamwork..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.team_function_daily ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.team_function_daily && (
              <p className="text-sm text-red-500 mt-1">{errors.team_function_daily}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How did your role evolve throughout the project?
            </label>
            <textarea
              value={formData.role_evolution}
              onChange={(e) => handleFieldChange('role_evolution', e.target.value)}
              placeholder="Describe how your responsibilities and contributions changed over time..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What communication patterns emerged naturally?
            </label>
            <textarea
              value={formData.communication_patterns}
              onChange={(e) => handleFieldChange('communication_patterns', e.target.value)}
              placeholder="Describe the unplanned ways you ended up communicating..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Identify a moment when your team interpreted exceptionally well together
            </label>
            <textarea
              value={formData.exceptional_moment}
              onChange={(e) => handleFieldChange('exceptional_moment', e.target.value)}
              placeholder="Describe a specific moment of excellent teamwork..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.exceptional_moment ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.exceptional_moment && (
              <p className="text-sm text-red-500 mt-1">{errors.exceptional_moment}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How did you manage transitions and maintain flow as a team?
            </label>
            <textarea
              value={formData.transition_management}
              onChange={(e) => handleFieldChange('transition_management', e.target.value)}
              placeholder="Describe your team's approach to smooth handoffs and maintaining interpretation flow..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Challenges & Growth",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Describe a significant challenge during the assignment and how you navigated it together
            </label>
            <textarea
              value={formData.significant_challenge}
              onChange={(e) => handleFieldChange('significant_challenge', e.target.value)}
              placeholder="Share a difficult moment and your team's response..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What unexpected interpreting skills did you develop?
            </label>
            <textarea
              value={formData.unexpected_skills}
              onChange={(e) => handleFieldChange('unexpected_skills', e.target.value)}
              placeholder="Identify abilities you didn't know you'd need or gain..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How did you contribute to resolving any miscommunications or technical issues?
            </label>
            <textarea
              value={formData.issue_resolution}
              onChange={(e) => handleFieldChange('issue_resolution', e.target.value)}
              placeholder="Describe your role in managing issues that arose..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          {/* Assignment type specific questions */}
          {(formData.assignment_type === 'virtual' || formData.assignment_type === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
                What solutions did you find for remote collaboration challenges?
              </label>
              <textarea
                value={formData.collaboration_solutions || ''}
                onChange={(e) => handleFieldChange('collaboration_solutions', e.target.value)}
                placeholder="Describe technical workarounds, communication strategies, or collaboration tools..."
                rows={3}
                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
          )}
          
          {(formData.assignment_type === 'in-person' || formData.assignment_type === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
                How did you handle environmental or positioning challenges?
              </label>
              <textarea
                value={formData.environmental_solutions || ''}
                onChange={(e) => handleFieldChange('environmental_solutions', e.target.value)}
                placeholder="Describe how you managed room dynamics, sight lines, acoustics, or other physical factors..."
                rows={3}
                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What would you do differently in your next team interpreting assignment?
            </label>
            <textarea
              value={formData.do_differently}
              onChange={(e) => handleFieldChange('do_differently', e.target.value)}
              placeholder="Reflect on changes you'd make with hindsight..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Key Learnings",
      icon: <HeartPulseIcon size={64} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Most important thing learned about yourself as a team interpreter?
            </label>
            <textarea
              value={formData.learned_about_self}
              onChange={(e) => handleFieldChange('learned_about_self', e.target.value)}
              placeholder="Identify your key self-discovery..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What collaboration insights will you carry forward to future assignments?
            </label>
            <textarea
              value={formData.collaboration_insights}
              onChange={(e) => handleFieldChange('collaboration_insights', e.target.value)}
              placeholder="Share wisdom about working with others..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How has this changed your approach to team interpreting?
            </label>
            <textarea
              value={formData.approach_changed}
              onChange={(e) => handleFieldChange('approach_changed', e.target.value)}
              placeholder="Describe shifts in your collaboration style..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What specific techniques for smooth handoffs or support did you discover?
            </label>
            <textarea
              value={formData.handoff_techniques}
              onChange={(e) => handleFieldChange('handoff_techniques', e.target.value)}
              placeholder="Describe effective strategies for team coordination..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Advice for someone about to start a similar team interpreting assignment?
            </label>
            <textarea
              value={formData.advice_for_others}
              onChange={(e) => handleFieldChange('advice_for_others', e.target.value)}
              placeholder="Share guidance based on your experience..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Then vs. Now Comparison",
      icon: <TrendingUp className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Then I thought team interpreting would be... → Now I know...
            </label>
            <textarea
              value={formData.then_thought_now_know}
              onChange={(e) => handleFieldChange('then_thought_now_know', e.target.value)}
              placeholder="Complete this comparison about your assumptions vs. reality..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Then I worried about... → Now I understand...
            </label>
            <textarea
              value={formData.then_worried_now_understand}
              onChange={(e) => handleFieldChange('then_worried_now_understand', e.target.value)}
              placeholder="Compare your concerns with your new understanding..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Then I planned to handle handoffs by... → What actually worked was...
            </label>
            <textarea
              value={formData.then_planned_actually_worked}
              onChange={(e) => handleFieldChange('then_planned_actually_worked', e.target.value)}
              placeholder="Compare your planned approach with what succeeded..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              My confidence in {formData.assignment_type === 'virtual' ? 'virtual' : formData.assignment_type === 'hybrid' ? 'hybrid' : 'in-person'} team interpreting has changed from... to...
            </label>
            <textarea
              value={formData.confidence_change}
              onChange={(e) => handleFieldChange('confidence_change', e.target.value)}
              placeholder="Describe how your confidence level has shifted..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Rate your overall team interpreting experience (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.experience_rating}
                onChange={(e) => handleFieldChange('experience_rating', Number(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#6B8B60' }}
              />
              <span className="w-12 text-center font-semibold" style={{ color: '#1A1A1A' }}>
                {formData.experience_rating}
              </span>
            </div>
            <textarea
              value={formData.rating_explanation}
              onChange={(e) => handleFieldChange('rating_explanation', e.target.value)}
              placeholder="Explain your rating..."
              rows={2}
              className="w-full mt-2 px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Closing Synthesis",
      icon: <Check className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What three specific strategies will you bring to your next team interpreting assignment?
            </label>
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <input
                  key={index}
                  type="text"
                  value={formData.three_strategies[index] || ''}
                  onChange={(e) => {
                    const strategies = [...formData.three_strategies];
                    strategies[index] = e.target.value;
                    handleFieldChange('three_strategies', strategies);
                  }}
                  placeholder={`Strategy ${index + 1}...`}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sage-500"
                />
              ))}
            </div>
          </div>

          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)',
              border: '1px solid rgba(107, 139, 96, 0.2)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#2D5F3F' }}>
              Post-Reflection Check
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
                  How confident do you feel about future team interpreting assignments? (1-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.confidence_rating}
                    onChange={(e) => handleFieldChange('confidence_rating', Number(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: '#6B8B60' }}
                  />
                  <span className="w-12 text-center font-semibold" style={{ color: '#1A1A1A' }}>
                    {formData.confidence_rating}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
                  In one word, how are you feeling after this reflection?
                </label>
                <input
                  type="text"
                  value={formData.feeling_word}
                  onChange={(e) => handleFieldChange('feeling_word', e.target.value)}
                  placeholder="Enter one word..."
                  maxLength={30}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sage-500"
                />
              </div>
            </div>
          </div>

          {/* Sharing Options */}
          <div 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'rgba(107, 139, 96, 0.05)',
              border: '1px solid rgba(107, 139, 96, 0.2)'
            }}
          >
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.share_enabled || false}
                onChange={(e) => handleFieldChange('share_enabled', e.target.checked)}
                className="rounded"
                style={{ accentColor: '#6B8B60' }}
              />
              <span className="text-sm font-medium" style={{ color: '#2D5F3F' }}>
                Enable sharing of key insights with my team
              </span>
            </label>
            {formData.share_enabled && (
              <p className="text-xs mt-2" style={{ color: '#5A5A5A' }}>
                You'll be able to select specific insights to share after saving
              </p>
            )}
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
        style={{ backgroundColor: '#FAF9F6' }}
      >
        {/* Header */}
        <div 
          className="p-6 border-b"
          style={{ 
            borderColor: '#E8E5E0',
            background: 'linear-gradient(135deg, rgba(107, 139, 96, 0.05) 0%, rgba(92, 127, 79, 0.02) 100%)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                  boxShadow: '0 2px 8px rgba(107, 139, 96, 0.3)'
                }}
              >
                <CommunityIcon size={64} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                  Team Reflection Journey
                </h2>
                <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                  Reflecting on your collaborative experience
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
                    backgroundColor: index <= currentSection ? '#6B8B60' : '#E8E5E0',
                    minWidth: '40px'
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
          style={{ borderColor: '#E8E5E0', backgroundColor: '#FFFFFF' }}
        >
          {currentSection > 0 && (
            <button
              onClick={handlePrev}
              className="px-6 py-2 rounded-lg flex items-center transition-colors"
              style={{
                backgroundColor: '#F8FBF6',
                color: '#6B8B60',
                border: '1px solid #6B8B60'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F7F0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FBF6';
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
                background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(107, 139, 96, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 139, 96, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(107, 139, 96, 0.3)';
              }}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              {formData.share_enabled && (
                <button
                  className="px-4 py-2 rounded-lg flex items-center"
                  style={{
                    backgroundColor: '#F8FBF6',
                    color: '#6B8B60',
                    border: '1px solid #6B8B60'
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Insights
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 rounded-lg flex items-center transition-all"
                style={{
                  background: isSaving 
                    ? 'linear-gradient(145deg, #9CA3AF 0%, #6B7280 100%)'
                    : 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(107, 139, 96, 0.3)',
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 139, 96, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(107, 139, 96, 0.3)';
                  }
                }}
              >
                <Check className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Complete Reflection'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            style={{ backgroundColor: '#FAF9F6' }}
          >
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                  boxShadow: '0 4px 12px rgba(107, 139, 96, 0.3)'
                }}
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                Reflection Complete!
              </h3>
              
              <p className="text-base mb-6" style={{ color: '#5A5A5A' }}>
                Excellent work reflecting on your team interpreting experience. 
                Your insights have been saved and will help you grow as a collaborative interpreter.
              </p>
              
              {formData.share_enabled && sharingLink && (
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(107, 139, 96, 0.1)' }}>
                  <p className="text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
                    Share your insights with your team:
                  </p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={sharingLink}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm border rounded-lg bg-white"
                      style={{ borderColor: '#E8E5E0' }}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(sharingLink);
                        // Show copied feedback
                      }}
                      className="px-3 py-2 rounded-lg flex items-center"
                      style={{
                        background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                        color: '#FFFFFF'
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    onClose();
                  }}
                  className="px-6 py-3 rounded-lg transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(107, 139, 96, 0.3)'
                  }}
                >
                  Continue to Dashboard
                </button>
                
                {formData.share_enabled && (
                  <button
                    onClick={() => {
                      // TODO: Implement team sharing feature
                      setShowSuccessModal(false);
                    }}
                    className="px-6 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: '#F8FBF6',
                      color: '#6B8B60',
                      border: '1px solid #6B8B60'
                    }}
                  >
                    Share Key Insights with Team
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamingReflectionEnhanced;