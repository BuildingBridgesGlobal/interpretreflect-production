'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.next';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.error) {
        setError(result.error.message);
        toast.error(result.error.message);
      } else {
        toast.success('Welcome back!');
        router.push('/dashboard');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      toast.error('Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          {/* Logo */}
          <Link href="/" className="inline-block mb-6">
            <h2 className="text-2xl font-bold text-brand-primary font-sans">InterpretReflect</h2>
          </Link>

          {/* Headline */}
          <h1 className="text-4xl font-bold text-brand-primary mb-3 font-sans">
            Welcome Back
          </h1>

          {/* Subhead */}
          <p className="text-lg text-brand-gray-600 font-body">
            Continue your performance optimization journey
          </p>
        </div>

        <div className="bg-white rounded-data shadow-card p-8 border border-brand-gray-200">
          {error && (
            <div className="mb-6 p-4 bg-brand-error-light border border-brand-error rounded-data flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-brand-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-brand-error-dark font-body">{error}</p>
            </div>
          )}

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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-brand-gray-300 text-brand-electric focus:ring-brand-electric focus:ring-offset-0"
                />
                <span className="ml-2 text-sm text-brand-gray-600 font-body">Remember me</span>
              </label>
              <Link
                href="/reset-password"
                className="text-sm text-brand-electric hover:text-brand-electric-hover font-semibold hover:underline font-body"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-primary to-brand-slate text-white font-bold text-base py-4 px-8 rounded-data hover:shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider font-sans"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-brand-gray-500 font-body">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="mt-4 w-full border-2 border-brand-gray-200 py-3 px-6 rounded-data hover:border-brand-primary/30 hover:bg-brand-primary-light/30 transition-all font-semibold text-brand-primary flex items-center justify-center gap-3 font-body"
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
              Sign in with Google
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-brand-gray-600 font-body">
            Don't have an account?{' '}
            <Link href="/signup" className="text-brand-electric hover:text-brand-electric-hover font-semibold hover:underline">
              Start free trial
            </Link>
          </p>

          {/* Agency Contact */}
          <p className="mt-4 text-center text-sm text-brand-gray-500 font-body">
            Agency team?{' '}
            <Link href="/auth/agency-contact" className="text-brand-electric hover:text-brand-electric-hover font-semibold hover:underline">
              Contact us for custom pricing
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
