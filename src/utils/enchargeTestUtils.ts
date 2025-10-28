import { enchargeService } from '../services/enchargeService';

/**
 * Encharge Testing Utilities
 * These functions can be called from the browser console for testing
 */

// Make enchargeService available globally for testing
if (typeof window !== 'undefined') {
  (window as any).enchargeTest = {
    // Test basic user creation
    testUser: async (email = 'test@example.com', name = 'Test User') => {
      console.log('🔄 Testing user creation/update...');
      try {
        await enchargeService.addOrUpdateUser({
          email,
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' '),
          userId: `test-${Date.now()}`,
          tags: ['console_test'],
          fields: {
            testDate: new Date().toISOString(),
            source: 'console'
          }
        });
        console.log('✅ User added/updated successfully');
        return true;
      } catch (error) {
        console.error('❌ Failed:', error);
        return false;
      }
    },

    // Test event tracking
    testEvent: async (email = 'test@example.com', eventName = 'console_test_event') => {
      console.log('🔄 Testing event tracking...');
      try {
        await enchargeService.trackEvent({
          email,
          name: eventName,
          properties: {
            test: true,
            timestamp: new Date().toISOString(),
            source: 'console'
          }
        });
        console.log('✅ Event tracked successfully');
        return true;
      } catch (error) {
        console.error('❌ Failed:', error);
        return false;
      }
    },

    // Test trial signup
    testTrial: async (email = 'trial@example.com', name = 'Trial User') => {
      console.log('🔄 Testing trial signup...');
      try {
        await enchargeService.handleTrialSignup(
          email,
          `trial-user-${Date.now()}`,
          name
        );
        console.log('✅ Trial signup tracked successfully');
        return true;
      } catch (error) {
        console.error('❌ Failed:', error);
        return false;
      }
    },

    // Test waitlist
    testWaitlist: async (email = 'waitlist@example.com', name = 'Waitlist User') => {
      console.log('🔄 Testing waitlist signup...');
      try {
        await enchargeService.addToWaitlist(email, name, 'console_test');
        console.log('✅ Added to waitlist successfully');
        return true;
      } catch (error) {
        console.error('❌ Failed:', error);
        return false;
      }
    },

    // Run all tests
    runAll: async () => {
      console.log('🚀 Running all Encharge tests...\n');
      const results = {
        user: false,
        event: false,
        trial: false,
        waitlist: false
      };

      // Test with unique emails to avoid conflicts
      const timestamp = Date.now();

      results.user = await (window as any).enchargeTest.testUser(
        `user-${timestamp}@test.com`,
        'Console Test User'
      );

      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

      results.event = await (window as any).enchargeTest.testEvent(
        `user-${timestamp}@test.com`
      );

      await new Promise(resolve => setTimeout(resolve, 1000));

      results.trial = await (window as any).enchargeTest.testTrial(
        `trial-${timestamp}@test.com`,
        'Trial Test User'
      );

      await new Promise(resolve => setTimeout(resolve, 1000));

      results.waitlist = await (window as any).enchargeTest.testWaitlist(
        `waitlist-${timestamp}@test.com`,
        'Waitlist Test User'
      );

      console.log('\n📊 Test Results:', results);
      console.log(`✅ Passed: ${Object.values(results).filter(r => r).length}/4`);
      console.log(`❌ Failed: ${Object.values(results).filter(r => !r).length}/4`);

      return results;
    },

    // Check API configuration
    checkConfig: () => {
      const hasApiKey = !!import.meta.env.VITE_ENCHARGE_API_KEY;
      console.log('🔧 Encharge Configuration:');
      console.log(`API Key: ${hasApiKey ? '✅ Configured' : '❌ Not configured'}`);
      // API key logging removed for security
      return hasApiKey;
    },

    // Get help
    help: () => {
      console.log(`
📚 Encharge Test Utilities - Available Commands:

🔧 Check Configuration:
   enchargeTest.checkConfig()

👤 Test User Creation:
   enchargeTest.testUser('email@example.com', 'Full Name')

📊 Test Event Tracking:
   enchargeTest.testEvent('email@example.com', 'event_name')

🎯 Test Trial Signup:
   enchargeTest.testTrial('email@example.com', 'Full Name')

📝 Test Waitlist:
   enchargeTest.testWaitlist('email@example.com', 'Full Name')

🚀 Run All Tests:
   enchargeTest.runAll()

💡 Tips:
   - All functions use default values if no parameters provided
   - Check browser console for detailed logs
   - Verify in Encharge dashboard after testing
   - Tests use unique timestamps to avoid conflicts
      `);
    }
  };

  // Log availability
  console.log('✨ Encharge test utilities loaded! Type "enchargeTest.help()" for available commands.');
}

export {};