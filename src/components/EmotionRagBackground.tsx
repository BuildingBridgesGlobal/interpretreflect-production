import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { 
  Palette, 
  Eye, 
  EyeOff, 
  Info,
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Moon,
  Wind,
  Sparkles,
  Heart
} from 'lucide-react';

// Emotion color mappings with accessibility in mind
export const emotionThemes = {
  calm: {
    name: 'Calm',
    icon: Sun,
    primary: '#E8F5E9',
    secondary: '#C8E6C9',
    tertiary: '#A5D6A7',
    gradient: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)',
    radial: 'radial-gradient(circle at 30% 50%, #E8F5E9 0%, transparent 60%)',
    pattern: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(200, 230, 201, 0.1) 35px, rgba(200, 230, 201, 0.1) 70px)',
    textColor: '#1B5E20',
    description: 'Your mind is clear and peaceful',
    accessibility: 'Light green background indicating calm emotional state'
  },
  anxious: {
    name: 'Anxious',
    icon: Cloud,
    primary: '#FFF3E0',
    secondary: '#FFE0B2',
    tertiary: '#FFCC80',
    gradient: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 50%, #FFCC80 100%)',
    radial: 'radial-gradient(circle at 70% 30%, #FFF3E0 0%, transparent 60%)',
    pattern: 'repeating-linear-gradient(-45deg, transparent, transparent 30px, rgba(255, 224, 178, 0.1) 30px, rgba(255, 224, 178, 0.1) 60px)',
    textColor: '#E65100',
    description: 'Feeling some tension - breathe deeply',
    accessibility: 'Light orange background indicating anxious emotional state'
  },
  stressed: {
    name: 'Stressed',
    icon: CloudRain,
    primary: '#FFEBEE',
    secondary: '#FFCDD2',
    tertiary: '#EF9A9A',
    gradient: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 50%, #EF9A9A 100%)',
    radial: 'radial-gradient(circle at 50% 50%, #FFEBEE 0%, transparent 70%)',
    pattern: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255, 205, 210, 0.1) 40px, rgba(255, 205, 210, 0.1) 80px)',
    textColor: '#C62828',
    description: 'High stress detected - consider a reset',
    accessibility: 'Light red background indicating stressed emotional state'
  },
  energized: {
    name: 'Energized',
    icon: Zap,
    primary: '#E3F2FD',
    secondary: '#BBDEFB',
    tertiary: '#90CAF9',
    gradient: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)',
    radial: 'radial-gradient(circle at 20% 80%, #E3F2FD 0%, transparent 60%)',
    pattern: 'repeating-linear-gradient(120deg, transparent, transparent 25px, rgba(187, 222, 251, 0.1) 25px, rgba(187, 222, 251, 0.1) 50px)',
    textColor: '#0D47A1',
    description: 'Full of positive energy',
    accessibility: 'Light blue background indicating energized emotional state'
  },
  exhausted: {
    name: 'Exhausted',
    icon: Moon,
    primary: '#F3E5F5',
    secondary: '#E1BEE7',
    tertiary: '#CE93D8',
    gradient: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 50%, #CE93D8 100%)',
    radial: 'radial-gradient(circle at 80% 20%, #F3E5F5 0%, transparent 60%)',
    pattern: 'repeating-linear-gradient(180deg, transparent, transparent 45px, rgba(225, 190, 231, 0.1) 45px, rgba(225, 190, 231, 0.1) 90px)',
    textColor: '#6A1B9A',
    description: 'Low energy - time for self-care',
    accessibility: 'Light purple background indicating exhausted emotional state'
  },
  focused: {
    name: 'Focused',
    icon: Wind,
    primary: '#E0F2F1',
    secondary: '#B2DFDB',
    tertiary: '#80CBC4',
    gradient: 'linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 50%, #80CBC4 100%)',
    radial: 'radial-gradient(circle at 40% 60%, #E0F2F1 0%, transparent 60%)',
    pattern: 'repeating-linear-gradient(60deg, transparent, transparent 32px, rgba(178, 223, 219, 0.1) 32px, rgba(178, 223, 219, 0.1) 64px)',
    textColor: '#00695C',
    description: 'In the zone - great concentration',
    accessibility: 'Light teal background indicating focused emotional state'
  },
  overwhelmed: {
    name: 'Overwhelmed',
    icon: CloudRain,
    primary: '#FBE9E7',
    secondary: '#FFCCBC',
    tertiary: '#FFAB91',
    gradient: 'linear-gradient(135deg, #FBE9E7 0%, #FFCCBC 50%, #FFAB91 100%)',
    radial: 'radial-gradient(circle at 60% 40%, #FBE9E7 0%, transparent 70%)',
    pattern: 'repeating-linear-gradient(135deg, transparent, transparent 38px, rgba(255, 204, 188, 0.1) 38px, rgba(255, 204, 188, 0.1) 76px)',
    textColor: '#D84315',
    description: 'Feeling overwhelmed - break needed',
    accessibility: 'Light coral background indicating overwhelmed emotional state'
  },
  accomplished: {
    name: 'Accomplished',
    icon: Sparkles,
    primary: '#F1F8E9',
    secondary: '#DCEDC8',
    tertiary: '#AED581',
    gradient: 'linear-gradient(135deg, #F1F8E9 0%, #DCEDC8 50%, #AED581 100%)',
    radial: 'radial-gradient(circle at 25% 75%, #F1F8E9 0%, transparent 60%)',
    pattern: 'repeating-linear-gradient(270deg, transparent, transparent 42px, rgba(220, 237, 200, 0.1) 42px, rgba(220, 237, 200, 0.1) 84px)',
    textColor: '#558B2F',
    description: 'Feeling accomplished and proud',
    accessibility: 'Light yellow-green background indicating accomplished emotional state'
  },
  neutral: {
    name: 'Neutral',
    icon: Heart,
    primary: '#FAFAFA',
    secondary: '#F5F5F5',
    tertiary: '#EEEEEE',
    gradient: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 50%, #EEEEEE 100%)',
    radial: 'radial-gradient(circle at 50% 50%, #FAFAFA 0%, transparent 60%)',
    pattern: 'none',
    textColor: '#424242',
    description: 'Balanced emotional state',
    accessibility: 'Light gray background indicating neutral emotional state'
  }
};

