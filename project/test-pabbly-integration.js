/**
 * Test Script for Pabbly Integration
 *
 * This script simulates Stripe webhook events to test your Pabbly workflows
 * Run this after setting up your Pabbly workflows to verify everything works
 *
 * Usage:
 * 1. Update the PABBLY_WEBHOOK_URLS with your actual webhook URLs
 * 2. Run: node test-pabbly-integration.js
 */

// Configuration - UPDATE THESE WITH YOUR ACTUAL VALUES
const CONFIG = {
  PABBLY_WEBHOOK_URLS: {
    subscription_created: 'https://connect.pabbly.com/workflow/webhook/YOUR_SUBSCRIPTION_CREATED_ID',
    subscription_deleted: 'https://connect.pabbly.com/workflow/webhook/YOUR_SUBSCRIPTION_DELETED_ID',
    payment_failed: 'https://connect.pabbly.com/workflow/webhook/YOUR_PAYMENT_FAILED_ID'
  },
  STRIPE_TEST_MODE: true, // Set to false when testing production
  TEST_EMAIL: 'test@interpretreflect.com' // Change to your test email
};

// Test Data Generators
const generateTestCustomer = (email = null) => ({
  id: `cus_test_${Date.now()}`,
  object: 'customer',
  email: email || `test+${Date.now()}@interpretreflect.com`,
  name: 'Test User',
  created: Math.floor(Date.now() / 1000),
  metadata: {
    test_mode: 'true'
  }
});

const generateSubscriptionCreated = (customerId = null) => ({
  id: `evt_test_${Date.now()}`,
  object: 'event',
  type: 'customer.subscription.created',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: `sub_test_${Date.now()}`,
      object: 'subscription',
      customer: customerId || `cus_test_${Date.now()}`,
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
      items: {
        data: [{
          price: {
            id: 'price_1S37dPIouyG60O9hzikj2c9h', // Your actual price ID
            product: 'prod_Sz5pOazVvmQSVJ',
            unit_amount: 1299, // $12.99
            currency: 'usd',
            recurring: {
              interval: 'month',
              interval_count: 1
            }
          }
        }]
      },
      metadata: {
        test: 'true'
      }
    }
  }
});

const generateSubscriptionCancelled = (subscriptionId = null) => ({
  id: `evt_test_${Date.now()}`,
  object: 'event',
  type: 'customer.subscription.deleted',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: subscriptionId || `sub_test_${Date.now()}`,
      object: 'subscription',
      customer: `cus_test_${Date.now()}`,
      status: 'canceled',
      canceled_at: Math.floor(Date.now() / 1000),
      cancellation_details: {
        reason: 'cancellation_requested',
        comment: 'Testing cancellation flow'
      },
      current_period_end: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days remaining
      metadata: {
        test: 'true'
      }
    }
  }
});

const generatePaymentFailed = (attemptCount = 1) => ({
  id: `evt_test_${Date.now()}`,
  object: 'event',
  type: 'invoice.payment_failed',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: `in_test_${Date.now()}`,
      object: 'invoice',
      customer: `cus_test_${Date.now()}`,
      customer_email: CONFIG.TEST_EMAIL,
      amount_due: 1299,
      currency: 'usd',
      attempt_count: attemptCount,
      next_payment_attempt: Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60), // 3 days
      subscription: `sub_test_${Date.now()}`,
      status: 'open',
      last_finalization_error: {
        code: 'card_declined',
        message: 'Your card was declined.',
        type: 'card_error'
      }
    }
  }
});

