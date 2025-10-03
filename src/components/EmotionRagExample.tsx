import React, { useState } from 'react';
import { 
  EmotionRagBackground, 
  EmotionRagProvider, 
  useEmotionUpdate,
  useEmotionRag,
  emotionThemes,
  EmotionType
} from './EmotionRagBackground';
import { 
  Heart, 
  Brain, 
  Activity, 
  BarChart3,
  RefreshCw,
  Smile,
  CloudRain,
  Zap,
  Coffee
} from 'lucide-react';

// Example Reflection Studio integration
function ReflectionStudioWithEmotion() {
  const { updateFromReflection, updateManual } = useEmotionUpdate();
  const { currentEmotion } = useEmotionRag();
  const [reflectionData, setReflectionData] = useState({
    stressLevel: 5,
    energyLevel: 5,
    focusLevel: 5,
    anxietyLevel: 5
  });

  const handleReflectionSubmit = () => {
    // Update emotion based on reflection data
    updateFromReflection(reflectionData);
    
    // Save reflection data (simplified)
    console.log('Reflection saved:', reflectionData);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--primary-900)' }}>
        Reflection Studio
      </h1>
      
      {/* Current Emotion Display */}
      <div 
        className="mb-6 p-4 rounded-lg"
        style={{
          backgroundColor: emotionThemes[currentEmotion].primary,
          border: `2px solid ${emotionThemes[currentEmotion].textColor}20`
        }}
      >
        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
          Your current wellness color:
        </p>
        <div className="flex items-center gap-3">
          <div 
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              background: emotionThemes[currentEmotion].gradient
            }}
          />
          <div>
            <span className="font-semibold" style={{ color: emotionThemes[currentEmotion].textColor }}>
              {emotionThemes[currentEmotion].name}
            </span>
            <span className="text-sm ml-2" style={{ color: emotionThemes[currentEmotion].textColor, opacity: 0.8 }}>
              - {emotionThemes[currentEmotion].description}
            </span>
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
          This background changes based on your reflections and check-ins
        </p>
      </div>

      {/* Reflection Sliders */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Stress Level: {reflectionData.stressLevel}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={reflectionData.stressLevel}
            onChange={(e) => setReflectionData({...reflectionData, stressLevel: parseInt(e.target.value)})}
            className="w-full"
            style={{
              accentColor: reflectionData.stressLevel > 7 ? 'var(--error-600)' : 
                          reflectionData.stressLevel > 4 ? 'var(--warning-600)' : 'var(--success-600)'
            }}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Energy Level: {reflectionData.energyLevel}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={reflectionData.energyLevel}
            onChange={(e) => setReflectionData({...reflectionData, energyLevel: parseInt(e.target.value)})}
            className="w-full"
            style={{
              accentColor: reflectionData.energyLevel > 7 ? 'var(--success-600)' : 
                          reflectionData.energyLevel > 4 ? 'var(--warning-600)' : 'var(--error-600)'
            }}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Focus Level: {reflectionData.focusLevel}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={reflectionData.focusLevel}
            onChange={(e) => setReflectionData({...reflectionData, focusLevel: parseInt(e.target.value)})}
            className="w-full"
            style={{ accentColor: 'var(--info-600)' }}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Anxiety Level: {reflectionData.anxietyLevel}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={reflectionData.anxietyLevel}
            onChange={(e) => setReflectionData({...reflectionData, anxietyLevel: parseInt(e.target.value)})}
            className="w-full"
            style={{
              accentColor: reflectionData.anxietyLevel > 7 ? 'var(--error-600)' : 
                          reflectionData.anxietyLevel > 4 ? 'var(--warning-600)' : 'var(--success-600)'
            }}
          />
        </div>
      </div>

      <button
        onClick={handleReflectionSubmit}
        className="w-full py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
        style={{
          backgroundColor: 'var(--primary-700)',
          color: 'var(--text-inverse)'
        }}
      >
        Submit Reflection & Update Background
      </button>

      {/* Quick Emotion Selection */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--primary-900)' }}>
          Quick Emotion Update
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(emotionThemes).slice(0, 9).map(([key, theme]) => {
            const Icon = theme.icon;
            return (
              <button
                key={key}
                onClick={() => updateManual(key as EmotionType)}
                className="p-3 rounded-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: theme.primary,
                  border: `2px solid ${theme.textColor}20`
                }}
                aria-label={`Set emotion to ${theme.name}`}
              >
                <Icon size={24} style={{ color: theme.textColor, margin: '0 auto 0.5rem' }} />
                <div className="text-sm font-medium" style={{ color: theme.textColor }}>
                  {theme.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Example Growth Insights integration
function GrowthInsightsWithEmotion() {
  const { currentEmotion, emotionHistory } = useEmotionRag();
  const { updateFromReset } = useEmotionUpdate();

  // Calculate emotion trends
  const emotionCounts = emotionHistory.reduce((acc, item) => {
    acc[item.emotion] = (acc[item.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantEmotion = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--primary-900)' }}>
        Growth Insights Dashboard
      </h1>

      {/* Emotion Trend Card */}
      <div 
        className="mb-6 p-6 rounded-2xl"
        style={{
          backgroundColor: 'var(--bg-card)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--primary-900)' }}>
            Emotional Climate Trends
          </h2>
          <Heart className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Current vs Dominant */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Current State
              </span>
              <div 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: emotionThemes[currentEmotion].primary,
                  color: emotionThemes[currentEmotion].textColor
                }}
              >
                {emotionThemes[currentEmotion].name}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Today's Dominant
              </span>
              <div 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: emotionThemes[dominantEmotion as EmotionType]?.primary || 'var(--neutral-100)',
                  color: emotionThemes[dominantEmotion as EmotionType]?.textColor || 'var(--text-primary)'
                }}
              >
                {emotionThemes[dominantEmotion as EmotionType]?.name || 'Neutral'}
              </div>
            </div>
          </div>

          {/* Emotion History */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Recent Emotions ({emotionHistory.length} check-ins)
            </h3>
            <div className="flex flex-wrap gap-2">
              {emotionHistory.slice(-6).map((item, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-full"
                  style={{
                    background: emotionThemes[item.emotion].gradient,
                    border: `2px solid ${emotionThemes[item.emotion].textColor}40`
                  }}
                  title={`${emotionThemes[item.emotion].name} - ${item.source}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Wellness Actions */}
        <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: emotionThemes[currentEmotion].primary }}>
          <p className="text-sm font-medium mb-3" style={{ color: emotionThemes[currentEmotion].textColor }}>
            Recommended actions based on your {emotionThemes[currentEmotion].name.toLowerCase()} state:
          </p>
          <div className="flex gap-3">
            {currentEmotion === 'stressed' && (
              <>
                <button
                  onClick={() => updateFromReset('breathing')}
                  className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--primary-700)'
                  }}
                >
                  <RefreshCw size={16} className="inline mr-2" />
                  Try Breathing Exercise
                </button>
                <button
                  onClick={() => updateFromReset('body-check')}
                  className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--primary-700)'
                  }}
                >
                  <Activity size={16} className="inline mr-2" />
                  Body Check-In
                </button>
              </>
            )}
            {currentEmotion === 'exhausted' && (
              <>
                <button
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--primary-700)'
                  }}
                >
                  <Coffee size={16} className="inline mr-2" />
                  Take a Break
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--primary-700)'
                  }}
                >
                  <Zap size={16} className="inline mr-2" />
                  Energy Boost Exercise
                </button>
              </>
            )}
            {(currentEmotion === 'calm' || currentEmotion === 'focused') && (
              <div className="flex items-center gap-2" style={{ color: emotionThemes[currentEmotion].textColor }}>
                <Smile size={20} />
                <span className="font-medium">You're in a great state! Keep it up!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Regular dashboard content continues... */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Sample metric cards */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
          <BarChart3 className="h-8 w-8 mb-3" style={{ color: 'var(--primary-600)' }} />
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Weekly Progress</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Background adapts to your emotional journey
          </p>
        </div>
        
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
          <Brain className="h-8 w-8 mb-3" style={{ color: 'var(--accent-700)' }} />
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Pattern Detection</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            AI learns your emotional patterns
          </p>
        </div>
        
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
          <Heart className="h-8 w-8 mb-3" style={{ color: 'var(--error-600)' }} />
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Wellness Score</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Visual cues support self-awareness
          </p>
        </div>
      </div>
    </div>
  );
}

// Main Example App
export function EmotionRagExample() {
  const [view, setView] = useState<'reflection' | 'insights'>('reflection');

  return (
    <EmotionRagProvider>
      <EmotionRagBackground showControls={true} showIndicator={true}>
        {/* Navigation */}
        <nav className="p-4 mb-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
          <div className="max-w-6xl mx-auto flex gap-4">
            <button
              onClick={() => setView('reflection')}
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: view === 'reflection' ? 'var(--primary-700)' : 'transparent',
                color: view === 'reflection' ? 'var(--text-inverse)' : 'var(--text-primary)'
              }}
            >
              Reflection Studio
            </button>
            <button
              onClick={() => setView('insights')}
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: view === 'insights' ? 'var(--primary-700)' : 'transparent',
                color: view === 'insights' ? 'var(--text-inverse)' : 'var(--text-primary)'
              }}
            >
              Growth Insights
            </button>
          </div>
        </nav>

        {/* Content */}
        {view === 'reflection' ? <ReflectionStudioWithEmotion /> : <GrowthInsightsWithEmotion />}

        {/* User Instructions */}
        <div 
          className="max-w-4xl mx-auto mt-8 p-6 rounded-2xl"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--primary-900)' }}>
            How the Emotion Background Works
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li>• The background color subtly changes to reflect your current emotional state</li>
            <li>• Colors update automatically when you submit reflections or complete resets</li>
            <li>• Use the controls in the bottom-left to adjust animation speed or disable if needed</li>
            <li>• The indicator in the top-right shows your current wellness color</li>
            <li>• All features are fully accessible with ARIA labels and keyboard navigation</li>
            <li>• Users with sensory sensitivities can disable or customize the experience</li>
          </ul>
        </div>
      </EmotionRagBackground>
    </EmotionRagProvider>
  );
}