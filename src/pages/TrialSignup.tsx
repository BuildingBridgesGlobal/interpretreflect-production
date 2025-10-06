import { ArrowLeft, ArrowRight, Check, Shield } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { enchargeService } from '../services/enchargeService';
import { analytics } from '../utils/analytics';

export function TrialSignup() {
  const navigate = useNavigate();
  const { user, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  // const [agreedToTerms, setAgreedToTerms] = useState(false); // Removed - handled in Stripe
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      checkExistingTrial();
    }
  }, [user]);

  const checkExistingTrial = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, trial_started_at')
      .eq('id', user.id)
      .single();

    if (profile?.subscription_status === 'active') {
      navigate('/');
    } else if (profile?.trial_started_at) {
      navigate('/');
    }
  };

  // Validation functions
  const validateName = (value: string): string => {
    if (!value.trim()) {
      return 'Full name is required';
    }
    if (value.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return '';
  };

  const validateEmail = (value: string): string => {
    if (!value.trim()) {
      return 'Email address is required';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value.trim())) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (value: string): string => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (value.length < 8) {
      return 'Consider using at least 8 characters for better security';
    }
    return '';
  };

  const validateTerms = (checked: boolean): string => {
    if (!checked) {
      return 'You must accept the Terms of Service and Privacy Policy';
    }
    return '';
  };

  // Field change handlers with validation
  const handleNameChange = (value: string) => {
    setName(value);
    if (touched.name) {
      setFieldErrors(prev => ({ ...prev, name: validateName(value) }));
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      setFieldErrors(prev => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      setFieldErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }
  };

  // Terms removed - handled in Stripe checkout
  // const handleTermsChange = (checked: boolean) => {
  //   setAgreedToTerms(checked);
  //   if (touched.terms) {
  //     setFieldErrors(prev => ({ ...prev, terms: validateTerms(checked) }));
  //   }
  // };

  // Field blur handler to mark as touched
  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    // Validate on blur
    switch (fieldName) {
      case 'name':
        setFieldErrors(prev => ({ ...prev, name: validateName(name) }));
        break;
      case 'email':
        setFieldErrors(prev => ({ ...prev, email: validateEmail(email) }));
        break;
      case 'password':
        setFieldErrors(prev => ({ ...prev, password: validatePassword(password) }));
        break;
      // Terms case removed - handled in Stripe
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ name: true, email: true, password: true });

    // Validate all fields (terms removed - handled in Stripe)
    const errors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password)
    };

    setFieldErrors(errors);

    // Check if there are any errors
    const hasErrors = Object.values(errors).some(error => error && !error.includes('Consider'));

    if (hasErrors) {
      // Focus on first error field
      if (errors.name) {
        document.getElementById('name')?.focus();
      } else if (errors.email) {
        document.getElementById('email')?.focus();
      } else if (errors.password) {
        document.getElementById('password')?.focus();
      } else if (errors.terms) {
        document.getElementById('terms')?.focus();
      }
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Create account
      await signUp(email, password);

      // Step 2: Get the new user
      const { data: { user: newUser } } = await supabase.auth.getUser();

      if (newUser) {
        // Step 3: Update profile with name
        await supabase
          .from('profiles')
          .update({
            full_name: name,
            updated_at: new Date().toISOString()
          })
          .eq('id', newUser.id);

        // Step 4: Start trial
        const { data: trialData, error: trialError } = await supabase.rpc('start_user_trial', {
          user_id: newUser.id
        });

        if (trialError) throw trialError;

        // Step 5: Track analytics
        analytics.trackTrialStart();

        // Step 6: Add to Encharge
        await enchargeService.handleTrialSignup(email, newUser.id, name);

        // Step 7: Log trial event
        await supabase
          .from('subscription_events')
          .insert({
            user_id: newUser.id,
            event_type: 'trial_started',
            metadata: {
              source: 'trial_signup_page',
              trial_duration_days: 3
            }
          });

        setSuccess(true);

        // Redirect after 3 seconds to the main app
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (err: any) {
      console.error('Trial signup error:', err);
      setError(err.message || 'Failed to start trial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Instant Access to All Premium Features',
    'No Credit Card Required',
    '3 Full Days of Unlimited Access',
    'AI Wellness Companion Elya Included',
    'Your AI wellness companion for instant reflection support',
    'Cancel Anytime, No Questions Asked',
    'Essential Tier After Trial: $12.99/Month'
  ];


  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #F5F9F5, #E8F5E8)' }}>
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
            <Check className="w-8 h-8" style={{ color: '#5C7F4F' }} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to InterpretReflect!
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Your 3-day free trial is now active. Check your email to confirm your account.
          </p>
          <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
            <p className="text-sm" style={{ color: '#5C7F4F' }}>
              Trial expires on: {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #FFF9F5 0%, #F5F9FF 50%, #F9F5FF 100%)',
      }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255, 220, 220, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(220, 240, 255, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 40% 40%, rgba(255, 240, 220, 0.2) 0%, transparent 50%)`,
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Back to Main Menu Button */}
        <div className="container mx-auto px-4 pt-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all shadow-sm backdrop-blur-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#5C7F4F',
              border: '1px solid rgba(45, 95, 63, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(245, 245, 220, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Main Menu
          </button>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left Side - Benefits */}
            <div className="order-2 lg:order-1 space-y-8">
              {/* Hero Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6"
                  style={{
                    backgroundColor: 'rgba(255, 220, 150, 0.3)',
                    color: '#5C7F4F',
                    border: '1px solid rgba(45, 95, 63, 0.2)'
                  }}>
                  ✨ EXCLUSIVE OFFER
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight"
                  style={{
                    background: 'linear-gradient(135deg, #5C7F4F, rgb(127, 92, 127))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                  Start Your Wellness Journey
                </h1>
                <p className="text-xl leading-relaxed" style={{ color: 'rgb(75, 85, 99)' }}>
                  Build your foundation for daily wellness with our evidence-based tools designed specifically for interpreters.
                </p>
              </div>

              {/* Features Grid */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
                <h3 className="font-semibold text-lg mb-4" style={{ color: '#5C7F4F' }}>
                  What's Included:
                </h3>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className={index === 4 ? "ml-6" : ""}>
                      <div className="flex items-start gap-3">
                        {/* Large green bullet point or sub-item indicator */}
                        <div className="flex-shrink-0 mt-1">
                          {index === 4 ? (
                            // Sub-item dash for Elya description
                            <div className="w-4 h-0.5 mt-2"
                              style={{
                                backgroundColor: 'rgba(92, 127, 79, 0.5)'
                              }} />
                          ) : (
                            // Regular bullet point
                            <div className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: '#5C7F4F',
                                boxShadow: '0 2px 4px rgba(45, 95, 63, 0.3)'
                              }} />
                          )}
                        </div>
                        <span className={`leading-relaxed text-base ${
                          index === 4
                            ? 'text-gray-600 italic text-sm'
                            : 'text-gray-700 font-medium'
                        }`}>
                          {feature}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Side - Signup Form */}
            <div className="order-1 lg:order-2">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden"
                style={{
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(92, 127, 79, 0.1)'
                }}>
                {/* Form Header */}
                <div className="text-center p-8 pb-6"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 240, 220, 0.3) 0%, rgba(255, 255, 255, 0) 100%)'
                  }}>
                  <h1 className="text-2xl font-bold tracking-tight leading-none mb-4">
                    <span style={{ color: '#5C7F4F' }}>Interpret</span>
                    <span style={{ color: 'rgba(92, 127, 79, 0.7)' }}>Reflect</span>
                  </h1>
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-semibold mb-4"
                    style={{
                      backgroundColor: 'rgba(255, 220, 150, 0.2)',
                      color: '#5C7F4F'
                    }}>
                    🎉 LIMITED TIME OFFER
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Start Your 3-Day Free Trial
                  </h2>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm font-medium text-green-800">No Credit Card Required</span>
                  </div>
                </div>

                {/* Form Body */}
                <div className="px-8 pb-8 relative">
                  {/* Loading overlay */}
                  {loading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-b-3xl">
                      <div className="text-center">
                        <svg className="animate-spin h-12 w-12 mx-auto mb-4" style={{ color: '#5C7F4F' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-lg font-semibold text-gray-700">Creating your account...</p>
                        <p className="text-sm text-gray-500 mt-2">This will only take a moment</p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      onBlur={() => handleBlur('name')}
                      aria-label="Full Name"
                      aria-required="true"
                      aria-invalid={!!fieldErrors.name}
                      aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                        fieldErrors.name && touched.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      style={{ '--tw-ring-color': '#5C7F4F' } as React.CSSProperties}
                      placeholder="Enter your full name"
                    />
                    {fieldErrors.name && touched.name && (
                      <p id="name-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onBlur={() => handleBlur('email')}
                      aria-label="Email Address"
                      aria-required="true"
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? 'email-error' : 'email-description'}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                        fieldErrors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      style={{ '--tw-ring-color': '#5C7F4F' } as React.CSSProperties}
                      placeholder="your@email.com"
                    />
                    <p id="email-description" className="sr-only">We'll use this to create your account and send important updates</p>
                    {fieldErrors.email && touched.email && (
                      <p id="email-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      onBlur={() => handleBlur('password')}
                      aria-label="Password"
                      aria-required="true"
                      aria-invalid={!!fieldErrors.password && !fieldErrors.password.includes('Consider')}
                      aria-describedby={fieldErrors.password ? 'password-error' : 'password-help'}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                        fieldErrors.password && touched.password && !fieldErrors.password.includes('Consider') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      style={{ '--tw-ring-color': '#5C7F4F' } as React.CSSProperties}
                      placeholder="Create a secure password"
                    />
                    {fieldErrors.password && touched.password && (
                      <p id="password-error" className={`mt-1 text-sm flex items-center gap-1 ${
                        fieldErrors.password.includes('Consider') ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          {fieldErrors.password.includes('Consider') ? (
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          )}
                        </svg>
                        {fieldErrors.password}
                      </p>
                    )}
                    {!fieldErrors.password && (
                      <p id="password-help" className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Minimum 6 characters • We'll keep your data secure
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                      aria-label="Confirm Password"
                      aria-required="true"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                        touched.confirmPassword && password !== confirmPassword && confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      style={{ '--tw-ring-color': '#5C7F4F' } as React.CSSProperties}
                      placeholder="Re-enter your password"
                    />
                    {touched.confirmPassword && confirmPassword && password !== confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Passwords do not match
                      </p>
                    )}
                    {touched.confirmPassword && password === confirmPassword && confirmPassword && (
                      <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Passwords match
                      </p>
                    )}
                  </div>

                  {/* Terms checkbox removed - handled in Stripe checkout page */}

                  <button
                    type="submit"
                    disabled={loading || !confirmPassword || password !== confirmPassword}
                    className="w-full py-5 font-black text-xl rounded-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 focus:outline-none focus:ring-4 shadow-xl relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #5C7F4F, rgb(107, 142, 94))',
                      color: '#FFFFFF',
                      boxShadow: '0 15px 35px rgba(45, 95, 63, 0.3)',
                      border: '2px solid rgba(45, 95, 63, 0.3)',
                      letterSpacing: '0.5px',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgb(107, 142, 94), rgb(122, 157, 109))';
                        e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 18px 40px rgba(45, 95, 63, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #5C7F4F, rgb(107, 142, 94))';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 15px 35px rgba(45, 95, 63, 0.3)';
                    }}
                    aria-label="Start my free trial"
                  >
                    {/* Animated background effect */}
                    {!loading && (
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
                      </div>
                    )}

                    {loading ? (
                      <div className="flex items-center gap-3 relative z-10">
                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="font-bold">Starting Your Trial...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 relative z-10">
                        <span>START MY FREE TRIAL</span>
                        <ArrowRight className="w-6 h-6" />
                      </div>
                    )}
                  </button>
                  </form>
                </div>

                  {/* Trust badges with soft transition */}
                  <div className="mt-8 pt-8 relative">
                    {/* Soft gradient divider */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                    <div className="flex justify-center items-center gap-6 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4" style={{ color: '#5C7F4F' }} />
                        <span>HIPAA Compliant</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check className="w-4 h-4" style={{ color: '#5C7F4F' }} />
                        <span>Cancel Anytime</span>
                      </div>
                    </div>
                  </div>

                  {/* Already have account */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <button
                        onClick={() => navigate('/login')}
                        className="ml-1 px-4 py-1.5 font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{
                          background: 'linear-gradient(135deg, #5C7F4F, rgb(107, 142, 94))',
                          color: '#FFFFFF'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#F5F5DC';
                          e.currentTarget.style.color = '#5C7F4F';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #5C7F4F, rgb(107, 142, 94))';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        aria-label="Sign in to existing account"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing preview with smooth transition */}
              <div className="mt-8 relative">
                {/* Soft divider */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                <div className="rounded-2xl p-6 shadow-sm transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    background: 'linear-gradient(135deg, rgba(245, 255, 245, 0.6), rgba(250, 255, 245, 0.6))',
                    border: '1px solid rgba(92, 127, 79, 0.08)'
                  }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">After Your Trial</h3>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full"
                    style={{
                      backgroundColor: 'rgba(92, 127, 79, 0.1)',
                      color: '#5C7F4F'
                    }}>
                    ESSENTIAL TIER
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold" style={{ color: '#5C7F4F' }}>$12.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#5C7F4F' }} />
                    <span className="text-gray-700">Daily reflections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#5C7F4F' }} />
                    <span className="text-gray-700">Stress tools</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#5C7F4F' }} />
                    <span className="text-gray-700">Progress tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#5C7F4F' }} />
                    <span className="text-gray-700">Secure & private</span>
                  </div>
                </div>
                </div>
              </div>
            </div>
            {/* Close grid container */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}