import React, { useEffect, useState } from 'react';
import {
  Cloud,
  CloudRain,
  Sun,
  CloudSnow,
  Wind,
  Users,
  TrendingUp,
  TrendingDown,
  Heart,
  AlertTriangle,
  Zap,
  Shield,
  Award,
  Activity
} from 'lucide-react';
import {
  generateEmotionalWeatherMap,
  identifyPositiveInfluencers,
  detectEmotionalContagion,
  subscribeToTeamEmotions,
  type TeamEmotionalWeather,
  type PositiveInfluencer,
  type ContagionAnalysis
} from '../services/emotionalContagionService';
import { useAuth } from '../contexts/AuthContext';

export function EmotionalWeatherMap() {
  const { user } = useAuth();
  const [weatherMap, setWeatherMap] = useState<{
    teams: TeamEmotionalWeather[];
    org_climate: string;
    interventions_needed: number;
  } | null>(null);
  const [influencers, setInfluencers] = useState<PositiveInfluencer[]>([]);
  const [contagionEvents, setContagionEvents] = useState<ContagionAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [realTimeAlert, setRealTimeAlert] = useState<{
    type: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadWeatherData();
      
      // Subscribe to real-time emotional events
      const unsubscribe = subscribeToTeamEmotions(
        user.user_metadata?.team_id || 'default',
        (event) => {
          if (event.type === 'intervention_needed') {
            setRealTimeAlert({
              type: 'warning',
              message: event.data.message
            });
            // Refresh weather map
            loadWeatherData();
          } else if (event.type === 'positive_spread') {
            setRealTimeAlert({
              type: 'success',
              message: event.data.message
            });
          }
        }
      );

      return () => unsubscribe();
    }
  }, [user]);

  const loadWeatherData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    // Load weather map
    const weatherResult = await generateEmotionalWeatherMap(
      user.user_metadata?.org_id || 'default'
    );
    
    if (weatherResult.success && weatherResult.data) {
      setWeatherMap({
        teams: weatherResult.data.teams,
        org_climate: weatherResult.data.org_climate,
        interventions_needed: weatherResult.data.interventions_needed
      });
    }

    // Load positive influencers
    const influencerResult = await identifyPositiveInfluencers(
      user.user_metadata?.team_id || 'default'
    );
    
    if (influencerResult.success && influencerResult.data) {
      setInfluencers(influencerResult.data);
    }

    // Load recent contagion events
    const contagionResult = await detectEmotionalContagion(
      user.user_metadata?.team_id || 'default'
    );
    
    if (contagionResult.success && contagionResult.data) {
      setContagionEvents(contagionResult.data);
    }

    setLoading(false);
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny': return Sun;
      case 'partly_cloudy': return Cloud;
      case 'cloudy': return CloudRain;
      case 'stormy': return CloudSnow;
      default: return Wind;
    }
  };

  const getWeatherColor = (weather: string) => {
    switch (weather) {
      case 'sunny': return '#FFD700';
      case 'partly_cloudy': return '#87CEEB';
      case 'cloudy': return '#778899';
      case 'stormy': return '#4B0082';
      default: return '#98D8C8';
    }
  };

  const getClimateStatus = (climate: string) => {
    switch (climate) {
      case 'healthy':
        return { color: '#10B981', text: 'Healthy Climate', icon: Heart };
      case 'stable':
        return { color: '#3B82F6', text: 'Stable Climate', icon: Shield };
      case 'caution':
        return { color: '#F59E0B', text: 'Caution Advised', icon: AlertTriangle };
      case 'alert':
        return { color: '#EF4444', text: 'Alert Status', icon: Zap };
      default:
        return { color: '#6B7280', text: 'Unknown', icon: Activity };
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="flex items-center justify-center">
          <Wind className="h-6 w-6 animate-spin" style={{ color: '#6B8B60' }} />
          <span className="ml-2">Analyzing emotional weather patterns...</span>
        </div>
      </div>
    );
  }

  if (!weatherMap) {
    return null;
  }

  const climateStatus = getClimateStatus(weatherMap.org_climate);
  const ClimateIcon = climateStatus.icon;

  return (
    <div className="space-y-6">
      {/* Real-time Alert */}
      {realTimeAlert && (
        <div
          className="rounded-xl p-4 flex items-start space-x-3 animate-pulse"
          style={{
            backgroundColor: realTimeAlert.type === 'warning' ? '#FEF3C7' : '#D1FAE5',
            border: `1px solid ${realTimeAlert.type === 'warning' ? '#F59E0B' : '#10B981'}`
          }}
        >
          {realTimeAlert.type === 'warning' ? (
            <AlertTriangle className="h-5 w-5" style={{ color: '#F59E0B' }} />
          ) : (
            <Heart className="h-5 w-5" style={{ color: '#10B981' }} />
          )}
          <p className="text-sm font-medium">{realTimeAlert.message}</p>
        </div>
      )}

      {/* Organization Climate Overview */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: `linear-gradient(135deg, ${climateStatus.color}20 0%, #FFFFFF 100%)`,
          border: `2px solid ${climateStatus.color}30`
        }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
              Emotional Weather Map
            </h2>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Real-time emotional climate across your organization
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <ClimateIcon className="h-8 w-8" style={{ color: climateStatus.color }} />
            <div className="text-right">
              <p className="font-bold" style={{ color: climateStatus.color }}>
                {climateStatus.text}
              </p>
              {weatherMap.interventions_needed > 0 && (
                <p className="text-xs" style={{ color: '#6B7280' }}>
                  {weatherMap.interventions_needed} teams need support
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Team Weather Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {weatherMap.teams.map((team, index) => {
            const WeatherIcon = getWeatherIcon(team.weather);
            const weatherColor = getWeatherColor(team.weather);
            
            return (
              <button
                key={team.team_id}
                onClick={() => setSelectedTeam(team.team_id)}
                className="rounded-xl p-4 transition-all hover:scale-105"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: `2px solid ${selectedTeam === team.team_id ? weatherColor : '#E5E7EB'}`,
                  boxShadow: selectedTeam === team.team_id 
                    ? `0 4px 12px ${weatherColor}40` 
                    : '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <div className="flex flex-col items-center">
                  <WeatherIcon 
                    className="h-10 w-10 mb-2" 
                    style={{ color: weatherColor }} 
                  />
                  <p className="text-xs font-semibold" style={{ color: '#1A1A1A' }}>
                    Team {index + 1}
                  </p>
                  <p className="text-xs capitalize" style={{ color: weatherColor }}>
                    {team.weather.replace('_', ' ')}
                  </p>
                </div>
                
                {/* Emotion indicators */}
                <div className="mt-2 flex justify-center space-x-1">
                  {team.emotions.slice(0, 3).map((emotion, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: emotion.emotion.includes('positive') 
                          ? '#10B981' 
                          : emotion.emotion.includes('negative')
                          ? '#EF4444'
                          : '#6B7280',
                        opacity: emotion.strength
                      }}
                    />
                  ))}
                </div>
                
                {team.interventionNeeded && (
                  <div className="mt-2">
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: '#FEF3C7',
                        color: '#92400E'
                      }}
                    >
                      Support Needed
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Emotional Contagion Patterns */}
        {contagionEvents.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A1A1A' }}>
              Active Emotional Contagion
            </h3>
            <div className="space-y-2">
              {contagionEvents.slice(0, 3).map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{
                    backgroundColor: event.risk_level === 'critical' ? '#FEE2E2' :
                                   event.risk_level === 'high' ? '#FEF3C7' :
                                   '#F3F4F6'
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      {event.emotion.includes('positive') ? (
                        <TrendingUp className="h-4 w-4" style={{ color: '#10B981' }} />
                      ) : (
                        <TrendingDown className="h-4 w-4" style={{ color: '#EF4444' }} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                        {event.emotion.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>
                        Spreading to {event.spread_count} people
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs font-semibold" style={{ 
                      color: event.risk_level === 'critical' ? '#DC2626' :
                             event.risk_level === 'high' ? '#F59E0B' : '#6B7280'
                    }}>
                      {event.risk_level.toUpperCase()}
                    </p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      {event.contagion_rate * 100}% rate
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Positive Influencers */}
        {influencers.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A1A1A' }}>
              Wellness Champions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {influencers.slice(0, 4).map((influencer) => (
                <div
                  key={influencer.influencer_hash}
                  className="flex items-center space-x-3 p-3 rounded-lg"
                  style={{
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #86EFAC'
                  }}
                >
                  <Award className="h-5 w-5" style={{ color: '#16A34A' }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                      {influencer.displayName}
                    </p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      Positive influence: {influencer.influence_score.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold" style={{ color: '#16A34A' }}>
                      +{influencer.positive_spread_count}
                    </p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      spread
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Research Insights */}
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: '#F9FAFB',
          border: '1px solid #E5E7EB'
        }}
      >
        <div className="flex items-center space-x-2 mb-2">
          <Activity className="h-4 w-4" style={{ color: '#6B7280' }} />
          <h4 className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
            Nobel-Worthy Research Data
          </h4>
        </div>
        <p className="text-xs" style={{ color: '#6B7280' }}>
          Tracking emotional contagion patterns across {weatherMap.teams.length} teams. 
          This data enables predictive interventions and team wellness optimization worth $100K-1M/year.
        </p>
      </div>
    </div>
  );
}