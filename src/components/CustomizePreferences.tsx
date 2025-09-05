import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Settings, 
  Bell, 
  Clock, 
  Sun, 
  Moon, 
  Type, 
  Globe, 
  Keyboard, 
  Eye,
  Shield,
  Check,
  AlertCircle,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UserPreferences {
  reminder_frequency: 'daily' | 'weekly' | 'custom' | 'none';
  reminder_time: string;
  custom_reminder_days?: string[];
  theme: 'light' | 'dark' | 'high-contrast';
  font_size: 'standard' | 'large';
  language: string;
  keyboard_shortcuts: boolean;
  screen_reader_mode: boolean;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' }
];

const WEEKDAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

export const CustomizePreferences: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    reminder_frequency: 'daily',
    reminder_time: '09:00',
    custom_reminder_days: [],
    theme: 'light',
    font_size: 'standard',
    language: 'en',
    keyboard_shortcuts: false,
    screen_reader_mode: false
  });

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  useEffect(() => {
    // Apply theme immediately when changed
    document.documentElement.setAttribute('data-theme', preferences.theme);
    
    // Apply font size
    if (preferences.font_size === 'large') {
      document.documentElement.classList.add('text-large');
    } else {
      document.documentElement.classList.remove('text-large');
    }

    // Apply screen reader mode
    if (preferences.screen_reader_mode) {
      document.documentElement.setAttribute('data-screen-reader', 'true');
    } else {
      document.documentElement.removeAttribute('data-screen-reader');
    }
  }, [preferences.theme, preferences.font_size, preferences.screen_reader_mode]);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setPreferences({
          ...preferences,
          ...data.preferences
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferences: preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success('Preferences saved successfully');
      
      // Announce to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.textContent = 'Your preferences have been saved successfully';
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);

    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Skip to main content link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-indigo-600 text-white px-4 py-2 rounded">
        Skip to main content
      </a>

      <main id="main-content" className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-indigo-600 mr-3" aria-hidden="true" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customize Your Preferences</h1>
                <p className="text-gray-600 mt-1">
                  Make InterpretReflect suit your style and workflow. Set your experience, 
                  accessibility features, and interface preferences—all stored securely and adjustable at any time.
                </p>
              </div>
            </div>
          </div>

          <form className="px-6 py-6 space-y-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            {/* Notification Settings */}
            <section aria-labelledby="notification-settings">
              <h2 id="notification-settings" className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-indigo-600" aria-hidden="true" />
                Notification Settings
              </h2>
              
              <div className="space-y-4">
                {/* Check-in Reminders */}
                <div>
                  <label htmlFor="reminder-frequency" className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Reminders
                    <span className="block text-xs text-gray-500 font-normal mt-1">
                      Choose how often you'd like to be reminded to reflect on your wellbeing
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      id="reminder-frequency"
                      value={preferences.reminder_frequency}
                      onChange={(e) => setPreferences({...preferences, reminder_frequency: e.target.value as any})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 appearance-none pr-10"
                      aria-describedby="reminder-frequency-help"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="custom">Custom</option>
                      <option value="none">None</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" aria-hidden="true" />
                  </div>
                  <span id="reminder-frequency-help" className="sr-only">
                    Select how often you want to receive check-in reminders
                  </span>
                </div>

                {/* Custom Days Selection */}
                {preferences.reminder_frequency === 'custom' && (
                  <div role="group" aria-labelledby="custom-days-label">
                    <p id="custom-days-label" className="text-sm font-medium text-gray-700 mb-2">
                      Select reminder days
                    </p>
                    <div className="space-y-2">
                      {WEEKDAYS.map(day => (
                        <label key={day.value} className="flex items-center">
                          <input
                            type="checkbox"
                            value={day.value}
                            checked={preferences.custom_reminder_days?.includes(day.value) || false}
                            onChange={(e) => {
                              const days = preferences.custom_reminder_days || [];
                              if (e.target.checked) {
                                setPreferences({...preferences, custom_reminder_days: [...days, day.value]});
                              } else {
                                setPreferences({...preferences, custom_reminder_days: days.filter(d => d !== day.value)});
                              }
                            }}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            aria-describedby={`${day.value}-help`}
                          />
                          <span className="ml-2 text-sm text-gray-700">{day.label}</span>
                          <span id={`${day.value}-help`} className="sr-only">
                            Select to receive reminders on {day.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preferred Time */}
                <div>
                  <label htmlFor="reminder-time" className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1 text-indigo-600" aria-hidden="true" />
                    Preferred Notification Time
                    <span className="block text-xs text-gray-500 font-normal mt-1">
                      Set a daily reminder time
                    </span>
                  </label>
                  <input
                    type="time"
                    id="reminder-time"
                    value={preferences.reminder_time}
                    onChange={(e) => setPreferences({...preferences, reminder_time: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    aria-describedby="reminder-time-help"
                  />
                  <span id="reminder-time-help" className="sr-only">
                    Select your preferred time to receive daily reminders
                  </span>
                </div>
              </div>
            </section>

            {/* Interface & Accessibility */}
            <section aria-labelledby="interface-settings">
              <h2 id="interface-settings" className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sun className="h-5 w-5 mr-2 text-indigo-600" aria-hidden="true" />
                Interface & Accessibility
              </h2>
              
              <div className="space-y-4">
                {/* Theme Selection */}
                <fieldset>
                  <legend className="text-sm font-medium text-gray-700 mb-2">
                    Theme Selection
                    <span className="block text-xs text-gray-500 font-normal mt-1">
                      Choose your visual theme preference
                    </span>
                  </legend>
                  <div className="space-y-2" role="radiogroup" aria-describedby="theme-help">
                    {[
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'high-contrast', label: 'High Contrast', icon: Eye }
                    ].map(theme => (
                      <label key={theme.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="theme"
                          value={theme.value}
                          checked={preferences.theme === theme.value}
                          onChange={(e) => setPreferences({...preferences, theme: e.target.value as any})}
                          className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          aria-describedby={`${theme.value}-theme-desc`}
                        />
                        <theme.icon className="h-4 w-4 mx-3 text-gray-600" aria-hidden="true" />
                        <span className="text-sm text-gray-700">{theme.label}</span>
                        <span id={`${theme.value}-theme-desc`} className="sr-only">
                          {theme.value === 'high-contrast' ? 'High contrast theme for better visibility' : `${theme.label} theme`}
                        </span>
                      </label>
                    ))}
                  </div>
                  <span id="theme-help" className="sr-only">
                    Select a theme that works best for your visual preferences
                  </span>
                </fieldset>

                {/* Font Size */}
                <fieldset>
                  <legend className="text-sm font-medium text-gray-700 mb-2">
                    <Type className="inline h-4 w-4 mr-1 text-indigo-600" aria-hidden="true" />
                    Font Size
                    <span className="block text-xs text-gray-500 font-normal mt-1">
                      Standard or Large for enhanced readability
                    </span>
                  </legend>
                  <div className="space-y-2" role="radiogroup">
                    {[
                      { value: 'standard', label: 'Standard' },
                      { value: 'large', label: 'Large (Enhanced Readability)' }
                    ].map(size => (
                      <label key={size.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="fontSize"
                          value={size.value}
                          checked={preferences.font_size === size.value}
                          onChange={(e) => setPreferences({...preferences, font_size: e.target.value as any})}
                          className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{size.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </section>

            {/* Language */}
            <section aria-labelledby="language-settings">
              <h2 id="language-settings" className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-indigo-600" aria-hidden="true" />
                Language
              </h2>
              
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Language
                  <span className="block text-xs text-gray-500 font-normal mt-1">
                    Choose your preferred language for emails and interface
                  </span>
                </label>
                <div className="relative">
                  <select
                    id="language"
                    value={preferences.language}
                    onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 appearance-none pr-10"
                    aria-describedby="language-help"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" aria-hidden="true" />
                </div>
                <span id="language-help" className="sr-only">
                  Select your preferred language for the platform interface
                </span>
              </div>
            </section>

            {/* Quick Shortcuts */}
            <section aria-labelledby="shortcuts-settings">
              <h2 id="shortcuts-settings" className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Keyboard className="h-5 w-5 mr-2 text-indigo-600" aria-hidden="true" />
                Quick Shortcuts
              </h2>
              
              <div className="space-y-4">
                {/* Keyboard Shortcuts */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="keyboard-shortcuts"
                      type="checkbox"
                      checked={preferences.keyboard_shortcuts}
                      onChange={(e) => setPreferences({...preferences, keyboard_shortcuts: e.target.checked})}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      aria-describedby="keyboard-shortcuts-desc"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="keyboard-shortcuts" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Enable Keyboard Shortcuts
                    </label>
                    <p id="keyboard-shortcuts-desc" className="text-xs text-gray-500 mt-1">
                      Navigate even faster: enable key commands for frequent actions
                    </p>
                    <button
                      type="button"
                      className="text-xs text-indigo-600 hover:text-indigo-500 mt-1 flex items-center"
                      onClick={() => toast.info('Press ? anywhere to see available shortcuts')}
                      aria-label="Learn more about keyboard shortcuts"
                    >
                      <HelpCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                      View shortcuts guide
                    </button>
                  </div>
                </div>

                {/* Screen Reader Mode */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="screen-reader"
                      type="checkbox"
                      checked={preferences.screen_reader_mode}
                      onChange={(e) => setPreferences({...preferences, screen_reader_mode: e.target.checked})}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      aria-describedby="screen-reader-desc"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="screen-reader" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Enable Screen Reader Mode
                    </label>
                    <p id="screen-reader-desc" className="text-xs text-gray-500 mt-1">
                      Optimizes site structure for full screen reader compatibility
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Security Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" role="region" aria-labelledby="security-note">
              <div className="flex">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" aria-hidden="true" />
                <div className="ml-3">
                  <h3 id="security-note" className="text-sm font-medium text-blue-900">
                    Security & Privacy Note
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    All preference selections are stored encrypted. Your choices never affect the privacy 
                    of your journal entries, reflections, or personal data.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                aria-label="Cancel and return to previous page"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                aria-label={saving ? 'Saving preferences...' : 'Save preferences'}
                aria-live="polite"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" aria-hidden="true"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};