// Type definitions
export type EmotionType = keyof typeof emotionThemes;

interface EmotionData {
  emotion: EmotionType;
  timestamp: Date;
  intensity: number; // 1-10
  source: 'reflection' | 'reset' | 'check-in' | 'manual';
}

interface EmotionRagContextType {
  currentEmotion: EmotionType;
  emotionHistory: EmotionData[];
  isEnabled: boolean;
  animationSpeed: 'slow' | 'medium' | 'fast' | 'none';
  patternEnabled: boolean;
  setCurrentEmotion: (emotion: EmotionType, source?: EmotionData['source']) => void;
  toggleEnabled: () => void;
  setAnimationSpeed: (speed: 'slow' | 'medium' | 'fast' | 'none') => void;
  togglePattern: () => void;
  clearHistory: () => void;
}

// Context for managing emotion state globally
const EmotionRagContext = createContext<EmotionRagContextType | undefined>(undefined);

export const useEmotionRag = () => {
  const context = useContext(EmotionRagContext);
  if (!context) {
    throw new Error('useEmotionRag must be used within EmotionRagProvider');
  }
  return context;
};

// Provider component
export function EmotionRagProvider({ children }: { children: React.ReactNode }) {
  const [currentEmotion, setCurrentEmotionState] = useState<EmotionType>('neutral');
  const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([]);
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem('emotionRagEnabled');
    return saved !== 'false';
  });
  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'medium' | 'fast' | 'none'>(() => {
    const saved = localStorage.getItem('emotionRagAnimationSpeed');
    return (saved as any) || 'medium';
  });
  const [patternEnabled, setPatternEnabled] = useState(() => {
    const saved = localStorage.getItem('emotionRagPatternEnabled');
    return saved !== 'false';
  });

  const setCurrentEmotion = (emotion: EmotionType, source: EmotionData['source'] = 'manual') => {
    setCurrentEmotionState(emotion);
    setEmotionHistory(prev => [...prev, {
      emotion,
      timestamp: new Date(),
      intensity: 5,
      source
    }].slice(-50)); // Keep last 50 entries
  };

  const toggleEnabled = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('emotionRagEnabled', String(newState));
  };

  const togglePattern = () => {
    const newState = !patternEnabled;
    setPatternEnabled(newState);
    localStorage.setItem('emotionRagPatternEnabled', String(newState));
  };

  const clearHistory = () => {
    setEmotionHistory([]);
    setCurrentEmotionState('neutral');
  };

  useEffect(() => {
    localStorage.setItem('emotionRagAnimationSpeed', animationSpeed);
  }, [animationSpeed]);

  const value = {
    currentEmotion,
    emotionHistory,
    isEnabled,
    animationSpeed,
    patternEnabled,
    setCurrentEmotion,
    toggleEnabled,
    setAnimationSpeed,
    togglePattern,
    clearHistory
  };

  return (
    <EmotionRagContext.Provider value={value}>
      {children}
    </EmotionRagContext.Provider>
  );
}

