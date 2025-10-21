# Emotion Tracking Debug Guide

## Issue
Emotions from Emotion Clarity Practice are not showing up in Growth Insights despite Supabase being updated.

## What We Know

### 1. Code Structure ✅
- **EmotionClarityPractice.tsx** (lines 200-204):
  - Saves with `entry_kind: "emotion-clarity"`
  - Saves emotions as comma-separated string in `data.emotions_identified`

- **GrowthInsights.tsx** (lines 156-216):
  - Filters for `entry_kind === "emotion-clarity"`
  - Processes `data?.emotions_identified` as comma-separated string
  - Splits by ", " and counts occurrences
  - Has comprehensive console logging

### 2. Database Migration ✅
- Migration `20251019224133_add_emotion_clarity_entry_kind.sql` was applied
- Adds 'emotion-clarity' to the valid_entry_kind constraint

## Debug Steps

### Step 1: Check Console Logs
When you navigate to Growth Insights, check the browser console for these logs:
```
🎭 Emotion Clarity - Total reflections: X
🎭 Emotion Clarity - Filtered reflections: X
🎭 Emotion Clarity - Sample reflection: {...}
🎭 Most Common Emotions (All Time): [...]
🎭 Emotions Last Week: [...]
🎭 Emotions Last Month: [...]
🎭 Emotions Last 90 Days: [...]
🎭 Total Emotion Clarity Practices: X
```

### Step 2: What to Look For

#### If "Filtered reflections: 0"
- **Problem**: No emotion-clarity entries in database
- **Solution**: Create a new Emotion Clarity Practice entry

#### If "Filtered reflections: > 0" but emotions array is empty
- **Problem**: Data structure mismatch
- **Likely causes**:
  1. `emotions_identified` is not a string
  2. `emotions_identified` is not formatted as "emotion1, emotion2, emotion3"
  3. Field name doesn't match (check the sample reflection log)

### Step 3: Check the Data

Look at the sample reflection log in console. It should look like:
```javascript
{
  id: "...",
  entry_kind: "emotion-clarity",
  data: {
    emotions_identified: "Emotionally flooded, Anxious, Drained",
    strongest_emotion: "...",
    body_location: "...",
    what_i_need: "...",
    next_step: "..."
  },
  created_at: "..."
}
```

## Potential Issues & Fixes

### Issue 1: No Data
**Symptom**: `🎭 Emotion Clarity - Filtered reflections: 0`

**Fix**: Create an Emotion Clarity Practice entry:
1. Navigate to Stress Reset Space
2. Click "Emotion Clarity Practice"
3. Select some emotions
4. Fill in the reflection questions
5. Click "Save & Close"
6. Refresh Growth Insights page

### Issue 2: Wrong Data Structure
**Symptom**: Filtered reflections > 0 but mostCommonEmotions is empty

**Check**: Look at the console log for the sample reflection
- Is `emotions_identified` present?
- Is it a string?
- Is it comma-separated?

**Possible Fix**: The field might be saved differently. Check what field names are actually in the data object.

### Issue 3: UI Not Rendering
**Symptom**: Console shows correct data but UI doesn't display

**Check lines 1116-1150 in GrowthInsights.tsx**:
- The condition is: `metrics?.mostCommonEmotions && metrics.mostCommonEmotions.length > 0`
- Add console log: `console.log("🎭🎭🎭 CARD RENDER - mostCommonEmotions:", metrics?.mostCommonEmotions);`

## Quick Test

1. Open browser to http://localhost:84
2. Log in
3. Open Browser DevTools (F12) → Console tab
4. Navigate to "Stress Reset Space" or wherever Emotion Clarity Practice is accessible
5. Complete an Emotion Clarity Practice
6. Navigate to Growth Insights
7. Check console for the debug logs mentioned above
8. Report what you see!

## Expected Behavior

After completing an Emotion Clarity Practice, you should see:
- Console logs showing filtered reflections > 0
- Console logs showing the emotions array with data
- "Most Common Emotions" card populated with your selected emotions
- Time-based cards (Last Week, Last Month, Last 90 Days) showing relevant data

## Next Steps

Please run the Quick Test above and report:
1. What do the console logs show?
2. Do you see the emotion cards in the UI?
3. What does the sample reflection object look like?

This will help us identify the exact issue!
