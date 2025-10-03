import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { validateForm, setLoadingState, ScreenReaderAnnouncer } from '../utils/accessibility';

interface FormData {
  email: string;
  password: string;
  name?: string;
}

interface AccessibleFormProps {
  type: 'login' | 'signup';
  onSubmit: (data: FormData) => Promise<void>;
}

export const AccessibleForm: React.FC<AccessibleFormProps> = ({ type, onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: type === 'signup' ? '' : undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const formRef = useRef<HTMLFormElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const announcerRef = useRef<ScreenReaderAnnouncer | null>(null);

  useEffect(() => {
    // Initialize screen reader announcer
    announcerRef.current = new ScreenReaderAnnouncer();
    
    return () => {
      announcerRef.current?.destroy();
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(formData);
    
    if (!validation.valid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      
      // Announce errors to screen readers
      const errorCount = validation.errors.length;
      const errorMessage = `${errorCount} error${errorCount > 1 ? 's' : ''} found. Please review the form.`;
      announcerRef.current?.announceError(errorMessage);
      
      // Focus first error field
      const firstErrorField = formRef.current?.querySelector('[aria-invalid="true"]') as HTMLElement;
      firstErrorField?.focus();
      
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    if (submitButtonRef.current) {
      setLoadingState(submitButtonRef.current, true);
    }
    
    try {
      await onSubmit(formData);
      announcerRef.current?.announce('Form submitted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setErrors({ form: errorMessage });
      announcerRef.current?.announceError(errorMessage);
    } finally {
      setIsLoading(false);
      if (submitButtonRef.current) {
        setLoadingState(submitButtonRef.current, false);
      }
    }
  };

  const formTitle = type === 'login' ? 'Sign In' : 'Create Account';
  const submitButtonText = type === 'login' ? 'Sign In' : 'Sign Up';

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
      aria-label={formTitle}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{formTitle}</h2>
        <p className="mt-2 text-sm text-gray-600">
          {type === 'login' 
            ? 'Welcome back! Please sign in to continue.'
            : 'Create your account to get started.'}
        </p>
      </div>

      {/* Form-level error */}
      {errors.form && (
        <div 
          role="alert"
          aria-live="assertive"
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-800 font-medium flex items-center">
            <span aria-hidden="true" className="mr-2">⚠️</span>
            {errors.form}
          </p>
        </div>
      )}

      {/* Name field (signup only) */}
      {type === 'signup' && (
        <div>
          <label 
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name
            <span className="text-red-500 ml-1" aria-label="required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent ${
              errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            value={formData.name || ''}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
              <span className="font-medium">Error:</span> {errors.name}
            </p>
          )}
        </div>
      )}

      {/* Email field */}
      <div>
        <label 
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : 'email-hint'}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent ${
            errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          value={formData.email}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        {!errors.email && (
          <p id="email-hint" className="mt-1 text-sm text-gray-500">
            We'll never share your email with anyone else.
          </p>
        )}
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
            <span className="font-medium">Error:</span> {errors.email}
          </p>
        )}
      </div>

      {/* Password field */}
      <div>
        <label 
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete={type === 'login' ? 'current-password' : 'new-password'}
            aria-required="true"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : 'password-hint'}
            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent ${
              errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-sage-500 rounded p-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {!errors.password && (
          <p id="password-hint" className="mt-1 text-sm text-gray-500">
            {type === 'signup' ? 'Must be at least 8 characters long.' : 'Enter your password to continue.'}
          </p>
        )}
        {errors.password && (
          <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
            <span className="font-medium">Error:</span> {errors.password}
          </p>
        )}
      </div>

      {/* Remember me / Forgot password (login only) */}
      {type === 'login' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-sage-600 focus:ring-sage-500 border-gray-300 rounded"
              aria-label="Remember me on this device"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <a 
            href="#" 
            className="text-sm text-sage-600 hover:text-sage-500 underline focus:outline-none focus:ring-2 focus:ring-sage-500 rounded"
          >
            Forgot your password?
          </a>
        </div>
      )}

      {/* Submit button */}
      <button
        ref={submitButtonRef}
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-sage-600 text-white font-semibold rounded-lg hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label={isLoading ? `${submitButtonText}, please wait` : submitButtonText}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </span>
        ) : (
          submitButtonText
        )}
      </button>

      {/* Alternative action */}
      <p className="text-center text-sm text-gray-600">
        {type === 'login' ? (
          <>
            Don't have an account?{' '}
            <a 
              href="/signup" 
              className="font-medium text-sage-600 hover:text-sage-500 underline focus:outline-none focus:ring-2 focus:ring-sage-500 rounded"
            >
              Sign up for free
            </a>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <a 
              href="/login" 
              className="font-medium text-sage-600 hover:text-sage-500 underline focus:outline-none focus:ring-2 focus:ring-sage-500 rounded"
            >
              Sign in instead
            </a>
          </>
        )}
      </p>
    </form>
  );
};

export default AccessibleForm;