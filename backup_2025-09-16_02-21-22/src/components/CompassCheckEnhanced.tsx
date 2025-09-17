import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, X, Compass, Shield, Heart, AlertCircle, Target, Copy, Check } from 'lucide-react';
import { supabase, CompassCheckData } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CompassCheckEnhancedProps {
  onComplete: (data: CompassCheckData) => void;
  onClose: () => void;
}

export const CompassCheckEnhanced: React.FC<CompassCheckEnhancedProps> = ({ 
  onComplete, 
  onClose 
}) => {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [startTime] = useState(Date.now());
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CompassCheckData>({
    // Quick Insight Capture
    situation_prompt: '',
    values_alignment: 5,
    uneasy_feeling: '',
    
    // Section 1: The Situation
    situation_description: '',
    difficulty_factors: '',
    competing_demands: '',
    people_impacted: '',
    personal_stakes: '',
    
    // Section 2: Values Exploration
    challenged_values: '',
    honored_values: '',
    values_conflict: '',
    others_values: '',
    systemic_factors: '',
    
    // Section 3: Decision Process
    navigation_approach: '',
    guiding_factors: '',
    compromises_made: '',
    hindsight_changes: '',
    peace_and_troubles: '',
    
    // Section 4: Impact & Consequences
    decision_impact: '',
    integrity_effect: '',
    relationships_affected: '',
    boundaries_learned: '',
    role_understanding_change: '',
    
    // Section 5: Realignment & Integration
    alignment_helpers: '',
    boundaries_to_set: '',
    future_handling: '',
    support_needed: '',
    growth_insights: '',
    
    // Values Assessment
    integrity_alignment: 5,
    authenticity_in_role: 5,
    ethical_clarity: 5,
    professional_boundaries: 5,
    personal_peace: 5,
    
    // Closing
    wisdom_gained: '',
    self_compassion_note: '',
    priority_value: '',
    
    // Metadata
    timestamp: new Date().toISOString(),
  });

  const sections = [
    'Quick Insight Capture',
    'The Situation',
    'Values Exploration',
    'Decision Process',
    'Impact & Consequences',
    'Realignment & Integration',
    'Values Assessment',
    'Closing Reflection',
    'Summary'
  ];

  const handleInputChange = (field: keyof CompassCheckData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateSection = (section: number): boolean => {
    switch (section) {
      case 0: // Quick Insight
        return formData.situation_prompt.trim() !== '' && 
               formData.uneasy_feeling.trim() !== '';
      case 1: // The Situation
        return formData.situation_description.trim() !== '' &&
               formData.difficulty_factors.trim() !== '';
      case 2: // Values Exploration
        return formData.challenged_values.trim() !== '' &&
               formData.honored_values.trim() !== '';
      case 3: // Decision Process
        return formData.navigation_approach.trim() !== '' &&
               formData.guiding_factors.trim() !== '';
      case 4: // Impact & Consequences
        return formData.decision_impact.trim() !== '' &&
               formData.integrity_effect.trim() !== '';
      case 5: // Realignment & Integration
        return formData.alignment_helpers.trim() !== '' &&
               formData.future_handling.trim() !== '';
      case 6: // Values Assessment
        return true; // All sliders have default values
      case 7: // Closing
        return formData.wisdom_gained.trim() !== '' &&
               formData.self_compassion_note.trim() !== '' &&
               formData.priority_value.trim() !== '';
      default:
        return true;
    }
  };

  const nextSection = () => {
    if (validateSection(currentSection)) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const generateSummary = (): string => {
    return `COMPASS CHECK SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━

🧭 VALUES ALIGNMENT: ${formData.values_alignment}/10

📍 SITUATION
${formData.situation_description}

What made it difficult:
${formData.difficulty_factors}

⚖️ VALUES EXPLORED
Challenged: ${formData.challenged_values}
Honored: ${formData.honored_values}
Conflict: ${formData.values_conflict}

🤔 DECISION PROCESS
How I navigated: ${formData.navigation_approach}
Guided by: ${formData.guiding_factors}
Compromises: ${formData.compromises_made}

💭 IMPACT
${formData.decision_impact}
Effect on integrity: ${formData.integrity_effect}

🔄 REALIGNMENT
What helps alignment: ${formData.alignment_helpers}
Future approach: ${formData.future_handling}
Growth insights: ${formData.growth_insights}

📊 VALUES ASSESSMENT
• Integrity: ${formData.integrity_alignment}/10
• Authenticity: ${formData.authenticity_in_role}/10
• Ethical Clarity: ${formData.ethical_clarity}/10
• Boundaries: ${formData.professional_boundaries}/10
• Personal Peace: ${formData.personal_peace}/10

💡 WISDOM GAINED
${formData.wisdom_gained}

❤️ SELF-COMPASSION
${formData.self_compassion_note}

🎯 PRIORITY VALUE
${formData.priority_value}

━━━━━━━━━━━━━━━━━━━━━━━━
Completed: ${new Date().toLocaleString()}`;
  };

  const copyToClipboard = () => {
    const summary = generateSummary();
    navigator.clipboard.writeText(summary).then(() => {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    });
  };

  const handleSubmit = async () => {
    if (!validateSection(7)) return;
    
    setIsSubmitting(true);
    
    const completionTime = Math.round((Date.now() - startTime) / 1000);
    const finalData = {
      ...formData,
      completion_time: completionTime,
      timestamp: new Date().toISOString(),
      ethical_challenge: formData.values_alignment <= 4,
      values_conflict_present: formData.values_conflict.trim() !== '',
      resolution_achieved: formData.personal_peace >= 7
    };

    try {
      if (user) {
        const { error } = await supabase
          .from('reflection_entries')
          .insert({
            user_id: user.id,
            reflection_id: `compass-check-${Date.now()}`,
            entry_kind: 'compass-check',
            data: finalData,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error saving compass check:', error);
        }
      }

      onComplete(finalData);
    } catch (error) {
      console.error('Error submitting compass check:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuickInsight = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What situation or decision prompted this compass check?
        </label>
        <textarea
          value={formData.situation_prompt}
          onChange={(e) => handleInputChange('situation_prompt', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="Briefly describe what brought you here..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How aligned with your values do you feel right now?
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Misaligned</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.values_alignment}
            onChange={(e) => handleInputChange('values_alignment', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm">Fully aligned</span>
          <span className="ml-4 font-medium text-sage-700 min-w-[2ch]">
            {formData.values_alignment}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What's sitting uneasy with you?
        </label>
        <textarea
          value={formData.uneasy_feeling}
          onChange={(e) => handleInputChange('uneasy_feeling', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="What doesn't feel quite right?"
        />
      </div>
    </div>
  );

  const renderTheSituation = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe the challenging decision or situation you faced
        </label>
        <textarea
          value={formData.situation_description}
          onChange={(e) => handleInputChange('situation_description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="Provide context about what happened..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What made this particularly difficult or complex?
        </label>
        <textarea
          value={formData.difficulty_factors}
          onChange={(e) => handleInputChange('difficulty_factors', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="What factors complicated the situation?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What competing demands or expectations were present?
        </label>
        <textarea
          value={formData.competing_demands}
          onChange={(e) => handleInputChange('competing_demands', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Who was impacted by this situation?
        </label>
        <textarea
          value={formData.people_impacted}
          onChange={(e) => handleInputChange('people_impacted', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What was at stake for you personally or professionally?
        </label>
        <textarea
          value={formData.personal_stakes}
          onChange={(e) => handleInputChange('personal_stakes', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>
    </div>
  );

  const renderValuesExploration = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What core values felt challenged or compromised?
        </label>
        <textarea
          value={formData.challenged_values}
          onChange={(e) => handleInputChange('challenged_values', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="Which of your values were tested?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Which of your values were you trying to honor?
        </label>
        <textarea
          value={formData.honored_values}
          onChange={(e) => handleInputChange('honored_values', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="What values guided your actions?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Where did you experience values conflict?
        </label>
        <textarea
          value={formData.values_conflict}
          onChange={(e) => handleInputChange('values_conflict', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What values of others were involved?
        </label>
        <textarea
          value={formData.others_values}
          onChange={(e) => handleInputChange('others_values', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How did institutional or systemic factors affect your choices?
        </label>
        <textarea
          value={formData.systemic_factors}
          onChange={(e) => handleInputChange('systemic_factors', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>
    </div>
  );

  const renderDecisionProcess = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How did you navigate the decision or situation?
        </label>
        <textarea
          value={formData.navigation_approach}
          onChange={(e) => handleInputChange('navigation_approach', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="Describe your approach..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What guided your ultimate choice or action?
        </label>
        <textarea
          value={formData.guiding_factors}
          onChange={(e) => handleInputChange('guiding_factors', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="What influenced your decision?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Where did you have to compromise? How did that feel?
        </label>
        <textarea
          value={formData.compromises_made}
          onChange={(e) => handleInputChange('compromises_made', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What would you do differently with hindsight?
        </label>
        <textarea
          value={formData.hindsight_changes}
          onChange={(e) => handleInputChange('hindsight_changes', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What are you at peace with? What still troubles you?
        </label>
        <textarea
          value={formData.peace_and_troubles}
          onChange={(e) => handleInputChange('peace_and_troubles', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>
    </div>
  );

  const renderImpactConsequences = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What was the impact of your decision or action?
        </label>
        <textarea
          value={formData.decision_impact}
          onChange={(e) => handleInputChange('decision_impact', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="Describe the outcomes..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How did it affect your sense of professional integrity?
        </label>
        <textarea
          value={formData.integrity_effect}
          onChange={(e) => handleInputChange('integrity_effect', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="Impact on your professional self..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What relationships were affected and how?
        </label>
        <textarea
          value={formData.relationships_affected}
          onChange={(e) => handleInputChange('relationships_affected', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What did you learn about your boundaries?
        </label>
        <textarea
          value={formData.boundaries_learned}
          onChange={(e) => handleInputChange('boundaries_learned', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How has this changed your understanding of your role?
        </label>
        <textarea
          value={formData.role_understanding_change}
          onChange={(e) => handleInputChange('role_understanding_change', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>
    </div>
  );

  const renderRealignmentIntegration = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What would help you feel more aligned with your values?
        </label>
        <textarea
          value={formData.alignment_helpers}
          onChange={(e) => handleInputChange('alignment_helpers', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="What would restore alignment?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What boundaries need to be set or reinforced?
        </label>
        <textarea
          value={formData.boundaries_to_set}
          onChange={(e) => handleInputChange('boundaries_to_set', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How will you handle similar situations in the future?
        </label>
        <textarea
          value={formData.future_handling}
          onChange={(e) => handleInputChange('future_handling', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="Your approach going forward..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What support do you need to process this experience?
        </label>
        <textarea
          value={formData.support_needed}
          onChange={(e) => handleInputChange('support_needed', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What growth or insight came from this challenge?
        </label>
        <textarea
          value={formData.growth_insights}
          onChange={(e) => handleInputChange('growth_insights', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>
    </div>
  );

  const renderValuesAssessment = () => (
    <div className="space-y-6">
      <div className="bg-sage-50 p-4 rounded-lg">
        <p className="text-sm text-sage-700 mb-4">
          Rate your current alignment in each area (1-10)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Shield className="inline w-4 h-4 mr-1" /> Integrity Alignment
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm">1</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.integrity_alignment}
            onChange={(e) => handleInputChange('integrity_alignment', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm">10</span>
          <span className="ml-4 font-medium text-sage-700 min-w-[2ch]">
            {formData.integrity_alignment}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Heart className="inline w-4 h-4 mr-1" /> Authenticity in Role
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm">1</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.authenticity_in_role}
            onChange={(e) => handleInputChange('authenticity_in_role', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm">10</span>
          <span className="ml-4 font-medium text-sage-700 min-w-[2ch]">
            {formData.authenticity_in_role}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Compass className="inline w-4 h-4 mr-1" /> Ethical Clarity
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm">1</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.ethical_clarity}
            onChange={(e) => handleInputChange('ethical_clarity', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm">10</span>
          <span className="ml-4 font-medium text-sage-700 min-w-[2ch]">
            {formData.ethical_clarity}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <AlertCircle className="inline w-4 h-4 mr-1" /> Professional Boundaries
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm">1</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.professional_boundaries}
            onChange={(e) => handleInputChange('professional_boundaries', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm">10</span>
          <span className="ml-4 font-medium text-sage-700 min-w-[2ch]">
            {formData.professional_boundaries}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Target className="inline w-4 h-4 mr-1" /> Personal Peace
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm">1</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.personal_peace}
            onChange={(e) => handleInputChange('personal_peace', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm">10</span>
          <span className="ml-4 font-medium text-sage-700 min-w-[2ch]">
            {formData.personal_peace}
          </span>
        </div>
      </div>
    </div>
  );

  const renderClosingReflection = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What wisdom from this experience will guide your future practice?
        </label>
        <textarea
          value={formData.wisdom_gained}
          onChange={(e) => handleInputChange('wisdom_gained', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="Key lessons learned..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Write a compassionate message to yourself about navigating this challenge
        </label>
        <textarea
          value={formData.self_compassion_note}
          onChange={(e) => handleInputChange('self_compassion_note', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="Be kind to yourself..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Moving forward, what value will you prioritize and protect more carefully?
        </label>
        <textarea
          value={formData.priority_value}
          onChange={(e) => handleInputChange('priority_value', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="The value you'll guard most..."
        />
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6">
      <div className="bg-sage-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-sage-900 mb-4">Compass Check Summary</h3>
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
          {generateSummary()}
        </pre>
      </div>

      <div className="flex justify-between">
        <button
          onClick={copyToClipboard}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {copiedToClipboard ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Summary
            </>
          )}
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Complete Compass Check'}
        </button>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (currentSection) {
      case 0: return renderQuickInsight();
      case 1: return renderTheSituation();
      case 2: return renderValuesExploration();
      case 3: return renderDecisionProcess();
      case 4: return renderImpactConsequences();
      case 5: return renderRealignmentIntegration();
      case 6: return renderValuesAssessment();
      case 7: return renderClosingReflection();
      case 8: return renderSummary();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Compass Check</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-gray-600 mb-4">
            When faced with challenging decisions or difficult assignments, it's important to realign with your core values. This reflection helps you process ethical dilemmas and reconnect with what matters most to you.
          </p>

          <div className="flex space-x-2 mb-4">
            {sections.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  index < currentSection
                    ? 'bg-sage-600'
                    : index === currentSection
                    ? 'bg-sage-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <p className="text-sm text-sage-700 font-medium">
            {sections[currentSection]} ({currentSection + 1}/{sections.length})
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {renderSection()}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between">
            <button
              onClick={prevSection}
              disabled={currentSection === 0}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <button
              onClick={nextSection}
              disabled={currentSection === sections.length - 1 || !validateSection(currentSection)}
              className="flex items-center px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};