// Main background component
export function EmotionRagBackground({ 
  children, 
  className = '',
  showControls = true,
  showIndicator = true
}: {
  children: React.ReactNode;
  className?: string;
  showControls?: boolean;
  showIndicator?: boolean;
}) {
  const { 
    currentEmotion, 
    isEnabled, 
    animationSpeed, 
    patternEnabled,
    toggleEnabled, 
    setAnimationSpeed,
    togglePattern 
  } = useEmotionRag();

  const theme = emotionThemes[currentEmotion];
  
  const animationDuration = useMemo(() => {
    switch (animationSpeed) {
      case 'slow': return '3s';
      case 'medium': return '1.5s';
      case 'fast': return '0.5s';
      case 'none': return '0s';
      default: return '1.5s';
    }
  }, [animationSpeed]);

  return (
    <div 
      className={`emotion-rag-container ${className}`}
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: isEnabled ? theme.gradient : 'var(--bg-primary)',
        transition: animationSpeed !== 'none' ? `background ${animationDuration} ease-in-out` : 'none'
      }}
      aria-label={isEnabled ? theme.accessibility : 'Emotion background disabled'}
      role="region"
    >
      {/* Overlay patterns for subtle texture */}
      {isEnabled && patternEnabled && (
        <>
          <div 
            className="emotion-overlay-1"
            style={{
              position: 'absolute',
              inset: 0,
              background: theme.radial,
              opacity: 0.6,
              pointerEvents: 'none',
              mixBlendMode: 'multiply',
              transition: `opacity ${animationDuration} ease-in-out`
            }}
            aria-hidden="true"
          />
          <div 
            className="emotion-overlay-2"
            style={{
              position: 'absolute',
              inset: 0,
              background: theme.pattern,
              opacity: 0.3,
              pointerEvents: 'none',
              transition: `opacity ${animationDuration} ease-in-out`
            }}
            aria-hidden="true"
          />
        </>
      )}

      {/* Emotion Indicator */}
      {showIndicator && isEnabled && (
        <EmotionIndicator theme={theme} />
      )}

      {/* Accessibility Controls */}
      {showControls && (
        <EmotionControls 
          isEnabled={isEnabled}
          animationSpeed={animationSpeed}
          patternEnabled={patternEnabled}
          toggleEnabled={toggleEnabled}
          setAnimationSpeed={setAnimationSpeed}
          togglePattern={togglePattern}
          theme={theme}
        />
      )}

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
}

