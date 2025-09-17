import React, { useState, useRef, useEffect } from 'react';
import { X, Heart, Brain, Shield, Sparkles, Users, Star, Anchor, Link, TreePine } from 'lucide-react';

interface AffirmationCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  affirmations: string[];
  color: string;
}

interface AffirmationReflectionStudioProps {
  onClose: () => void;
}

export const AffirmationReflectionStudio: React.FC<AffirmationReflectionStudioProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const categories: AffirmationCategory[] = [
    {
      id: 'worth-value',
      title: 'Inherent Worth & Value',
      description: 'Gentle reminders of your fundamental value as a human being, independent of performance or achievement.',
      icon: <Heart className="w-6 h-6" />,
      color: 'rose',
      affirmations: [
        'You are worthy simply because you exist.',
        'Your humanity is valuable, regardless of outcome.',
        'Your presence adds unique meaning to every space.',
        'Nothing you do or don\'t do erases your worth.',
        'You deserve respect—always—including from yourself.'
      ]
    },
    {
      id: 'professional-wisdom',
      title: 'Professional Wisdom & Competence',
      description: 'Celebrating your skills, growth, and professional contributions.',
      icon: <Brain className="w-6 h-6" />,
      color: 'blue',
      affirmations: [
        'Your skills and learning matter to those you serve.',
        'Each assignment helps you grow as a professional.',
        'Your judgment and training make a real-world difference.',
        'It\'s okay to ask for support; great professionals do.',
        'Pride in your work is a healthy, necessary thing.'
      ]
    },
    {
      id: 'inner-strength',
      title: 'Inner Strength & Resilience',
      description: 'Acknowledging your capacity to navigate challenges and grow.',
      icon: <Shield className="w-6 h-6" />,
      color: 'purple',
      affirmations: [
        'You\'ve handled difficult things before and will again.',
        'Your resilience grows stronger with each challenge.',
        'It\'s okay to rest; recovery is part of strength.',
        'You can set boundaries and still be compassionate.',
        'Your experiences have given you unique wisdom.'
      ]
    },
    {
      id: 'self-compassion',
      title: 'Self-Compassion & Kindness',
      description: 'Permission to be gentle with yourself and honor your humanity.',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'green',
      affirmations: [
        'You\'re allowed to make mistakes and learn from them.',
        'Being kind to yourself helps you be kind to others.',
        'Your feelings are valid and deserve acknowledgment.',
        'You don\'t have to be perfect to be valuable.',
        'Taking care of yourself is not selfish—it\'s necessary.'
      ]
    },
    {
      id: 'community-connection',
      title: 'Community & Connection',
      description: 'Recognizing your place in the interpreting community.',
      icon: <Users className="w-6 h-6" />,
      color: 'indigo',
      affirmations: [
        'You belong in the interpreting community.',
        'Your perspective adds value to our profession.',
        'Asking for help strengthens professional bonds.',
        'Your colleagues understand and support your journey.',
        'You contribute to something larger than yourself.'
      ]
    },
    {
      id: 'growth-potential',
      title: 'Growth & Potential',
      description: 'Embracing continuous learning and development.',
      icon: <Star className="w-6 h-6" />,
      color: 'yellow',
      affirmations: [
        'Every day brings opportunities to learn and grow.',
        'Your potential expands with each new experience.',
        'It\'s okay not to know everything yet.',
        'Your curiosity and openness are professional strengths.',
        'You\'re exactly where you need to be in your journey.'
      ]
    },
    {
      id: 'steadiness-presence',
      title: 'Steadiness & Presence',
      description: 'Affirmations for grounding, focus, and being fully present, no matter what arises.',
      icon: <Anchor className="w-6 h-6" />,
      color: 'teal',
      affirmations: [
        'In each moment, I am grounded and steady.',
        'My calm energy supports everyone in the interaction.',
        'I honor my focus, even if circumstances shift around me.',
        'Pausing is an act of strength and care.',
        'My awareness guides me to respond thoughtfully and fully.'
      ]
    },
    {
      id: 'connection-collaboration',
      title: 'Connection & Collaboration',
      description: 'Affirmations for recognizing the strength and diversity in all collaborative work.',
      icon: <Link className="w-6 h-6" />,
      color: 'orange',
      affirmations: [
        'I am enriched by every partnership I build.',
        'Understanding grows when we work together with trust.',
        'Diverse ways of expression bring out the best in the team.',
        'My openness encourages others to share their full selves.',
        'Each connection I make is unique and worthy of respect.'
      ]
    },
    {
      id: 'adaptability-growth',
      title: 'Adaptability & Growth',
      description: 'Affirmations for meeting change and challenge with curiosity and resilience.',
      icon: <TreePine className="w-6 h-6" />,
      color: 'emerald',
      affirmations: [
        'I adapt to new situations with flexibility and care.',
        'Every challenge is an opportunity for learning.',
        'I welcome change as a path to greater understanding.',
        'I trust in my ability to adjust and thrive.',
        'Growth happens in every experience—expected or not.'
      ]
    }
  ];

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeCategory) {
        closeDialog();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [activeCategory]);

  // Focus management for dialog
  useEffect(() => {
    if (activeCategory && dialogRef.current) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      dialogRef.current.focus();
    }
  }, [activeCategory]);

  const openDialog = (categoryId: string) => {
    setActiveCategory(categoryId);
    setFocusedIndex(0);
  };

  const closeDialog = () => {
    setActiveCategory(null);
    // Restore focus to the button that opened the dialog
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; hover: string; text: string; border: string }> = {
      rose: {
        bg: 'bg-rose-50',
        hover: 'hover:bg-rose-100',
        text: 'text-rose-600',
        border: 'border-rose-200'
      },
      blue: {
        bg: 'bg-blue-50',
        hover: 'hover:bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200'
      },
      purple: {
        bg: 'bg-purple-50',
        hover: 'hover:bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200'
      },
      green: {
        bg: 'bg-green-50',
        hover: 'hover:bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200'
      },
      indigo: {
        bg: 'bg-indigo-50',
        hover: 'hover:bg-indigo-100',
        text: 'text-indigo-600',
        border: 'border-indigo-200'
      },
      yellow: {
        bg: 'bg-yellow-50',
        hover: 'hover:bg-yellow-100',
        text: 'text-yellow-600',
        border: 'border-yellow-200'
      },
      teal: {
        bg: 'bg-teal-50',
        hover: 'hover:bg-teal-100',
        text: 'text-teal-600',
        border: 'border-teal-200'
      },
      orange: {
        bg: 'bg-orange-50',
        hover: 'hover:bg-orange-100',
        text: 'text-orange-600',
        border: 'border-orange-200'
      },
      emerald: {
        bg: 'bg-emerald-50',
        hover: 'hover:bg-emerald-100',
        text: 'text-emerald-600',
        border: 'border-emerald-200'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  const activeDialogCategory = categories.find(c => c.id === activeCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <main 
        id="affirmation-studio-main" 
        aria-labelledby="affirmation-studio-heading"
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 id="affirmation-studio-heading" className="text-2xl font-bold text-gray-900">
              Affirmation & Reflection Studio
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Gentle, conversational affirmations paired with thoughtful reflection
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close affirmation studio"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <p className="text-gray-700 mb-8">
            Use anytime to nurture your relationship with yourself and your interpreting practice. 
            Each category contains affirmations designed to support your wellbeing and professional growth.
          </p>

          <section 
            id="affirmation-categories" 
            aria-label="Affirmation Categories" 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {categories.map((category) => {
              const colors = getColorClasses(category.color);
              return (
                <article 
                  key={category.id}
                  className={`affirmation-card rounded-xl p-6 border-2 transition-all ${colors.bg} ${colors.border} ${colors.hover}`}
                  aria-labelledby={`${category.id}-heading`}
                >
                  <div className={`inline-flex p-3 rounded-lg ${colors.bg} mb-4`}>
                    <div className={colors.text}>{category.icon}</div>
                  </div>
                  
                  <h3 id={`${category.id}-heading`} className="text-lg font-semibold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  
                  <p className="affirmation-desc text-sm text-gray-600 mb-4">
                    {category.description}
                  </p>
                  
                  <button
                    className={`affirmation-btn w-full px-4 py-2 rounded-lg font-medium transition-all ${colors.text} ${colors.bg} ${colors.hover} border ${colors.border}`}
                    aria-haspopup="dialog"
                    aria-controls={`${category.id}-dialog`}
                    aria-label={`View affirmations for ${category.title}`}
                    onClick={() => openDialog(category.id)}
                    style={{ minHeight: '44px' }}
                  >
                    {category.affirmations.length} affirmations
                  </button>
                </article>
              );
            })}
          </section>

          {/* Reflection Prompt Section */}
          <section className="mt-12 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reflection Prompt
            </h3>
            <p className="text-gray-700 mb-4">
              After reading your affirmations, take a moment to reflect:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Which affirmation resonates most with you today?</li>
              <li>• What would change if you truly believed these words?</li>
              <li>• How can you carry one of these affirmations with you today?</li>
              <li>• What evidence from your experience supports these truths?</li>
            </ul>
          </section>
        </div>

        {/* Affirmation Dialog */}
        {activeCategory && activeDialogCategory && (
          <div
            id={`${activeCategory}-dialog`}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${activeCategory}-dialog-heading`}
            aria-describedby={`${activeCategory}-desc`}
          >
            <div
              ref={dialogRef}
              role="document"
              className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-8 m-4"
              tabIndex={-1}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  <div className={`${getColorClasses(activeDialogCategory.color).text} mr-3`}>
                    {activeDialogCategory.icon}
                  </div>
                  <h4 id={`${activeCategory}-dialog-heading`} className="text-xl font-bold text-gray-900">
                    {activeDialogCategory.title} Affirmations
                  </h4>
                </div>
                <button
                  ref={closeButtonRef}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label="Close affirmation dialog"
                  onClick={closeDialog}
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <ol className="space-y-4 mb-8">
                {activeDialogCategory.affirmations.map((affirmation, index) => (
                  <li 
                    key={index}
                    className={`p-4 rounded-lg transition-all ${
                      focusedIndex === index 
                        ? `${getColorClasses(activeDialogCategory.color).bg} ${getColorClasses(activeDialogCategory.color).border} border-2` 
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-gray-900 leading-relaxed">
                      {affirmation}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Take a moment to let these words settle in your heart.
                </p>
                <button
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  aria-label="Close affirmation dialog"
                  onClick={closeDialog}
                  style={{ minHeight: '44px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};