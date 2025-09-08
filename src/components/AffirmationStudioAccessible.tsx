import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Award,
  Zap,
  TrendingUp,
  Target,
  Shield,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Calendar,
  Share2,
  Clock
} from 'lucide-react';

interface AffirmationCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  affirmations: string[];
  reflection: string;
  actionableTips: Array<{
    challenge: string;
    tip: string;
  }>;
}

const affirmationCategories: AffirmationCategory[] = [
  {
    id: 'worth',
    title: 'Inherent Worth & Value',
    description: 'Gentle reminders of your fundamental value as a human being, independent of performance or achievement',
    icon: Heart,
    color: '#5C7F4F',
    bgColor: '#F0F5ED',
    borderColor: '#7A9B6E',
    affirmations: [
      "My worth is not determined by my productivity or how perfectly I perform my work.",
      "I am valuable simply because I exist, not because of what I produce or achieve.",
      "My humanity and dignity remain intact regardless of mistakes or imperfect performances.",
      "I deserve rest, joy, and peace regardless of today's accomplishments.",
      "My value as a person extends far beyond my professional role."
    ],
    reflection: "How can I remember my inherent worth today, separate from my work?",
    actionableTips: [
      {
        challenge: "Write down three things you value about yourself that have nothing to do with work",
        tip: "Think about your kindness, creativity, humor, or the way you care for others. These qualities exist whether you're working or not."
      },
      {
        challenge: "Set aside 10 minutes today for something that brings you joy, regardless of its productivity value",
        tip: "Listen to music, doodle, take a walk, or simply sit quietly. Joy for its own sake reinforces your inherent worth."
      },
      {
        challenge: "Practice receiving a compliment without deflecting or minimizing it",
        tip: "Simply say 'thank you' when someone acknowledges you. Let yourself absorb the recognition of your value."
      }
    ]
  },
  {
    id: 'wisdom',
    title: 'Professional Wisdom & Competence',
    description: 'Celebrating your skills, growth, and professional contributions',
    icon: Award,
    color: '#8B7355',
    bgColor: '#FFF9F0',
    borderColor: '#C4A57B',
    affirmations: [
      "Your thoughtful choices and dedication weave understanding between worlds. Every decision reflects a deep, growing wisdom.",
      "Your questions and openness nurture better communication for everyone. Seeking clarity is a sign of genuine insight and strength.",
      "By sharing our experiences and learning together, we lift each other up and strengthen the wisdom of our community.",
      "Each mindful reflection and new challenge helps your brain grow sharper and more adaptable—wisdom is built, one experience at a time.",
      "You lead with empathy and discernment, balancing confidence in your skills with compassion for yourself and others."
    ],
    reflection: "What professional skill or achievement am I most proud of today?",
    actionableTips: [
      {
        challenge: "Share one piece of professional wisdom with a colleague or peer today",
        tip: "Your experience has value. Sharing what you've learned helps others and reinforces your own expertise."
      },
      {
        challenge: "Document one successful problem-solving moment from your recent work",
        tip: "Write a brief note about how you handled a challenge. This creates a personal library of your competence."
      },
      {
        challenge: "Ask a thoughtful question in your next meeting or interaction",
        tip: "Asking good questions demonstrates wisdom. It shows you're thinking deeply and contributing to better outcomes."
      }
    ]
  },
  {
    id: 'resilience',
    title: 'Inner Strength & Resilience',
    description: 'Honoring your ability to weather storms and bounce back from difficulty',
    icon: Zap,
    color: '#7A8B9B',
    bgColor: '#F0F3F7',
    borderColor: '#9BADC4',
    affirmations: [
      "Your patience in tough moments matters, every small act of perseverance shapes a more resilient you.",
      "Seeking support or rest isn't weakness, it's wisdom in action. Every time you value your own needs, you nurture your growth and well-being.",
      "When challenges arise, remember, facing difficulty together makes our community more adaptable and compassionate.",
      "Each time you learn from a setback, your brain grows new pathways for courage and creative problem-solving, resilience is a skill you build every day.",
      "It's okay to have hard days. Showing up, even when it's tough, is a true act of inner strength, progress comes from kindness to yourself."
    ],
    reflection: "What challenge have I overcome recently that shows my resilience?",
    actionableTips: [
      {
        challenge: "Identify one coping strategy that worked for you recently and use it proactively today",
        tip: "Whether it's deep breathing, taking breaks, or reaching out to someone, use what works before stress builds up."
      },
      {
        challenge: "Acknowledge one difficult emotion without trying to fix or change it",
        tip: "Simply name what you're feeling: 'I notice I'm feeling frustrated.' Acknowledgment without judgment builds emotional resilience."
      },
      {
        challenge: "Do one small thing today that your future self will thank you for",
        tip: "Prepare tomorrow's lunch, organize your workspace, or send that email. Small acts of self-care compound into resilience."
      }
    ]
  },
  {
    id: 'growth',
    title: 'Continuous Growth & Learning',
    description: 'Celebrating your commitment to personal and professional development',
    icon: TrendingUp,
    color: '#6B8B90',
    bgColor: '#EFF5F6',
    borderColor: '#89B4BB',
    affirmations: [
      "Every effort you make to learn something new moves you forward, no matter how small the step is.",
      "Your curiosity and willingness to ask questions keep your mind flexible, every new skill or idea adds to your expertise.",
      "Mistakes and setbacks are a natural part of learning, each one gives your brain a chance to grow and adapt.",
      "Sharing your insights with others opens the door to new solutions and deeper understanding for everyone.",
      "Growth isn't a race, it's a journey unique to you. Progress comes from trying, reflecting, and showing up again and again."
    ],
    reflection: "What have I learned about myself through my work this week?",
    actionableTips: [
      {
        challenge: "Try one new approach or technique in your work today, no matter how small",
        tip: "Growth happens through experimentation. Even tiny changes keep your mind flexible and curious."
      },
      {
        challenge: "Write down one question you're curious about related to your field",
        tip: "Curiosity is the engine of growth. Identifying what you want to learn gives direction to your development."
      },
      {
        challenge: "Celebrate one learning moment from today, especially if it came from a mistake",
        tip: "Every error is data for growth. Acknowledge what you learned and how it will inform your future actions."
      }
    ]
  },
  {
    id: 'purpose',
    title: 'Purpose & Service',
    description: 'Connecting with deeper meaning and purpose in your work and life',
    icon: Target,
    color: '#8B6B8B',
    bgColor: '#F7F0F7',
    borderColor: '#B499B4',
    affirmations: [
      "My work creates bridges of understanding between people.",
      "I facilitate crucial conversations that change lives.",
      "My service makes healthcare, justice, and education accessible.",
      "I honor the trust placed in me by those who depend on my voice.",
      "My work has ripple effects I may never fully see but can trust exist."
    ],
    reflection: "How did my work make a positive difference today, even in small ways?",
    actionableTips: [
      {
        challenge: "Notice and appreciate one small positive impact you made today",
        tip: "Look for the subtle moments - a smile you created, a problem you solved, or clarity you provided. Small impacts accumulate into meaningful change."
      },
      {
        challenge: "Express gratitude to someone whose work impacts you",
        tip: "Recognize another's contribution today. The ripple effects of appreciation strengthen our collective purpose."
      },
      {
        challenge: "Document one way your work contributed to a larger goal",
        tip: "Connect your daily tasks to the bigger picture. Write down how today's efforts moved something important forward."
      }
    ]
  },
  {
    id: 'boundaries',
    title: 'Healthy Boundaries & Self-Care',
    description: 'Affirming your right to protect your energy, time, and wellbeing',
    icon: Shield,
    color: '#8B8B6B',
    bgColor: '#F7F7F0',
    borderColor: '#B4B499',
    affirmations: [
      "Taking time to care for yourself is not selfish, it helps you be present and authentic in every part of your life.",
      "Setting clear boundaries allows you and others to show up with respect and honesty, creating room for real connection.",
      "Listening to your own needs, whether for rest or space, helps you participate more fully in your own way and at your own pace.",
      "Saying no when you need to is an act of kindness to yourself and others, making it easier for everyone to communicate and understand each other.",
      "Your well-being matters to the whole community, every step you take towards self-care helps others feel safe to do the same."
    ],
    reflection: "What boundary do I need to set or maintain to protect my wellbeing?",
    actionableTips: [
      {
        challenge: "Implement one small act of self-care before the day ends",
        tip: "Choose something nurturing - a short walk, a healthy snack, or five minutes of quiet. Small acts of self-care reinforce your worth."
      },
      {
        challenge: "Practice one boundary-setting phrase today",
        tip: "Try: 'I need to check my schedule,' or 'Let me think about that.' Having phrases ready makes boundary-setting easier."
      },
      {
        challenge: "Schedule dedicated time for something that replenishes you",
        tip: "Block out time this week for an activity that restores your energy. Treat it as non-negotiable as any other commitment."
      }
    ]
  }
];

