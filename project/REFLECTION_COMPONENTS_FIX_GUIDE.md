# Reflection Components Fix Guide

## What We're Fixing & Why

### THE PROBLEM:

The Supabase JavaScript client is completely broken and hangs on ALL operations:

- `supabase.auth.getSession()` - hangs forever
- `supabase.from('table').insert()` - hangs forever
- Even with `returning: 'minimal'` - still hangs

### THE SOLUTION:

We're bypassing the Supabase JavaScript client and using direct REST API calls instead.
Your data STILL saves to Supabase, we're just using HTTP fetch() instead of their broken client.

---

## EXACT CHANGES FOR EACH COMPONENT

### Step 1: Update Imports

**REMOVE these imports:**

```javascript
import { directInsertReflection } from '../services/directSupabaseApi';
import { supabase } from '../lib/supabase';
```

**ADD these imports:**

```javascript
import { useAuth } from '../contexts/AuthContext';
import { reflectionService } from '../services/reflectionService';
```

### Step 2: Add useAuth Hook

At the TOP of your component function (right after the component declaration):

**ADD this line:**

```javascript
const PostAssignmentDebrief: React.FC<Props> = ({ onComplete, onClose }) => {
  const { user } = useAuth();  // <-- ADD THIS LINE
  // ... rest of your existing state hooks
```

### Step 3: Update Save Function

Find the function that saves the reflection (usually called `handleSubmit`, `handleSave`, `completeDebrief`, etc.)

**REPLACE this pattern:**

```javascript
// OLD WAY - Getting user from localStorage
const user = JSON.parse(localStorage.getItem('session') || '{}').user;
const accessToken = JSON.parse(localStorage.getItem('session') || '{}').access_token;

if (user?.id) {
  const reflectionData = {
    user_id: user.id,
    entry_kind: 'component_name_here',
    data: results,
    reflection_id: crypto.randomUUID(),
  };

  const { data, error } = await directInsertReflection(reflectionData, accessToken);
  // OR
  const { data, error } = await supabase.from('reflection_entries').insert(reflectionData);
}
```

**WITH this pattern:**

```javascript
// NEW WAY - Using reflectionService
if (user?.id) {
  console.log('ComponentName - Saving with reflectionService');

  const result = await reflectionService.saveReflection(
    user.id,
    'component_name_here', // <-- Use the correct entry_kind for this component
    dataToSave // <-- Your form data object
  );

  if (!result.success) {
    console.error('ComponentName - Error saving:', result.error);
  } else {
    console.log('ComponentName - Saved successfully');
  }
} else {
  console.error('ComponentName - No user found');
}
```

---

## COMPONENTS STATUS

### ✅ COMPLETED (2/12):

1. **PreAssignmentPrepV6** - entry_kind: 'pre_assignment_prep' ✅
2. **PostAssignmentDebrief** - entry_kind: 'post_assignment_debrief' ✅

### 🔄 TO BE UPDATED (10/12):

3. **WellnessCheckInAccessible** - entry_kind: 'wellness_checkin'
4. **CulturalConsiderationsReflection** - entry_kind: 'cultural_considerations'
5. **TeamingReflection** - entry_kind: 'teaming_reflection'
6. **PeerReflection** - entry_kind: 'peer_reflection'
7. **SelfCareAssessment** - entry_kind: 'self_care_assessment'
8. **VicariousTraumaReflection** - entry_kind: 'vicarious_trauma'
9. **EthicalDilemmaReflection** - entry_kind: 'ethical_dilemma'
10. **BoundariesReflection** - entry_kind: 'boundaries_reflection'
11. **InterpretationQualityReflection** - entry_kind: 'interpretation_quality'
12. **ProfessionalDevelopmentReflection** - entry_kind: 'professional_development'

---

## HOW THE FIX WORKS

### reflectionService.saveReflection() does:

1. Takes user_id, entry_kind, and data
2. Uses direct fetch() to POST to Supabase REST API
3. Gets auth token from localStorage (bypasses broken client)
4. Returns { success: true } or { success: false, error: "message" }
5. Runs wellness metrics in background (non-blocking)

### Why This Works:

- **Direct REST API** - Uses standard fetch(), not broken Supabase client
- **No hanging** - fetch() doesn't have the hanging bug
- **Same database** - Still saves to your Supabase database
- **Auth works** - Still uses your Supabase auth tokens

---

## TROUBLESHOOTING

### If save hangs:

1. Check browser console for "Saving with reflectionService" message
2. Look for timeout errors
3. Verify user is logged in (check user?.id)

### If data doesn't show in Recent Reflections:

1. Refresh the page
2. Check browser console for getUserReflections errors
3. Verify entry_kind matches what homepage expects

### If delete doesn't work:

1. Check if reflection has valid ID
2. Verify auth token is available
3. Check console for delete API errors

---

## TO CONTINUE WHERE YOU LEFT OFF:

Current Status: 2 of 12 components updated
Next Component: WellnessCheckInAccessible (or pick any from the list)

Just follow the 3 steps above for each remaining component!

---

## IMPORTANT NOTES:

- Each component uses a DIFFERENT entry_kind (see list above)
- Some components might have different variable names for form data
- Always test save + view in Recent Reflections + delete
- The Supabase client will remain broken until they fix it or you recreate the client
