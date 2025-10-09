# Burnout Assessment - Complete Frontend Test Plan

## Test Environment
- **URL**: https://www.interpretreflect.com
- **Browser**: Chrome, Firefox, Safari (test on at least 2)
- **Account**: Use your test account

---

## Test 1: Button Selection Works Correctly ✅ (Already Confirmed Fixed)

### Steps:
1. Navigate to dashboard/homepage
2. Click "Daily Burnout Gauge" or "Check Your Burnout Level"
3. On the first question, try to click the **TOP option** ("Full tank - energized and ready")

### Expected Result:
- ✅ Top button should be selectable immediately without clicking other buttons first
- ✅ Button should show selected state (green background, green border)
- ✅ "Next" button should become enabled

### Status: ✅ CONFIRMED FIXED

---

## Test 2: Complete First Assessment (Fresh)

### Pre-condition:
- Clear browser cache OR use incognito mode
- Log in fresh

### Steps:
1. Open Daily Burnout Gauge
2. Complete all 5 questions:
   - **Question 1 (Energy Tank)**: Select "Half tank - managing okay" (value 3)
   - **Question 2 (Recovery Speed)**: Select "Well - decent recharge from rest" (value 4)
   - **Question 3 (Emotional Leakage)**: Select "Some spillover - occasional rumination" (value 3)
   - **Question 4 (Performance Signal)**: Select "Adequate - getting by" (value 3)
   - **Question 5 (Tomorrow Readiness)**: Select "Neutral - just another day" (value 3)
3. Click "Complete"

### Expected Results:
- ✅ Assessment completes successfully
- ✅ Results screen shows:
  - Risk level (should be "Moderate" or "Early Warning Signs")
  - Detailed scores for each question
  - Personalized recommendations
- ✅ No error messages in console
- ✅ Console shows: `"✅ Assessment saved successfully"`

### Check Console for:
```
💾 Saving assessment: [date], Score: [X]/10
✅ Assessment saved successfully
```

### Verify in Dashboard:
- Go back to homepage/dashboard
- Check "Today's Mood" and "Energy Level" display
- **Expected**: Should show calculated values from your assessment

---

## Test 3: Update Assessment (Same Day)

### Pre-condition:
- You've already completed one assessment today (Test 2)

### Steps:
1. Open Daily Burnout Gauge again
2. Complete with DIFFERENT answers:
   - **Question 1 (Energy Tank)**: Select "Full tank - energized and ready" (value 5)
   - **Question 2 (Recovery Speed)**: Select "Quickly - refreshed after short breaks" (value 5)
   - **Question 3 (Emotional Leakage)**: Select "Leave them at work - clear separation" (value 5)
   - **Question 4 (Performance Signal)**: Select "Sharp - at my best" (value 5)
   - **Question 5 (Tomorrow Readiness)**: Select "Excited - looking forward to it" (value 5)
3. Click "Complete"

### Expected Results:
- ✅ Assessment completes successfully
- ✅ NO duplicate key error
- ✅ Console shows: `"✅ Assessment saved/updated successfully"` OR `"✅ Assessment updated successfully"`
- ✅ Results show new risk level (should be "Low" or "Healthy Balance")

### Check Console for:
```
📊 Supabase response: { savedData: {...}, burnoutError: null }
✅ Assessment saved/updated successfully
```

### Verify Dashboard Updated:
- Go back to homepage/dashboard
- **Expected**: Mood and Energy should reflect NEW values (should be higher - around 10/10 or 9/10)
- **Should NOT show**: 10/10 for both if you didn't select all 5's

---

## Test 4: Multiple Updates Same Day

### Steps:
1. Take the assessment a 3rd time with medium values:
   - Select all "3" values (middle options)
2. Complete it
3. Wait 5 seconds
4. Take the assessment a 4th time with low values:
   - Select all "1" values (lowest options)
5. Complete it

