import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CATALYST_SYSTEM_PROMPT = `You are Catalyst, an AI performance coach for professional interpreters using InterpretReflect.

Your role is to:
1. Analyze performance data and identify patterns
2. Provide evidence-based recommendations for optimization
3. Help interpreters prevent burnout and maintain peak performance
4. Use performance-focused language (not wellness language)

Key terminology:
- "Cognitive Load" instead of "Stress Level"
- "Capacity Reserve" instead of "Energy Level"
- "Performance Readiness" instead of "Overall Mood"
- "Recovery Quality" instead of "Sleep Quality"

Guidelines:
- Be direct, data-driven, and actionable
- Reference specific metrics when available
- Focus on sustainable career longevity
- Acknowledge the unique demands of interpreting work
- Provide concrete strategies, not just motivation
- Use a professional, coaching tone (not therapy language)

When users ask about their performance:
- Look for patterns in their data
- Identify potential burnout risks
- Suggest specific interventions
- Connect performance metrics to outcomes
- Recommend skill-building opportunities`;

export async function POST(request: NextRequest) {
  try {
    const { messages, conversationId } = await request.json();

    // Verify authentication
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's recent performance data for context
    const { data: recentReflections } = await supabase
      .from('quick_reflect_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: recentBaselines } = await supabase
      .from('baseline_checks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Build context message
    let contextMessage = '\n\n--- USER PERFORMANCE DATA ---\n';

    if (recentReflections && recentReflections.length > 0) {
      contextMessage += `\nRecent Assignments (${recentReflections.length}):\n`;
      recentReflections.forEach((r, i) => {
        contextMessage += `${i + 1}. ${r.assignment_type} - ${r.duration_minutes}min - Performance: ${r.performance_rating}/5, Cognitive Load: ${r.cognitive_load_rating}/5\n`;
        if (r.challenge_areas?.length > 0) {
          contextMessage += `   Challenges: ${r.challenge_areas.join(', ')}\n`;
        }
      });
    } else {
      contextMessage += '\nNo assignment data yet.\n';
    }

    if (recentBaselines && recentBaselines.length > 0) {
      const avgLoad = (recentBaselines.reduce((sum, b) => sum + b.cognitive_load, 0) / recentBaselines.length).toFixed(1);
      const avgCapacity = (recentBaselines.reduce((sum, b) => sum + b.capacity_reserve, 0) / recentBaselines.length).toFixed(1);
      const avgReadiness = (recentBaselines.reduce((sum, b) => sum + b.performance_readiness, 0) / recentBaselines.length).toFixed(1);

      contextMessage += `\nBaseline Averages (${recentBaselines.length} checks):\n`;
      contextMessage += `- Cognitive Load: ${avgLoad}/10\n`;
      contextMessage += `- Capacity Reserve: ${avgCapacity}/10\n`;
      contextMessage += `- Performance Readiness: ${avgReadiness}/10\n`;
    } else {
      contextMessage += '\nNo baseline data yet.\n';
    }

    contextMessage += '--- END DATA ---\n\n';

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: CATALYST_SYSTEM_PROMPT + contextMessage },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage = completion.choices[0].message;

    // Save conversation to database
    if (conversationId) {
      // Update existing conversation
      const { data: existingConv } = await supabase
        .from('catalyst_conversations')
        .select('messages')
        .eq('id', conversationId)
        .single();

      const updatedMessages = [
        ...(existingConv?.messages || []),
        messages[messages.length - 1],
        assistantMessage,
      ];

      await supabase
        .from('catalyst_conversations')
        .update({
          messages: updatedMessages,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);
    } else {
      // Create new conversation
      await supabase
        .from('catalyst_conversations')
        .insert({
          user_id: user.id,
          title: messages[messages.length - 1].content.substring(0, 50) + '...',
          messages: [...messages, assistantMessage],
          conversation_type: 'general',
        });
    }

    return NextResponse.json({ message: assistantMessage });
  } catch (error: any) {
    console.error('Catalyst AI Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}