export const AffirmationStudioAccessible: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<AffirmationCategory | null>(null);
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showReflection, setShowReflection] = useState(false);
  const [dailyAffirmation, setDailyAffirmation] = useState<{ category: string; index: number } | null>(null);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  const [reflectionInput, setReflectionInput] = useState('');
  const [showActionableTip, setShowActionableTip] = useState(false);
  const [currentTip, setCurrentTip] = useState<{ challenge: string; tip: string } | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Load saved data from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('affirmationFavorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }

    const savedRecent = localStorage.getItem('recentAffirmations');
    if (savedRecent) {
      setRecentlyUsed(JSON.parse(savedRecent));
    }

    // Set daily affirmation based on date
    const today = new Date().toDateString();
    const savedDaily = localStorage.getItem('dailyAffirmation');
    if (savedDaily) {
      const parsed = JSON.parse(savedDaily);
      if (parsed.date === today) {
        setDailyAffirmation(parsed.affirmation);
      } else {
        generateDailyAffirmation();
      }
    } else {
      generateDailyAffirmation();
    }
  }, []);

  const generateDailyAffirmation = () => {
    const categoryIndex = Math.floor(Math.random() * affirmationCategories.length);
    const affirmationIndex = Math.floor(Math.random() * 5);
    const daily = { category: affirmationCategories[categoryIndex].id, index: affirmationIndex };
    
    setDailyAffirmation(daily);
    localStorage.setItem('dailyAffirmation', JSON.stringify({
      date: new Date().toDateString(),
      affirmation: daily
    }));
  };

  const handleSelectCategory = (category: AffirmationCategory) => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    setSelectedCategory(category);
    setCurrentAffirmationIndex(0);
    setShowReflection(false);

    // Track recently used
    const updated = [category.id, ...recentlyUsed.filter(id => id !== category.id)].slice(0, 3);
    setRecentlyUsed(updated);
    localStorage.setItem('recentAffirmations', JSON.stringify(updated));

    // Focus modal when opened
    setTimeout(() => {
      modalRef.current?.focus();
    }, 100);
  };

  const handleCompleteReflection = () => {
    if (reflectionInput.trim()) {
      // Select a random tip from the category
      const tips = selectedCategory?.actionableTips || [];
      if (tips.length > 0) {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        setCurrentTip(randomTip);
        setShowActionableTip(true);
      }
    }
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setShowReflection(false);
    setShowActionableTip(false);
    setReflectionInput('');
    setCurrentTip(null);
    // Return focus to previous element
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  };

  const toggleFavorite = (categoryId: string, affirmationIndex: number) => {
    const key = `${categoryId}-${affirmationIndex}`;
    const newFavorites = new Set(favorites);
    
    if (newFavorites.has(key)) {
      newFavorites.delete(key);
    } else {
      newFavorites.add(key);
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('affirmationFavorites', JSON.stringify(Array.from(newFavorites)));
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: `${text}\n\n- From InterpretReflect™`,
          title: 'Affirmation'
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Affirmation copied to clipboard!');
    }
  };

  const getDailyAffirmationText = () => {
    if (!dailyAffirmation) return null;
    const category = affirmationCategories.find(c => c.id === dailyAffirmation.category);
    if (!category) return null;
    return category.affirmations[dailyAffirmation.index];
  };

  return (
    <main aria-labelledby="studio-heading" className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <h2 id="studio-heading" className="text-3xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
          Affirmation & Reflection Studio
        </h2>
        <p className="text-lg" style={{ color: '#4A5568' }}>
          Gentle, conversational affirmations paired with thoughtful reflection. Use before, after, or anytime during your day.
        </p>
      </header>

      {/* Daily Affirmation Card */}
      <section
        aria-labelledby="daily-affirmation-heading"
        className="mb-8 p-6 rounded-2xl"
        style={{
          backgroundColor: '#F0F5ED',
          border: '2px solid #7A9B6E'
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 id="daily-affirmation-heading" className="flex items-center gap-2 text-xl font-bold mb-3" style={{ color: '#5C7F4F' }}>
              <Sparkles className="h-6 w-6" />
              Today's Affirmation
            </h3>
            {getDailyAffirmationText() && (
              <>
                <blockquote className="text-lg italic mb-4" style={{ color: '#2D3748' }}>
                  "{getDailyAffirmationText()}"
                </blockquote>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShare(getDailyAffirmationText()!)}
                    className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#5C7F4F',
                      border: '1px solid #7A9B6E'
                    }}
                    aria-label="Share today's affirmation"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <button
                    onClick={generateDailyAffirmation}
                    className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#5C7F4F',
                      border: '1px solid #7A9B6E'
                    }}
                    aria-label="Get new daily affirmation"
                  >
                    <RefreshCw className="h-4 w-4" />
                    New One
                  </button>
                </div>
              </>
            )}
          </div>
          <Calendar className="h-8 w-8" style={{ color: '#7A9B6E' }} aria-hidden="true" />
        </div>
      </section>

      {/* View Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'all' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-pressed={viewMode === 'all'}
          >
            All Categories
          </button>
          <button
            onClick={() => setViewMode('favorites')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewMode === 'favorites' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-pressed={viewMode === 'favorites'}
          >
            <BookmarkCheck className="h-4 w-4" />
            My Favorites ({favorites.size})
          </button>
        </div>
      </div>

      {/* Affirmation Categories Grid */}
      {viewMode === 'all' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {affirmationCategories.map((category) => {
          const Icon = category.icon;
          return (
            <section
              key={category.id}
              aria-labelledby={`${category.id}-heading`}
              className="rounded-xl p-6 transition-all hover:shadow-lg focus-within:shadow-lg"
              style={{
                backgroundColor: '#FFFFFF',
                border: `2px solid ${category.borderColor}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: category.bgColor }}
                  aria-hidden="true"
                >
                  <Icon className="h-6 w-6" style={{ color: category.color }} />
                </div>
                <div className="flex-1">
                  <h3 id={`${category.id}-heading`} className="text-lg font-bold mb-2" style={{ color: '#2D3748' }}>
                    {category.title}
                  </h3>
                  <p className="text-sm" style={{ color: '#4A5568' }}>
                    {category.description}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => handleSelectCategory(category)}
                className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: category.bgColor,
                  color: category.color,
                  focusRingColor: category.color
                }}
                aria-label={`View ${category.title} affirmations - ${category.affirmations.length} affirmations available`}
              >
                <span>5 affirmations</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </section>
          );
        })}
      </div>
      ) : (
        /* Favorites View */
        <div className="space-y-4">
          {favorites.size === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <BookmarkCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No favorites yet</h3>
              <p className="text-gray-600 mb-4">
                Click the bookmark icon on any affirmation to save it here
              </p>
              <button
                onClick={() => setViewMode('all')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Affirmations
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from(favorites).map((favoriteKey) => {
                const [categoryId, indexStr] = favoriteKey.split('-');
                const category = affirmationCategories.find(c => c.id === categoryId);
                const index = parseInt(indexStr);
                
                if (!category || isNaN(index)) return null;
                
                const Icon = category.icon;
                return (
                  <div
                    key={favoriteKey}
                    className="p-4 rounded-xl border-2 transition-all hover:shadow-lg"
                    style={{
                      backgroundColor: category.bgColor,
                      borderColor: category.borderColor
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" style={{ color: category.color }} />
                        <span className="text-sm font-medium" style={{ color: category.color }}>
                          {category.title}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleFavorite(categoryId, index)}
                        className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                        aria-label="Remove from favorites"
                      >
                        <BookmarkCheck className="h-4 w-4" style={{ color: category.color }} />
                      </button>
                    </div>
                    <blockquote className="text-sm italic" style={{ color: '#2D3748' }}>
                      "{category.affirmations[index]}"
                    </blockquote>
                    <button
                      onClick={() => handleSelectCategory(category)}
                      className="mt-3 text-xs font-medium hover:underline"
                      style={{ color: category.color }}
                    >
                      View in context →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Affirmation Modal */}
      {selectedCategory && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-heading"
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: selectedCategory.bgColor }}
                  >
                    <selectedCategory.icon className="h-6 w-6" style={{ color: selectedCategory.color }} />
                  </div>
                  <div>
                    <h3 id="modal-heading" className="text-xl font-bold" style={{ color: '#2D3748' }}>
                      {selectedCategory.title}
                    </h3>
                    <p className="text-sm" style={{ color: '#718096' }}>
                      Affirmation {currentAffirmationIndex + 1} of {selectedCategory.affirmations.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-50 rounded-lg transition-all"
                  aria-label="Close affirmation modal"
                >
                  <X className="h-5 w-5" style={{ color: '#4A5568' }} />
                </button>
              </div>

              {/* Affirmation Display */}
              {!showReflection ? (
                <>
                  <div
                    className="min-h-[200px] flex items-center justify-center px-8 py-12 rounded-xl mb-6"
                    style={{
                      backgroundColor: selectedCategory.bgColor,
                      border: `2px solid ${selectedCategory.borderColor}`
                    }}
                    role="region"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <blockquote className="text-xl text-center italic font-medium" style={{ color: selectedCategory.color }}>
                      "{selectedCategory.affirmations[currentAffirmationIndex]}"
                    </blockquote>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => toggleFavorite(selectedCategory.id, currentAffirmationIndex)}
                      className="p-3 rounded-lg transition-all"
                      style={{
                        backgroundColor: favorites.has(`${selectedCategory.id}-${currentAffirmationIndex}`) ? '#FFF9F0' : '#F7FAFC',
                        color: favorites.has(`${selectedCategory.id}-${currentAffirmationIndex}`) ? '#C4A57B' : '#718096'
                      }}
                      aria-label={favorites.has(`${selectedCategory.id}-${currentAffirmationIndex}`) ? 'Remove from favorites' : 'Add to favorites'}
                      aria-pressed={favorites.has(`${selectedCategory.id}-${currentAffirmationIndex}`)}
                    >
                      {favorites.has(`${selectedCategory.id}-${currentAffirmationIndex}`) ? (
                        <BookmarkCheck className="h-5 w-5" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleShare(selectedCategory.affirmations[currentAffirmationIndex])}
                      className="p-3 rounded-lg transition-all"
                      style={{
                        backgroundColor: '#F7FAFC',
                        color: '#718096'
                      }}
                      aria-label="Share this affirmation"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowReflection(true)}
                      className="flex-1 py-3 px-4 rounded-lg font-medium transition-all"
                      style={{
                        backgroundColor: selectedCategory.bgColor,
                        color: selectedCategory.color,
                        border: `1px solid ${selectedCategory.borderColor}`
                      }}
                    >
                      Reflect on This
                    </button>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setCurrentAffirmationIndex(prev => 
                          prev > 0 ? prev - 1 : selectedCategory.affirmations.length - 1
                        );
                      }}
                      className="p-3 rounded-full transition-all"
                      style={{
                        backgroundColor: '#F7FAFC',
                        color: '#4A5568'
                      }}
                      aria-label="Previous affirmation"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>

                    {/* Progress Dots */}
                    <div className="flex gap-2" role="tablist" aria-label="Affirmation navigation">
                      {selectedCategory.affirmations.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentAffirmationIndex(index)}
                          className="transition-all"
                          style={{
                            width: index === currentAffirmationIndex ? '32px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            backgroundColor: index === currentAffirmationIndex ? selectedCategory.color : '#CBD5E0'
                          }}
                          role="tab"
                          aria-selected={index === currentAffirmationIndex}
                          aria-label={`Go to affirmation ${index + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setCurrentAffirmationIndex(prev => 
                          prev < selectedCategory.affirmations.length - 1 ? prev + 1 : 0
                        );
                      }}
                      className="p-3 rounded-full transition-all"
                      style={{
                        backgroundColor: '#F7FAFC',
                        color: '#4A5568'
                      }}
                      aria-label="Next affirmation"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>
                </>
              ) : showActionableTip && currentTip ? (
                /* Actionable Tip View */
                <div>
                  <div
                    className="p-6 rounded-xl mb-6"
                    style={{
                      backgroundColor: selectedCategory.bgColor,
                      border: `2px solid ${selectedCategory.borderColor}`
                    }}
                  >
                    <div className="flex items-center mb-4">
                      <Sparkles className="h-6 w-6 mr-2" style={{ color: selectedCategory.color }} />
                      <h4 className="text-lg font-semibold" style={{ color: selectedCategory.color }}>
                        Your Gentle Challenge
                      </h4>
                    </div>
                    <p className="text-lg font-medium mb-4" style={{ color: '#2D3748' }}>
                      {currentTip.challenge}
                    </p>
                    <div className="border-t pt-4" style={{ borderColor: selectedCategory.borderColor }}>
                      <p className="text-base" style={{ color: '#4A5568' }}>
                        <strong>Tip:</strong> {currentTip.tip}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowActionableTip(false);
                        setShowReflection(false);
                        setReflectionInput('');
                        setCurrentTip(null);
                      }}
                      className="px-4 py-2 rounded-lg font-medium transition-all"
                      style={{
                        backgroundColor: '#F7FAFC',
                        color: '#4A5568'
                      }}
                    >
                      Back to Affirmations
                    </button>
                    <button
                      onClick={() => {
                        // Get another random tip
                        const tips = selectedCategory?.actionableTips || [];
                        const availableTips = tips.filter(tip => tip !== currentTip);
                        if (availableTips.length > 0) {
                          const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)];
                          setCurrentTip(randomTip);
                        }
                      }}
                      className="px-4 py-2 rounded-lg font-medium transition-all"
                      style={{
                        backgroundColor: selectedCategory.bgColor,
                        color: selectedCategory.color,
                        border: `1px solid ${selectedCategory.borderColor}`
                      }}
                    >
                      <RefreshCw className="h-4 w-4 inline mr-2" />
                      Try Another Tip
                    </button>
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 rounded-lg font-medium text-white transition-all"
                      style={{
                        backgroundColor: selectedCategory.color
                      }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Reflection View */
                <div>
                  <div
                    className="p-6 rounded-xl mb-6"
                    style={{
                      backgroundColor: selectedCategory.bgColor,
                      border: `2px solid ${selectedCategory.borderColor}`
                    }}
                  >
                    <h4 className="text-lg font-semibold mb-3" style={{ color: selectedCategory.color }}>
                      Reflection Prompt
                    </h4>
                    <p className="text-lg" style={{ color: '#2D3748' }}>
                      {selectedCategory.reflection}
                    </p>
                  </div>
                  
                  <textarea
                    className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{
                      borderColor: '#E2E8F0',
                      focusRingColor: selectedCategory.color
                    }}
                    rows={4}
                    placeholder="Take a moment to reflect..."
                    aria-label="Reflection notes"
                    value={reflectionInput}
                    onChange={(e) => setReflectionInput(e.target.value)}
                  />
                  
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setShowReflection(false)}
                      className="px-4 py-2 rounded-lg font-medium transition-all"
                      style={{
                        backgroundColor: '#F7FAFC',
                        color: '#4A5568'
                      }}
                    >
                      Back to Affirmations
                    </button>
                    <button
                      onClick={handleCompleteReflection}
                      className="flex-1 py-3 rounded-lg font-medium text-white transition-all"
                      style={{
                        backgroundColor: selectedCategory.color
                      }}
                      disabled={!reflectionInput.trim()}
                    >
                      Complete Reflection
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AffirmationStudioAccessible;