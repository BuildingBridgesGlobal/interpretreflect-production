import React, { useState } from 'react';
import LandingPage from './LandingPage';
import { useAuth } from './contexts/AuthContext';
import { 
  Home, 
  BookOpen, 
  RefreshCw, 
  MessageCircle, 
  TrendingUp, 
  Target, 
  Shield, 
  Heart, 
  Clock, 
  Users, 
  Lightbulb, 
  Settings, 
 
  ChevronDown, 
  Globe, 
  User, 
  Gauge, 
  Sparkles, 
  Square, 
  Waves, 
  Thermometer, 
  Eye, 
  Mountain, 
  Space as Peace, 
  Brain, 
  ArrowLeft, 
  Star, 
  Activity, 
  BarChart3, 
  Triangle, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  ChevronRight,
  Lock,
  Database,
  Settings as SettingsIcon,
  Download,
  X
} from 'lucide-react';

function App() {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('reflection');
  const [activeCategory, setActiveCategory] = useState('structured');
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showElyaModal, setShowElyaModal] = useState(false);
  const [insightsTimePeriod, setInsightsTimePeriod] = useState('month');
  const [showPrivacyPage, setShowPrivacyPage] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const renderGrowthInsights = () => (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main" aria-labelledby="growth-insights-heading">
      <div className="space-y-8">
        {/* Header with time period tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 id="growth-insights-heading" className="text-4xl font-bold mb-2" style={{color: '#1A1A1A', letterSpacing: '-0.5px'}}>
                Growth Insights
              </h1>
              <p className="text-base" style={{color: '#3A3A3A'}}>
                Past Month: 31 total reflections
              </p>
            </div>
            
            <nav className="flex space-x-2 p-2 rounded-xl" role="tablist" aria-label="Time period selector" style={{backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'}}>
              <button 
                onClick={() => setInsightsTimePeriod('week')}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
                role="tab"
                aria-selected={insightsTimePeriod === 'week'}
                aria-controls="insights-panel"
                aria-label="View past week insights"
                style={{
                  backgroundColor: insightsTimePeriod === 'week' ? '#A8C09A' : 'transparent',
                  color: insightsTimePeriod === 'week' ? '#FFFFFF' : '#1A1A1A'
                }}
                onMouseEnter={(e) => {
                  if (insightsTimePeriod !== 'week') {
                    e.currentTarget.style.backgroundColor = 'rgba(168, 192, 154, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (insightsTimePeriod !== 'week') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Past Week
              </button>
              <button 
                onClick={() => setInsightsTimePeriod('month')}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
                role="tab"
                aria-selected={insightsTimePeriod === 'month'}
                aria-controls="insights-panel"
                aria-label="View past month insights"
                style={{
                  backgroundColor: insightsTimePeriod === 'month' ? '#A8C09A' : 'transparent',
                  color: insightsTimePeriod === 'month' ? '#FFFFFF' : '#1A1A1A'
                }}
                onMouseEnter={(e) => {
                  if (insightsTimePeriod !== 'month') {
                    e.currentTarget.style.backgroundColor = 'rgba(168, 192, 154, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (insightsTimePeriod !== 'month') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Past Month
              </button>
              <button 
                onClick={() => setInsightsTimePeriod('90days')}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
                role="tab"
                aria-selected={insightsTimePeriod === '90days'}
                aria-controls="insights-panel"
                aria-label="View past 90 days insights"
                style={{
                  backgroundColor: insightsTimePeriod === '90days' ? '#A8C09A' : 'transparent',
                  color: insightsTimePeriod === '90days' ? '#FFFFFF' : '#1A1A1A'
                }}
                onMouseEnter={(e) => {
                  if (insightsTimePeriod !== '90days') {
                    e.currentTarget.style.backgroundColor = 'rgba(168, 192, 154, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (insightsTimePeriod !== '90days') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Past 90 Days
              </button>
            </nav>
          </div>
        </div>

        {/* Stress & Energy Chart */}
        <section className="rounded-2xl p-8" aria-labelledby="stress-energy-chart-heading" style={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 10px 30px rgba(168, 192, 154, 0.15), 0 2px 8px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(168, 192, 154, 0.2)'
        }}>
          <div className="flex items-center justify-between mb-6">
            <h2 id="stress-energy-chart-heading" className="text-2xl font-bold" style={{color: '#1A1A1A'}}>
              Your Stress & Energy Over Time
            </h2>
            <button className="text-sm font-medium flex items-center px-4 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
              aria-label="View stress and energy data by assignment" 
              style={{
                color: '#A8C09A',
                backgroundColor: 'rgba(168, 192, 154, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 192, 154, 0.2)';
                e.currentTarget.style.color = '#2D5F3F';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 192, 154, 0.1)';
                e.currentTarget.style.color = '#A8C09A';
              }}
            >
              View by assignment →
            </button>
          </div>
          
          {/* Chart area with mock data visualization */}
          <div className="rounded-xl p-6 h-80 relative" role="img" aria-label="Line chart showing stress and energy levels over the past month with reset day markers" style={{backgroundColor: '#FAFAF8', border: '1px solid #E8E5E0'}}>
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-4">
              <span>10</span>
              <span>8</span>
              <span>6</span>
              <span>4</span>
              <span>2</span>
              <span>0</span>
            </div>
            
            {/* Chart content area */}
            <div className="ml-8 mr-4 h-full flex items-end justify-between relative">
              {/* Mock chart lines - simplified representation */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" role="presentation" aria-hidden="true">
                {/* Stress line (red) */}
                <polyline
                  points="0,120 20,115 40,110 60,125 80,135 100,130 120,140 140,135 160,125 180,130 200,120 220,115 240,110 260,105 280,120 300,125 320,130 340,135 360,140 380,145 400,150"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                />
                {/* Energy line (blue) */}
                <polyline
                  points="0,160 20,155 40,150 60,140 80,125 100,120 120,115 140,125 160,130 180,135 200,140 220,150 240,160 260,170 280,165 300,160 320,155 340,150 360,145 380,140 400,135"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                {/* Reset day markers (green dots) */}
                <circle cx="100" cy="130" r="3" fill="#10b981" />
                <circle cx="200" cy="140" r="3" fill="#10b981" />
                <circle cx="300" cy="160" r="3" fill="#10b981" />
                <circle cx="380" cy="140" r="3" fill="#10b981" />
              </svg>
            </div>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-8 right-4 flex justify-between text-xs text-gray-500 mt-2">
              <span>30</span>
              <span>31</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>
              <span>10</span>
              <span>11</span>
              <span>12</span>
              <span>13</span>
              <span>14</span>
              <span>15</span>
              <span>16</span>
              <span>17</span>
              <span>18</span>
              <span>19</span>
              <span>20</span>
              <span>21</span>
              <span>22</span>
              <span>23</span>
              <span>24</span>
              <span>25</span>
              <span>26</span>
              <span>27</span>
              <span>28</span>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-400">Stress</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-400">Energy</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-400">Reset Day</span>
            </div>
          </div>
        </section>

        {/* Reset Toolkit Insights */}
        <div>
          <div className="flex items-center mb-6">
            <div className="p-2 rounded-lg mr-3" style={{backgroundColor: 'rgba(168, 192, 154, 0.15)'}}>
              <Lightbulb className="h-5 w-5" aria-hidden="true" style={{color: '#A8C09A'}} />
            </div>
            <h2 className="text-2xl font-bold" style={{color: '#1A1A1A'}}>
              Your Reset Toolkit Insights
            </h2>
            <span className="text-sm ml-auto" style={{color: '#6B7C6B'}}>
              12 total uses • 3 this week
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl p-5 transition-all" style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #A8C09A',
              boxShadow: '0 4px 12px rgba(168, 192, 154, 0.2)'
            }}>
              <div className="flex items-center text-sm font-semibold mb-2" style={{color: '#2D5F3F'}}>
                <Star className="h-4 w-4 mr-2" aria-hidden="true" style={{color: '#A8C09A'}} />
                Most Effective
              </div>
              <div className="text-2xl font-bold mb-1" style={{color: '#1A1A1A'}}>Box Breathing</div>
              <div className="text-sm" style={{color: '#2D5F3F'}}>-2.5 avg stress reduction</div>
            </div>
            
            <div className="rounded-xl p-5 transition-all" style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #87CEEB',
              boxShadow: '0 4px 12px rgba(135, 206, 235, 0.2)'
            }}>
              <div className="flex items-center text-sm font-semibold mb-2" style={{color: '#4682B4'}}>
                <Activity className="h-4 w-4 mr-2" aria-hidden="true" style={{color: '#87CEEB'}} />
                Overall Completion
              </div>
              <div className="text-2xl font-bold mb-1" style={{color: '#1A1A1A'}}>83%</div>
              <div className="text-sm" style={{color: '#4682B4'}}>across all techniques</div>
            </div>
            
            <div className="rounded-xl p-5 transition-all" style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #C8B8DB',
              boxShadow: '0 4px 12px rgba(200, 184, 219, 0.2)'
            }}>
              <div className="flex items-center text-sm font-semibold mb-2" style={{color: '#8B7AA8'}}>
                <BarChart3 className="h-4 w-4 mr-2" aria-hidden="true" style={{color: '#C8B8DB'}} />
                Avg Stress Relief
              </div>
              <div className="text-2xl font-bold mb-1" style={{color: '#1A1A1A'}}>-1.9</div>
              <div className="text-sm" style={{color: '#8B7AA8'}}>stress points per reset</div>
            </div>
            
            <div className="rounded-xl p-5 transition-all" style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #F4A460',
              boxShadow: '0 4px 12px rgba(244, 164, 96, 0.2)'
            }}>
              <div className="flex items-center text-sm font-semibold mb-2" style={{color: '#D2691E'}}>
                <Triangle className="h-4 w-4 mr-2" aria-hidden="true" style={{color: '#F4A460'}} />
                Try Next
              </div>
              <div className="text-2xl font-bold mb-1" style={{color: '#1A1A1A'}}>Box Breathing</div>
              <div className="text-sm" style={{color: '#D2691E'}}>90% confidence</div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Row 1 */}
          <article className="rounded-xl p-5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600" 
            tabIndex={0}
            role="region"
            aria-label="Closed Loops metric"
            style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E8E5E0'
          }}>
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-lg mr-2" style={{backgroundColor: 'rgba(135, 206, 235, 0.15)'}}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" style={{color: '#87CEEB'}} />
              </div>
              <span className="text-sm font-semibold" style={{color: '#4682B4'}}>Closed Loops</span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{color: '#2D5F3F'}}>78%</div>
            <div className="text-xs" style={{color: '#3A3A3A', lineHeight: '1.4'}}>
              Finished a Pre + Post within 48h<br/>
              Based on post entries (n=23)
            </div>
          </article>
          
          <article className="rounded-xl p-5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            tabIndex={0}
            role="region"
            aria-label="Stress Change metric"
            style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E8E5E0'
          }}>
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-lg mr-2" style={{backgroundColor: 'rgba(168, 192, 154, 0.15)'}}>
                <TrendingUp className="h-4 w-4" aria-hidden="true" style={{color: '#A8C09A'}} />
              </div>
              <span className="text-sm font-semibold" style={{color: '#2D5F3F'}}>Stress Change</span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{color: '#2D5F3F'}}>-1.8</div>
            <div className="text-xs" style={{color: '#3A3A3A', lineHeight: '1.4'}}>
              Post stress vs Pre (lower is better)<br/>
              Based on paired assignments (n=18)
            </div>
          </article>
          
          <article className="rounded-xl p-5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            tabIndex={0}
            role="region"
            aria-label="Stress Change metric"
            style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E8E5E0'
          }}>
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-lg mr-2" style={{backgroundColor: 'rgba(135, 206, 235, 0.15)'}}>
                <CheckCircle className="h-4 w-4" aria-hidden="true" style={{color: '#87CEEB'}} />
              </div>
              <span className="text-sm font-semibold" style={{color: '#4682B4'}}>Recovery Score</span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{color: '#2D5F3F'}}>72%</div>
            <div className="text-xs" style={{color: '#3A3A3A', lineHeight: '1.4'}}>
              Consistency of small resets<br/>
              Based on reflections (n=31)
            </div>
          </article>
          
          <article className="rounded-xl p-5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            tabIndex={0}
            role="region"
            aria-label="Stress Change metric"
            style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E8E5E0'
          }}>
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-lg mr-2" style={{backgroundColor: 'rgba(244, 164, 96, 0.15)'}}>
                <Target className="h-4 w-4" aria-hidden="true" style={{color: '#F4A460'}} />
              </div>
              <span className="text-sm font-semibold" style={{color: '#D2691E'}}>Plan Use</span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{color: '#D2691E'}}>65%</div>
            <div className="text-xs" style={{color: '#3A3A3A', lineHeight: '1.4'}}>
              Reflections with an If-Then plan<br/>
              Based on reflections (n=31)
            </div>
          </article>
          
          {/* Row 2 */}
          <article className="rounded-xl p-5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            tabIndex={0}
            role="region"
            aria-label="Team Plan Kept metric"
            style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E8E5E0'
          }}>
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-lg mr-2" style={{backgroundColor: 'rgba(168, 192, 154, 0.15)'}}>
                <Users className="h-4 w-4" aria-hidden="true" style={{color: '#A8C09A'}} />
              </div>
              <span className="text-sm font-semibold" style={{color: '#2D5F3F'}}>Team Plan Kept</span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{color: '#2D5F3F'}}>88%</div>
            <div className="text-xs" style={{color: '#3A3A3A', lineHeight: '1.4'}}>
              Agreements held vs drift<br/>
              Based on team reflections (n=12)
            </div>
          </article>
          
          <article className="rounded-xl p-5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            tabIndex={0}
            role="region"
            aria-label="Stress Change metric"
            style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E8E5E0'
          }}>
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-lg mr-2" style={{backgroundColor: 'rgba(255, 182, 193, 0.15)'}}>
                <AlertTriangle className="h-4 w-4" aria-hidden="true" style={{color: '#F08080'}} />
              </div>
              <span className="text-sm font-semibold" style={{color: '#CD5C5C'}}>Boundaries + Plan</span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{color: '#1A1A1A'}}>8</div>
            <div className="text-xs" style={{color: '#3A3A3A', lineHeight: '1.4'}}>
              Compass entries with a phrase + plan<br/>
              Based on Compass entries (n=8)
            </div>
          </article>
          
          <article className="rounded-xl p-5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            tabIndex={0}
            role="region"
            aria-label="Stress Change metric"
            style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E8E5E0'
          }}>
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-lg mr-2" style={{backgroundColor: 'rgba(255, 223, 0, 0.15)'}}>
                <Zap className="h-4 w-4" aria-hidden="true" style={{color: '#FFD700'}} />
              </div>
              <span className="text-sm font-semibold" style={{color: '#DAA520'}}>Average Energy</span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{color: '#DAA520'}}>6.5</div>
            <div className="text-xs" style={{color: '#3A3A3A', lineHeight: '1.4'}}>
              Typical energy level<br/>
              Based on reflections (n=31)
            </div>
          </article>
          
          <article className="rounded-xl p-5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            tabIndex={0}
            role="region"
            aria-label="Stress Change metric"
            style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E8E5E0',
            opacity: '0.6'
          }}>
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-lg mr-2" style={{backgroundColor: 'rgba(192, 192, 192, 0.15)'}}>
                <Gauge className="h-4 w-4" aria-hidden="true" style={{color: '#A9A9A9'}} />
              </div>
              <span className="text-sm font-semibold" style={{color: '#808080'}}>Burnout Gauge</span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{color: '#A9A9A9'}}>—</div>
            <div className="text-xs" style={{color: '#A9A9A9', lineHeight: '1.4'}}>
              Daily assessment<br/>
              Based on reflections (n=0)
            </div>
          </article>
        </div>

        {/* Bottom section boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Recovery Habits */}
          <section className="rounded-2xl p-6" aria-labelledby="recovery-habits-heading" style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
            border: '1px solid #E8E5E0'
          }}>
            <h3 id="recovery-habits-heading" className="text-lg font-bold mb-5" style={{color: '#1A1A1A'}}>Recovery Habits</h3>
            
            <div className="mb-5">
              <div className="flex justify-between text-sm mb-3">
                <span style={{color: '#6B7C6B'}}>Recovery Balance Index</span>
                <span className="font-bold" style={{color: '#2D5F3F'}}>72%</span>
              </div>
              <div className="w-full rounded-full h-2.5" style={{backgroundColor: '#F0EDE8'}}>
                <div className="h-2.5 rounded-full" style={{
                  width: '72%',
                  background: 'linear-gradient(90deg, #A8C09A 0%, #B5CCA8 100%)'
                }}></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3" style={{color: '#1A1A1A'}}>Top Early Signals:</h4>
              <div className="space-y-3">
                <div className="flex items-center text-sm p-2 rounded-lg" style={{backgroundColor: 'rgba(255, 223, 0, 0.08)'}}>
                  <AlertTriangle className="h-4 w-4 mr-2" aria-hidden="true" style={{color: '#DAA520'}} />
                  <span style={{color: '#3A3A3A'}}>Sleep quality declining</span>
                </div>
                <div className="flex items-center text-sm p-2 rounded-lg" style={{backgroundColor: 'rgba(244, 164, 96, 0.08)'}}>
                  <AlertTriangle className="h-4 w-4 mr-2" aria-hidden="true" style={{color: '#D2691E'}} />
                  <span style={{color: '#3A3A3A'}}>Skipping breaks more often</span>
                </div>
              </div>
            </div>
          </section>
          
          {/* Teamwork Check */}
          <section className="rounded-2xl p-6" aria-labelledby="teamwork-check-heading" style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
            border: '1px solid #E8E5E0'
          }}>
            <h3 id="teamwork-check-heading" className="text-lg font-bold mb-5" style={{color: '#1A1A1A'}}>Teamwork Check</h3>
            
            <div className="mb-5">
              <div className="flex justify-between text-sm mb-3">
                <span style={{color: '#6B7C6B'}}>Agreements Fidelity</span>
                <span className="font-bold" style={{color: '#2D5F3F'}}>88%</span>
              </div>
              <div className="w-full rounded-full h-2.5" style={{backgroundColor: '#F0EDE8'}}>
                <div className="h-2.5 rounded-full" style={{
                  width: '88%',
                  background: 'linear-gradient(90deg, #C8B8DB 0%, #87CEEB 100%)'
                }}></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3" style={{color: '#1A1A1A'}}>Top Drift Area:</h4>
              <div className="flex items-center text-sm p-2 rounded-lg" style={{backgroundColor: 'rgba(244, 164, 96, 0.08)'}}>
                <ChevronDown className="h-4 w-4 mr-2" aria-hidden="true" style={{color: '#F4A460'}} />
                <span style={{color: '#3A3A3A'}}>Turn-taking balance</span>
              </div>
            </div>
          </section>
          
          {/* Values & Tough Calls */}
          <section className="rounded-2xl p-6" aria-labelledby="values-tough-calls-heading" style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
            border: '1px solid #E8E5E0'
          }}>
            <h3 id="values-tough-calls-heading" className="text-lg font-bold mb-5" style={{color: '#1A1A1A'}}>Values & Tough Calls</h3>
            
            <div className="mb-5">
              <h4 className="font-semibold mb-3" style={{color: '#1A1A1A'}}>Top Active Value:</h4>
              <div className="flex items-center text-sm p-2 rounded-lg" style={{backgroundColor: 'rgba(255, 182, 193, 0.08)'}}>
                <Heart className="h-4 w-4 mr-2" aria-hidden="true" style={{color: '#F08080'}} />
                <span style={{color: '#3A3A3A'}}>Advocacy for client</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3" style={{color: '#1A1A1A'}}>Gray Zone Focus:</h4>
              <div className="flex items-center text-sm p-2 rounded-lg" style={{backgroundColor: 'rgba(200, 184, 219, 0.08)'}}>
                <Clock className="h-4 w-4 mr-2" aria-hidden="true" style={{color: '#C8B8DB'}} />
                <span style={{color: '#3A3A3A'}}>Role boundaries with family</span>
              </div>
            </div>
          </section>
        </div>

        {/* Three-column insight boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl p-6 transition-all hover:scale-105" style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            boxShadow: '0 8px 20px rgba(168, 192, 154, 0.15)',
            border: '2px solid #A8C09A'
          }}>
            <h3 className="font-bold text-lg mb-4" style={{color: '#2D5F3F'}}>NOTICE</h3>
            <p className="leading-relaxed" style={{color: '#3A3A3A'}}>
              What changed: stress after prep, your energy, and team follow-through.
            </p>
          </div>
          
          <div className="rounded-2xl p-6 transition-all hover:scale-105" style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            boxShadow: '0 8px 20px rgba(135, 206, 235, 0.15)',
            border: '2px solid #87CEEB'
          }}>
            <h3 className="font-bold text-lg mb-4" style={{color: '#4682B4'}}>NORMALIZE</h3>
            <p className="leading-relaxed" style={{color: '#3A3A3A'}}>
              What steadies you: quick resets and ready boundary phrases.
            </p>
          </div>
          
          <div className="rounded-2xl p-6 transition-all hover:scale-105" style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            boxShadow: '0 8px 20px rgba(200, 184, 219, 0.15)',
            border: '2px solid #C8B8DB'
          }}>
            <h3 className="font-bold text-lg mb-4" style={{color: '#8B7AA8'}}>NEXT</h3>
            <p className="leading-relaxed" style={{color: '#3A3A3A'}}>
              Try one tiny If-Then on your next assignment.
            </p>
          </div>
        </div>

        {/* One Next Step */}
        <div className="rounded-2xl p-8" style={{
          background: 'linear-gradient(135deg, #6B8B60 0%, #5F7F55 100%)',
          boxShadow: '0 12px 35px rgba(107, 139, 96, 0.35)',
          border: '1px solid rgba(107, 139, 96, 0.2)'
        }}>
          <div className="flex items-center">
            <div className="rounded-xl p-4 mr-5" style={{
              backgroundColor: 'rgba(168, 192, 154, 0.25)',
              backdropFilter: 'blur(10px)'
            }}>
              <ChevronRight className="h-7 w-7" aria-hidden="true" style={{color: '#FFFFFF'}} />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-1" style={{color: '#FFFFFF'}}>One Next Step</h3>
              <p style={{color: 'rgba(255, 255, 255, 0.9)'}}>Keep it up! Your reflection practice is strong</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  const renderPrivacyPage = () => {
    return (
      <>
        <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
          {/* Header */}
          <div className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Privacy & Data</h1>
                <button
                  onClick={() => setShowPrivacyPage(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Content - 3 columns */}
              <main className="lg:col-span-3 space-y-8">
                {/* Privacy Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <Lock className="h-6 w-6 text-blue-400 mr-3" />
                      <h3 className="text-lg font-semibold text-blue-400">Secure by Design</h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      All journal entries, reflections, and wellness data are encrypted in storage and in transit.
                    </p>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                      <h3 className="text-lg font-semibold text-green-400">Privacy-First</h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Your data belongs to you. We never sell it, and it's never shared without your explicit consent.
                    </p>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <SettingsIcon className="h-6 w-6 text-purple-400 mr-3" />
                      <h3 className="text-lg font-semibold text-purple-400">Zero-Config</h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      You don't need to manage endless privacy settings — these protections are built in from the start.
                    </p>
                  </div>
                </div>

                {/* Data Use in Beta */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Data Use in Beta</h2>
                  <p className="text-gray-300 mb-6">We're in beta, so here's what's true today:</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-white font-medium">Encryption:</span>
                        <span className="text-gray-300 ml-2">All reflections and mood logs are encrypted.</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-white font-medium">Export & Delete:</span>
                        <span className="text-gray-300 ml-2">You can download your data or permanently delete your account at any time.</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-white font-medium">HIPAA:</span>
                        <span className="text-gray-300 ml-2">Not yet fully HIPAA-compliant, but we are designing with healthcare-level privacy standards in mind.</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-white font-medium">Integrations:</span>
                        <span className="text-gray-300 ml-2">No third-party integrations in beta (coming later).</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-white font-medium">Two-Factor Auth:</span>
                        <span className="text-gray-300 ml-2">Planned feature, not active yet.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consent at Signup */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Consent at Signup</h2>
                  <p className="text-gray-300 mb-6">When you first create your account, you'll accept:</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">That your reflections and data are stored securely.</span>
                    </div>
                    
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">That optional insights (AI feedback, growth analytics) are processed only for your account.</span>
                    </div>
                    
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">That you may opt in later to research participation or integrations (once available).</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">No need to revisit toggles — your preferences are stored once and can be updated if features roll out.</span>
                    </div>
                  </div>
                </div>
              </main>

              {/* Right Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 sticky top-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-slate-900" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">dev</div>
                      <div className="text-gray-400 text-sm">dev@interpretreflect.com</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between text-left text-gray-300 hover:text-white p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-3" />
                        <div>
                          <div className="font-medium">Profile Settings</div>
                          <div className="text-xs text-gray-400">Customize your preferences</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    
                    <button className="w-full flex items-center justify-between text-left text-gray-300 hover:text-white p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center">
                        <Database className="h-4 w-4 mr-3" />
                        <div>
                          <div className="font-medium">Manage Subscription</div>
                          <div className="text-xs text-gray-400">Billing and plan details</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    
                    <button className="w-full flex items-center justify-between text-left text-purple-400 hover:text-purple-300 p-3 rounded-lg bg-purple-600/20 border border-purple-600/30">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-3" />
                        <div>
                          <div className="font-medium">Privacy & Data</div>
                          <div className="text-xs text-purple-300">Control your data sharing</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    
                    <div className="pt-3 border-t border-slate-700">
                      <button className="w-full flex items-center text-left text-red-400 hover:text-red-300 p-3 rounded-lg hover:bg-red-600/10 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-3" />
                        <div className="font-medium">Sign Out</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderChatWithElya = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{
      background: 'linear-gradient(180deg, rgba(250, 249, 246, 0.95) 0%, rgba(240, 237, 232, 0.95) 100%)',
      backdropFilter: 'blur(20px)'
    }}>
      <div className="relative">
        {/* Animated background circles */}
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full opacity-20" style={{
          background: 'radial-gradient(circle, #A8C09A 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full opacity-20" style={{
          background: 'radial-gradient(circle, #A8C09A 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite 2s'
        }}></div>
        
        <div className="rounded-3xl p-10 max-w-lg mx-4 text-center relative" style={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
          boxShadow: '0 20px 60px rgba(168, 192, 154, 0.25), 0 10px 30px rgba(0, 0, 0, 0.1)',
          border: '2px solid rgba(168, 192, 154, 0.2)'
        }}>
          {/* Icon container with glow effect */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 rounded-full blur-xl opacity-30" style={{
              background: 'radial-gradient(circle, #A8C09A 0%, transparent 70%)',
              transform: 'scale(1.5)'
            }}></div>
            <div className="relative rounded-full p-6" style={{
              background: 'linear-gradient(135deg, #A8C09A 0%, #B5CCA8 100%)',
              boxShadow: '0 8px 20px rgba(168, 192, 154, 0.4)'
            }}>
              <Brain className="h-14 w-14" style={{color: '#FFFFFF'}} />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-4" style={{
            color: '#1A1A1A',
            letterSpacing: '-0.5px'
          }}>
            Meet Elya, Your AI Companion
          </h2>
          
          <div className="mb-8">
            <p className="text-lg mb-4" style={{
              color: '#5A5A5A',
              lineHeight: '1.7'
            }}>
              Your personal wellness AI is preparing something special.
            </p>
            <p className="text-base" style={{
              color: '#6B7C6B',
              lineHeight: '1.6'
            }}>
              While Elya gets ready, explore our reflection tools and stress reset techniques to begin your wellness journey.
            </p>
          </div>
          
          {/* Status indicator */}
          <div className="mb-8 inline-flex items-center px-4 py-2 rounded-full" style={{
            backgroundColor: 'rgba(168, 192, 154, 0.1)',
            border: '1px solid rgba(168, 192, 154, 0.3)'
          }}>
            <div className="w-2 h-2 rounded-full mr-3" style={{
              backgroundColor: '#A8C09A',
              animation: 'pulse 2s ease-in-out infinite'
            }}></div>
            <span className="text-sm font-medium" style={{color: '#2D5F3F'}}>Beta Launch Coming Soon</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center" style={{
              background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(107, 139, 96, 0.3)'
            }} 
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(107, 139, 96, 0.4)';
            }} 
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(107, 139, 96, 0.3)';
            }}>
              <Sparkles className="h-5 w-5 mr-2" />
              Join the Waitlist
            </button>
            <button 
              onClick={() => setActiveTab('home')}
              className="px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1A1A1A',
                border: '2px solid #E8E5E0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#A8C09A';
                e.currentTarget.style.backgroundColor = '#F8FBF6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E8E5E0';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );

  const reflectionCards = [
    {
      icon: Target,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/20',
      title: 'Pre-Assignment Prep',
      description: 'Prime attention, steady the nervous system, and set...',
      status: [
        { label: 'Prepare Well', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' }
      ]
    },
    {
      icon: Clock,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/20',
      title: 'Post-Assignment Debrief',
      description: 'Consolidate learning, de-load stress, and turn...',
      status: [
        { label: 'Reflect & Grow', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' }
      ]
    },
    {
      icon: Users,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      title: 'Teaming Prep',
      description: 'Align minds and mechanics so handoffs are smooth...',
      status: [
        { label: 'Team Ready', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' }
      ]
    },
    {
      icon: Users,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      title: 'Teaming Reflection',
      description: 'Consolidate what worked between partners, surface...',
      status: [
        { label: 'Team Review', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' }
      ]
    },
    {
      icon: Target,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      title: 'Mentoring Prep',
      description: 'Clarify the ask, define success, and set up a...',
      status: [
        { label: 'Get the Right', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' }
      ]
    },
    {
      icon: Lightbulb,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      title: 'Mentoring Reflection',
      description: 'Consolidate insights and capture next steps',
      status: [
        { label: 'Apply', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' }
      ]
    },
    {
      icon: Heart,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      title: 'Wellness Check-in',
      description: 'Focus on emotional and physical wellbeing',
      status: [
        { label: 'Stay', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' }
      ]
    },
    {
      icon: Settings,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/20',
      title: 'Compass Check',
      description: 'Realign with your values after challenging decisions',
      status: [
        { label: 'Values', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' }
      ]
    }
  ];

  const affirmationCategories = [
    {
      icon: Heart,
      iconColor: 'text-white',
      iconBg: 'bg-pink-500',
      title: 'Inherent Worth & Value',
      description: 'Gentle reminders of your fundamental value as a human being, independent of performance or achievement.',
      tag: 'self worth',
      tagColor: 'bg-pink-500'
    },
    {
      icon: Sparkles,
      iconColor: 'text-white',
      iconBg: 'bg-orange-500',
      title: 'Professional Wisdom & Competence',
      description: 'Affirmations celebrating your skills, growth, and professional contributions.',
      tag: 'professional competence',
      tagColor: 'bg-orange-500'
    },
    {
      icon: Shield,
      iconColor: 'text-white',
      iconBg: 'bg-green-500',
      title: 'Inner Strength & Resilience',
      description: 'Honoring your ability to weather storms and bounce back from difficulty.',
      tag: 'resilience',
      tagColor: 'bg-green-500'
    },
    {
      icon: TrendingUp,
      iconColor: 'text-white',
      iconBg: 'bg-purple-500',
      title: 'Continuous Growth & Learning',
      description: 'Celebrating your commitment to personal and professional development.',
      tag: 'growth',
      tagColor: 'bg-purple-500'
    },
    {
      icon: Star,
      iconColor: 'text-white',
      iconBg: 'bg-blue-400',
      title: 'Purpose & Service',
      description: 'Connecting with the deeper meaning and purpose in your work and life.',
      tag: 'service',
      tagColor: 'bg-blue-400'
    },
    {
      icon: User,
      iconColor: 'text-white',
      iconBg: 'bg-purple-600',
      title: 'Healthy Boundaries & Self-Care',
      description: 'Affirming your right to protect your energy, time, and wellbeing.',
      tag: 'boundaries',
      tagColor: 'bg-purple-600'
    }
  ];

  const renderStressReset = () => (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main" aria-labelledby="stress-reset-heading">
      <div className="text-center mb-12">
        <div className="inline-block p-4 rounded-full mb-6" style={{backgroundColor: 'rgba(45, 95, 63, 0.15)'}}>
          <RefreshCw className="h-12 w-12" aria-hidden="true" style={{color: '#2D5F3F'}} />
        </div>
        <h1 id="stress-reset-heading" className="text-4xl font-bold mb-4" style={{color: '#1A1A1A', letterSpacing: '-0.5px'}}>
          Your Personal Reset Space
        </h1>
        <p className="text-xl mb-2" style={{color: '#3A3A3A', fontWeight: '500'}}>
          Choose what your body-mind needs right now
        </p>
        <p className="text-base" style={{color: '#3A3A3A'}}>
          All practices are accessible for every body and mind
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Box Breathing */}
        <article className="rounded-2xl p-7 transition-all cursor-pointer group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
          tabIndex={0}
          role="button"
          aria-label="Box Breathing exercise - 4 minutes, gentle breathing rhythm to anchor your system" 
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#A8C09A';
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(168, 192, 154, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{
            background: 'radial-gradient(circle, #A8C09A 0%, transparent 70%)',
            transform: 'translate(50%, -50%)'
          }}></div>
          
          <div className="rounded-xl p-4 w-fit mb-5" style={{
            background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
            boxShadow: '0 4px 10px rgba(107, 139, 96, 0.3)'
          }}>
            <Square className="h-8 w-8" style={{color: '#FFFFFF'}} />
          </div>
          <h3 className="text-xl font-bold mb-3" style={{color: '#1A1A1A'}}>
            Box Breathing
          </h3>
          <p className="text-sm mb-5" style={{color: '#3A3A3A', lineHeight: '1.6'}}>
            A steady rhythm to anchor your system
          </p>
          <div className="flex items-center space-x-4 text-sm mb-4">
            <span className="px-3 py-1 rounded-full" style={{backgroundColor: 'rgba(168, 192, 154, 0.15)', color: '#2D5F3F'}}>4 minutes</span>
            <span className="font-semibold" style={{color: '#A8C09A'}}>Gentle</span>
          </div>
          <div className="pt-4 border-t" style={{borderColor: 'rgba(168, 192, 154, 0.2)'}}>
            <p className="text-sm italic" style={{color: '#6B7C6B'}}>
              Balances your autonomic nervous system
            </p>
          </div>
        </article>

        {/* Body Release Pattern */}
        <article className="rounded-2xl p-7 transition-all cursor-pointer group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
          tabIndex={0}
          role="button"
          aria-label="Body Release Pattern exercise - 3 minutes, moderate progressive release through your body" 
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#A8C09A';
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(168, 192, 154, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{
            background: 'radial-gradient(circle, #A8C09A 0%, transparent 70%)',
            transform: 'translate(50%, -50%)'
          }}></div>
          
          <div className="rounded-xl p-4 w-fit mb-5" style={{
            background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
            boxShadow: '0 4px 10px rgba(107, 139, 96, 0.3)'
          }}>
            <Waves className="h-8 w-8" aria-hidden="true" style={{color: '#FFFFFF'}} />
          </div>
          <h3 className="text-xl font-bold mb-3" style={{color: '#1A1A1A'}}>
            Body Release Pattern
          </h3>
          <p className="text-sm mb-5" style={{color: '#3A3A3A', lineHeight: '1.6'}}>
            Progressive release through your body
          </p>
          <div className="flex items-center space-x-4 text-sm mb-4">
            <span className="px-3 py-1 rounded-full" style={{backgroundColor: 'rgba(168, 192, 154, 0.15)', color: '#2D5F3F'}}>3 minutes</span>
            <span className="font-semibold" style={{color: '#A8C09A'}}>Moderate</span>
          </div>
          <div className="pt-4 border-t" style={{borderColor: 'rgba(168, 192, 154, 0.2)'}}>
            <p className="text-sm italic" style={{color: '#6B7C6B'}}>
              Releases physical holding patterns
            </p>
          </div>
        </article>

        {/* Temperature Shift */}
        <article className="rounded-2xl p-7 transition-all cursor-pointer group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
          tabIndex={0}
          role="button"
          aria-label="Temperature Shift exercise - 1 minute, intense temperature-based nervous system reset" 
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#A8C09A';
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(168, 192, 154, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{
            background: 'radial-gradient(circle, #A8C09A 0%, transparent 70%)',
            transform: 'translate(50%, -50%)'
          }}></div>
          
          <div className="rounded-xl p-4 w-fit mb-5" style={{
            background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
            boxShadow: '0 4px 10px rgba(107, 139, 96, 0.3)'
          }}>
            <Thermometer className="h-8 w-8" aria-hidden="true" style={{color: '#FFFFFF'}} />
          </div>
          <h3 className="text-xl font-bold mb-3" style={{color: '#1A1A1A'}}>
            Temperature Shift
          </h3>
          <p className="text-sm mb-5" style={{color: '#3A3A3A', lineHeight: '1.6'}}>
            Use temperature to reset your nervous system
          </p>
          <div className="flex items-center space-x-4 text-sm mb-4">
            <span className="px-3 py-1 rounded-full" style={{backgroundColor: 'rgba(168, 192, 154, 0.15)', color: '#2D5F3F'}}>2 minutes</span>
            <span className="font-semibold" style={{color: '#A8C09A'}}>Gentle</span>
          </div>
          <div className="pt-4 border-t" style={{borderColor: 'rgba(168, 192, 154, 0.2)'}}>
            <p className="text-sm italic" style={{color: '#6B7C6B'}}>
              Activates your natural calming response
            </p>
          </div>
        </article>

        {/* Sensory Reset */}
        <article className="rounded-2xl p-7 transition-all cursor-pointer group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
          tabIndex={0}
          role="button"
          aria-label="Sensory Reset exercise - 2 minutes, very gentle sensory break" 
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#A8C09A';
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(168, 192, 154, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{
            background: 'radial-gradient(circle, #A8C09A 0%, transparent 70%)',
            transform: 'translate(50%, -50%)'
          }}></div>
          
          <div className="rounded-xl p-4 w-fit mb-5" style={{
            background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
            boxShadow: '0 4px 10px rgba(107, 139, 96, 0.3)'
          }}>
            <Eye className="h-8 w-8" aria-hidden="true" style={{color: '#FFFFFF'}} />
          </div>
          <h3 className="text-xl font-bold mb-3" style={{color: '#1A1A1A'}}>
            Sensory Reset
          </h3>
          <p className="text-sm mb-5" style={{color: '#3A3A3A', lineHeight: '1.6'}}>
            Give your senses a gentle break
          </p>
          <div className="flex items-center space-x-4 text-sm mb-4">
            <span className="px-3 py-1 rounded-full" style={{backgroundColor: 'rgba(168, 192, 154, 0.15)', color: '#2D5F3F'}}>2 minutes</span>
            <span className="font-semibold" style={{color: '#A8C09A'}}>Very Gentle</span>
          </div>
          <div className="pt-4 border-t" style={{borderColor: 'rgba(168, 192, 154, 0.2)'}}>
            <p className="text-sm italic" style={{color: '#6B7C6B'}}>
              Refreshes your sensory channels
            </p>
          </div>
        </article>

        {/* Expansion Practice */}
        <article className="rounded-2xl p-7 transition-all cursor-pointer group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
          tabIndex={0}
          role="button"
          aria-label="Expansion Practice exercise - 6 minutes, moderate practice to create space in awareness" 
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#A8C09A';
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(168, 192, 154, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{
            background: 'radial-gradient(circle, #A8C09A 0%, transparent 70%)',
            transform: 'translate(50%, -50%)'
          }}></div>
          
          <div className="rounded-xl p-4 w-fit mb-5" style={{
            background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
            boxShadow: '0 4px 10px rgba(107, 139, 96, 0.3)'
          }}>
            <Mountain className="h-8 w-8" aria-hidden="true" style={{color: '#FFFFFF'}} />
          </div>
          <h3 className="text-xl font-bold mb-3" style={{color: '#1A1A1A'}}>
            Expansion Practice
          </h3>
          <p className="text-sm mb-5" style={{color: '#3A3A3A', lineHeight: '1.6'}}>
            Create space in your awareness
          </p>
          <div className="flex items-center space-x-4 text-sm mb-4">
            <span className="px-3 py-1 rounded-full" style={{backgroundColor: 'rgba(168, 192, 154, 0.15)', color: '#2D5F3F'}}>3 minutes</span>
            <span className="font-semibold" style={{color: '#A8C09A'}}>Gentle</span>
          </div>
          <div className="pt-4 border-t" style={{borderColor: 'rgba(168, 192, 154, 0.2)'}}>
            <p className="text-sm italic" style={{color: '#6B7C6B'}}>
              Shifts from focused to spacious awareness
            </p>
          </div>
        </article>

        {/* Name & Transform */}
        <article className="rounded-2xl p-7 transition-all cursor-pointer group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
          tabIndex={0}
          role="button"
          aria-label="Name and Transform exercise - 5 minutes, moderate practice to work with emotions as information" 
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#A8C09A';
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(168, 192, 154, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{
            background: 'radial-gradient(circle, #A8C09A 0%, transparent 70%)',
            transform: 'translate(50%, -50%)'
          }}></div>
          
          <div className="rounded-xl p-4 w-fit mb-5" style={{
            background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
            boxShadow: '0 4px 10px rgba(107, 139, 96, 0.3)'
          }}>
            <Peace className="h-8 w-8" aria-hidden="true" style={{color: '#FFFFFF'}} />
          </div>
          <h3 className="text-xl font-bold mb-3" style={{color: '#1A1A1A'}}>
            Name & Transform
          </h3>
          <p className="text-sm mb-5" style={{color: '#3A3A3A', lineHeight: '1.6'}}>
            Work with emotions as information
          </p>
          <div className="flex items-center space-x-4 text-sm mb-4">
            <span className="px-3 py-1 rounded-full" style={{backgroundColor: 'rgba(168, 192, 154, 0.15)', color: '#2D5F3F'}}>5 minutes</span>
            <span className="font-semibold" style={{color: '#A8C09A'}}>Moderate</span>
          </div>
          <div className="pt-4 border-t" style={{borderColor: 'rgba(168, 192, 154, 0.2)'}}>
            <p className="text-sm italic" style={{color: '#6B7C6B'}}>
              Transforms emotional overwhelm into clarity
            </p>
          </div>
        </article>
      </div>
    </main>
  );

  const renderAffirmations = () => (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full mr-4" style={{backgroundColor: 'rgba(168, 192, 154, 0.15)'}}>
              <Heart className="h-8 w-8" style={{color: '#A8C09A'}} />
            </div>
            <h1 className="text-4xl font-bold" style={{color: '#1A1A1A', letterSpacing: '-0.5px'}}>
              Affirmation & Reflection Studio
            </h1>
          </div>
          <p className="text-lg max-w-3xl mx-auto" style={{color: '#5A5A5A', lineHeight: '1.7'}}>
            Gentle, conversational affirmations paired with thoughtful reflection to nurture your relationship with yourself
          </p>
        </div>

        {/* Affirmation Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {affirmationCategories.map((category, index) => (
            <div
              key={index}
              className="rounded-xl p-6 transition-all duration-200 cursor-pointer group"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid transparent',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#A8C09A';
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(168, 192, 154, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="rounded-lg p-3 w-fit" style={{backgroundColor: 'rgba(168, 192, 154, 0.15)'}}>
                  <category.icon className="h-6 w-6" style={{color: '#A8C09A'}} />
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium" style={{color: '#6B7C6B'}}>5 affirmations</span>
                </div>
              </div>
              
              <h3 className="text-lg font-bold mb-3" style={{color: '#1A1A1A'}}>
                {category.title}
              </h3>
              
              <p className="text-sm mb-6 leading-relaxed" style={{color: '#5A5A5A', lineHeight: '1.6'}}>
                {category.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{
                  backgroundColor: 'rgba(168, 192, 154, 0.2)',
                  color: '#2D5F3F'
                }}>
                  {category.tag}
                </div>
                <ChevronDown className="h-4 w-4 rotate-[-90deg] group-hover:translate-x-1 transition-transform" style={{color: '#A8C09A'}} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );

  const renderBurnoutGauge = () => (
    <section aria-labelledby="burnout-gauge-heading">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 id="burnout-gauge-heading" className="text-3xl font-bold mb-3" style={{color: '#1A1A1A'}}>
            Daily Burnout Gauge
          </h2>
          <p className="text-base" style={{color: '#5A5A5A'}}>
            Quick check-in on your energy and stress levels
          </p>
        </div>
        <div className="p-4 rounded-full" style={{backgroundColor: 'rgba(45, 95, 63, 0.15)'}}>
          <Gauge className="h-10 w-10" aria-hidden="true" style={{color: '#2D5F3F'}} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { rating: 1, label: 'Energized', emoji: '🌟' },
          { rating: 2, label: 'Balanced', emoji: '😊' },
          { rating: 3, label: 'Managing', emoji: '😐' },
          { rating: 4, label: 'Stressed', emoji: '😰' },
          { rating: 5, label: 'Exhausted', emoji: '😔' }
        ].map((item) => (
          <button
            key={item.rating}
            onClick={() => setSelectedRating(item.rating)}
            className="p-6 rounded-xl text-center transition-all"
            style={{
              backgroundColor: selectedRating === item.rating ? '#A8C09A' : '#FFFFFF',
              border: selectedRating === item.rating ? '2px solid #A8C09A' : '2px solid #E8E5E0',
              transform: selectedRating === item.rating ? 'scale(1.05)' : 'scale(1)',
              boxShadow: selectedRating === item.rating ? '0 8px 20px rgba(168, 192, 154, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              if (selectedRating !== item.rating) {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.borderColor = '#A8C09A';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedRating !== item.rating) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = '#E8E5E0';
              }
            }}
          >
            <div className="text-3xl mb-3">{item.emoji}</div>
            <div className="text-5xl font-bold mb-2" style={{
              color: selectedRating === item.rating ? '#FFFFFF' : '#A8C09A'
            }}>{item.rating}</div>
            <div className="text-sm font-medium" style={{
              color: selectedRating === item.rating ? '#FFFFFF' : '#1A1A1A'
            }}>{item.label}</div>
          </button>
        ))}
      </div>
    </section>
  );

  const renderDashboardHome = () => (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3" style={{color: '#1A1A1A', letterSpacing: '-0.5px'}}>
              Good morning, dev
            </h1>
            <p className="text-lg" style={{color: '#5A5A5A', fontWeight: '400'}}>
              Ready to reflect and grow today?
            </p>
          </div>

          {/* Continue Your Journey Card */}
          <div className="rounded-2xl p-8" style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FAFAF8 100%)',
            boxShadow: '0 10px 30px rgba(168, 192, 154, 0.15), 0 2px 8px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(168, 192, 154, 0.2)'
          }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-3" style={{color: '#1A1A1A'}}>
                  Continue Your Journey
                </h2>
                <p className="text-base" style={{color: '#5A5A5A', lineHeight: '1.6'}}>
                  Choose your reflection type and dive deeper into your professional growth
                </p>
              </div>
              <div className="p-4 rounded-full" style={{backgroundColor: 'rgba(168, 192, 154, 0.15)'}}>
                <BookOpen className="h-10 w-10" style={{color: '#A8C09A'}} />
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="rounded-xl p-6 text-left transition-all group" style={{
                backgroundColor: '#6B8B60',
                background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                boxShadow: '0 4px 15px rgba(107, 139, 96, 0.3)',
                transform: 'translateY(0)'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(107, 139, 96, 0.4)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(107, 139, 96, 0.3)';
              }}>
                <div className="p-3 rounded-lg inline-block mb-4" style={{backgroundColor: 'rgba(255, 255, 255, 0.2)'}}>
                  <Target className="h-6 w-6" style={{color: '#FFFFFF'}} />
                </div>
                <h3 className="font-bold mb-2 text-lg" style={{color: '#FFFFFF'}}>New Reflection</h3>
                <p className="text-sm" style={{color: 'rgba(255, 255, 255, 0.9)'}}>Start a fresh reflection session</p>
              </button>
              
              <button 
                onClick={() => setActiveCategory('burnout')}
                className="rounded-xl p-6 text-left transition-all group" style={{
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #A8C09A',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                  transform: 'translateY(0)'
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(168, 192, 154, 0.3)';
                  e.currentTarget.style.backgroundColor = '#F8FBF6';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                <div className="p-3 rounded-lg inline-block mb-4" style={{backgroundColor: 'rgba(168, 192, 154, 0.15)'}}>
                  <Shield className="h-6 w-6" style={{color: '#A8C09A'}} />
                </div>
                <h3 className="font-bold mb-2 text-lg" style={{color: '#1A1A1A'}}>Daily Burnout Gauge</h3>
                <p className="text-sm" style={{color: '#5A5A5A'}}>5-question wellness assessment</p>
              </button>
              
              <button className="rounded-xl p-6 text-left transition-all group" style={{
                background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                boxShadow: '0 4px 15px rgba(107, 139, 96, 0.3)',
                transform: 'translateY(0)'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(107, 139, 96, 0.4)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(107, 139, 96, 0.3)';
              }}>
                <div className="p-3 rounded-lg inline-block mb-4" style={{backgroundColor: 'rgba(255, 255, 255, 0.2)'}}>
                  <Heart className="h-6 w-6" style={{color: '#FFFFFF'}} />
                </div>
                <h3 className="font-bold mb-2 text-lg" style={{color: '#FFFFFF'}}>Quick Reset</h3>
                <p className="text-sm" style={{color: 'rgba(255, 255, 255, 0.9)'}}>5-minute wellness break</p>
              </button>
            </div>
          </div>

          {/* Recent Reflections */}
          <div className="rounded-2xl p-8" style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(168, 192, 154, 0.15), 0 2px 8px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(168, 192, 154, 0.2)'
          }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{color: '#1A1A1A'}}>Recent Reflections</h2>
              <button className="font-semibold flex items-center transition-all px-4 py-2 rounded-lg" style={{
                color: '#6B7C6B',
                backgroundColor: 'transparent'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 192, 154, 0.1)';
                e.currentTarget.style.color = '#A8C09A';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6B7C6B';
              }}>
                View All
                <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
              </button>
            </div>
            
            {/* Empty State */}
            <div className="text-center py-16">
              <div className="p-6 rounded-xl mb-6" style={{backgroundColor: 'rgba(168, 192, 154, 0.05)'}}>
                <BookOpen className="h-16 w-16 mx-auto mb-4" style={{color: '#C8D5C8'}} />
              </div>
              <p className="mb-6 text-lg" style={{color: '#5A5A5A'}}>No reflections yet</p>
              <button className="px-8 py-3 rounded-xl font-semibold transition-all flex items-center mx-auto" style={{
                background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                color: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(107, 139, 96, 0.3)'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(107, 139, 96, 0.4)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(107, 139, 96, 0.3)';
              }}>
                <span className="mr-2 text-xl">+</span>
                Start Your First Reflection
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Tools */}
          <div className="rounded-2xl p-6" style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 8px 20px rgba(168, 192, 154, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(168, 192, 154, 0.2)'
          }}>
            <h3 className="text-lg font-bold mb-5" style={{color: '#1A1A1A'}}>Quick Tools</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center p-4 rounded-xl transition-all text-left group" style={{
                backgroundColor: 'rgba(168, 192, 154, 0.08)',
                border: '1px solid transparent'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 192, 154, 0.15)';
                e.currentTarget.style.borderColor = '#A8C09A';
                e.currentTarget.style.transform = 'translateX(2px)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 192, 154, 0.08)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}>
                <div className="p-2 rounded-lg mr-3" style={{backgroundColor: 'rgba(168, 192, 154, 0.2)'}}>
                  <MessageCircle className="h-5 w-5" style={{color: '#A8C09A'}} />
                </div>
                <span className="font-medium" style={{color: '#1A1A1A'}}>Chat with Elya</span>
              </button>
              <button className="w-full flex items-center p-4 rounded-xl transition-all text-left group" style={{
                backgroundColor: 'rgba(168, 192, 154, 0.08)',
                border: '1px solid transparent'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 192, 154, 0.15)';
                e.currentTarget.style.borderColor = '#A8C09A';
                e.currentTarget.style.transform = 'translateX(2px)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 192, 154, 0.08)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}>
                <div className="p-2 rounded-lg mr-3" style={{backgroundColor: 'rgba(168, 192, 154, 0.2)'}}>
                  <TrendingUp className="h-5 w-5" style={{color: '#A8C09A'}} />
                </div>
                <span className="font-medium" style={{color: '#1A1A1A'}}>Growth Insights</span>
              </button>
            </div>
          </div>

          {/* Today's Insight */}
          <div className="rounded-2xl p-6" style={{
            background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
            boxShadow: '0 10px 25px rgba(107, 139, 96, 0.35)',
            border: '1px solid rgba(107, 139, 96, 0.3)'
          }}>
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg mr-3" style={{backgroundColor: 'rgba(168, 192, 154, 0.25)'}}>
                <Lightbulb className="h-5 w-5" style={{color: '#FFFFFF'}} />
              </div>
              <h3 className="text-lg font-bold" style={{color: '#FFFFFF'}}>Today's Insight</h3>
            </div>
            <blockquote className="italic mb-4 leading-relaxed text-base" style={{color: '#FFFFFF', opacity: '0.95'}}>
              "Regular reflection helps build emotional resilience and prevents burnout in high-stress professions."
            </blockquote>
            <p className="text-sm" style={{color: 'rgba(255, 255, 255, 0.75)'}}>
              Based on your reflection patterns
            </p>
          </div>
        </div>
      </div>
    </main>
  );

  const renderReflectionStudio = () => (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main" aria-labelledby="reflection-studio-heading">
      {/* Main Content */}
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 id="reflection-studio-heading" className="text-4xl font-bold mb-3" style={{color: '#1A1A1A', letterSpacing: '-0.5px'}}>
            Good morning, dev
          </h1>
          <p className="text-lg" style={{color: '#5A5A5A', fontWeight: '400'}}>
            Ready to reflect and grow today?
          </p>
        </div>

        {/* Category Tabs */}
        <nav className="flex space-x-3 mb-8 p-2 rounded-2xl" role="tablist" aria-label="Reflection categories" style={{backgroundColor: '#FFFFFF', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'}}>
          <button 
            onClick={() => setActiveCategory('structured')}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            role="tab"
            aria-selected={activeCategory === 'structured'}
            aria-controls="structured-panel"
            aria-label="Structured reflections tab"
            style={{
              backgroundColor: activeCategory === 'structured' ? '#2D5F3F' : 'transparent',
              color: activeCategory === 'structured' ? '#FFFFFF' : '#1A1A1A',
              transform: activeCategory === 'structured' ? 'scale(1.02)' : 'scale(1)',
              boxShadow: activeCategory === 'structured' ? '0 4px 15px rgba(168, 192, 154, 0.3)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (activeCategory !== 'structured') {
                e.currentTarget.style.backgroundColor = 'rgba(168, 192, 154, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeCategory !== 'structured') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid #2D5F3F';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Structured</span>
          </button>
          <button 
            onClick={() => setActiveCategory('burnout')}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            role="tab"
            aria-selected={activeCategory === 'burnout'}
            aria-controls="burnout-panel"
            aria-label="Daily burnout gauge tab"
            style={{
              backgroundColor: activeCategory === 'burnout' ? '#2D5F3F' : 'transparent',
              color: activeCategory === 'burnout' ? '#FFFFFF' : '#1A1A1A',
              transform: activeCategory === 'burnout' ? 'scale(1.02)' : 'scale(1)',
              boxShadow: activeCategory === 'burnout' ? '0 4px 15px rgba(168, 192, 154, 0.3)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (activeCategory !== 'burnout') {
                e.currentTarget.style.backgroundColor = 'rgba(168, 192, 154, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeCategory !== 'burnout') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid #2D5F3F';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            <Gauge className="h-4 w-4" aria-hidden="true" />
            <span>Daily Burnout Gauge</span>
          </button>
          <button 
            onClick={() => setActiveCategory('affirmations')}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            role="tab"
            aria-selected={activeCategory === 'affirmations'}
            aria-controls="affirmations-panel"
            aria-label="Affirmations tab"
            style={{
              backgroundColor: activeCategory === 'affirmations' ? '#2D5F3F' : 'transparent',
              color: activeCategory === 'affirmations' ? '#FFFFFF' : '#1A1A1A',
              transform: activeCategory === 'affirmations' ? 'scale(1.02)' : 'scale(1)',
              boxShadow: activeCategory === 'affirmations' ? '0 4px 15px rgba(168, 192, 154, 0.3)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (activeCategory !== 'affirmations') {
                e.currentTarget.style.backgroundColor = 'rgba(168, 192, 154, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeCategory !== 'affirmations') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid #2D5F3F';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>Affirmations</span>
          </button>
        </nav>

        {/* Content based on active category */}
        {activeCategory === 'structured' && (
          <div role="tabpanel" id="structured-panel" aria-labelledby="structured-tab">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-3" style={{color: '#1A1A1A'}}>
                  Structured Reflections
                </h2>
                <p className="text-base" style={{color: '#3A3A3A'}}>
                  Choose your reflection focus for today
                </p>
              </div>
              <div className="p-4 rounded-full" style={{backgroundColor: 'rgba(168, 192, 154, 0.15)'}}>
                <BookOpen className="h-10 w-10" style={{color: '#A8C09A'}} />
              </div>
            </div>

            {/* Reflection Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {reflectionCards.map((card, index) => (
                <article
                  key={index}
                  tabIndex={0}
                  role="button"
                  aria-label={`${card.title} reflection card`}
                  className="rounded-xl p-6 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid transparent',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#A8C09A';
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(168, 192, 154, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2D5F3F';
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(45, 95, 63, 0.25)';
                    e.currentTarget.style.outline = '2px solid #2D5F3F';
                    e.currentTarget.style.outlineOffset = '2px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.outline = 'none';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      // Handle card selection
                    }
                  }}
                >
                  <div className="rounded-lg p-3 w-fit mb-4" style={{backgroundColor: 'rgba(45, 95, 63, 0.15)'}}>
                    <card.icon className="h-6 w-6" aria-hidden="true" style={{color: '#2D5F3F'}} />
                  </div>
                  
                  <h3 className="text-lg font-bold mb-3" style={{color: '#1A1A1A'}}>
                    {card.title}
                  </h3>
                  
                  <p className="text-sm mb-6 leading-relaxed" style={{color: '#3A3A3A', lineHeight: '1.6'}}>
                    {card.description}
                  </p>

                  <div className="space-y-2">
                    {card.status.map((status, statusIndex) => (
                      <div key={statusIndex} className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2" aria-hidden="true" style={{backgroundColor: '#2D5F3F'}}></div>
                        <span className="text-xs font-medium" style={{color: '#3A3A3A'}}>
                          {status.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeCategory === 'burnout' && (
          <div role="tabpanel" id="burnout-panel" aria-labelledby="burnout-tab">
            {renderBurnoutGauge()}
          </div>
        )}

        {activeCategory === 'affirmations' && (
          <div role="tabpanel" id="affirmations-panel" aria-labelledby="affirmations-tab">
            {renderAffirmations()}
          </div>
        )}
      </div>
    </main>
  );

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#FAF9F6'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-sage-200 border-t-sage-600 mx-auto mb-4" style={{borderTopColor: '#A8C09A', borderColor: 'rgba(168, 192, 154, 0.3)'}}></div>
          <p className="text-lg" style={{color: '#3A3A3A'}}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if user is not authenticated
  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(180deg, #FAF9F6 0%, #F0EDE8 100%)', minHeight: '100vh'}}>
      {/* Header */}
      <header className="shadow-md" style={{background: 'linear-gradient(135deg, #A8C09A 0%, #B5CCA8 100%)', boxShadow: '0 2px 10px rgba(168, 192, 154, 0.3)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Greeting */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <Globe className="h-7 w-7 mr-3" style={{color: '#FFFFFF'}} />
                <span className="text-xl font-bold tracking-wide" style={{color: '#FFFFFF', letterSpacing: '0.5px'}}>
                  InterpretReflect™
                </span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold" style={{color: '#FFFFFF'}}>
                  Good morning, {user?.email?.split('@')[0] || 'User'}
                </h1>
                <p className="text-sm opacity-90" style={{color: '#FFFFFF'}}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 rounded-lg p-2 transition-all"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" style={{backgroundColor: '#FFFFFF', border: '2px solid rgba(255, 255, 255, 0.5)'}}>
                    <span className="text-sm font-semibold" style={{color: '#1A1A1A'}}>{user?.email?.charAt(0).toUpperCase() || 'U'}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} style={{color: '#FFFFFF'}} />
                </button>
                
                {/* User Dropdown Menu */}
                {showUserDropdown && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserDropdown(false)}
                    />
                    
                    <div className="absolute right-0 top-full mt-3 w-80 rounded-2xl shadow-2xl z-20" style={{
                      backgroundColor: '#1A1A1A',
                      border: '1px solid rgba(168, 192, 154, 0.2)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)'
                    }}>
                      {/* User Info */}
                      <div className="p-5" style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: 'rgba(168, 192, 154, 0.08)'
                      }}>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md" style={{
                            background: 'linear-gradient(135deg, #A8C09A 0%, #B5CCA8 100%)',
                            boxShadow: '0 4px 12px rgba(168, 192, 154, 0.3)'
                          }}>
                            <span className="text-lg font-bold" style={{color: '#FFFFFF'}}>{user?.email?.charAt(0).toUpperCase() || 'U'}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-lg" style={{color: '#FFFFFF'}}>{user?.email?.split('@')[0] || 'User'}</div>
                            <div className="text-sm" style={{color: '#A8C09A'}}>{user?.email || 'user@interpretreflect.com'}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="p-3">
                        <button className="w-full flex items-center space-x-3 p-4 rounded-xl transition-all text-left group" 
                          style={{
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.transform = 'translateX(2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <div className="p-2 rounded-lg" style={{backgroundColor: 'rgba(168, 192, 154, 0.15)'}}>
                            <User className="h-5 w-5" style={{color: '#A8C09A'}} />
                          </div>
                          <div className="flex-grow">
                            <div className="font-medium" style={{color: '#FFFFFF'}}>Profile Settings</div>
                            <div className="text-xs" style={{color: '#8A8A8A'}}>Customize your preferences</div>
                          </div>
                          <ChevronRight className="h-4 w-4 opacity-60" style={{color: '#6A6A6A'}} />
                        </button>
                        
                        <button className="w-full flex items-center space-x-3 p-4 rounded-xl transition-all text-left group" 
                          style={{
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.transform = 'translateX(2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <div className="p-2 rounded-lg" style={{backgroundColor: 'rgba(168, 192, 154, 0.15)'}}>
                            <Settings className="h-5 w-5" style={{color: '#A8C09A'}} />
                          </div>
                          <div className="flex-grow">
                            <div className="font-medium" style={{color: '#FFFFFF'}}>Manage Subscription</div>
                            <div className="text-xs" style={{color: '#8A8A8A'}}>Billing and plan details</div>
                          </div>
                          <ChevronRight className="h-4 w-4 opacity-60" style={{color: '#6A6A6A'}} />
                        </button>
                        
                        <button className="w-full flex items-center space-x-3 p-4 rounded-xl transition-all text-left group" 
                          style={{
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.transform = 'translateX(2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <div className="p-2 rounded-lg" style={{backgroundColor: 'rgba(168, 192, 154, 0.15)'}}>
                            <Shield className="h-5 w-5" style={{color: '#A8C09A'}} />
                          </div>
                          <div className="flex-grow">
                            <div className="font-medium" style={{color: '#FFFFFF'}}>Privacy & Data</div>
                            <div className="text-xs" style={{color: '#8A8A8A'}}>Control your data sharing</div>
                          </div>
                          <ChevronRight className="h-4 w-4 opacity-60" style={{color: '#6A6A6A'}} />
                        </button>
                      </div>
                      
                      {/* Sign Out */}
                      <div className="p-3" style={{
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <button 
                          onClick={async () => {
                            await signOut();
                            setShowUserDropdown(false);
                          }}
                          className="w-full flex items-center space-x-3 p-4 rounded-xl transition-all text-left" 
                          style={{
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 100, 100, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div className="p-2 rounded-lg" style={{backgroundColor: 'rgba(255, 100, 100, 0.15)'}}>
                            <Globe className="h-5 w-5" style={{color: '#FF8A8A'}} />
                          </div>
                          <div className="font-medium" style={{color: '#FF8A8A'}}>Sign Out</div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={{backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E5E0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'reflection', label: 'Reflection Studio', icon: BookOpen },
              { id: 'stress', label: 'Stress Reset', icon: RefreshCw },
              { id: 'chat', label: 'Chat with Elya', icon: MessageCircle },
              { id: 'insights', label: 'Growth Insights', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center px-3 py-4 text-sm font-medium transition-all"
                style={{
                  color: activeTab === tab.id ? '#A8C09A' : '#1A1A1A',
                  borderBottom: activeTab === tab.id ? '3px solid #A8C09A' : '3px solid transparent',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  paddingBottom: '13px'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = '#6B7C6B';
                    e.currentTarget.style.background = 'rgba(168, 192, 154, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = '#1A1A1A';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Render different content based on active tab */}
      {activeTab === 'reflection' && renderReflectionStudio()}
      {activeTab === 'home' && renderDashboardHome()}
      {activeTab === 'stress' && renderStressReset()}
      {activeTab === 'chat' && renderChatWithElya()}
      {activeTab === 'insights' && renderGrowthInsights()}
      
      {/* Privacy Page Overlay */}
      {showPrivacyPage && renderPrivacyPage()}
    </div>
  );
}

export default App;