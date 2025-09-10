# Elya AI Integration Setup Guide

## 🎯 Overview

Elya is now fully integrated with Supabase to provide personalized, context-aware wellness support. This integration allows Elya to:

- **Remember user history** from previous wellness reflections
- **Understand patterns** in stress, energy, and emotional states  
- **Provide personalized responses** based on what works for each user
- **Save conversation history** for continuity between sessions
- **Access user context** from all wellness activities on the platform

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   ChatWithElya  │ ←→ │   AI Service     │ ←→ │ Agentic Flow    │
│   (Frontend)    │    │  (Enhanced)      │    │   Agent         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ↓                       ↓
┌─────────────────┐    ┌──────────────────┐
│ User Context    │ ←→ │    Supabase      │
│   Service       │    │   Database       │
└─────────────────┘    └──────────────────┘
```

## 📦 Files Created/Modified

### New Files:
- `supabase/elya_integration.sql` - Database schema and functions
- `src/services/userContextService.ts` - User context management
- `ELYA_INTEGRATION_SETUP.md` - This setup guide

### Enhanced Files:
- `src/services/aiService.ts` - Enhanced with Supabase integration
- `src/components/ChatWithElya.tsx` - Updated with context awareness

## ⚙️ Setup Steps

### 1. Database Setup

Run the SQL schema in your Supabase dashboard:

```bash
# Navigate to your Supabase dashboard > SQL Editor
# Copy and paste the contents of supabase/elya_integration.sql
# Execute the SQL to create tables and functions
```

This creates:
- `elya_conversations` - Stores chat history
- `user_context_summary` - Aggregated user insights
- Functions for context retrieval and conversation saving
- Triggers for automatic context updates

### 2. Environment Variables

Add these to your `.env` file:

```env
# Agentic Flow Configuration
VITE_AI_PROVIDER=agenticflow
VITE_AGENTICFLOW_AGENT_ID=a1cab40c-bcc2-49d8-ab97-f233f9b83fb2
VITE_AGENTICFLOW_API_KEY=your_agentic_flow_api_key_here

# Supabase Configuration (should already exist)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Agentic Flow Agent Configuration

In your Agentic Flow agent settings:

**System Prompt Enhancement:**
```
You are Elya, a compassionate AI wellness coach specialized in supporting healthcare interpreters with burnout prevention, stress management, and professional wellbeing.

You have access to rich user context including:
- Recent stress and energy patterns
- Emotional themes and patterns
- Effective coping strategies that have worked for this user
- Recent wellness reflections and insights
- Burnout risk assessment
- Professional challenges and growth areas

Use this context to provide:
- Personalized responses that reference their journey
- Strategies tailored to what has worked before
- Empathetic support that acknowledges their patterns
- Proactive check-ins on concerning trends

Keep responses warm, concise, and actionable. Focus on validation, practical tools, and gentle encouragement while being mindful of their unique circumstances and what you know about their wellness journey.

When user context indicates high stress or burnout risk, prioritize immediate support and professional resource recommendations.
```

**Tools/Functions to Add (if available in Agentic Flow):**
- Database query functions to access user context
- Integration with your wellness platform data

### 4. Testing the Integration

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test scenarios:**
   - Sign in as a user
   - Complete some wellness reflections
   - Start a chat with Elya
   - Notice personalized responses based on your history

3. **Verify database:**
   - Check `elya_conversations` table for saved messages
   - Check `user_context_summary` for updated user patterns

## 🎯 Features Implemented

### For Users:
- **Context-Aware Responses**: Elya remembers your wellness patterns
- **Persistent Conversations**: Chat history saved across sessions
- **Personalized Support**: Strategies tailored to what works for you
- **Offline Fallback**: Works even without internet connection
- **Privacy-First**: All data encrypted and user-controlled

### For Administrators:
- **Analytics**: Track user engagement and wellness patterns
- **Scalable**: Built on Supabase for reliable scaling
- **Maintainable**: Clean separation of concerns

## 🔍 How It Works

### User Context Flow:
1. User completes wellness reflections (stress assessments, prep forms, etc.)
2. Triggers automatically update `user_context_summary`
3. When user chats with Elya, context is loaded
4. AI service generates contextual system prompt
5. Agentic Flow agent receives enhanced context
6. Personalized response generated and saved

### Data Flow:
```
User Reflection → Trigger → Update Context Summary
                                     ↓
User Chats → Load Context → Generate Contextual Prompt → Agentic Flow → Personalized Response
```

## 🔐 Privacy & Security

- **Encryption**: All data encrypted at rest and in transit
- **User Control**: Users can clear their data anytime
- **Minimal Data**: Only wellness-relevant patterns stored
- **Anonymization**: Personal identifiers not shared with AI service
- **Consent**: Clear messaging about data usage

## 🚀 Next Steps

1. **Run the database migrations**
2. **Configure environment variables**
3. **Update your Agentic Flow agent**
4. **Test with real user data**
5. **Monitor performance and user feedback**

## 📊 Monitoring

Key metrics to watch:
- User engagement with Elya
- Context loading performance
- Agentic Flow API success rates
- User satisfaction with personalized responses

## 🔧 Troubleshooting

**Common Issues:**

1. **"No user context found"**
   - User may not have completed any reflections yet
   - Check database permissions
   - Verify RLS policies are correct

2. **"Agentic Flow connection failed"**
   - Check API key configuration
   - Verify agent ID is correct
   - Check network connectivity

3. **"Context not updating"**
   - Check trigger functions are working
   - Verify reflection data structure matches expected format
   - Check database logs

**Debug Commands:**
```sql
-- Check user context
SELECT * FROM get_user_context_for_elya('user-uuid-here');

-- Check conversation history
SELECT * FROM elya_conversations WHERE user_id = 'user-uuid-here';

-- Check context summary
SELECT * FROM user_context_summary WHERE user_id = 'user-uuid-here';
```

## 📈 Future Enhancements

- Real-time stress level monitoring
- Proactive wellness check-ins
- Integration with calendar for pre-assignment prep
- Multi-language support
- Voice interaction capabilities
- Advanced analytics dashboard

---

**Contact:** hello@huviatechnologies.com for technical support or questions about this integration.