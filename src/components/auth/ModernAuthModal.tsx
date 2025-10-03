import React, { useState, useEffect } from 'react';
import { X, Mail, ArrowRight, Check, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface ModernAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export const ModernAuthModal: React.FC<ModernAuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'signin',
  onSuccess
}) => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic-link'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setEmail('');
      setPassword('');
      setName('');
      setError('');
      setSuccess(false);
      setValidationErrors({});
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSignIn = async () => {
    setError('');
    setValidationErrors({});

    // Validate fields
    const errors: Record<string, string> = {};
    if (!email) errors.email = 'Email is required';
    else if (!validateEmail(email)) errors.email = 'Please enter a valid email';
    if (!password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email, password);

      if (result.error) {
        throw result.error;
      }

      // Success - close modal and navigate
      onClose();
      if (onSuccess) onSuccess();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setError('');
    setValidationErrors({});

    // Validate email
    if (!email) {
      setValidationErrors({ email: 'Email is required' });
      return;
    }
    if (!validateEmail(email)) {
      setValidationErrors({ email: 'Please enter a valid email' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: name || undefined
          }
        }
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setError('');

    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithApple();
      }

      onClose();
      if (onSuccess) onSuccess();
      navigate('/');
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white border-2 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'rgb(92, 127, 79)' }}
          >
            <X className="w-5 h-5" style={{ color: 'rgb(92, 127, 79)' }} />
          </button>

          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl text-gray-800 font-bold tracking-tight leading-none mb-4">
              Interpret<span className="text-gray-600">Reflect</span>
            </h1>
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back
            </h2>
            <p className="text-gray-600 mt-2">
              Sign in to continue your wellness journey
            </p>
          </div>

          {success ? (
            // Success state
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Check your email!
              </h3>
              <p className="text-gray-600">
                We've sent a magic link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Click the link in your email to sign in instantly.
              </p>
            </div>
          ) : (
            <>
              {/* SSO Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleSSO('google')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: 'rgb(92, 127, 79)', color: 'rgb(92, 127, 79)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F5DC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <button
                  onClick={() => handleSSO('apple')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 bg-white rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: 'rgb(92, 127, 79)', color: 'rgb(92, 127, 79)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F5DC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Sign In Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSignIn();
              }}>
                <div className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setValidationErrors({});
                      }}
                      placeholder="Email address"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        validationErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      style={{ '--tw-ring-color': 'rgb(92, 127, 79)' } as React.CSSProperties}
                      required
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setValidationErrors({});
                      }}
                      placeholder="Password"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        validationErrors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      style={{ '--tw-ring-color': 'rgb(92, 127, 79)' } as React.CSSProperties}
                      required
                    />
                    {validationErrors.password && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.password}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: loading ? '#9CA3AF' : 'rgb(92, 127, 79)'
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </form>

              {/* Account Links */}
              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Don't have an account?
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/signup');
                    }}
                    className="ml-2 px-3 py-1 bg-white border rounded-md font-semibold transition-all"
                    style={{ borderColor: 'rgb(92, 127, 79)', color: 'rgb(92, 127, 79)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F5F5DC';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    Sign up
                  </button>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    // Could implement forgot password flow later
                    alert('Please contact hello@huviatechnologies.com to reset your password');
                  }}
                  className="px-3 py-1 text-sm text-white rounded-md font-semibold transition-all"
                  style={{ background: 'rgb(92, 127, 79)' }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Terms notice */}
              <p className="mt-4 text-xs text-center text-gray-500">
                By continuing, you agree to our{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Terms</a>
                {' '}and{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Privacy Policy</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};