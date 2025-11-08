'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle, CheckCircle, ArrowRight, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.next';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain a number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(email, password);

      if (result.error) {
        setError(result.error.message);
        toast.error(result.error.message);
      } else {
        setSuccess(true);
        toast.success('Account created! Please check your email to verify.');

        // Redirect to onboarding after 2 seconds
        setTimeout(() => {
          router.push('/onboarding');
        }, 2000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      toast.error('Failed to sign up with Google');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-data shadow-card p-8 text-center border border-brand-gray-200">
            <CheckCircle className="w-16 h-16 text-brand-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-brand-primary mb-2 font-sans">
              Welcome to InterpretReflect!
            </h2>
            <p className="text-brand-gray-600 mb-6 font-body">
              Your account has been created. Check your email to verify your account.
            </p>
            <p className="text-sm text-brand-gray-500 font-body">
              Redirecting you to performance assessment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray-50 px-4 py-12">
      <div className="max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
          <Link href="/" className="inline-block mb-6">
            <h2 className="text-2xl font-bold text-brand-primary font-sans">InterpretReflect</h2>
          </Link>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-energy-light border border-brand-energy/20 rounded-full px-4 py-2 mb-4">
            <span className="w-2 h-2 bg-brand-energy rounded-full animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-brand-energy-dark font-semibold">
              Free 14-Day Trial
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold text-brand-primary mb-3 font-sans">
            Start Your Performance Assessment
          </h1>

          {/* Subhead */}
          <p className="text-lg text-brand-gray-600 max-w-md mx-auto leading-relaxed font-body">
            Join professional interpreters optimizing their cognitive load with neuroscience-backed insights and RID-approved development.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-data shadow-card p-8 border border-brand-gray-200">

          {error && (
            <div className="mb-6 p-4 bg-brand-error-light border border-brand-error rounded-data flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-brand-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-brand-error-dark font-body">{error}</p>
            </div>
          )}

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignUp}
            type="button"
            className="w-full border-2 border-brand-gray-200 py-3 px-6 rounded-data hover:border-brand-primary/30 hover:bg-brand-primary-light/30 transition-all font-semibold text-brand-primary flex items-center justify-center gap-3 mb-6 font-body"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-brand-gray-500 font-body">Or sign up with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-primary mb-2 font-sans">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-all font-body text-brand-charcoal placeholder:text-brand-gray-400 hover:border-brand-primary/30"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-primary mb-2 font-sans">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-all font-body text-brand-charcoal placeholder:text-brand-gray-400 hover:border-brand-primary/30"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-brand-gray-500 font-body">
                Min 8 characters, uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-primary mb-2 font-sans">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-all font-body text-brand-charcoal placeholder:text-brand-gray-400 hover:border-brand-primary/30"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 rounded border-brand-gray-300 text-brand-electric focus:ring-brand-electric focus:ring-offset-0"
              />
              <label htmlFor="terms" className="text-sm text-brand-gray-600 font-body">
                I agree to the{' '}
                <Link href="/terms" className="text-brand-electric hover:text-brand-electric-hover font-semibold hover:underline">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-brand-electric hover:text-brand-electric-hover font-semibold hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-energy to-brand-energy-hover text-white font-bold text-base py-4 px-8 rounded-data hover:shadow-lg hover:shadow-brand-energy/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center justify-center gap-2 font-sans"
            >
              {loading ? 'Creating Account...' : (
                <>
                  Start Performance Assessment
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-brand-gray-600 font-body">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-electric hover:text-brand-electric-hover font-semibold hover:underline">
              Sign in
            </Link>
          </p>

        </div>

        {/* RID Badge */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-brand-primary to-brand-slate p-6 rounded-data text-white text-center shadow-lg border-2 border-brand-electric">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-5 h-5 text-brand-electric" />
              <span className="font-bold text-sm uppercase tracking-wider font-sans">
                New RID Professional Category
              </span>
            </div>
            <p className="text-white/95 font-medium mb-1 font-body">
              Studies of Healthy Minds & Bodies
            </p>
            <p className="text-sm text-white/85 font-body">
              Earn RID-approved CEUs through performance optimization • Sponsor #2309
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
