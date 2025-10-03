# Supabase & Elya Integration Guide

## Overview
This guide explains how to integrate the new Supabase-connected reflection system and Elya AI integration into your InterpretReflect platform.

## What's New

### 1. **Reflection Service** (`src/services/reflectionService.ts`)
- Saves all reflections to Supabase automatically
- Fetches reflection statistics and insights
- Prepares data for Elya AI integration
- Tracks reflection streaks and patterns

### 2. **Growth Insights Supabase Component** (`src/components/GrowthInsightsSupabase.tsx`)
- Displays real-time reflection data from Supabase
- Shows statistics, patterns, and achievements
- Includes Elya AI integration button
- Export functionality for data analysis

### 3. **useSupabaseReflections Hook** (`src/hooks/useSupabaseReflections.ts`)
- Manages reflection state with Supabase sync
- Handles both local storage and cloud storage
- Provides stats and insights

## Integration Steps

### Step 1: Update App.tsx Imports
Add these imports at the top of your App.tsx file:

```typescript
import { useSupabaseReflections } from './hooks/useSupabaseReflections';
import { GrowthInsightsSupabase } from './components/GrowthInsightsSupabase';
```

### Step 2: Replace the saveReflection Function
Replace the existing `saveReflection` function in App.tsx with the hook:

```typescript
// Replace this section in App.tsx
const { 
  savedReflections, 
  saveReflection, 
  stats, 
  insights 
} = useSupabaseReflections(insightsTimePeriod);
```

### Step 3: Update Reflection Callbacks
Update all reflection completion callbacks to use async/await:

```typescript
// Example for Wellness Check-in
onComplete={async (results) => {
  await saveReflection('Wellness Check-in', results);
  setShowWellnessCheckIn(false);
}}
```

### Step 4: Add Growth Insights Supabase Component
You can either:
- Replace the existing Growth Insights section with the new component
- Add it as a new tab/section

```typescript
// In your render method
{activeTab === 'insights' && <GrowthInsightsSupabase />}
```

## Supabase Database Schema

The integration expects these tables in your Supabase database:

### reflections table
```sql
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  answers JSONB NOT NULL,
  status TEXT DEFAULT 'completed',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### reflection_events table
```sql
CREATE TABLE reflection_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  reflection_id UUID REFERENCES reflections(id),
  reflection_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### growth_insights table
```sql
CREATE TABLE growth_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  insight_type TEXT,
  data JSONB,
  metadata JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_growth_metrics table
```sql
CREATE TABLE user_growth_metrics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  preparedness_score DECIMAL,
  self_awareness_level DECIMAL,
  role_clarity_score DECIMAL,
  ethical_awareness_score DECIMAL,
  growth_mindset_score DECIMAL,
  resilience_score DECIMAL,
  overall_progress DECIMAL,
  last_assessment TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Elya AI Integration

### What is Elya?
Elya is an AI wellness companion that can analyze reflection patterns and provide personalized guidance.

### Integration Features
1. **Data Preparation**: The system prepares reflection data in a format Elya can analyze
2. **Pattern Recognition**: Identifies emotional patterns and themes
3. **Personalized Recommendations**: Generates wellness strategies based on your data
4. **Integration Token**: Creates a secure token for data exchange

### How to Connect with Elya
1. Complete at least 5 reflections
2. Click the "Connect with Elya" button in Growth Insights
3. Review the data summary
4. Authorize the connection

### Elya Data Format
```typescript
{
  userId: string,
  reflectionSummary: {
    totalCount: number,
    types: string[],
    dateRange: { start: string, end: string }
  },
  keyThemes: string[],
  emotionalPatterns: Array<{ emotion: string, frequency: number }>,
  recommendations: string[],
  integrationToken: string
}
```

## Key Data Points in Growth Insights

The enhanced Growth Insights now displays:

### Statistics
- Total reflections count
- Weekly average (reflections per day)
- Current streak (consecutive days)
- Monthly reflection count

### Insights
- **Patterns & Themes**: Identified trends in your reflections
- **Achievements**: Milestones you've reached
- **Recommendations**: Personalized suggestions
- **Areas of Growth**: Opportunities for development

### Reflection Practice Analysis
- Top reflection types used
- Frequency distribution
- Time-based trends

## Benefits of Supabase Integration

1. **Data Persistence**: Reflections are saved to the cloud
2. **Cross-Device Sync**: Access your data from any device
3. **Real-Time Updates**: See changes instantly
4. **Analytics**: Track progress over time
5. **Data Export**: Download your data for external analysis
6. **Team Insights**: (Future) Share insights with supervisors/mentors

## Testing the Integration

1. **Test Reflection Saving**:
   - Complete a reflection
   - Check Supabase dashboard for new entry
   - Verify it appears in Growth Insights

2. **Test Data Fetching**:
   - Switch time periods (week/month/90 days)
   - Verify correct data loads

3. **Test Elya Integration**:
   - Click "Connect with Elya"
   - Verify data preparation
   - Check console for integration data

## Troubleshooting

### Reflections not saving to Supabase
- Check user authentication status
- Verify Supabase connection in `lib/supabase.ts`
- Check browser console for errors

### Growth Insights not loading
- Ensure tables exist in Supabase
- Check RLS policies allow user access
- Verify user is authenticated

### Elya button not appearing
- Complete at least one reflection
- Refresh the Growth Insights page
- Check console for errors

## Future Enhancements

1. **Real-Time Collaboration**: Share reflections with team members
2. **Advanced Analytics**: ML-powered pattern recognition
3. **Voice Integration**: Audio reflection recordings
4. **Mobile App**: Native mobile experience
5. **Elya Chat Interface**: Direct conversation with AI assistant

## Support

For questions or issues:
- Check browser console for error messages
- Review Supabase logs in dashboard
- Contact support with error details

---

*Last Updated: September 2025*