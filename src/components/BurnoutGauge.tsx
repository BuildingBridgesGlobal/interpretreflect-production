import React, { useState, useEffect } from 'react';
import { AlertTriangle, Battery, BatteryLow, Heart, TrendingUp, TrendingDown } from 'lucide-react';

interface BurnoutGaugeProps {
  onTakeGauge: () => void;
  lastScore?: number | null;
  lastDate?: string | null;
}

export const BurnoutGauge: React.FC<BurnoutGaugeProps> = ({ 
  onTakeGauge, 
  lastScore, 
  lastDate 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getGaugeColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    if (score >= 4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getGaugeMessage = (score: number) => {
    if (score >= 8) return { text: 'High energy - You\'re in a good place!', icon: <Heart className="w-5 h-5" /> };
    if (score >= 6) return { text: 'Moderate energy - Monitor your wellbeing', icon: <Battery className="w-5 h-5" /> };
    if (score >= 4) return { text: 'Low energy - Consider a wellness check-in', icon: <BatteryLow className="w-5 h-5" /> };
    return { text: 'Very low energy - Prioritize self-care today', icon: <AlertTriangle className="w-5 h-5" /> };
  };

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const hasCompletedToday = lastDate && isToday(lastDate);
  const gaugeInfo = lastScore ? getGaugeMessage(lastScore) : null;
  const gaugeColor = lastScore ? getGaugeColor(lastScore) : 'text-gray-500 bg-gray-100';

  return (
    <section 
      id="burnout-gauge-card" 
      className={`bg-white rounded-lg shadow-md border-2 border-blue-200 overflow-hidden transition-all duration-300 ${
        isExpanded ? 'max-h-96' : 'max-h-64'
      } sticky top-4 z-10`}
      aria-labelledby="burnout-gauge-heading"
    >
      <div className="p-6">
        <h2 id="burnout-gauge-heading" className="text-xl font-bold mb-4 flex items-center justify-between">
          <span className="flex items-center">
            <Battery className="mr-2 text-blue-600" size={24} />
            Daily Burnout Gauge
          </span>
          {lastScore && (
            <span className={`text-sm px-3 py-1 rounded-full ${gaugeColor}`}>
              {lastScore}/10
            </span>
          )}
        </h2>

        <div className="gauge-summary space-y-4">
          {hasCompletedToday ? (
            <>
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-700">Today's Energy Level</p>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                  aria-expanded={isExpanded}
                  aria-controls="gauge-details"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              </div>

              {/* Visual Gauge */}
              <div className="gauge-visual" aria-label={`Energy level: ${lastScore} out of 10`}>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 flex items-center justify-center text-white font-semibold ${
                      lastScore! >= 8 ? 'bg-[rgba(107,130,104,0.05)]0' :
                      lastScore! >= 6 ? 'bg-yellow-500' :
                      lastScore! >= 4 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${(lastScore! / 10) * 100}%` }}
                  >
                    <span aria-live="polite" className="text-sm">{lastScore}/10</span>
                  </div>
                </div>
              </div>

              {gaugeInfo && (
                <div className={`flex items-center space-x-2 p-3 rounded-md ${gaugeColor}`}>
                  {gaugeInfo.icon}
                  <p className="text-sm font-medium">{gaugeInfo.text}</p>
                </div>
              )}

              {isExpanded && (
                <div id="gauge-details" className="space-y-3 pt-3 border-t border-gray-200">
                  <h3 className="font-medium text-gray-700">Quick Actions</h3>
                  {lastScore! < 6 && (
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        className="text-sm bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 transition-colors"
                        style={{ minHeight: '44px' }}
                      >
                        Wellness Check-in
                      </button>
                      <button 
                        className="text-sm bg-green-100 text-green-700 px-3 py-2 rounded hover:bg-green-200 transition-colors"
                        style={{ minHeight: '44px' }}
                      >
                        Breathing Exercise
                      </button>
                      <button 
                        className="text-sm bg-purple-100 text-purple-700 px-3 py-2 rounded hover:bg-purple-200 transition-colors"
                        style={{ minHeight: '44px' }}
                      >
                        Body Scan
                      </button>
                      <button 
                        className="text-sm bg-orange-100 text-orange-700 px-3 py-2 rounded hover:bg-orange-200 transition-colors"
                        style={{ minHeight: '44px' }}
                      >
                        Connect with Peer
                      </button>
                    </div>
                  )}
                  <button
                    onClick={onTakeGauge}
                    className="w-full text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Retake gauge
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-gray-700">
                <strong>How are you feeling today?</strong>
              </p>
              <p className="text-sm text-gray-600">
                Take a quick moment to check in with your energy and wellbeing.
              </p>
              <button
                onClick={onTakeGauge}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                aria-label="Take today's burnout gauge"
                style={{ minHeight: '44px' }}
              >
                Take Burnout Gauge
              </button>
            </>
          )}

          {/* Nudge based on score */}
          {hasCompletedToday && lastScore! < 6 && (
            <p className="gauge-nudge text-sm text-gray-600 italic flex items-center">
              {lastScore! < 4 ? (
                <>
                  <AlertTriangle className="mr-1 text-orange-500" size={16} />
                  Priority: Schedule a wellness check-in today →
                </>
              ) : (
                <>
                  <TrendingDown className="mr-1 text-yellow-500" size={16} />
                  Low energy? Try a Wellness Check-in →
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Mobile-responsive collapse indicator */}
      <div className="md:hidden bg-gray-50 px-4 py-2 text-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-gray-500 hover:text-gray-700"
          aria-label={isExpanded ? 'Collapse gauge' : 'Expand gauge'}
        >
          {isExpanded ? '▲ Less' : '▼ More'}
        </button>
      </div>
    </section>
  );
};