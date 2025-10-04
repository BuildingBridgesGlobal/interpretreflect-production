# 📊 Predictive Burnout Algorithm - Data Flow Guide

## WHERE YOU INPUT DATA (Data Collection Points)

### 1. **Wellness Check-In** (Main Tab → Wellness Tools)

- **Stress Level**: Slider 1-10
- **Energy Level**: Slider 1-10
- **Overall Well-being**: Rating
- **Location**: Appears as first card in Wellness Tools section
- **Frequency**: Recommended daily

### 2. **Daily Burnout Gauge** (Growth Insights Tab)

- **5 Quick Questions**:
  - Energy Tank (How full is your energy?)
  - Recovery Speed (How quickly do you bounce back?)
  - Emotional Leakage (Are emotions spilling over?)
  - Performance Signal (How's your focus?)
  - Tomorrow Readiness (Ready for tomorrow?)
- **Location**: Growth Insights tab → Daily Burnout section
- **Frequency**: Once per day

### 3. **Session Reflections** (Main Tab → Various Cards)

- **Pre-Assignment Prep**: Before sessions
- **Post-Assignment Debrief**: After sessions
- **Team Reflections**: Team dynamics
- **In-Session Check**: During breaks
- **Each includes**: Stress/Energy metrics

### 4. **Stress Reset Tools** (Stress Reset Tab)

- **Box Breathing**: Records stress before/after
- **Body Check-In**: Tension levels
- **Temperature Shift**: Recovery metrics
- **Professional Boundaries**: Boundary health
- **Each tool tracks**: Usage and effectiveness

---

## WHERE PREDICTIONS APPEAR (Output Locations)

### 1. **Burnout Risk Monitor** (Growth Insights Tab)

📍 **Location**: Growth Insights → Middle section

**What You'll See**:

```
🔴 RISK LEVEL: [Critical/High/Moderate/Low/Minimal]
📈 TREND: [Improving ↗️ / Stable → / Worsening ↘️]
⏰ WEEKS UNTIL BURNOUT: [1-4 weeks or N/A]
🎯 CONFIDENCE: [30%-90% based on data amount]
```

**Visual Indicators**:

- 🔴 Red = Critical (8-10 score)
- 🟠 Orange = High (6-8 score)
- 🟡 Yellow = Moderate (4-6 score)
- 🟢 Green = Low (0-4 score)

### 2. **Intervention Recommendations** (Same Section)

**Displays Based on Risk**:

- **Critical**: "Take immediate break", "Contact supervisor", "Crisis support"
- **High**: "Adjust workload", "Daily stress reduction", "Peer support"
- **Moderate**: "Weekly reflection", "Build resilience", "Monitor patterns"
- **Low**: "Maintain practices", "Continue check-ins"

### 3. **Daily Burnout Trend Chart** (Growth Insights Tab)

📍 **Location**: Below Burnout Risk Monitor

- **Shows**: 30-day burnout trend line
- **Updates**: After each reflection
- **Colors**: Green (good) to Red (concerning)

### 4. **Stress & Energy Over Time** (Growth Insights Tab)

📍 **Location**: Below Daily Burnout Trend

- **Dual Lines**: Energy (green) and Stress (orange)
- **Correlation**: Shows relationship between stress/energy

### 5. **Real-Time Alerts** (Pop-up Notifications)

**When Risk Becomes Critical**:

- ⚠️ Alert appears at top of screen
- Immediate action items provided
- Cannot be dismissed until acknowledged

---

## HOW THE ALGORITHM WORKS

### Data Collection → Analysis → Prediction

```
YOUR INPUT                  ALGORITHM ANALYZES           PREDICTION OUTPUT
-----------                 ------------------           -----------------
Daily Reflections    →      Last 14 days data      →    Risk Score (0-10)
(Stress: 7/10)              Energy patterns              Risk Level
(Energy: 3/10)              Stress frequency             Weeks to burnout
                           Engagement variety            Interventions
                           Trend analysis
```

### The Math Behind It:

```
Risk Score =
  25% × (10 - Energy Level)     [Low energy = higher risk]
+ 15% × Energy Instability      [Fluctuations = higher risk]
+ 15% × Low Energy Days         [Frequency matters]
+ 15% × Average Stress          [Chronic stress impact]
+ 10% × High Stress Days        [Peak stress frequency]
+ 10% × Current Burnout         [Existing burnout level]
+ 10% × Engagement              [Less variety = higher risk]
```

---

## QUICK START GUIDE

### To See PBA in Action:

1. **Complete a Wellness Check-In**
   - Main tab → Wellness Tools → First card
   - Set your stress and energy levels

2. **Do the Daily Burnout Gauge**
   - Growth Insights tab → Daily Burnout section
   - Answer 5 quick questions

3. **View Your Prediction**
   - Stay in Growth Insights tab
   - Look for "Burnout Risk Monitor" section
   - See your risk level and recommendations

4. **Track Over Time**
   - Complete daily for 7 days
   - Watch confidence level increase (50% → 70% → 90%)
   - See trend changes (improving/worsening)

---

## ACCURACY TIMELINE

- **Day 1-2**: Basic prediction (30% confidence)
- **Day 3-4**: Pattern emerging (50% confidence)
- **Day 5-6**: Reliable prediction (70% confidence)
- **Day 7+**: High accuracy (90% confidence)

---

## PRIVACY FEATURES

- ✅ All calculations happen in YOUR database
- ✅ No data shared externally
- ✅ Can work anonymously (ZKWV mode)
- ✅ You control all data
- ✅ HIPAA compliant

---

## TROUBLESHOOTING

**Not seeing predictions?**

1. Complete at least 2 reflections
2. Make sure you're logged in
3. Check Growth Insights tab
4. Run the SQL function in Supabase (see RUN_IN_SUPABASE_SQL.txt)

**Predictions seem off?**

- Need 7+ days of data for accuracy
- Be consistent with daily entries
- Vary your responses (not all 5s)

**Want to test quickly?**

- Complete multiple reflections with different stress/energy levels
- Use past dates if testing
- Algorithm updates immediately
