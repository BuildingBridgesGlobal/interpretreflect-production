import React, { useState, useEffect } from 'react';
import {
  Activity,
  Brain,
  Heart,
  Eye,
  Hand,
  Ear,
  Wind,
  Coffee,
  Shield,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Target,
  Sparkles,
  Timer,
  Award,
  TrendingUp,
} from 'lucide-react';

interface PreAssignmentPrepProps {
  onComplete?: (results: PrepResults) => void;
  onClose?: () => void;
}

interface PrepResults {
  cognitiveLoad: string;
  completedSteps: string[];
  intention: string;
  successMemory: string;
  stressLevel: number;
  energyLevel: number;
  timestamp: Date;
}

const PreAssignmentPrep: React.FC<PreAssignmentPrepProps> = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [cognitiveLoad, setCognitiveLoad] = useState<string>('');
  const [isButterflying, setIsButterflying] = useState(false);
  const [butterflyTimer, setButterflyTimer] = useState(30);
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingInputs, setGroundingInputs] = useState({
    see: ['', '', '', '', ''],
    touch: ['', '', '', ''],
    hear: ['', '', ''],
    smell: ['', ''],
    taste: [''],
  });
  const [intention, setIntention] = useState('');
  const [successMemory, setSuccessMemory] = useState('');
  const [shieldActive, setShieldActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [tapSide, setTapSide] = useState<'left' | 'right'>('left');
  const [stressLevel, setStressLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);

  const steps = [
    { title: 'Stress & Energy Check', duration: '15 seconds', icon: Activity },
    { title: 'Cognitive Load Check', duration: '30 seconds', icon: Brain },
    { title: 'Bilateral Stimulation Reset', duration: '45 seconds', icon: Heart },
    { title: 'Attention Anchoring', duration: '45 seconds', icon: Eye },
    { title: 'Performance State Activation', duration: '45 seconds', icon: Target },
    { title: 'Boundary Shield', duration: '15 seconds', icon: Shield },
  ];

  // Butterfly hug animation
  useEffect(() => {
    if (isButterflying && butterflyTimer > 0) {
      const interval = setInterval(() => {
        setButterflyTimer((prev) => prev - 1);
        setTapSide((prev) => (prev === 'left' ? 'right' : 'left'));
      }, 1000);
      return () => clearInterval(interval);
    } else if (butterflyTimer === 0) {
      setIsButterflying(false);
      markStepComplete('bilateral');
    }
  }, [isButterflying, butterflyTimer]);

  const markStepComplete = (step: string) => {
    setCompletedSteps((prev) => [...prev, step]);
  };

  const handleCognitiveLoadSelect = (level: string) => {
    setCognitiveLoad(level);
    markStepComplete('cognitive-check');
  };

  const startButterfly = () => {
    setIsButterflying(true);
    setButterflyTimer(30);
  };

  const completePrep = () => {
    const results: PrepResults = {
      cognitiveLoad,
      completedSteps,
      intention,
      successMemory,
      stressLevel,
      energyLevel,
      timestamp: new Date(),
    };
    onComplete?.(results);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        // Stress & Energy Check
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{ backgroundColor: 'rgba(92, 127, 79, 0.2)' }}
              >
                <Activity className="h-10 w-10" style={{ color: '#5C7F4F' }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Quick Check-In
              </h2>
              <p className="text-sm" style={{ color: '#6B7C6B' }}>
                Let's assess your current state
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <p className="font-medium mb-3" style={{ color: '#1A1A1A' }}>
                  Current Stress Level:
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: '#10B981' }}>Low</span>
                  <span className="text-sm" style={{ color: '#EF4444' }}>High</span>
                </div>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <button
                      key={level}
                      onClick={() => setStressLevel(level)}
                      className={`flex-1 h-12 rounded-lg transition-all ${
                        stressLevel === level ? 'scale-110' : ''
                      }`}
                      style={{
                        backgroundColor: stressLevel === level 
                          ? level <= 3 ? '#10B981' : level <= 7 ? '#F59E0B' : '#EF4444'
                          : '#E8E5E0',
                        border: stressLevel === level ? '2px solid #1A1A1A' : 'none',
                      }}
                    >
                      <span className="font-bold" style={{ color: stressLevel === level ? '#FFFFFF' : '#9CA3AF' }}>
                        {level}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-medium mb-3" style={{ color: '#1A1A1A' }}>
                  Current Energy Level:
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: '#EF4444' }}>Low</span>
                  <span className="text-sm" style={{ color: '#10B981' }}>High</span>
                </div>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <button
                      key={level}
                      onClick={() => setEnergyLevel(level)}
                      className={`flex-1 h-12 rounded-lg transition-all ${
                        energyLevel === level ? 'scale-110' : ''
                      }`}
                      style={{
                        backgroundColor: energyLevel === level 
                          ? level <= 3 ? '#EF4444' : level <= 7 ? '#F59E0B' : '#10B981'
                          : '#E8E5E0',
                        border: energyLevel === level ? '2px solid #1A1A1A' : 'none',
                      }}
                    >
                      <span className="font-bold" style={{ color: energyLevel === level ? '#FFFFFF' : '#9CA3AF' }}>
                        {level}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  markStepComplete('stress-energy');
                  setCurrentStep(1);
                }}
                className="w-full py-3 rounded-xl font-semibold transition-all"
                style={{
                  backgroundColor: '#5C7F4F',
                  color: '#FFFFFF',
                }}
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 1:
        // Cognitive Load Check  
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{ backgroundColor: 'rgba(92, 127, 79, 0.2)' }}
              >
                <Brain className="h-10 w-10" style={{ color: '#5C7F4F' }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Cognitive Load Check
              </h2>
              <p className="text-sm" style={{ color: '#6B7C6B' }}>
                Based on Cognitive Load Theory (Sweller, 1988)
              </p>
            </div>

            <div className="space-y-3">
              <p className="font-medium mb-4" style={{ color: '#1A1A1A' }}>
                Rate your current mental state:
              </p>
              {[
                { value: 'clear', label: 'Clear and focused', color: '#10B981', icon: '😊' },
                { value: 'scattered', label: 'Slightly scattered', color: '#F59E0B', icon: '😐' },
                {
                  value: 'overwhelmed',
                  label: 'Moderately overwhelmed',
                  color: '#EF4444',
                  icon: '😟',
                },
                { value: 'overloaded', label: 'Severely overloaded', color: '#991B1B', icon: '😰' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleCognitiveLoadSelect(option.value)}
                  className={`w-full p-4 rounded-xl text-left transition-all flex items-center ${
                    cognitiveLoad === option.value ? 'scale-105' : ''
                  }`}
                  style={{
                    backgroundColor:
                      cognitiveLoad === option.value ? option.color + '20' : '#FFFFFF',
                    border: `2px solid ${cognitiveLoad === option.value ? option.color : '#E8E5E0'}`,
                  }}
                >
                  <span className="text-2xl mr-3">{option.icon}</span>
                  <span className="font-medium" style={{ color: '#1A1A1A' }}>
                    {option.label}
                  </span>
                  {cognitiveLoad === option.value && (
                    <CheckCircle className="h-5 w-5 ml-auto" style={{ color: option.color }} />
                  )}
                </button>
              ))}
            </div>

            {(cognitiveLoad === 'scattered' ||
              cognitiveLoad === 'overwhelmed' ||
              cognitiveLoad === 'overloaded') && (
              <div
                className="mt-6 p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5" style={{ color: '#EF4444' }} />
                  <div>
                    <p className="font-medium mb-2" style={{ color: '#991B1B' }}>
                      Take 3 deep breaths before proceeding
                    </p>
                    <p className="text-sm" style={{ color: '#6B7C6B' }}>
                      Research shows this reduces cortisol within 90 seconds (Ma et al., 2017)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
              >
                <Heart className="h-10 w-10" style={{ color: '#EF4444' }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Bilateral Stimulation Reset
              </h2>
              <p className="text-sm" style={{ color: '#6B7C6B' }}>
                Adapted from EMDR research (Shapiro, 2001)
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-2xl p-6">
              <h3 className="font-semibold mb-4" style={{ color: '#1A1A1A' }}>
                Butterfly Hug Technique:
              </h3>

              {/* Butterfly Animation */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Body */}
                  <div className="w-24 h-32 rounded-full bg-gray-200" />

                  {/* Arms crossed */}
                  <div className="absolute top-8">
                    <div
                      className={`absolute w-16 h-16 rounded-full transition-all duration-500 ${
                        tapSide === 'left' ? 'scale-110' : 'scale-100'
                      }`}
                      style={{
                        backgroundColor: tapSide === 'left' ? '#EF4444' : '#FCA5A5',
                        left: '-30px',
                        top: '20px',
                      }}
                    />
                    <div
                      className={`absolute w-16 h-16 rounded-full transition-all duration-500 ${
                        tapSide === 'right' ? 'scale-110' : 'scale-100'
                      }`}
                      style={{
                        backgroundColor: tapSide === 'right' ? '#EF4444' : '#FCA5A5',
                        right: '-30px',
                        top: '20px',
                      }}
                    />
                  </div>

                  {/* Timer */}
                  {isButterflying && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <p className="text-2xl font-bold" style={{ color: '#EF4444' }}>
                        {butterflyTimer}s
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <span className="font-bold text-red-600">1</span>
                  </div>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    Cross arms over chest, hands on opposite shoulders
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <span className="font-bold text-red-600">2</span>
                  </div>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    Alternate tapping left-right, left-right
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <span className="font-bold text-red-600">3</span>
                  </div>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    Continue for 30 seconds while breathing normally
                  </p>
                </div>
              </div>

              {!isButterflying && !completedSteps.includes('bilateral') && (
                <button
                  onClick={startButterfly}
                  className="w-full px-6 py-3 rounded-xl font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(145deg, #EF4444 0%, #DC2626 100%)',
                    color: '#FFFFFF',
                  }}
                >
                  Start Butterfly Hug
                </button>
              )}

              {completedSteps.includes('bilateral') && (
                <div
                  className="text-center p-4 rounded-xl"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                >
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" style={{ color: '#10B981' }} />
                  <p className="font-medium" style={{ color: '#10B981' }}>
                    Complete!
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#6B7C6B' }}>
                    Anxiety reduced by up to 40% (Jarero et al., 2011)
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
              >
                <Eye className="h-10 w-10" style={{ color: '#3B82F6' }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Attention Anchoring
              </h2>
              <p className="text-sm" style={{ color: '#6B7C6B' }}>
                Based on Attention Restoration Theory (Kaplan, 1995)
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold" style={{ color: '#1A1A1A' }}>
                5-4-3-2-1 Grounding Exercise:
              </h3>

              {/* See - 5 things */}
              <div
                className={`p-4 rounded-xl transition-all ${groundingStep >= 0 ? 'bg-purple-50 border-2 border-purple-400' : 'bg-gray-50'}`}
              >
                <div className="flex items-center mb-3">
                  <Eye className="h-5 w-5 mr-2" style={{ color: '#9333EA' }} />
                  <span className="font-medium" style={{ color: '#1A1A1A' }}>
                    5 things you can see:
                  </span>
                </div>
                <div className="space-y-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Thing ${i + 1}...`}
                      value={groundingInputs.see[i]}
                      onChange={(e) => {
                        const newInputs = { ...groundingInputs };
                        newInputs.see[i] = e.target.value;
                        setGroundingInputs(newInputs);
                      }}
                      className="w-full px-3 py-2 rounded-lg border"
                      style={{ borderColor: '#E8E5E0' }}
                    />
                  ))}
                </div>
              </div>

              {/* Touch - 4 things */}
              <div
                className={`p-4 rounded-xl transition-all ${groundingStep >= 1 ? 'bg-blue-50 border-2 border-blue-400' : 'bg-gray-50'}`}
              >
                <div className="flex items-center mb-3">
                  <Hand className="h-5 w-5 mr-2" style={{ color: '#3B82F6' }} />
                  <span className="font-medium" style={{ color: '#1A1A1A' }}>
                    4 things you can touch:
                  </span>
                </div>
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Thing ${i + 1}...`}
                      value={groundingInputs.touch[i]}
                      onChange={(e) => {
                        const newInputs = { ...groundingInputs };
                        newInputs.touch[i] = e.target.value;
                        setGroundingInputs(newInputs);
                      }}
                      className="w-full px-3 py-2 rounded-lg border"
                      style={{ borderColor: '#E8E5E0' }}
                    />
                  ))}
                </div>
              </div>

              {/* Hear - 3 things */}
              <div
                className={`p-4 rounded-xl transition-all ${groundingStep >= 2 ? 'bg-green-50 border-2 border-green-400' : 'bg-gray-50'}`}
              >
                <div className="flex items-center mb-3">
                  <Ear className="h-5 w-5 mr-2" style={{ color: '#10B981' }} />
                  <span className="font-medium" style={{ color: '#1A1A1A' }}>
                    3 things you can hear:
                  </span>
                </div>
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Sound ${i + 1}...`}
                      value={groundingInputs.hear[i]}
                      onChange={(e) => {
                        const newInputs = { ...groundingInputs };
                        newInputs.hear[i] = e.target.value;
                        setGroundingInputs(newInputs);
                      }}
                      className="w-full px-3 py-2 rounded-lg border"
                      style={{ borderColor: '#E8E5E0' }}
                    />
                  ))}
                </div>
              </div>

              {/* Smell - 2 things */}
              <div
                className={`p-4 rounded-xl transition-all ${groundingStep >= 3 ? 'bg-orange-50 border-2 border-orange-400' : 'bg-gray-50'}`}
              >
                <div className="flex items-center mb-3">
                  <Wind className="h-5 w-5 mr-2" style={{ color: '#FB923C' }} />
                  <span className="font-medium" style={{ color: '#1A1A1A' }}>
                    2 things you can smell:
                  </span>
                </div>
                <div className="space-y-2">
                  {[0, 1].map((i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Scent ${i + 1}...`}
                      value={groundingInputs.smell[i]}
                      onChange={(e) => {
                        const newInputs = { ...groundingInputs };
                        newInputs.smell[i] = e.target.value;
                        setGroundingInputs(newInputs);
                      }}
                      className="w-full px-3 py-2 rounded-lg border"
                      style={{ borderColor: '#E8E5E0' }}
                    />
                  ))}
                </div>
              </div>

              {/* Taste - 1 thing */}
              <div
                className={`p-4 rounded-xl transition-all ${groundingStep >= 4 ? 'bg-red-50 border-2 border-red-400' : 'bg-gray-50'}`}
              >
                <div className="flex items-center mb-3">
                  <Coffee className="h-5 w-5 mr-2" style={{ color: '#EF4444' }} />
                  <span className="font-medium" style={{ color: '#1A1A1A' }}>
                    1 thing you can taste:
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Taste..."
                  value={groundingInputs.taste[0]}
                  onChange={(e) => {
                    const newInputs = { ...groundingInputs };
                    newInputs.taste[0] = e.target.value;
                    setGroundingInputs(newInputs);
                  }}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: '#E8E5E0' }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
              <p className="text-sm" style={{ color: '#2D5F3F' }}>
                <strong>Impact:</strong> Reduces anticipatory stress by 35% (Norris et al., 2018)
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{ backgroundColor: 'rgba(251, 146, 60, 0.2)' }}
              >
                <Target className="h-10 w-10" style={{ color: '#FB923C' }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Performance State Activation
              </h2>
              <p className="text-sm" style={{ color: '#6B7C6B' }}>
                Based on Flow State research (Csikszentmihalyi, 1990)
              </p>
            </div>

            <div className="space-y-6">
              {/* Posture Reset */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50">
                <div className="flex items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                    <span className="font-bold text-orange-600">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2" style={{ color: '#1A1A1A' }}>
                      Posture Reset
                    </h3>
                    <p className="text-sm mb-3" style={{ color: '#3A3A3A' }}>
                      Shoulders back, chin parallel to ground
                    </p>
                    <div className="p-3 rounded-lg bg-white/50">
                      <p className="text-xs" style={{ color: '#6B7C6B' }}>
                        <strong>Science:</strong> Increases testosterone, decreases cortisol (Cuddy
                        et al., 2015)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Intention */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="font-bold text-blue-600">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2" style={{ color: '#1A1A1A' }}>
                      Professional Intention
                    </h3>
                    <p className="text-sm mb-3" style={{ color: '#3A3A3A' }}>
                      Complete this sentence:
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                        "In this assignment, I will facilitate understanding by..."
                      </p>
                      <textarea
                        value={intention}
                        onChange={(e) => setIntention(e.target.value)}
                        placeholder="Your intention..."
                        className="w-full px-4 py-3 rounded-lg border resize-none"
                        rows={3}
                        style={{ borderColor: '#E8E5E0' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Competence Reminder */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <span className="font-bold text-green-600">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2" style={{ color: '#1A1A1A' }}>
                      Competence Reminder
                    </h3>
                    <p className="text-sm mb-3" style={{ color: '#3A3A3A' }}>
                      Recall ONE recent interpreting success:
                    </p>
                    <textarea
                      value={successMemory}
                      onChange={(e) => setSuccessMemory(e.target.value)}
                      placeholder="Describe a moment when you felt proud of your interpreting..."
                      className="w-full px-4 py-3 rounded-lg border resize-none"
                      rows={3}
                      style={{ borderColor: '#E8E5E0' }}
                    />
                    <div className="mt-3 p-3 rounded-lg bg-white/50">
                      <p className="text-xs" style={{ color: '#6B7C6B' }}>
                        <strong>Science:</strong> Activates positive neural pathways (Fredrickson,
                        2001)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{ backgroundColor: 'rgba(92, 127, 79, 0.2)' }}
              >
                <Shield className="h-10 w-10" style={{ color: '#5C7F4F' }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Boundary Shield
              </h2>
              <p className="text-sm" style={{ color: '#6B7C6B' }}>
                Based on Professional Boundary research (Pearlman & Saakvitne, 1995)
              </p>
            </div>

            <div className="relative">
              {/* Shield Visualization */}
              <div className="relative w-64 h-64 mx-auto mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Animated shield bubble */}
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-3000 ${
                      shieldActive ? 'animate-pulse' : ''
                    }`}
                    style={{
                      background: shieldActive
                        ? 'radial-gradient(circle, rgba(92, 127, 79, 0.3) 0%, rgba(92, 127, 79, 0.1) 50%, transparent 100%)'
                        : 'radial-gradient(circle, rgba(92, 127, 79, 0.1) 0%, transparent 100%)',
                      border: shieldActive
                        ? '2px solid rgba(92, 127, 79, 0.5)'
                        : '2px dashed rgba(92, 127, 79, 0.3)',
                    }}
                  />

                  {/* Person in center */}
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <Activity className="h-8 w-8" style={{ color: '#5C7F4F' }} />
                  </div>

                  {/* Floating elements */}
                  {shieldActive && (
                    <>
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <div className="text-xs bg-white px-2 py-1 rounded-full shadow-md">
                          Information ✓
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 animate-pulse">
                        <div className="text-xs bg-red-100 px-2 py-1 rounded-full">Emotions ✗</div>
                      </div>
                      <div
                        className="absolute bottom-0 right-0 animate-pulse"
                        style={{ animationDelay: '0.5s' }}
                      >
                        <div className="text-xs bg-red-100 px-2 py-1 rounded-full">Stress ✗</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="text-center space-y-4">
                <div
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}
                >
                  <h3 className="font-semibold mb-3" style={{ color: '#2D5F3F' }}>
                    Visualize Your Protective Bubble:
                  </h3>
                  <ul className="space-y-2 text-sm text-left max-w-xs mx-auto">
                    <li className="flex items-center">
                      <CheckCircle
                        className="h-4 w-4 mr-2 flex-shrink-0"
                        style={{ color: '#10B981' }}
                      />
                      <span style={{ color: '#3A3A3A' }}>Information passes through clearly</span>
                    </li>
                    <li className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: '#EF4444' }} />
                      <span style={{ color: '#3A3A3A' }}>Emotions bounce off</span>
                    </li>
                    <li className="flex items-center">
                      <Heart className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: '#5C7F4F' }} />
                      <span style={{ color: '#3A3A3A' }}>You remain centered</span>
                    </li>
                  </ul>
                </div>

                {!shieldActive && (
                  <button
                    onClick={() => setShieldActive(true)}
                    className="px-8 py-3 rounded-xl font-semibold transition-all mx-auto"
                    style={{
                      background: 'linear-gradient(145deg, #5C7F4F 0%, #8FA080 100%)',
                      color: '#FFFFFF',
                    }}
                  >
                    Activate Shield
                  </button>
                )}

                {shieldActive && (
                  <div
                    className="p-6 rounded-xl"
                    style={{
                      background: 'linear-gradient(145deg, #F0F9FF 0%, #E0F2FE 100%)',
                      border: '2px solid #5C7F4F',
                    }}
                  >
                    <p className="text-lg font-semibold mb-2" style={{ color: '#2D5F3F' }}>
                      "I am the conduit, not the container."
                    </p>
                    <p className="text-sm" style={{ color: '#6B7C6B' }}>
                      Shield activated. You are protected and ready.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b" style={{ borderColor: '#E8E5E0' }}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              Pre-Assignment Preparation
            </h1>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5" style={{ color: '#6B7C6B' }} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    currentStep === index
                      ? 'bg-gradient-to-br from-green-400 to-green-600 text-white scale-110'
                      : currentStep > index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {currentStep > index ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-full h-1 mx-2 ${
                      currentStep > index ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: '#1A1A1A' }}>
                  {steps[currentStep].title}
                </p>
                <p className="text-sm" style={{ color: '#6B7C6B' }}>
                  {steps[currentStep].duration}
                </p>
              </div>
              <Timer className="h-5 w-5" style={{ color: '#6B7C6B' }} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">{renderStep()}</div>

        {/* Footer */}
        <div className="px-8 py-6 border-t" style={{ borderColor: '#E8E5E0' }}>
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-2 hover:bg-gray-50'
              }`}
              style={{ borderColor: currentStep === 0 ? '#E8E5E0' : '#5C7F4F' }}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-3 rounded-xl font-semibold transition-all flex items-center"
                style={{
                  background: 'linear-gradient(145deg, #5C7F4F 0%, #8FA080 100%)',
                  color: '#FFFFFF',
                }}
              >
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={completePrep}
                className="px-8 py-3 rounded-xl font-semibold transition-all flex items-center"
                style={{
                  background: 'linear-gradient(145deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                }}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Begin Assignment
              </button>
            )}
          </div>

          {currentStep === steps.length - 1 && (
            <div
              className="mt-6 p-4 rounded-xl"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
            >
              <h3 className="font-semibold mb-2" style={{ color: '#059669' }}>
                Ready State Checklist:
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" style={{ color: '#10B981' }} />
                  <span style={{ color: '#3A3A3A' }}>Breathing is steady</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" style={{ color: '#10B981' }} />
                  <span style={{ color: '#3A3A3A' }}>Body feels grounded</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" style={{ color: '#10B981' }} />
                  <span style={{ color: '#3A3A3A' }}>Mind is focused</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" style={{ color: '#10B981' }} />
                  <span style={{ color: '#3A3A3A' }}>Boundaries set</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreAssignmentPrep;
