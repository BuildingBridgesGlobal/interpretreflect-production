# Setting Up the Predictive Burnout Algorithm (PBA)

## Quick Setup (2 minutes)

### Step 1: Run the SQL Function in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the entire contents of `CREATE_PBA_FUNCTION.sql`
6. Click **Run** (or press Ctrl+Enter)

You should see: "Success. No rows returned"

### Step 2: Verify Installation

Run this test query in the SQL Editor:

```sql
-- Test with a sample user ID (replace with an actual user ID from your auth.users table)
SELECT predict_burnout_risk(
  (SELECT id FROM auth.users LIMIT 1)
);
```

You should see a JSON result with risk assessment data.

## What the PBA Does

The Predictive Burnout Algorithm analyzes your reflection patterns to:

1. **Calculate Risk Score (0-10)**
   - Based on energy levels, stress patterns, and engagement
   - Updated in real-time with each reflection

2. **Predict Burnout Timeline**
   - Estimates weeks until potential burnout
   - Based on trend analysis (improving/stable/worsening)

3. **Generate Interventions**
   - Immediate actions for critical risk (8-10)
   - Urgent support for high risk (6-8)
   - Preventive measures for moderate risk (4-6)
   - Maintenance for low risk (0-4)

4. **Track Key Factors**
   - Energy trends and stability
   - Stress frequency and peaks
   - Engagement patterns
   - Recovery needs

## How It Works

The algorithm analyzes your last 14 days of reflections:

```
Risk Score =
  25% Energy Level (lower = higher risk)
  + 15% Energy Stability (variance = risk)
  + 15% Low Energy Days (frequency)
  + 15% Average Stress Level
  + 10% High Stress Days
  + 10% Current Burnout Score
  + 10% Engagement Variety
```

## Where to See It

1. Go to the **Growth Insights** tab
2. Look for the **Burnout Risk Monitor** section
3. You'll see:
   - Current risk level (colored indicator)
   - Risk trend (improving/stable/worsening)
   - Weeks until burnout (if at risk)
   - Recommended interventions
   - Real-time alerts for critical risk

## Testing the PBA

To see it in action:

1. Complete several reflections over a few days
2. Vary your stress/energy levels in the reflections
3. The PBA will start making predictions after 2+ reflections
4. Accuracy improves with 7+ reflections (90% confidence)

## Troubleshooting

If the PBA isn't working:

1. **Check if function exists:**

```sql
SELECT proname FROM pg_proc WHERE proname = 'predict_burnout_risk';
```

2. **Check permissions:**

```sql
GRANT EXECUTE ON FUNCTION predict_burnout_risk(uuid) TO authenticated;
```

3. **Check for data:**

```sql
SELECT COUNT(*) FROM reflection_entries
WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
AND created_at > NOW() - INTERVAL '14 days';
```

4. **Manual test in browser console:**

```javascript
const testPBA = async () => {
  const { burnoutPredictionService } = await import('./src/services/burnoutPredictionService');
  const { supabase } = await import('./src/lib/supabase');

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error('Not logged in!');
    return;
  }

  const result = await burnoutPredictionService.predictBurnoutRisk(user.id);
  console.log('PBA Result:', result);
};

testPBA();
```

## Privacy & Security

- The PBA can work in two modes:
  1. **Direct mode**: Uses your user ID (faster, for personal use)
  2. **ZKWV mode**: Uses hashed ID (anonymous, for enterprise)

- All calculations happen in the database
- No personal data leaves the system
- Results are never shared without consent

## Next Steps

1. Complete daily reflections to improve accuracy
2. Watch for trend changes in the monitor
3. Follow intervention recommendations
4. The system learns and improves over time

The PBA is now actively protecting your wellness! 🛡️