// Emotion indicator component
function EmotionIndicator({ theme }: { theme: typeof emotionThemes[EmotionType] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = theme.icon;

  return (
    <div 
      className="emotion-indicator"
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 50,
        transition: 'all 0.3s ease'
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="emotion-indicator-button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-card)',
          border: `2px solid ${theme.textColor}20`,
          borderRadius: isExpanded ? '1rem 1rem 0 0' : '2rem',
          boxShadow: 'var(--shadow-lg)',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        aria-expanded={isExpanded}
        aria-label={`Current wellness color: ${theme.name}. ${theme.description}. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
      >
        <Icon 
          size={20} 
          style={{ color: theme.textColor }}
          aria-hidden="true"
        />
        <span style={{ color: theme.textColor, fontWeight: 500 }}>
          {theme.name}
        </span>
        <Palette 
          size={16} 
          style={{ 
            color: theme.textColor,
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}
          aria-hidden="true"
        />
      </button>
      
      {isExpanded && (
        <div 
          className="emotion-details"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            backgroundColor: 'var(--bg-card)',
            border: `2px solid ${theme.textColor}20`,
            borderTop: 'none',
            borderRadius: '0 0 1rem 1rem',
            padding: '1rem',
            minWidth: '250px',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.875rem',
            marginBottom: '0.5rem'
          }}>
            Your current wellness color:
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            backgroundColor: theme.primary,
            borderRadius: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              background: theme.gradient,
              border: `2px solid ${theme.textColor}40`
            }} />
            <div>
              <p style={{ 
                color: theme.textColor, 
                fontWeight: 600,
                fontSize: '1rem'
              }}>
                {theme.name}
              </p>
              <p style={{ 
                color: theme.textColor, 
                fontSize: '0.75rem',
                opacity: 0.8
              }}>
                {theme.description}
              </p>
            </div>
          </div>
          <p style={{ 
            color: 'var(--text-tertiary)', 
            fontSize: '0.75rem',
            fontStyle: 'italic'
          }}>
            <Info size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Changes reflect your recent check-ins
          </p>
        </div>
      )}
    </div>
  );
}

// Accessibility controls component
function EmotionControls({ 
  isEnabled, 
  animationSpeed, 
  patternEnabled,
  toggleEnabled, 
  setAnimationSpeed,
  togglePattern,
  theme 
}: {
  isEnabled: boolean;
  animationSpeed: 'slow' | 'medium' | 'fast' | 'none';
  patternEnabled: boolean;
  toggleEnabled: () => void;
  setAnimationSpeed: (speed: 'slow' | 'medium' | 'fast' | 'none') => void;
  togglePattern: () => void;
  theme: typeof emotionThemes[EmotionType];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="emotion-controls"
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        zIndex: 50
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="emotion-controls-toggle"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          backgroundColor: 'var(--bg-card)',
          border: '2px solid var(--border-default)',
          borderRadius: '0.5rem',
          boxShadow: 'var(--shadow-md)',
          cursor: 'pointer'
        }}
        aria-expanded={isOpen}
        aria-label="Emotion background accessibility controls"
      >
        {isEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
        <span style={{ fontSize: '0.875rem' }}>Background: {isEnabled ? 'On' : 'Off'}</span>
      </button>

      {isOpen && (
        <div 
          className="emotion-controls-panel"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: '0.5rem',
            backgroundColor: 'var(--bg-card)',
            border: '2px solid var(--border-default)',
            borderRadius: '0.75rem',
            padding: '1rem',
            minWidth: '280px',
            boxShadow: 'var(--shadow-lg)'
          }}
          role="region"
          aria-label="Emotion background settings"
        >
          <h3 style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            marginBottom: '0.75rem',
            color: 'var(--text-primary)'
          }}>
            Accessibility Settings
          </h3>

          {/* Enable/Disable Toggle */}
          <div style={{ marginBottom: '0.75rem' }}>
            <button
              onClick={toggleEnabled}
              style={{
                width: '100%',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: isEnabled ? theme.primary : 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
              aria-pressed={isEnabled}
            >
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                Emotion Background
              </span>
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: isEnabled ? 'var(--success-600)' : 'var(--neutral-400)',
                color: 'white',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 500
              }}>
                {isEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Animation Speed */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.75rem', 
              color: 'var(--text-secondary)',
              marginBottom: '0.25rem'
            }}>
              Animation Speed
            </label>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {(['none', 'slow', 'medium', 'fast'] as const).map(speed => (
                <button
                  key={speed}
                  onClick={() => setAnimationSpeed(speed)}
                  style={{
                    flex: 1,
                    padding: '0.375rem',
                    fontSize: '0.75rem',
                    backgroundColor: animationSpeed === speed ? 'var(--primary-600)' : 'var(--bg-secondary)',
                    color: animationSpeed === speed ? 'white' : 'var(--text-primary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                  aria-pressed={animationSpeed === speed}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* Pattern Toggle */}
          <div>
            <button
              onClick={togglePattern}
              style={{
                width: '100%',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: patternEnabled ? theme.secondary : 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
              aria-pressed={patternEnabled}
            >
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                Background Patterns
              </span>
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: patternEnabled ? 'var(--info-600)' : 'var(--neutral-400)',
                color: 'white',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 500
              }}>
                {patternEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          <p style={{
            marginTop: '0.75rem',
            fontSize: '0.6875rem',
            color: 'var(--text-tertiary)',
            fontStyle: 'italic'
          }}>
            Adjust for sensory comfort
          </p>
        </div>
      )}
    </div>
  );
}

// Hook to update emotion from other components
export function useEmotionUpdate() {
  const { setCurrentEmotion } = useEmotionRag();
  
  // Analyze emotion from reflection data
  const analyzeEmotion = (data: any): EmotionType => {
    // Simple algorithm - in production, use more sophisticated analysis
    if (data.stressLevel > 7) return 'stressed';
    if (data.energyLevel > 7) return 'energized';
    if (data.energyLevel < 3) return 'exhausted';
    if (data.focusLevel > 7) return 'focused';
    if (data.anxietyLevel > 6) return 'anxious';
    if (data.accomplishmentFeeling) return 'accomplished';
    if (data.overwhelmLevel > 6) return 'overwhelmed';
    return 'calm';
  };

  return {
    updateFromReflection: (reflectionData: any) => {
      const emotion = analyzeEmotion(reflectionData);
      setCurrentEmotion(emotion, 'reflection');
    },
    updateFromReset: (resetType: string) => {
      // Different resets might lead to different emotions
      const emotionMap: Record<string, EmotionType> = {
        'breathing': 'calm',
        'body-check': 'focused',
        'assignment-reset': 'neutral',
        'boundary-reset': 'accomplished'
      };
      setCurrentEmotion(emotionMap[resetType] || 'calm', 'reset');
    },
    updateManual: (emotion: EmotionType) => {
      setCurrentEmotion(emotion, 'manual');
    }
  };
}