### Expected Results:
- ✅ Each assessment saves/updates successfully
- ✅ NO duplicate errors
- ✅ Dashboard reflects the MOST RECENT assessment each time
- ✅ Risk level changes appropriately (high/severe for all 1's)

---

## Test 5: Mood and Energy Display Accuracy

### Steps:
1. Complete assessment with KNOWN values:
   - Energy Tank: 4/5
   - All other questions: 3/5
2. Go to dashboard/homepage

### Calculate Expected Values:
- **Energy**: energy_tank * 2 = 4 * 2 = **8/10**
- **Raw Score**: 4 + 3 + 3 + 3 + 3 = 16
- **Normalized Score**: ((16 - 5) / 20) * 10 = 5.5/10
- **Mood**: 10 - 5.5 = **4.5/10** (rounds to 4 or 5)

### Expected Results:
- ✅ Energy shows approximately **8/10**
- ✅ Mood shows approximately **4-5/10**
- ✅ Values are NOT 10/10 unless you selected all 5's

---

## Test 6: Data Persistence

### Steps:
1. Complete an assessment
2. Note the mood/energy values
3. Close browser completely
4. Reopen browser and log in
5. Go to dashboard

### Expected Results:
- ✅ Mood and energy values are still displayed
- ✅ Values match what you saw before closing browser
- ✅ Data persists from database, not just localStorage

---

## Test 7: Console Error Check

### Steps:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Complete an assessment

### Expected Results:
- ✅ NO red errors about duplicate keys
- ✅ NO "23505" error codes
- ✅ NO "❌ Save failed" messages
- ✅ Should see green success messages

### Acceptable Console Messages:
```
💾 Saving assessment: 2025-10-09, Score: X/10
✅ Daily Burnout Check: Score X/10, Wellness X%
📊 Supabase response: { savedData: {...}, burnoutError: null }
✅ Assessment saved/updated successfully
```

---

## Test 8: Assessment History/Graph

### Pre-condition:
- Complete assessments on multiple days if possible

### Steps:
1. Check if there's a burnout history graph or chart
2. Look for burnout trends over time

### Expected Results:
- ✅ Most recent assessment is displayed
- ✅ Historical data shows if available
- ✅ Graph updates when new assessment is completed

---

## Test 9: Navigation and Back Button

### Steps:
1. Start an assessment
2. Answer first 2 questions
3. Click "Previous" button
4. Change your answer on question 1
5. Click "Next" to proceed
6. Complete all questions

### Expected Results:
- ✅ Previous button works correctly
- ✅ Changed answers are saved
- ✅ Assessment completes with updated answers
- ✅ Final score reflects the changed answers

---

## Test 10: Assessment Recommendations

### Steps:
1. Complete assessment with LOW scores (all 1's or 2's)
2. Review the recommendations provided

### Expected Results:
- ✅ Recommendations are relevant to low scores
- ✅ Suggestions like "Take a breathing break" or "Try Assignment Reset"
- ✅ Recommendations are specific, not generic

---

## Test 11: Mobile Responsiveness (If Applicable)

### Steps:
1. Open on mobile device or resize browser to mobile width
2. Complete an assessment

### Expected Results:
- ✅ All buttons are clickable
- ✅ Text is readable
- ✅ Assessment completes successfully
- ✅ Results display properly

---

## Test 12: Real-Time Dashboard Update

### Steps:
1. Have dashboard open in one browser tab
2. Complete assessment
3. Click X to close assessment
4. Observe dashboard

### Expected Results:
- ✅ Dashboard updates immediately (or within 1-2 seconds)
- ✅ Mood/Energy values reflect new assessment
- ✅ No page refresh needed

---

## Quick Regression Test (Run After Any Changes)

1. ✅ Top button selectable on first click
2. ✅ Complete fresh assessment - no errors
3. ✅ Update assessment same day - no duplicate error
4. ✅ Dashboard shows correct mood/energy values
5. ✅ No console errors

---

## Known Issues to Watch For

❌ **Fixed Issues** (should NOT appear):
- Top button not clickable
- Duplicate key error (23505)
- Wrong mood/energy display (always 10/10)
- Assessment not saving to database

---

## Bug Reporting Template

If you find an issue, report with:
```
**Test #**: [Test number from above]
**Step**: [Which step failed]
**Expected**: [What should happen]
**Actual**: [What actually happened]
**Console Errors**: [Copy any red errors]
**Screenshot**: [If visual issue]
```

---

## Success Criteria

All tests should pass with:
- ✅ No duplicate key errors
- ✅ All buttons clickable on first try
- ✅ Correct mood/energy calculations
- ✅ Data persists across sessions
- ✅ Multiple updates same day work correctly
- ✅ Dashboard updates in real-time
