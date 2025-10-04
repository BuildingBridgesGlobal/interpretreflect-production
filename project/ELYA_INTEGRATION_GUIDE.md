# Elya AI Integration Guide

## Overview

Elya is fully integrated with both **Supabase** for data persistence and **Agentic Flow** for AI responses. All conversations are saved to the database and Elya uses user context to provide personalized responses.

## ✅ Current Integration Status

### 1. **Supabase Integration** - COMPLETE

- ✅ Conversations saved to `elya_conversations` table
- ✅ User context retrieved from reflections and past data
- ✅ Conversation summaries generated
- ✅ Pattern detection and insights
- ✅ Row Level Security (RLS) enabled

### 2. **Agentic Flow Integration** - COMPLETE

- ✅ Connected to Agentic Flow API
- ✅ Agent ID configured: `a1cab40c-bcc2-49d8-ab97-f233f9b83fb2`
- ✅ Fallback to simulated responses if API fails
- ✅ User context passed to AI for personalization

## Data Flow

```
User Message → ChatWithElya Component
    ↓
aiService.getResponse()
    ↓
1. Save user message to Supabase (elya_conversations)
2. Get user context from Supabase (reflections, metrics)
3. Send to Agentic Flow API with context
4. Receive AI response
5. Save Elya response to Supabase
    ↓
Display to User
```

## What's Being Saved

### Every Message Includes:

- **user_id**: Authenticated user
- **session_id**: Unique conversation session
- **message_id**: Unique message identifier
- **sender**: 'user' or 'elya'
- **message**: The actual text
- **metadata**: Additional context including:
  - timestamp
  - provider (agenticflow/simulated)
  - user_context_used (true/false)

### User Context Sent to AI:

- Average stress levels
- Average energy levels
- Burnout risk level
- Recent emotions
- Common challenges
- Effective strategies
- Recent reflection patterns

## SQL Scripts to Run

Run these scripts in your Supabase SQL Editor in this order:

1. **elya_conversations.sql** - Creates tables for storing conversations
2. **elya_functions.sql** - Creates functions for data operations

## Agentic Flow Configuration

### Current Settings (.env):

```env
VITE_AI_PROVIDER=agenticflow
VITE_AGENTICFLOW_AGENT_ID=a1cab40c-bcc2-49d8-ab97-f233f9b83fb2
VITE_AGENTICFLOW_API_KEY=your_agentic_flow_api_key_here
```

### To Add Your API Key:

1. Get your API key from Agentic Flow dashboard
2. Update `.env` file with your key
3. Restart the development server

## Testing Elya Integration

### 1. Test Supabase Connection:

```javascript
// Open browser console and check:
// 1. Send a message to Elya
// 2. Check Network tab for Supabase calls
// 3. Look for 'save_elya_conversation' RPC calls
```

### 2. Verify Data in Supabase:

```sql
-- Check conversations are being saved
SELECT * FROM elya_conversations
ORDER BY created_at DESC
LIMIT 10;

-- Check user context is working
SELECT get_user_context_for_elya('your-user-id');

-- View conversation patterns
SELECT * FROM detect_conversation_patterns('your-user-id', 30);
```

### 3. Test Agentic Flow:

- Send various messages to Elya
- Check responses are contextual and relevant
- Verify fallback works if API fails

## Features

### 1. Contextual Responses

Elya uses your reflection history to provide personalized support:

- Remembers your stress patterns
- Knows your effective coping strategies
- Understands your challenges
- Tracks your burnout risk

### 2. Conversation Memory

- Each session maintains conversation history
- Previous messages influence responses
- Context carries through the conversation

### 3. Pattern Detection

The system automatically detects:

- Recurring themes (stress, fatigue, anxiety)
- Emotional patterns
- Support-seeking behaviors
- Risk indicators

### 4. Smart Fallbacks

If Agentic Flow is unavailable:

- Uses contextual simulated responses
- Still saves conversations to Supabase
- Maintains user experience

## Troubleshooting

### "Elya not responding"

1. Check browser console for errors
2. Verify Supabase connection
3. Check Agentic Flow API status
4. Ensure user is authenticated

### "Responses not personalized"

1. Complete some reflections first
2. Check user context is loading:
   ```sql
   SELECT * FROM reflections WHERE user_id = 'your-user-id';
   ```
3. Verify RPC functions are created

### "Conversations not saving"

1. Check RLS policies are enabled
2. Verify user is authenticated
3. Check elya_conversations table exists
4. Look for errors in browser console

## Advanced Features

### Generate Conversation Summary:

```sql
SELECT generate_conversation_summary('session-id', 'user-id');
```

### Get AI Recommendations:

```sql
SELECT * FROM get_elya_recommendations('user-id');
```

### View Conversation Stats:

```sql
SELECT * FROM get_elya_conversation_stats('user-id');
```

## Security

- All data is protected by Row Level Security
- Users can only access their own conversations
- API keys are never exposed to client
- Sensitive data is encrypted in transit

## Next Steps

1. ✅ Run SQL scripts in Supabase
2. ✅ Add your Agentic Flow API key (optional)
3. ✅ Test conversation flow
4. ✅ Verify data is saving
5. ✅ Monitor usage in Supabase dashboard

## Support

If you encounter issues:

1. Check this guide first
2. Review browser console for errors
3. Verify all SQL scripts ran successfully
4. Check Supabase logs for RPC errors
5. Ensure Agentic Flow agent is active
