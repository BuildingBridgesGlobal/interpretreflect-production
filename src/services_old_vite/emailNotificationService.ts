/**
 * Email Notification Service
 * Manages email preferences and integrates with Encharge for marketing automation
 */

import { supabase } from '../lib/supabase';

interface EmailPreferences {
  userId: string;
  emailNotifications: boolean;
  wellnessReminders: boolean;
  weeklyInsights: boolean;
  productUpdates: boolean;
  marketingEmails: boolean;
}

interface EnchargeContact {
  email: string;
  userId: string;
  name?: string;
  tags?: string[];
  fields?: Record<string, any>;
}

class EmailNotificationService {
  private static instance: EmailNotificationService;
  private enchargeApiKey: string | null = null;
  private enchargeListId: string | null = null;

  private constructor() {
    // Initialize with environment variables
    this.enchargeApiKey = import.meta.env.VITE_ENCHARGE_API_KEY || null;
    this.enchargeListId = import.meta.env.VITE_ENCHARGE_LIST_ID || null;
  }

  static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  /**
   * Update email notification preferences
   */
  async updateEmailPreferences(userId: string, preferences: Partial<EmailPreferences>): Promise<boolean> {
    try {
      // First, update in our database
      const { data, error } = await supabase
        .from('email_preferences')
        .upsert({
          user_id: userId,
          email_notifications: preferences.emailNotifications,
          wellness_reminders: preferences.wellnessReminders,
          weekly_insights: preferences.weeklyInsights,
          product_updates: preferences.productUpdates,
          marketing_emails: preferences.marketingEmails,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating email preferences:', error);
        return false;
      }

      // Get user details for Encharge
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();

      if (!userError && userData) {
        // Update Encharge if user enabled notifications
        if (preferences.emailNotifications) {
          await this.addToEncharge({
            email: userData.email,
            userId: userId,
            name: userData.full_name,
            fields: {
              wellness_reminders: preferences.wellnessReminders || false,
              weekly_insights: preferences.weeklyInsights || false,
              product_updates: preferences.productUpdates || false,
              marketing_emails: preferences.marketingEmails || false
            },
            tags: this.getTagsFromPreferences(preferences)
          });
        } else {
          // User disabled notifications - update in Encharge
          await this.updateEnchargeContact(userData.email, {
            fields: {
              email_notifications_disabled: true,
              wellness_reminders: false,
              weekly_insights: false,
              product_updates: false,
              marketing_emails: false
            },
            tags: ['notifications-disabled']
          });
        }
      }

      // Log the preference change
      await this.logPreferenceChange(userId, preferences);

      return true;
    } catch (error) {
      console.error('Error updating email preferences:', error);
      return false;
    }
  }

  /**
   * Add or update contact in Encharge
   */
  private async addToEncharge(contact: EnchargeContact): Promise<boolean> {
    if (!this.enchargeApiKey || !this.enchargeListId) {
      console.warn('Encharge API key or List ID not configured');
      // Still return true so the app continues to work
      return true;
    }

    try {
      // Encharge API endpoint for adding/updating contacts
      const response = await fetch('https://api.encharge.io/v1/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Encharge-Token': this.enchargeApiKey
        },
        body: JSON.stringify({
          email: contact.email,
          userId: contact.userId,
          name: contact.name,
          listId: this.enchargeListId,
          fields: {
            ...contact.fields,
            source: 'interpretreflect_app',
            updated_from: 'email_preferences'
          },
          tags: contact.tags,
          // Subscribe to the list
          status: 'subscribed'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Encharge API error:', error);
        // Don't throw - we want the app to continue working even if Encharge fails
        return false;
      }

      console.log(`Successfully added/updated ${contact.email} in Encharge`);
      return true;
    } catch (error) {
      console.error('Error adding to Encharge:', error);
      // Don't throw - we want the app to continue working even if Encharge fails
      return false;
    }
  }

  /**
   * Update existing contact in Encharge
   */
  private async updateEnchargeContact(email: string, updates: { fields?: Record<string, any>, tags?: string[] }): Promise<boolean> {
    if (!this.enchargeApiKey) {
      console.warn('Encharge API key not configured');
      return true;
    }

    try {
      const response = await fetch(`https://api.encharge.io/v1/people/${email}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Encharge-Token': this.enchargeApiKey
        },
        body: JSON.stringify({
          fields: updates.fields,
          tags: updates.tags
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Encharge update error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating Encharge contact:', error);
      return false;
    }
  }

  /**
   * Get tags based on preferences
   */
  private getTagsFromPreferences(preferences: Partial<EmailPreferences>): string[] {
    const tags: string[] = ['interpretreflect-user'];

    if (preferences.wellnessReminders) tags.push('wellness-reminders');
    if (preferences.weeklyInsights) tags.push('weekly-insights');
    if (preferences.productUpdates) tags.push('product-updates');
    if (preferences.marketingEmails) tags.push('marketing-emails');
    if (preferences.emailNotifications === false) tags.push('notifications-disabled');

    return tags;
  }

  /**
   * Log preference changes for analytics
   */
  private async logPreferenceChange(userId: string, preferences: Partial<EmailPreferences>) {
    try {
      await supabase.from('email_preference_logs').insert({
        user_id: userId,
        preferences: preferences,
        changed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging preference change:', error);
      // Non-critical - don't throw
    }
  }

  /**
   * Get current email preferences for a user
   */
  async getEmailPreferences(userId: string): Promise<EmailPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found - return defaults
          return {
            userId,
            emailNotifications: true,
            wellnessReminders: true,
            weeklyInsights: true,
            productUpdates: false,
            marketingEmails: false
          };
        }
        console.error('Error fetching email preferences:', error);
        return null;
      }

      return {
        userId: data.user_id,
        emailNotifications: data.email_notifications,
        wellnessReminders: data.wellness_reminders,
        weeklyInsights: data.weekly_insights,
        productUpdates: data.product_updates,
        marketingEmails: data.marketing_emails
      };
    } catch (error) {
      console.error('Error getting email preferences:', error);
      return null;
    }
  }

  /**
   * Send wellness reminder email
   */
  async sendWellnessReminder(userId: string, reminderType: string, data?: any): Promise<boolean> {
    try {
      // Check if user has wellness reminders enabled
      const preferences = await this.getEmailPreferences(userId);
      if (!preferences?.wellnessReminders) {
        console.log('User has disabled wellness reminders');
        return false;
      }

      // Call the Supabase edge function to send email
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          userId,
          emailType: 'wellness_reminder',
          data: {
            reminderType,
            ...data
          }
        }
      });

      if (error) {
        console.error('Error sending wellness reminder:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending wellness reminder:', error);
      return false;
    }
  }

  /**
   * Sync all users with Encharge (batch operation)
   */
  async syncAllUsersWithEncharge(): Promise<void> {
    try {
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name')
        .not('email', 'is', null);

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      for (const user of users || []) {
        const preferences = await this.getEmailPreferences(user.id);
        if (preferences?.emailNotifications) {
          await this.addToEncharge({
            email: user.email,
            userId: user.id,
            name: user.full_name,
            fields: {
              wellness_reminders: preferences.wellnessReminders,
              weekly_insights: preferences.weeklyInsights,
              product_updates: preferences.productUpdates,
              marketing_emails: preferences.marketingEmails
            },
            tags: this.getTagsFromPreferences(preferences)
          });
        }
      }

      console.log(`Synced ${users?.length || 0} users with Encharge`);
    } catch (error) {
      console.error('Error syncing with Encharge:', error);
    }
  }
}

export const emailNotificationService = EmailNotificationService.getInstance();