import { supabase } from '../lib/supabase';

// Encharge API configuration
const ENCHARGE_API_KEY = import.meta.env.VITE_ENCHARGE_API_KEY;
const ENCHARGE_API_URL = 'https://api.encharge.io/v1';

export interface EnchargeUser {
  email: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface EnchargeEvent {
  email: string;
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

class EnchargeService {
  private apiKey: string;

  constructor() {
    this.apiKey = ENCHARGE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Encharge API key not configured');
    }
  }

  /**
   * Add or update a user in Encharge
   */
  async addOrUpdateUser(user: EnchargeUser): Promise<void> {
    if (!this.apiKey) {
      console.log('Encharge not configured, skipping user sync');
      return;
    }

    try {
      // Use Supabase Edge Function to handle Encharge API call
      const { error } = await supabase.functions.invoke('send-encharge-event', {
        body: {
          type: 'identify',
          email: user.email,
          properties: {
            firstName: user.firstName,
            lastName: user.lastName,
            userId: user.userId,
            ...user.customFields
          },
          tags: user.tags
        }
      });

      if (error) throw error;
      console.log('User synced to Encharge:', user.email);
    } catch (error) {
      console.error('Failed to sync user to Encharge:', error);
    }
  }

  /**
   * Track an event in Encharge
   */
  async trackEvent(event: EnchargeEvent): Promise<void> {
    if (!this.apiKey) {
      console.log('Encharge not configured, skipping event tracking');
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('send-encharge-event', {
        body: {
          type: 'track',
          email: event.email,
          event: event.name,
          properties: event.properties,
          timestamp: event.timestamp || new Date().toISOString()
        }
      });

      if (error) throw error;
      console.log('Event tracked in Encharge:', event.name);
    } catch (error) {
      console.error('Failed to track event in Encharge:', error);
    }
  }

  /**
   * Handle trial signup - add user and trigger automation
   */
  async handleTrialSignup(email: string, userId: string, name?: string): Promise<void> {
    // Add/update user with trial tag
    await this.addOrUpdateUser({
      email,
      userId,
      firstName: name?.split(' ')[0],
      lastName: name?.split(' ').slice(1).join(' '),
      tags: ['trial_user', 'new_signup'],
      customFields: {
        trialStartDate: new Date().toISOString(),
        trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        signupSource: 'website'
      }
    });

    // Track trial started event
    await this.trackEvent({
      email,
      name: 'trial_started',
      properties: {
        trialDuration: 3,
        plan: 'premium',
        source: window.location.pathname
      }
    });
  }

  /**
   * Handle subscription conversion
   */
  async handleSubscriptionConversion(email: string, plan: string, amount: number): Promise<void> {
    // Update user tags
    await this.addOrUpdateUser({
      email,
      tags: ['paying_customer', `plan_${plan.toLowerCase()}`],
      customFields: {
        subscriptionPlan: plan,
        subscriptionAmount: amount,
        conversionDate: new Date().toISOString()
      }
    });

    // Track conversion event
    await this.trackEvent({
      email,
      name: 'trial_converted',
      properties: {
        plan,
        amount,
        currency: 'USD'
      }
    });
  }

  /**
   * Handle trial expiration
   */
  async handleTrialExpired(email: string): Promise<void> {
    await this.trackEvent({
      email,
      name: 'trial_expired',
      properties: {
        expiredAt: new Date().toISOString()
      }
    });
  }

  /**
   * Handle onboarding progress
   */
  async trackOnboardingStep(email: string, step: string, completed: boolean): Promise<void> {
    await this.trackEvent({
      email,
      name: 'onboarding_progress',
      properties: {
        step,
        completed,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Handle feature usage tracking
   */
  async trackFeatureUsage(email: string, feature: string): Promise<void> {
    await this.trackEvent({
      email,
      name: 'feature_used',
      properties: {
        feature,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Export singleton instance
export const enchargeService = new EnchargeService();

// Export types for use in other components
export type { EnchargeUser, EnchargeEvent };