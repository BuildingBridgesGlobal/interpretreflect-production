import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reflectionService } from '../services/reflectionService';
import {
  Activity,
  Wind,
  Heart,
  Brain,
  BookOpen,
  Shield,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Timer,
  TrendingDown,
  RefreshCw,
  MessageSquare,
  Target,
  Mic,
  Save,
} from 'lucide-react';

interface PostAssignmentDebriefProps {
  onComplete?: (results: DebriefResults) => void;
  onClose?: () => void;
}

interface DebriefResults {
  stressLevelBefore: number;
  stressLevelAfter: number;
  completionLevel: string;
  hardestPart: string;
  stillHolding: string;
  handledWell: string;
  clientEmotions: string[];
  professionalResponses: string[];
  personalEmotions: string[];
  newLearning: string;
  communicationPattern: string;
  futureChange: string;
  redFlags: string[];
  timestamp: Date;
}

const PostAssignmentDebrief: React.FC<PostAssignmentDebriefProps> = ({ onComplete, onClose }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [shakeTimer, setShakeTimer] = useState(20);
  const [isShaking, setIsShaking] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [jawReleaseTimer, setJawReleaseTimer] = useState(20);
  const [isReleasingJaw, setIsReleasingJaw] = useState(false);

  // Form states
  const [hardestPart, setHardestPart] = useState('');
  const [stillHolding, setStillHolding] = useState('');
  const [handledWell, setHandledWell] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Emotions tracking
  const [clientEmotions, setClientEmotions] = useState<string[]>([]);
  const [professionalResponses, setProfessionalResponses] = useState<string[]>([]);
  const [personalEmotions, setPersonalEmotions] = useState<string[]>([]);
  const [otherClientEmotion, setOtherClientEmotion] = useState('');
  const [otherPersonalEmotion, setOtherPersonalEmotion] = useState('');
  const [struggledWith, setStruggledWith] = useState('');

  // Learning capture
  const [newTerminology, setNewTerminology] = useState('');
  const [communicationPattern, setCommunicationPattern] = useState('');
  const [futureChange, setFutureChange] = useState('');

  // Boundary restoration
  const [boundaryComplete, setBoundaryComplete] = useState(false);

  // Red flags
  const [redFlags, setRedFlags] = useState<string[]>([]);

  // Recovery indicators
  const [stressLevelBefore, setStressLevelBefore] = useState(0);
  const [stressLevelAfter, setStressLevelAfter] = useState(0);
  const [completionLevel, setCompletionLevel] = useState('');

  const steps = [
    { title: 'Immediate Discharge', duration: '60 seconds', icon: Activity },
    { title: 'Cognitive Offloading', duration: '90 seconds', icon: Brain },
    { title: 'Emotional Differentiation', duration: '60 seconds', icon: Heart },
    { title: 'Memory Consolidation', duration: '60 seconds', icon: BookOpen },
    { title: 'Boundary Restoration', duration: '30 seconds', icon: Shield },
  ];

  // Shake timer
  useEffect(() => {
    if (isShaking && shakeTimer > 0) {
      const interval = setInterval(() => {
        setShakeTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (shakeTimer === 0) {
      setIsShaking(false);
    }
  }, [isShaking, shakeTimer]);

  // Jaw release timer
  useEffect(() => {
    if (isReleasingJaw && jawReleaseTimer > 0) {
      const interval = setInterval(() => {
        setJawReleaseTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (jawReleaseTimer === 0) {
      setIsReleasingJaw(false);
    }
  }, [isReleasingJaw, jawReleaseTimer]);

  const startShaking = () => {
    setIsShaking(true);
    setShakeTimer(20);
  };

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathCount(0);
  };

  const completeBreath = () => {
    setBreathCount((prev) => prev + 1);
    if (breathCount >= 2) {
      setIsBreathing(false);
    }
  };

  const startJawRelease = () => {
    setIsReleasingJaw(true);
    setJawReleaseTimer(20);
  };

  const toggleEmotion = (emotion: string, category: 'client' | 'professional' | 'personal') => {
    if (category === 'client') {
      setClientEmotions((prev) =>
        prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
      );
    } else if (category === 'professional') {
      setProfessionalResponses((prev) =>
        prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
      );
    } else {
      setPersonalEmotions((prev) =>
        prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
      );
    }
  };

  const toggleRedFlag = (flag: string) => {
    setRedFlags((prev) => (prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]));
  };

  const completeDebrief = async () => {
    const results: DebriefResults = {
      stressLevelBefore,
      stressLevelAfter,
      completionLevel,
      hardestPart,
      stillHolding,
      handledWell,
      clientEmotions,
      professionalResponses,
      personalEmotions,
      newLearning: newTerminology,
      communicationPattern,
      futureChange,
      redFlags,
      timestamp: new Date(),
    };

    // Save to database using reflectionService
    try {
      if (user?.id) {
        console.log('PostAssignmentDebrief - Saving with reflectionService');

        const result = await reflectionService.saveReflection(
          user.id,
          'post_assignment_debrief',
          results
        );

        if (!result.success) {
          console.error('PostAssignmentDebrief - Error saving:', result.error);
        } else {
          console.log('PostAssignmentDebrief - Saved successfully');
        }
      } else {
        console.error('PostAssignmentDebrief - No user found');
      }
    } catch (error) {
      console.error('PostAssignmentDebrief - Error saving to database:', error);
    }

    // Call onComplete with results
    onComplete?.(results);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        // Immediate Discharge
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
              >
                <Activity className="h-10 w-10" style={{ color: '#EF4444' }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Immediate Discharge
              </h2>
              <p className="text-sm" style={{ color: '#6B7C6B' }}>
                Based on Somatic Experiencing (Levine, 1997) & Polyvagal Theory (Porges, 2011)
              </p>
            </div>

            {/* Physical Reset Sequence */}
            <div className="space-y-6">
              {/* Shake it out */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-red-50 to-orange-50">
                <div className="flex items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <span className="font-bold text-red-600">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2" style={{ color: '#1A1A1A' }}>
                      Shake it out
                    </h3>
                    <p className="text-sm mb-3" style={{ color: '#3A3A3A' }}>
                      Literally shake hands, arms, shoulders. Jump in place if possible.
                    </p>

                    {/* Shake Animation */}
                    {isShaking && (
                      <div className="relative h-32 mb-4">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className={`w-24 h-24 rounded-full ${isShaking ? 'animate-bounce' : ''}`}
                            style={{
                              backgroundColor: '#FCA5A5',
                              animation: isShaking ? 'shake 0.5s infinite' : 'none',
                            }}
                          >
                            <div className="flex items-center justify-center h-full">
                              <Activity className="h-12 w-12 text-white" />
                            </div>
                          </div>
                          {isShaking && (
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                              <p className="text-2xl font-bold" style={{ color: '#EF4444' }}>
                                {shakeTimer}s
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!isShaking && shakeTimer === 20 && (
                      <button
                        onClick={startShaking}
                        className="w-full px-4 py-2 rounded-lg bg-red-500 text-white font-semibold"
                      >
                        Start Shaking
                      </button>
                    )}

                    {shakeTimer === 0 && (
                      <div className="p-3 rounded-lg bg-[rgba(107,130,104,0.05)]">
                        <CheckCircle className="h-5 w-5 text-green-500 inline mr-2" />
                        <span className="text-sm" style={{ color: '#059669' }}>
                          Stress hormones discharged!
                        </span>
                      </div>
                    )}

                    <div className="mt-3 p-3 rounded-lg bg-white/50">
                      <p className="text-xs" style={{ color: '#6B7C6B' }}>
                        <strong>Science:</strong> Discharges trapped stress hormones (Berceli, 2005)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Physiological Sigh */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="font-bold text-blue-600">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2" style={{ color: '#1A1A1A' }}>
                      Physiological Sigh
                    </h3>
                    <p className="text-sm mb-3" style={{ color: '#3A3A3A' }}>
                      Double inhale through nose, long exhale through mouth. Repeat 3 times.
                    </p>

                    {/* Breathing Animation */}
                    <div className="relative h-32 mb-4">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={`w-24 h-24 rounded-full transition-all duration-2000 ${
                            isBreathing ? 'scale-125' : 'scale-100'
                          }`}
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.3)',
                            border: '3px solid #3B82F6',
                          }}
                        >
                          <Wind className="h-10 w-10" style={{ color: '#3B82F6' }} />
                        </div>
                        <div className="absolute bottom-0">
                          <p className="text-sm font-medium" style={{ color: '#3B82F6' }}>
                            {isBreathing
                              ? 'Inhale-Inhale... Exhale...'
                              : `Completed: ${breathCount}/3`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!isBreathing && breathCount < 3 && (
                        <button
                          onClick={startBreathing}
                          className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold"
                        >
                          {breathCount === 0 ? 'Start Breathing' : 'Next Breath'}
                        </button>
                      )}

                      {isBreathing && (
                        <button
                          onClick={completeBreath}
                          className="flex-1 px-4 py-2 rounded-lg bg-blue-400 text-white font-semibold"
                        >
                          Complete Breath
                        </button>
                      )}
                    </div>

                    {breathCount >= 3 && (
                      <div className="p-3 rounded-lg bg-[rgba(107,130,104,0.05)] mt-3">
                        <CheckCircle className="h-5 w-5 text-green-500 inline mr-2" />
                        <span className="text-sm" style={{ color: '#059669' }}>
                          Autonomic nervous system calmed!
                        </span>
                      </div>
                    )}

                    <div className="mt-3 p-3 rounded-lg bg-white/50">
                      <p className="text-xs" style={{ color: '#6B7C6B' }}>
                        <strong>Science:</strong> Fastest way to calm nervous system (Huberman Lab,
                        2023)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Jaw & Shoulder Release */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <span className="font-bold text-green-600">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2" style={{ color: '#1A1A1A' }}>
                      Jaw & Shoulder Release
                    </h3>
                    <p className="text-sm mb-3" style={{ color: '#3A3A3A' }}>
                      Open mouth wide, move jaw side to side. Roll shoulders backward 5 times.
                    </p>

                    {/* Jaw Release Animation */}
                    {isReleasingJaw && (
                      <div className="relative h-24 mb-4">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex space-x-4">
                            <div
                              className={`w-16 h-16 rounded-full bg-green-200 flex items-center justify-center ${
                                isReleasingJaw ? 'animate-pulse' : ''
                              }`}
                            >
                              <span className="text-2xl">😮</span>
                            </div>
                            <div
                              className={`w-16 h-16 rounded-full bg-green-200 flex items-center justify-center`}
                              style={{
                                animation: isReleasingJaw ? 'rotate 2s linear infinite' : 'none',
                              }}
                            >
                              <RefreshCw className="h-8 w-8 text-green-600" />
                            </div>
                          </div>
                          {isReleasingJaw && (
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                              <p className="text-lg font-bold" style={{ color: '#10B981' }}>
                                {jawReleaseTimer}s
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!isReleasingJaw && jawReleaseTimer === 20 && (
                      <button
                        onClick={startJawRelease}
                        className="w-full px-4 py-2 rounded-lg bg-[rgba(107,130,104,0.05)]0 text-white font-semibold"
                      >
                        Start Release
                      </button>
                    )}

                    {jawReleaseTimer === 0 && (
                      <div className="p-3 rounded-lg bg-[rgba(107,130,104,0.05)]">
                        <CheckCircle className="h-5 w-5 text-green-500 inline mr-2" />
                        <span className="text-sm" style={{ color: '#059669' }}>
                          Tension released!
                        </span>
                      </div>
                    )}

                    <div className="mt-3 p-3 rounded-lg bg-white/50">
                      <p className="text-xs" style={{ color: '#6B7C6B' }}>
                        <strong>Science:</strong> Releases tension from concentrated listening
                        (Gawler & Leach, 2019)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <style jsx>{`
              @keyframes shake {
                0%,
                100% {
                  transform: translateX(0);
                }
                25% {
                  transform: translateX(-10px);
                }
                75% {
                  transform: translateX(10px);
                }
              }
              @keyframes rotate {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        );

      case 1:
        // Cognitive Offloading
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{ backgroundColor: 'rgba(147, 51, 234, 0.2)' }}
              >
                <Brain className="h-10 w-10" style={{ color: '#9333EA' }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Cognitive Offloading
              </h2>
              <p className="text-sm" style={{ color: '#6B7C6B' }}>
                Based on Expressive Writing research (Pennebaker, 1997)
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
              <h3 className="font-semibold mb-4" style={{ color: '#1A1A1A' }}>
                Stream-of-Consciousness Dump
              </h3>
              <p className="text-sm mb-6" style={{ color: '#6B7C6B' }}>
                Write or voice-record WITHOUT editing (30 seconds each):
              </p>

              {/* Recording Option */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center ${
                    isRecording ? 'bg-red-500' : 'bg-purple-500'
                  } text-white`}
                >
                  <Mic className="h-5 w-5 mr-2" />
                  {isRecording ? 'Stop Recording' : 'Start Voice Recording'}
                </button>
              </div>

              <div className="space-y-4">
                {/* Hardest Part */}
                <div className="p-4 rounded-xl bg-white/70">
                  <label className="block mb-2">
                    <span className="font-medium" style={{ color: '#1A1A1A' }}>
                      "The hardest part of that assignment was..."
                    </span>
                    <span className="text-xs ml-2" style={{ color: '#6B7C6B' }}>
                      (30 seconds - don't overthink, just dump)
                    </span>
                  </label>
                  <textarea
                    value={hardestPart}
                    onChange={(e) => setHardestPart(e.target.value)}
                    placeholder="Just let it flow..."
                    className="w-full px-4 py-3 rounded-lg border resize-none"
                    rows={3}
                    style={{ borderColor: '#E8E5E0' }}
                  />
                </div>

                {/* Still Holding */}
                <div className="p-4 rounded-xl bg-white/70">
                  <label className="block mb-2">
                    <span className="font-medium" style={{ color: '#1A1A1A' }}>
                      "I'm still holding onto..."
                    </span>
                    <span className="text-xs ml-2" style={{ color: '#6B7C6B' }}>
                      (30 seconds - name it to tame it)
                    </span>
                  </label>
                  <textarea
                    value={stillHolding}
                    onChange={(e) => setStillHolding(e.target.value)}
                    placeholder="What's lingering..."
                    className="w-full px-4 py-3 rounded-lg border resize-none"
                    rows={3}
                    style={{ borderColor: '#E8E5E0' }}
                  />
                </div>

                {/* Handled Well */}
                <div className="p-4 rounded-xl bg-white/70">
                  <label className="block mb-2">
                    <span className="font-medium" style={{ color: '#1A1A1A' }}>
                      "I handled well..."
                    </span>
                    <span className="text-xs ml-2" style={{ color: '#6B7C6B' }}>
                      (30 seconds - mandatory self-acknowledgment)
                    </span>
                  </label>
                  <textarea
                    value={handledWell}
                    onChange={(e) => setHandledWell(e.target.value)}
                    placeholder="Give yourself credit..."
                    className="w-full px-4 py-3 rounded-lg border resize-none"
                    rows={3}
                    style={{ borderColor: '#E8E5E0' }}
                  />
                </div>
              </div>

              <div
                className="mt-6 p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}
              >
                <p className="text-sm" style={{ color: '#5C7F4F' }}>
                  <strong>Impact:</strong> 90 seconds of expressive writing reduces cortisol by 23%
                  and improves sleep quality by 29% (Pennebaker & Chung, 2011)
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        // Emotional Differentiation
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
                Emotional Differentiation
              </h2>
              <p className="text-sm" style={{ color: '#6B7C6B' }}>
                Based on Emotional Granularity research (Barrett, 2004)
              </p>
            </div>

            <div className="space-y-6">
              {/* Client's Emotions */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-red-50 to-pink-50">
                <h3 className="font-semibold mb-4" style={{ color: '#1A1A1A' }}>
                  Client's emotions I witnessed:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Anger', 'Grief', 'Fear', 'Frustration', 'Joy', 'Shame'].map((emotion) => (
                    <button
                      key={emotion}
                      onClick={() => toggleEmotion(emotion, 'client')}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        clientEmotions.includes(emotion)
                          ? 'bg-red-100 border-red-400'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <span className="flex items-center justify-center">
                        {clientEmotions.includes(emotion) && (
                          <CheckCircle className="h-4 w-4 mr-2 text-red-500" />
                        )}
                        {emotion}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Other emotion..."
                    value={otherClientEmotion}
                    onChange={(e) => setOtherClientEmotion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ borderColor: '#E8E5E0' }}
                  />
                </div>
              </div>

              {/* Professional Responses */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50">
                <h3 className="font-semibold mb-4" style={{ color: '#1A1A1A' }}>
                  My professional responses:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Stayed neutral', 'Felt pulled in', 'Maintained boundaries'].map((response) => (
                    <button
                      key={response}
                      onClick={() => toggleEmotion(response, 'professional')}
                      className={`px-4 py-2 rounded-lg border-2 transition-all text-left ${
                        professionalResponses.includes(response)
                          ? 'bg-blue-100 border-blue-400'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <span className="flex items-center">
                        {professionalResponses.includes(response) && (
                          <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                        )}
                        {response}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="block mb-2 text-sm" style={{ color: '#6B7C6B' }}>
                    Struggled with:
                  </label>
                  <input
                    type="text"
                    placeholder="What was challenging..."
                    value={struggledWith}
                    onChange={(e) => setStruggledWith(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ borderColor: '#E8E5E0' }}
                  />
                </div>
              </div>

              {/* Personal Emotions */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50">
                <h3 className="font-semibold mb-2" style={{ color: '#1A1A1A' }}>
                  My personal emotions (it's okay to have them):
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Satisfied', 'Drained', 'Triggered', 'Proud', 'Frustrated'].map((emotion) => (
                    <button
                      key={emotion}
                      onClick={() => toggleEmotion(emotion, 'personal')}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        personalEmotions.includes(emotion)
                          ? 'bg-green-100 border-green-400'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <span className="flex items-center justify-center">
                        {personalEmotions.includes(emotion) && (
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        )}
                        {emotion}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Other feeling..."
                    value={otherPersonalEmotion}
                    onChange={(e) => setOtherPersonalEmotion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ borderColor: '#E8E5E0' }}
                  />
                </div>
              </div>

              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}
              >
                <p className="text-sm" style={{ color: '#5C7F4F' }}>
                  <strong>Science:</strong> Naming emotions with precision reduces their intensity
                  by 50% (Lieberman et al., 2007)
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        // Memory Consolidation
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
              >
                <BookOpen className="h-10 w-10" style={{ color: '#3B82F6' }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Memory Consolidation
              </h2>
              <p className="text-sm" style={{ color: '#6B7C6B' }}>
                Based on Reconsolidation Theory (Nader et al., 2000)
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
              <h3 className="font-semibold mb-6" style={{ color: '#1A1A1A' }}>
                Professional Learning Capture
              </h3>

              <div className="space-y-6">
                {/* New Terminology */}
                <div className="p-4 rounded-xl bg-white/70">
                  <label className="block mb-3">
                    <div className="flex items-center mb-2">
                      <Target className="h-5 w-5 mr-2" style={{ color: '#3B82F6' }} />
                      <span className="font-medium" style={{ color: '#1A1A1A' }}>
                        New terminology/concept learned:
                      </span>
                    </div>
                  </label>
                  <textarea
                    value={newTerminology}
                    onChange={(e) => setNewTerminology(e.target.value)}
                    placeholder="What new terms or concepts did you encounter?"
                    className="w-full px-4 py-3 rounded-lg border resize-none"
                    rows={2}
                    style={{ borderColor: '#E8E5E0' }}
                  />
                </div>

                {/* Communication Pattern */}
                <div className="p-4 rounded-xl bg-white/70">
                  <label className="block mb-3">
                    <div className="flex items-center mb-2">
                      <MessageSquare className="h-5 w-5 mr-2" style={{ color: '#3B82F6' }} />
                      <span className="font-medium" style={{ color: '#1A1A1A' }}>
                        Communication pattern I noticed:
                      </span>
                    </div>
                  </label>
                  <textarea
                    value={communicationPattern}
                    onChange={(e) => setCommunicationPattern(e.target.value)}
                    placeholder="What patterns did you observe in communication?"
                    className="w-full px-4 py-3 rounded-lg border resize-none"
                    rows={2}
                    style={{ borderColor: '#E8E5E0' }}
                  />
                </div>

                {/* Future Change */}
                <div className="p-4 rounded-xl bg-white/70">
                  <label className="block mb-3">
                    <div className="flex items-center mb-2">
                      <TrendingDown className="h-5 w-5 mr-2" style={{ color: '#3B82F6' }} />
                      <span className="font-medium" style={{ color: '#1A1A1A' }}>
                        Something I'll do differently next time:
                      </span>
                    </div>
                  </label>
                  <textarea
                    value={futureChange}
                    onChange={(e) => setFutureChange(e.target.value)}
                    placeholder="What will you adjust in future assignments?"
                    className="w-full px-4 py-3 rounded-lg border resize-none"
                    rows={2}
                    style={{ borderColor: '#E8E5E0' }}
                  />
                </div>
              </div>

              <div
                className="mt-6 p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              >
                <p className="text-sm" style={{ color: '#1E40AF' }}>
                  <strong>Impact:</strong> Writing learning points within 5 minutes increases
                  retention by 42% (Karpicke & Blunt, 2011)
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        // Boundary Restoration
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
                Boundary Restoration
              </h2>
              <p className="text-sm" style={{ color: '#6B7C6B' }}>
                Based on Professional Identity research (Reid et al., 2018)
              </p>
            </div>

            <div className="space-y-6">
              {/* Closing Ritual */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                <h3 className="font-semibold mb-6" style={{ color: '#1A1A1A' }}>
                  Closing Ritual
                </h3>

                {/* Step 1: Physical Gesture */}
                <div className="mb-6 p-4 rounded-xl bg-white/70">
                  <div className="flex items-start mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <span className="font-bold text-green-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: '#1A1A1A' }}>
                        Physical Gesture
                      </h4>
                      <p className="text-sm mb-4" style={{ color: '#3A3A3A' }}>
                        Push palms away from chest (literally pushing away the session)
                      </p>

                      {/* Animation */}
                      <div className="relative h-32 flex items-center justify-center">
                        <div
                          className={`transition-all duration-1000 ${
                            boundaryComplete ? 'translate-x-12 opacity-50' : 'translate-x-0'
                          }`}
                        >
                          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center">
                            <span className="text-3xl">🤲</span>
                          </div>
                        </div>
                        {boundaryComplete && (
                          <div className="absolute right-8">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Verbal Boundary */}
                <div className="mb-6 p-4 rounded-xl bg-white/70">
                  <div className="flex items-start mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <span className="font-bold text-green-600">2</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2" style={{ color: '#1A1A1A' }}>
                        Verbal Boundary
                      </h4>
                      <div
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}
                      >
                        <p className="italic" style={{ color: '#5C7F4F' }}>
                          "I provided professional service with skill and integrity. This assignment
                          is complete. I release what is not mine to carry."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Identity Statement */}
                <div className="mb-6 p-4 rounded-xl bg-white/70">
                  <div className="flex items-start mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <span className="font-bold text-green-600">3</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2" style={{ color: '#1A1A1A' }}>
                        Identity Statement
                      </h4>
                      <div
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}
                      >
                        <p className="italic" style={{ color: '#5C7F4F' }}>
                          "I am [your name], not the stories I interpret."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {!boundaryComplete && (
                  <button
                    onClick={() => setBoundaryComplete(true)}
                    className="w-full px-6 py-3 rounded-xl font-semibold transition-all"
                    style={{
                      background: 'linear-gradient(145deg, #5C7F4F 0%, #8FA080 100%)',
                      color: '#FFFFFF',
                    }}
                  >
                    Complete Ritual
                  </button>
                )}

                {boundaryComplete && (
                  <div
                    className="p-4 rounded-xl text-center"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                  >
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" style={{ color: '#10B981' }} />
                    <p className="font-medium" style={{ color: '#059669' }}>
                      Boundaries Restored
                    </p>
                    <p className="text-sm mt-1" style={{ color: '#6B7C6B' }}>
                      You are complete and protected
                    </p>
                  </div>
                )}
              </div>

              {/* Red Flag Check */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-6 w-6 mr-2" style={{ color: '#EF4444' }} />
                  <h3 className="font-semibold" style={{ color: '#991B1B' }}>
                    Red Flag Check
                  </h3>
                </div>
                <p className="text-sm mb-4" style={{ color: '#6B7C6B' }}>
                  Seek additional support if you:
                </p>
                <div className="space-y-2">
                  {[
                    "Can't stop thinking about specific details after 24 hours",
                    'Feel numb or disconnected from your own life',
                    'Experience physical symptoms (nausea, headache, chest tightness)',
                    'Have intrusive images/thoughts about the content',
                    'Feel unusual anger or sadness that persists',
                  ].map((flag) => (
                    <button
                      key={flag}
                      onClick={() => toggleRedFlag(flag)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        redFlags.includes(flag)
                          ? 'bg-red-100 border-red-400'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <span className="flex items-start">
                        <div
                          className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 flex-shrink-0 ${
                            redFlags.includes(flag)
                              ? 'bg-red-500 border-red-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {redFlags.includes(flag) && (
                            <CheckCircle className="h-3 w-3 text-white m-auto" />
                          )}
                        </div>
                        <span className="text-sm" style={{ color: '#3A3A3A' }}>
                          {flag}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                {redFlags.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-red-100">
                    <p className="text-sm font-medium" style={{ color: '#991B1B' }}>
                      ⚠️ Consider reaching out to a supervisor or mental health professional
                    </p>
                  </div>
                )}
              </div>

              {/* Recovery Quality Indicator */}
              <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#E8E5E0' }}>
                <h3 className="font-semibold mb-4" style={{ color: '#1A1A1A' }}>
                  Recovery Quality Indicator
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm" style={{ color: '#6B7C6B' }}>
                      Stress level BEFORE this debrief:
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          onClick={() => setStressLevelBefore(level)}
                          className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all ${
                            stressLevelBefore === level
                              ? 'bg-red-500 text-white border-red-500'
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm" style={{ color: '#6B7C6B' }}>
                      Stress level AFTER this debrief:
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          onClick={() => setStressLevelAfter(level)}
                          className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all ${
                            stressLevelAfter === level
                              ? 'bg-[rgba(107,130,104,0.05)]0 text-white border-[#6B8268]'
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm" style={{ color: '#6B7C6B' }}>
                      Feeling of completion:
                    </label>
                    <div className="space-y-2">
                      {[
                        'Session fully processed',
                        'Mostly processed',
                        'Still carrying some weight',
                        'Need additional support',
                      ].map((level) => (
                        <button
                          key={level}
                          onClick={() => setCompletionLevel(level)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${
                            completionLevel === level
                              ? 'bg-green-100 border-green-400'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <span className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border-2 mr-3 ${
                                completionLevel === level
                                  ? 'bg-[rgba(107,130,104,0.05)]0 border-[#6B8268]'
                                  : 'border-gray-300'
                              }`}
                            >
                              {completionLevel === level && (
                                <CheckCircle className="h-3 w-3 text-white m-auto" />
                              )}
                            </div>
                            <span className="text-sm" style={{ color: '#3A3A3A' }}>
                              {level}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
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
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b" style={{ borderColor: '#E8E5E0' }}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              Post-Assignment Debrief
            </h1>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors text-white"
              style={{ background: 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))' }}
            >
              <ChevronRight className="h-5 w-5" />
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
                        ? 'bg-[rgba(107,130,104,0.05)]0 text-white'
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
                      currentStep > index ? 'bg-[rgba(107,130,104,0.05)]0' : 'bg-gray-200'
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
                onClick={completeDebrief}
                className="px-8 py-3 rounded-xl font-semibold transition-all flex items-center"
                style={{
                  background: 'linear-gradient(145deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                }}
              >
                <Save className="h-5 w-5 mr-2" />
                Complete Debrief
              </button>
            )}
          </div>

          {/* Stress Reduction Indicator */}
          {currentStep === steps.length - 1 && stressLevelBefore > 0 && stressLevelAfter > 0 && (
            <div
              className="mt-6 p-4 rounded-xl"
              style={{
                backgroundColor:
                  stressLevelAfter < stressLevelBefore
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
              }}
            >
              <div className="flex items-center justify-center">
                {stressLevelAfter < stressLevelBefore ? (
                  <>
                    <TrendingDown className="h-6 w-6 mr-2" style={{ color: '#10B981' }} />
                    <span className="font-semibold" style={{ color: '#059669' }}>
                      Stress reduced by {stressLevelBefore - stressLevelAfter} levels!
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-6 w-6 mr-2" style={{ color: '#EF4444' }} />
                    <span className="font-semibold" style={{ color: '#991B1B' }}>
                      Consider additional support if stress persists
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostAssignmentDebrief;