// Test Execution Functions
async function sendWebhook(url, data) {
  try {
    console.log(`📤 Sending webhook to: ${url.substring(0, 50)}...`);
    console.log(`   Event type: ${data.type}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 'test_signature', // Pabbly might not validate in test mode
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      console.log(`✅ Success: ${response.status} ${response.statusText}`);
      const responseText = await response.text();
      if (responseText) {
        console.log(`   Response: ${responseText.substring(0, 100)}`);
      }
    } else {
      console.log(`❌ Failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      if (errorText) {
        console.log(`   Error: ${errorText.substring(0, 200)}`);
      }
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log(''); // Empty line for readability
}

// Test Scenarios
async function testNewSubscription() {
  console.log('🧪 TEST 1: New Subscription Created');
  console.log('=====================================');

  const customer = generateTestCustomer(CONFIG.TEST_EMAIL);
  const event = generateSubscriptionCreated(customer.id);

  // Add customer data to event
  event.data.object.customer_object = customer;

  await sendWebhook(CONFIG.PABBLY_WEBHOOK_URLS.subscription_created, event);

  console.log('✓ Check Supabase: Profile should be updated with:');
  console.log(`  - subscription_status: 'active'`);
  console.log(`  - stripe_customer_id: '${customer.id}'`);
  console.log(`  - stripe_subscription_id: '${event.data.object.id}'`);
  console.log('✓ Check Encharge: Tags should include: customer-active');
  console.log('');
}

async function testCancellation() {
  console.log('🧪 TEST 2: Subscription Cancelled');
  console.log('=====================================');

  const event = generateSubscriptionCancelled();

  await sendWebhook(CONFIG.PABBLY_WEBHOOK_URLS.subscription_deleted, event);

  console.log('✓ Check Supabase: Profile should be updated with:');
  console.log(`  - subscription_status: 'cancelled'`);
  console.log(`  - cancellation_date: [current timestamp]`);
  console.log(`  - Keep access until: ${new Date(event.data.object.current_period_end * 1000).toLocaleDateString()}`);
  console.log('✓ Check Encharge: Tags should include: customer-cancelled, win-back-eligible');
  console.log('');
}

async function testPaymentFailed() {
  console.log('🧪 TEST 3: Payment Failed (Multiple Attempts)');
  console.log('==============================================');

  // Test escalating attempts
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`\nAttempt ${attempt}:`);
    const event = generatePaymentFailed(attempt);
    await sendWebhook(CONFIG.PABBLY_WEBHOOK_URLS.payment_failed, event);

    if (attempt === 1) {
      console.log('✓ Should send friendly reminder email');
    } else if (attempt === 2) {
      console.log('✓ Should send urgent email');
    } else if (attempt === 3) {
      console.log('✓ Should alert admin and prepare for suspension');
    }
  }

  console.log('\n✓ Check Supabase: Profile should show:');
  console.log(`  - subscription_status: 'past_due'`);
  console.log(`  - payment_retry_count: 3`);
  console.log('✓ Check Encharge: Should have triggered payment failed sequence');
  console.log('');
}

// Main Test Runner
async function runAllTests() {
  console.log('');
  console.log('🚀 PABBLY INTEGRATION TEST SUITE');
  console.log('==================================');
  console.log(`Test Mode: ${CONFIG.STRIPE_TEST_MODE ? 'TEST' : 'PRODUCTION'}`);
  console.log(`Test Email: ${CONFIG.TEST_EMAIL}`);
  console.log('');

  // Check if webhook URLs are configured
  if (CONFIG.PABBLY_WEBHOOK_URLS.subscription_created.includes('YOUR_')) {
    console.log('⚠️  WARNING: Please update PABBLY_WEBHOOK_URLS with your actual webhook URLs');
    console.log('   You can find these in your Pabbly workflow settings');
    console.log('');
    return;
  }

  // Run tests with delay between each
  await testNewSubscription();
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

  await testCancellation();
  await new Promise(resolve => setTimeout(resolve, 2000));

  await testPaymentFailed();

  console.log('');
  console.log('✅ ALL TESTS COMPLETED');
  console.log('=======================');
  console.log('');
  console.log('📋 MANUAL VERIFICATION CHECKLIST:');
  console.log('--------------------------------');
  console.log('1. Check Pabbly Dashboard:');
  console.log('   □ All 3 workflows show "Success" status');
  console.log('   □ No error messages in execution logs');
  console.log('');
  console.log('2. Check Supabase Database:');
  console.log('   □ profiles table has updated subscription fields');
  console.log('   □ subscription_audit_log has new entries');
  console.log('   □ pabbly_webhook_logs shows processed webhooks');
  console.log('');
  console.log('3. Check Encharge:');
  console.log('   □ Test contact created/updated');
  console.log('   □ Correct tags applied');
  console.log('   □ Email sequences triggered');
  console.log('');
  console.log('4. Check Email Inbox:');
  console.log('   □ Welcome email received');
  console.log('   □ Cancellation email received');
  console.log('   □ Payment failed email received');
  console.log('');
}

// Interactive Test Menu
async function interactiveMenu() {
  console.log('');
  console.log('🎮 PABBLY TEST MENU');
  console.log('===================');
  console.log('1. Test New Subscription');
  console.log('2. Test Cancellation');
  console.log('3. Test Payment Failed');
  console.log('4. Run All Tests');
  console.log('5. Exit');
  console.log('');

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('Select test to run (1-5): ', async (answer) => {
    switch(answer) {
      case '1':
        await testNewSubscription();
        break;
      case '2':
        await testCancellation();
        break;
      case '3':
        await testPaymentFailed();
        break;
      case '4':
        await runAllTests();
        break;
      case '5':
        console.log('Goodbye!');
        readline.close();
        return;
      default:
        console.log('Invalid option');
    }

    readline.close();
    // Restart menu
    interactiveMenu();
  });
}

// Run based on command line argument
if (process.argv.includes('--interactive')) {
  interactiveMenu();
} else {
  runAllTests();
}

// Export for use in other scripts
module.exports = {
  generateTestCustomer,
  generateSubscriptionCreated,
  generateSubscriptionCancelled,
  generatePaymentFailed,
  sendWebhook
};