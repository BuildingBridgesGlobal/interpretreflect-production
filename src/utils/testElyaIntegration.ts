// Test Script for Elya Integration with Supabase
// This file tests all the new Elya functions created in Part 2

import { supabase } from '../lib/supabase';

interface TestResult {
  function: string;
  success: boolean;
  data?: any;
  error?: any;
}

class ElyaIntegrationTester {
  private userId: string | null = null;
  private testResults: TestResult[] = [];

  async runAllTests() {
    console.log('🧪 Starting Elya Integration Tests...\n');
    
    // Get current user
    await this.initializeUser();
    
    if (!this.userId) {
      console.error('❌ No authenticated user found. Please log in first.');
      return;
    }

    console.log(`✅ Authenticated as user: ${this.userId}\n`);

    // Run all tests
    await this.testGetUserContext();
    await this.testSaveConversation();
    await this.testGetWellnessInsights();
    await this.testGetTeamInsights();
    await this.testGenerateRecommendations();
    await this.testAnalyzeEmotionPatterns();
    await this.testGetAssignmentInsights();

    // Print summary
    this.printTestSummary();
  }

  private async initializeUser() {
    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id || null;
  }

  // Test 1: Get User Context for Elya
  private async testGetUserContext() {
    console.log('📋 Testing: get_user_context_for_elya');
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_context_for_elya', { 
          target_user_id: this.userId 
        });

      if (error) throw error;

      this.testResults.push({
        function: 'get_user_context_for_elya',
        success: true,
        data: {
          hasUserSummary: !!data?.user_summary,
          recentReflectionsCount: data?.recent_reflections?.length || 0,
          recentConversationsCount: data?.recent_conversations?.length || 0
        }
      });

      console.log('✅ User context retrieved successfully');
      console.log(`   - User summary: ${data?.user_summary ? 'Present' : 'Not found'}`);
      console.log(`   - Recent reflections: ${data?.recent_reflections?.length || 0}`);
      console.log(`   - Recent conversations: ${data?.recent_conversations?.length || 0}\n`);

    } catch (error) {
      this.testResults.push({
        function: 'get_user_context_for_elya',
        success: false,
        error: error
      });
      console.error('❌ Failed:', error);
      console.log();
    }
  }

  // Test 2: Save Elya Conversation
  private async testSaveConversation() {
    console.log('💬 Testing: save_elya_conversation');
    
    try {
      const testSessionId = `test-session-${Date.now()}`;
      const testMessageId = `test-msg-${Date.now()}`;
      
      const { data, error } = await supabase
        .rpc('save_elya_conversation', {
          p_user_id: this.userId,
          p_session_id: testSessionId,
          p_message_id: testMessageId,
          p_sender: 'user',
          p_content: 'Test message for Elya integration',
          p_metadata: { test: true, timestamp: new Date().toISOString() }
        });

      if (error) throw error;

      this.testResults.push({
        function: 'save_elya_conversation',
        success: true,
        data: { conversationId: data }
      });

      console.log('✅ Conversation saved successfully');
      console.log(`   - Conversation ID: ${data}\n`);

    } catch (error) {
      this.testResults.push({
        function: 'save_elya_conversation',
        success: false,
        error: error
      });
      console.error('❌ Failed:', error);
      console.log();
    }
  }

  // Test 3: Get Wellness Insights
  private async testGetWellnessInsights() {
    console.log('🌟 Testing: get_wellness_insights_for_elya');
    
    try {
      const { data, error } = await supabase
        .rpc('get_wellness_insights_for_elya', {
          target_user_id: this.userId
        });

      if (error) throw error;

      this.testResults.push({
        function: 'get_wellness_insights_for_elya',
        success: true,
        data: data
      });

      console.log('✅ Wellness insights retrieved successfully');
      console.log(`   - Burnout risk score: ${data?.burnout_risk_score || 0}`);
      console.log(`   - Wellness trend: ${data?.wellness_trend || 'Unknown'}`);
      console.log(`   - Needs attention: ${data?.needs_attention ? 'Yes' : 'No'}`);
      console.log(`   - Recent challenges: ${data?.recent_challenges?.length || 0} found`);
      console.log(`   - Effective strategies: ${data?.effective_strategies?.length || 0} found\n`);

    } catch (error) {
      this.testResults.push({
        function: 'get_wellness_insights_for_elya',
        success: false,
        error: error
      });
      console.error('❌ Failed:', error);
      console.log();
    }
  }

  // Test 4: Get Team Insights
  private async testGetTeamInsights() {
    console.log('👥 Testing: get_team_insights_for_elya');
    
    try {
      const { data, error } = await supabase
        .rpc('get_team_insights_for_elya', {
          target_user_id: this.userId
        });

      if (error) throw error;

      this.testResults.push({
        function: 'get_team_insights_for_elya',
        success: true,
        data: data
      });

      console.log('✅ Team insights retrieved successfully');
      console.log(`   - Recent team sessions: ${data?.recent_team_sessions?.length || 0}`);
      console.log(`   - Team session count (30d): ${data?.team_session_count || 0}`);
      console.log(`   - Avg collaboration rating: ${data?.collaboration_patterns?.avg_collaboration_rating || 'N/A'}\n`);

    } catch (error) {
      this.testResults.push({
        function: 'get_team_insights_for_elya',
        success: false,
        error: error
      });
      console.error('❌ Failed:', error);
      console.log();
    }
  }

  // Test 5: Generate Recommendations
  private async testGenerateRecommendations() {
    console.log('💡 Testing: generate_recommendations_for_elya');
    
    try {
      const { data, error } = await supabase
        .rpc('generate_recommendations_for_elya', {
          target_user_id: this.userId
        });

      if (error) throw error;

      this.testResults.push({
        function: 'generate_recommendations_for_elya',
        success: true,
        data: data
      });

      console.log('✅ Recommendations generated successfully');
      console.log(`   - Recommendations count: ${data?.recommendations?.length || 0}`);
      console.log(`   - Based on days: ${data?.based_on_days || 0}`);
      console.log(`   - Reflection count: ${data?.reflection_count || 0}`);
      
      if (data?.recommendations?.length > 0) {
        console.log('   - Top recommendation:');
        const topRec = data.recommendations[0];
        console.log(`     • Type: ${topRec.type}`);
        console.log(`     • Priority: ${topRec.priority}`);
        console.log(`     • Suggestion: ${topRec.suggestion?.substring(0, 60)}...`);
      }
      console.log();

    } catch (error) {
      this.testResults.push({
        function: 'generate_recommendations_for_elya',
        success: false,
        error: error
      });
      console.error('❌ Failed:', error);
      console.log();
    }
  }

  // Test 6: Analyze Emotion Patterns
  private async testAnalyzeEmotionPatterns() {
    console.log('😊 Testing: analyze_emotion_patterns_for_elya');
    
    try {
      const { data, error } = await supabase
        .rpc('analyze_emotion_patterns_for_elya', {
          target_user_id: this.userId
        });

      if (error) throw error;

      this.testResults.push({
        function: 'analyze_emotion_patterns_for_elya',
        success: true,
        data: data
      });

      console.log('✅ Emotion patterns analyzed successfully');
      console.log(`   - Dominant emotions: ${data?.dominant_emotions?.slice(0, 3).join(', ') || 'None'}`);
      console.log(`   - Emotion frequency entries: ${data?.emotion_frequency?.length || 0}`);
      console.log(`   - Emotion trends (weeks): ${data?.emotion_trends?.length || 0}`);
      console.log(`   - Emotional diversity score: ${data?.emotional_diversity_score?.toFixed(1) || 0}%\n`);

    } catch (error) {
      this.testResults.push({
        function: 'analyze_emotion_patterns_for_elya',
        success: false,
        error: error
      });
      console.error('❌ Failed:', error);
      console.log();
    }
  }

  // Test 7: Get Assignment Insights
  private async testGetAssignmentInsights() {
    console.log('📝 Testing: get_assignment_insights_for_elya');
    
    try {
      const { data, error } = await supabase
        .rpc('get_assignment_insights_for_elya', {
          target_user_id: this.userId
        });

      if (error) throw error;

      this.testResults.push({
        function: 'get_assignment_insights_for_elya',
        success: true,
        data: data
      });

      console.log('✅ Assignment insights retrieved successfully');
      console.log(`   - Recent assignments: ${data?.recent_assignments?.length || 0}`);
      console.log(`   - Total assignments (30d): ${data?.total_assignments_30d || 0}`);
      console.log(`   - Avg preparation level: ${data?.preparation_patterns?.avg_preparation_level?.toFixed(1) || 'N/A'}`);
      console.log(`   - Completion rate: ${data?.performance_metrics?.completion_rate?.toFixed(1) || 0}%`);
      console.log(`   - Confidence improvement: ${data?.performance_metrics?.confidence_improvement?.toFixed(1) || 'N/A'}\n`);

    } catch (error) {
      this.testResults.push({
        function: 'get_assignment_insights_for_elya',
        success: false,
        error: error
      });
      console.error('❌ Failed:', error);
      console.log();
    }
  }

  // Print test summary
  private printTestSummary() {
    console.log('=' .repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(60));
    
    const successCount = this.testResults.filter(r => r.success).length;
    const failCount = this.testResults.filter(r => !r.success).length;
    
    console.log(`✅ Passed: ${successCount}/${this.testResults.length}`);
    console.log(`❌ Failed: ${failCount}/${this.testResults.length}`);
    console.log();
    
    console.log('Details:');
    this.testResults.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${result.function}`);
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error.message || result.error}`);
      }
    });
    
    console.log('\n' + '=' .repeat(60));
    
    if (successCount === this.testResults.length) {
      console.log('🎉 All tests passed! Elya integration is working correctly.');
    } else if (failCount > 0) {
      console.log('⚠️  Some tests failed. Please check the errors above.');
      console.log('Common issues:');
      console.log('1. Make sure Part 1 SQL (tables) was run before Part 2');
      console.log('2. Ensure you\'re logged in as an authenticated user');
      console.log('3. Check that all SQL functions were created successfully');
    }
  }
}

// Export the tester
export const elyaIntegrationTester = new ElyaIntegrationTester();

// Function to run tests (can be called from console or component)
export async function testElyaIntegration() {
  const tester = new ElyaIntegrationTester();
  await tester.runAllTests();
}

// Auto-run if this file is executed directly
if (import.meta.url === `file://${__filename}`) {
  testElyaIntegration();
}