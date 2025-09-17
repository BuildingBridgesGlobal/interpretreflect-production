import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, Users, Shield, Award, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { analytics } from '../utils/analytics';
import { HeartPulseIcon, SecureLockIcon, CommunityIcon, TargetIcon } from './CustomIcon';

interface ConversionFlowProps {
  onClose: () => void;
  trigger: 'exit-intent' | 'time-delay' | 'scroll' | 'manual';
}

export function ConversionFlow({ onClose, trigger }: ConversionFlowProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Track conversion flow appearance
  useEffect(() => {
    analytics.trackConversion(trigger, 'modal_shown');
  }, [trigger]);

  // Urgency timer
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTriggerMessage = () => {
    switch (trigger) {
      case 'exit-intent':
        return "Wait! Don't miss out on your wellness journey";
      case 'time-delay':
        return "Transform your interpreting career today";
      case 'scroll':
        return "You're interested in interpreter wellness - we can help!";
      default:
        return "Transform your interpreting career today";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track conversion completion
    analytics.trackConversionComplete(trigger, email);
    
    setSubmitted(true);
  };

  const socialProof = [
    { name: "Sarah M.", role: "Medical Interpreter", rating: 5, text: "Game-changer for burnout prevention" },
    { name: "James L.", role: "Court Interpreter", rating: 5, text: "Elya feels like having a therapist on call" },
    { name: "Maria G.", role: "Educational Interpreter", rating: 5, text: "Perfect 3-minute exercises between assignments" },
  ];

  const benefits = [
    { icon: <Shield className="w-5 h-5" />, text: "7-day free trial - cancel anytime" },
    { icon: <Users className="w-5 h-5" />, text: "Join 2,500+ interpreters already using InterpretReflect" },
    { icon: <Award className="w-5 h-5" />, text: "Reduce burnout by 40% in first month" },
    { icon: <Clock className="w-5 h-5" />, text: "Just 3 minutes daily for lasting wellness" },
  ];

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
          <p className="text-gray-600 mb-4">
            We'll send you exclusive wellness tips and early access to new features.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-emerald-700 text-white py-3 rounded-lg font-semibold hover:bg-emerald-800 transition-colors"
          >
            Continue Exploring
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b bg-gradient-to-r from-green-50 to-blue-50">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 font-semibold"
          >
            <X className="w-7 h-7" />
          </button>
          
          {/* Urgency Timer */}
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium inline-block mb-3">
            ⏰ Limited Time: {formatTime(timeLeft)} remaining
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {getTriggerMessage()}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <>
              {/* CTA */}
              <div className="bg-gradient-to-r from-emerald-700 to-blue-700 text-white p-6 rounded-xl text-center">
                <h3 className="text-xl font-bold mb-2">Special Offer: 3-Day Free Trial</h3>
                <p className="text-sm opacity-90 mb-4">
                  Usually $12.99/month • No credit card required for trial
                </p>
                <button
                  onClick={() => {
                    analytics.trackConversion(trigger, 'cta_clicked');
                    setStep(2);
                  }}
                  className="w-full bg-white text-emerald-700 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-xs opacity-75 mt-2">
                  Cancel anytime • No commitment
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Get Early Access</h3>
                <p className="text-gray-600">
                  Enter your email to start your free trial and receive exclusive wellness tips
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-700 text-white py-3 rounded-lg font-semibold hover:bg-emerald-800 transition-colors"
                >
                  Start My Free Trial
                </button>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    By signing up, you agree to our{' '}
                    <a href="/terms" className="text-emerald-700 hover:underline">Terms</a> and{' '}
                    <a href="/privacy" className="text-emerald-700 hover:underline">Privacy Policy</a>
                  </p>
                </div>
              </form>

              {/* Trust Signals */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <SecureLockIcon size={16} />
                    <span>SSL Secured</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <HeartPulseIcon size={16} />
                    <span>HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CommunityIcon size={16} />
                    <span>2,500+ Users</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}