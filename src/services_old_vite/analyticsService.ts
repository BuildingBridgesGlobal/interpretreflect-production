/**
 * Analytics Service
 * Handles all analytics tracking with user consent
 * Respects user privacy preferences
 */

import { supabase } from '../lib/supabase';

interface AnalyticsEvent {
  event_name: string;
  event_category?: string;
  event_label?: string;
  event_value?: number;
  user_id?: string;
  session_id?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private analyticsEnabled: boolean = true; // Default to true
  private userId: string | null = null;
  private sessionId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Generate session ID
    this.sessionId = this.generateSessionId();

    // Start flush interval (batch events every 30 seconds)
    this.startFlushInterval();

    // Listen for page unload to flush events
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize analytics with user preferences
   */
  async initialize(userId: string) {
    this.userId = userId;

    // Load user's analytics preference from database
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('privacy_settings')
        .eq('id', userId)
        .single();

      if (!error && data?.privacy_settings?.analytics !== undefined) {
        this.analyticsEnabled = data.privacy_settings.analytics;
        console.log(`Analytics ${this.analyticsEnabled ? 'enabled' : 'disabled'} for user`);
      }
    } catch (error) {
      console.error('Error loading analytics preferences:', error);
    }

    // Set up third-party analytics if enabled
    if (this.analyticsEnabled) {
      this.initializeThirdPartyAnalytics();
    }
  }

  /**
   * Update analytics consent
   */
  async updateConsent(enabled: boolean) {
    this.analyticsEnabled = enabled;

    if (enabled) {
      this.initializeThirdPartyAnalytics();
      console.log('Analytics enabled by user');
    } else {
      this.disableThirdPartyAnalytics();
      this.clearStoredData();
      console.log('Analytics disabled by user - clearing data');
    }

    // Store preference in database
    if (this.userId) {
      try {
        await supabase
          .from('user_profiles')
          .update({
            'privacy_settings.analytics': enabled,
            updated_at: new Date().toISOString()
          })
          .eq('id', this.userId);
      } catch (error) {
        console.error('Error updating analytics preference:', error);
      }
    }
  }

  /**
   * Track an event (only if analytics enabled)
   */
  track(eventName: string, properties?: Record<string, any>) {
    if (!this.analyticsEnabled) {
      console.debug(`Analytics disabled - not tracking: ${eventName}`);
      return;
    }

    const event: AnalyticsEvent = {
      event_name: eventName,
      user_id: this.userId || undefined,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      metadata: properties
    };

    // Add to queue for batching
    this.eventQueue.push(event);

    // Flush if queue is getting large
    if (this.eventQueue.length >= 20) {
      this.flush();
    }

    console.debug(`Event tracked: ${eventName}`, properties);
  }

  /**
   * Track page view
   */
  trackPageView(pagePath: string, pageTitle?: string) {
    if (!this.analyticsEnabled) return;

    this.track('page_view', {
      page_path: pagePath,
      page_title: pageTitle,
      referrer: document.referrer
    });
  }

  /**
   * Track user timing (performance metrics)
   */
  trackTiming(category: string, variable: string, value: number) {
    if (!this.analyticsEnabled) return;

    this.track('timing', {
      timing_category: category,
      timing_variable: variable,
      timing_value: value
    });
  }

  /**
   * Track errors (sanitized, no sensitive data)
   */
  trackError(errorMessage: string, errorStack?: string, fatal: boolean = false) {
    if (!this.analyticsEnabled) return;

    // Sanitize error messages to remove any potential sensitive data
    const sanitizedMessage = this.sanitizeErrorMessage(errorMessage);

    this.track('error', {
      error_message: sanitizedMessage,
      error_fatal: fatal,
      error_stack: errorStack ? this.sanitizeErrorMessage(errorStack) : undefined
    });
  }

  /**
   * Initialize third-party analytics (Google Analytics, Mixpanel, etc.)
   */
  private initializeThirdPartyAnalytics() {
    // Only initialize if we haven't already and user consents
    if (!this.analyticsEnabled) return;

    // Example: Google Analytics 4
    if (typeof window !== 'undefined' && !window.gtag) {
      // Only load if not already loaded
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID}`;

      script.onerror = () => {
        console.warn('Failed to load Google Analytics');
      };

      if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function() { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
          anonymize_ip: true, // Privacy-friendly
          allow_google_signals: false,
          allow_ad_personalization_signals: false
        });
      }
    }

    // PostHog Analytics (commented out - install posthog-js to enable)
    // To enable PostHog:
    // 1. Run: npm install posthog-js
    // 2. Add VITE_POSTHOG_KEY to your .env file
    // 3. Uncomment the code below
    /*
    if (typeof window !== 'undefined' && !window.posthog && import.meta.env.VITE_POSTHOG_KEY) {
      import('posthog-js').then(({ default: posthog }) => {
        posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
          api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
          autocapture: false,
          capture_pageview: false,
          respect_dnt: true,
          opt_out_capturing_by_default: false,
          loaded: () => {
            if (this.userId) {
              posthog.identify(this.userId);
            }
          }
        });
        window.posthog = posthog;
      });
    }
    */
  }

  /**
   * Disable all third-party analytics
   */
  private disableThirdPartyAnalytics() {
    // Disable Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied'
      });

      // Clear GA cookies
      document.cookie.split(";").forEach((c) => {
        if (c.indexOf('_ga') === 0 || c.indexOf('_gid') === 0) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        }
      });
    }

    // Disable Posthog
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.opt_out_capturing();
      window.posthog.clear_opt_in_out_capturing();
    }

    // Clear any other analytics cookies
    this.clearAnalyticsCookies();
  }

  /**
   * Clear stored analytics data
   */
  private clearStoredData() {
    // Clear event queue
    this.eventQueue = [];

    // Clear local storage items
    if (typeof localStorage !== 'undefined') {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('analytics') || key.includes('_ga') || key.includes('posthog'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    // Clear session storage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  }

  /**
   * Clear analytics-related cookies
   */
  private clearAnalyticsCookies() {
    if (typeof document !== 'undefined') {
      // List of common analytics cookie prefixes
      const analyticsCookies = ['_ga', '_gid', '_gat', '_gcl', 'ph_', 'mp_', 'ajs_'];

      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

        if (analyticsCookies.some(prefix => name.startsWith(prefix))) {
          // Delete cookie
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        }
      });
    }
  }

  /**
   * Flush event queue to storage
   */
  private async flush() {
    if (!this.analyticsEnabled || this.eventQueue.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Store events in Supabase for internal analytics
      await supabase
        .from('analytics_events')
        .insert(events);

      // Send to third-party if configured
      events.forEach(event => {
        this.sendToThirdParty(event);
      });
    } catch (error) {
      console.error('Error flushing analytics events:', error);
      // Re-add events to queue on failure
      this.eventQueue = events.concat(this.eventQueue);
    }
  }

  /**
   * Send event to third-party analytics
   */
  private sendToThirdParty(event: AnalyticsEvent) {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.event_name, {
        event_category: event.event_category,
        event_label: event.event_label,
        value: event.event_value,
        ...event.metadata
      });
    }

    // Posthog
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture(event.event_name, event.metadata);
    }
  }

  /**
   * Start interval to flush events
   */
  private startFlushInterval() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000); // Flush every 30 seconds
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitize error messages to remove sensitive data
   */
  private sanitizeErrorMessage(message: string): string {
    // Remove email addresses
    message = message.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]');

    // Remove potential API keys or tokens
    message = message.replace(/[a-zA-Z0-9]{32,}/g, '[token]');

    // Remove URLs with potential sensitive params
    message = message.replace(/https?:\/\/[^\s]+/g, '[url]');

    return message;
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.analyticsEnabled;
  }
}

// Extend Window interface for third-party analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    posthog?: any;
  }
}

export const analyticsService = AnalyticsService.getInstance();