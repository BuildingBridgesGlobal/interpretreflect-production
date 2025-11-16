'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Users, Building2, ArrowRight, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AgencyContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    agencyName: '',
    teamSize: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('agency_inquiries')
        .insert([{
          name: formData.name,
          email: formData.email,
          agency_name: formData.agencyName,
          team_size: formData.teamSize,
          message: formData.message
        }]);

      if (error) {
        console.error('Error saving agency inquiry:', error);
        throw error;
      }
      
      setSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-brand-gray-50 dark:bg-gray-900">
        {/* Banner Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-800 dark:from-blue-950 dark:via-blue-900 dark:to-slate-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6 shadow-soft-lg animate-pulse-glow">
              <Building2 className="w-5 h-5 text-white" />
              <span className="text-sm font-mono uppercase tracking-wider text-white font-semibold">
                Agency Team Plans
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 font-sans leading-tight font-display">
              Let's Talk Team Pricing
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 font-body leading-relaxed max-w-2xl mx-auto">
              Get custom pricing and dedicated support for your interpreting team. Let's discuss your specific needs and create a solution that scales with your agency.
            </p>
          </div>
        </div>
      </section>

        {/* Success Content */}
        <div className="flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 text-center border border-gray-200 dark:border-gray-700">
              <CheckCircle className="w-20 h-20 text-green-500 dark:text-green-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-brand-primary dark:text-blue-300 mb-4 font-sans">
                Thank You for Your Interest!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 font-body leading-relaxed">
                We've received your information and will contact you within 24 hours to discuss your team's needs and create a custom pricing plan.
              </p>
              <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400 font-body bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <p className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Custom team pricing
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Dedicated onboarding support
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Advanced team management features
                </p>
              </div>
              <Link 
                href="/" 
                className="inline-flex items-center mt-8 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-orange-500 dark:to-orange-600 text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Return to Homepage
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-body mb-2">Need immediate assistance?</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-body">
                  <a href="mailto:info@interpretreflect.com" className="hover:text-blue-600 dark:hover:text-orange-400 transition-colors">
                    info@interpretreflect.com
                  </a>
                  <span className="hidden sm:inline text-gray-400 dark:text-gray-500">•</span>
                  <span>Text: 424-333-0373 (text only)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Banner Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-800 dark:from-blue-950 dark:via-blue-900 dark:to-slate-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
              <Building2 className="w-5 h-5 text-white" />
              <span className="text-sm font-mono uppercase tracking-wider text-white font-semibold">
                Agency Team Plans
              </span>
            </div>
            
            <h1 className="text-5xl font-bold mb-6 font-sans leading-tight">
              Let's Talk Team Pricing
            </h1>
            
            <p className="text-xl text-white/90 font-body leading-relaxed max-w-2xl mx-auto">
              Get custom pricing and dedicated support for your interpreting team. Let's discuss your specific needs and create a solution that scales with your agency.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full">
          
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-300 font-sans">InterpretReflect</h2>
            </Link>
          </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 border border-gray-200 dark:border-gray-700">
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-blue-300 mb-3 font-sans">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-500 focus:border-transparent transition-all font-body text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                placeholder="John Smith"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-blue-300 mb-3 font-sans">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-500 focus:border-transparent transition-all font-body text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  placeholder="john@agency.com"
                />
              </div>
            </div>

            {/* Agency Name */}
            <div>
              <label htmlFor="agencyName" className="block text-sm font-medium text-gray-900 dark:text-blue-300 mb-3 font-sans">
                Agency Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="agencyName"
                  type="text"
                  value={formData.agencyName}
                  onChange={(e) => setFormData({...formData, agencyName: e.target.value})}
                  required
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-500 focus:border-transparent transition-all font-body text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  placeholder="ABC Interpreting Services"
                />
              </div>
            </div>

            {/* Team Size */}
            <div>
              <label htmlFor="teamSize" className="block text-sm font-medium text-gray-900 dark:text-blue-300 mb-3 font-sans">
                Team Size
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <select
                  id="teamSize"
                  value={formData.teamSize}
                  onChange={(e) => setFormData({...formData, teamSize: e.target.value})}
                  required
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-500 focus:border-transparent transition-all font-body text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                >
                  <option value="">Select team size</option>
                  <option value="1-5">1-5 interpreters</option>
                  <option value="6-15">6-15 interpreters</option>
                  <option value="16-50">16-50 interpreters</option>
                  <option value="51+">51+ interpreters</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-900 dark:text-blue-300 mb-3 font-sans">
                Tell us about your needs (optional)
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-500 focus:border-transparent transition-all font-body text-gray-900 dark:text-white bg-white dark:bg-gray-800 resize-none"
                placeholder="What specific challenges are you looking to solve?"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-orange-500 dark:to-orange-600 text-white font-bold text-lg py-4 px-8 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-orange-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-sans"
            >
              {loading ? 'Sending...' : (
                <>
                  Request Custom Pricing
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </form>

          {/* Back Link */}
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400 font-body">
            Individual interpreter?{' '}
            <Link href="/auth/signup" className="text-blue-600 dark:text-orange-400 hover:text-blue-700 dark:hover:text-orange-300 font-semibold hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <section className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-sans">Need Help?</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400 font-body">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@interpretreflect.com" className="hover:text-blue-600 dark:hover:text-orange-400 transition-colors">
                  info@interpretreflect.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">•</span>
                <span>Text: 424-333-0373 (text only)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}