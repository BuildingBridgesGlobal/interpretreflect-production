import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { enchargeService } from '../services/enchargeService';

export function EnchargeTest() {
  const { user } = useAuth();
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testName, setTestName] = useState('Test User');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testAddUser = async () => {
    setLoading(true);
    addResult('Testing: Add/Update User...');
    try {
      await enchargeService.addOrUpdateUser({
        email: testEmail,
        firstName: testName.split(' ')[0],
        lastName: testName.split(' ').slice(1).join(' '),
        userId: 'test-user-123',
        tags: ['test_user', 'api_test'],
        fields: {
          testDate: new Date().toISOString(),
          source: 'test_page'
        }
      });
      addResult('✅ User added/updated successfully');
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    }
    setLoading(false);
  };

  const testTrackEvent = async () => {
    setLoading(true);
    addResult('Testing: Track Event...');
    try {
      await enchargeService.trackEvent({
        email: testEmail,
        name: 'test_event',
        properties: {
          test: true,
          timestamp: new Date().toISOString()
        }
      });
      addResult('✅ Event tracked successfully');
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    }
    setLoading(false);
  };

  const testTrialSignup = async () => {
    setLoading(true);
    addResult('Testing: Trial Signup Flow...');
    try {
      await enchargeService.handleTrialSignup(
        testEmail,
        'test-user-123',
        testName
      );
      addResult('✅ Trial signup tracked successfully');
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    }
    setLoading(false);
  };

  const testWaitlist = async () => {
    setLoading(true);
    addResult('Testing: Waitlist Signup...');
    try {
      await enchargeService.addToWaitlist(
        testEmail,
        testName,
        'professional_plan'
      );
      addResult('✅ Added to waitlist successfully');
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    }
    setLoading(false);
  };

  const testFeatureUsage = async () => {
    setLoading(true);
    addResult('Testing: Feature Usage Tracking...');
    try {
      await enchargeService.trackFeatureUsage(
        testEmail,
        'test_feature',
        { action: 'clicked', page: 'test_page' }
      );
      addResult('✅ Feature usage tracked successfully');
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    }
    setLoading(false);
  };

  const testAllIntegrations = async () => {
    await testAddUser();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testTrackEvent();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testFeatureUsage();
    addResult('🎉 All tests completed!');
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Encharge API Integration Test</h1>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">API Status</h2>
            <p className="text-sm text-blue-700">
              API Key: {import.meta.env.VITE_ENCHARGE_API_KEY ? '✅ Configured' : '❌ Not configured'}
            </p>
            <p className="text-sm text-blue-700">
              Current User: {user?.email || 'Not logged in'}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Test Email</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="test@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Test Name</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Test User"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <button
              onClick={testAddUser}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Test Add User
            </button>
            <button
              onClick={testTrackEvent}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Test Track Event
            </button>
            <button
              onClick={testTrialSignup}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Test Trial Signup
            </button>
            <button
              onClick={testWaitlist}
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              Test Waitlist
            </button>
            <button
              onClick={testFeatureUsage}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Test Feature Usage
            </button>
            <button
              onClick={testAllIntegrations}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Run All Tests
            </button>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Test Results:</h3>
              <button
                onClick={clearResults}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear Results
              </button>
            </div>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-gray-500">No tests run yet. Click a button above to test the integration.</p>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Testing Instructions:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>1. Make sure the dev server has been restarted after adding the API key</li>
              <li>2. Open browser console to see detailed logs</li>
              <li>3. Check Encharge dashboard to verify data is being received</li>
              <li>4. Test each function individually or run all tests</li>
              <li>5. You can use any email for testing (doesn't need to be real)</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">What to Check in Encharge:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ People section - New contacts should appear</li>
              <li>✓ Events section - Custom events should be logged</li>
              <li>✓ Tags - Test users should have appropriate tags</li>
              <li>✓ Fields - Custom fields should be populated</li>
              <li>✓ Automations - Check if any automations are triggered</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}