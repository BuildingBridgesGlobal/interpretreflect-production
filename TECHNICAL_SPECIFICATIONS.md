# InterpretReflect - Technical Specifications

**Version**: 1.0 Beta
**Last Updated**: October 9, 2025
**Platform**: https://www.interpretreflect.com

---

## 🏗️ System Architecture Overview

InterpretReflect is a modern web application built with a serverless architecture, focusing on wellness tools and reflection practices for interpreters and translators.

### Architecture Pattern
- **Frontend**: Single Page Application (SPA)
- **Backend**: Serverless (Supabase Backend-as-a-Service)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **AI**: Agentic Flow API
- **Email**: Encharge Automation

---

## 💻 Frontend Technical Stack

### Core Technologies
```
- Framework: React 18.x
- Language: TypeScript 5.x
- Build Tool: Vite 5.x
- Routing: React Router v6
- State Management: React Context API + Hooks
- Styling: Tailwind CSS 3.x
- UI Icons: Lucide React
- PWA: Vite PWA Plugin
```

### Key Libraries
```
- @stripe/stripe-js - Payment processing
- @supabase/supabase-js - Backend client
- recharts - Data visualization
- date-fns - Date manipulation
- lucide-react - Icon system
- framer-motion - Animations (optional)
```

### Project Structure
```
src/
├── components/           # React components
│   ├── admin/           # Admin-specific components
│   ├── animations/      # Animation components
│   ├── feedback/        # User feedback components
│   ├── illustrations/   # SVG illustrations
│   ├── layout/          # Layout components
│   └── views/           # View components
├── contexts/            # React Context providers
│   └── AuthContext.tsx  # Authentication state
├── hooks/               # Custom React hooks
│   ├── useSubscription.ts
│   └── useStripePayment.ts
├── lib/                 # External library configurations
│   └── supabase.ts      # Supabase client
├── pages/               # Route pages
├── services/            # Business logic services
│   ├── aiService.ts
│   ├── analyticsService.ts
│   └── emailNotificationService.ts
├── styles/              # Global styles
├── utils/               # Utility functions
├── config/              # Configuration files
└── App.tsx              # Main application component
```

### Build Configuration
```json
{
  "build": {
    "target": "es2015",
    "outDir": "dist",
    "minify": true,
    "sourcemap": false
  }
}
```

### Performance Optimizations
- Code splitting via dynamic imports
- Lazy loading for routes
- Image optimization
- Service Worker for offline capability
- Caching strategies (30s subscription cache)
- Debounced search/filter operations

---

## 🗄️ Backend & Database Architecture

### Platform: Supabase
- **Database**: PostgreSQL 15.x
- **Auth**: Supabase Auth (JWT-based)
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime subscriptions
- **Edge Functions**: Serverless functions (Node.js)

### Database Schema

#### Core Tables

**profiles**
```sql
- id (UUID, FK to auth.users)
- full_name (TEXT)
- email (TEXT)
- pronouns (TEXT)
- credentials (TEXT[])
- profile_photo_url (TEXT)
- preferred_language (TEXT)
- accessibility_settings (JSONB)
- is_admin (BOOLEAN)
- subscription_status (TEXT)
- trial_started_at (TIMESTAMPTZ)
- trial_ends_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

**subscriptions**
```sql
- id (UUID)
- user_id (UUID, FK to profiles)
- stripe_subscription_id (TEXT)
- stripe_customer_id (TEXT)
- status (TEXT) - active, past_due, canceled, trialing
- plan_id (TEXT)
- current_period_start (TIMESTAMPTZ)
- current_period_end (TIMESTAMPTZ)
- cancel_at_period_end (BOOLEAN)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

**burnout_assessments**
```sql
- id (UUID)
- user_id (UUID, FK to profiles)
- assessment_date (DATE) - UNIQUE per user per day
- burnout_score (DECIMAL) - 0-10 scale
- risk_level (TEXT) - low, moderate, high, severe
- energy_tank (INTEGER) - 1-5
- recovery_speed (INTEGER) - 1-5
- emotional_leakage (INTEGER) - 1-5
- performance_signal (INTEGER) - 1-5
- tomorrow_readiness (INTEGER) - 1-5
- symptoms (JSONB)
- recovery_recommendations (TEXT[])
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

CONSTRAINT: uq_ba_user_day UNIQUE (user_id, assessment_date)
```

**reflection_entries**
```sql
- id (UUID)
- user_id (UUID, FK to profiles)
- reflection_id (TEXT)
- entry_kind (TEXT) - burnout_assessment, wellness_checkin, etc.
- data (JSONB) - flexible structure for different reflection types
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

**stress_reset_logs**
```sql
- id (UUID)
- user_id (UUID, FK to profiles)
- tool_type (TEXT)
- duration_minutes (INTEGER)
- stress_level_before (INTEGER) - 1-10
- stress_level_after (INTEGER) - 1-10
- notes (TEXT)
- created_at (TIMESTAMPTZ)
```

**daily_activity**
```sql
- id (UUID)
- user_id (UUID, FK to profiles)
- activity_date (DATE)
- activities_completed (TEXT[])
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

CONSTRAINT: UNIQUE (user_id, activity_date)
```

**email_logs**
```sql
- id (UUID)
- user_id (UUID)
- email_type (TEXT)
- recipient_email (TEXT)
- subject (TEXT)
- status (TEXT) - sent, failed
- sent_at (TIMESTAMPTZ)
- metadata (JSONB)
```

**terms_acceptances**
```sql
- id (UUID)
- user_id (UUID, FK to profiles)
- version (TEXT)
- accepted_at (TIMESTAMPTZ)
- ip_address (TEXT)
```

### Row Level Security (RLS)

All tables have RLS enabled with policies:
```sql
-- Users can only access their own data
POLICY "Users can view own data"
  FOR SELECT USING (auth.uid() = user_id);

POLICY "Users can insert own data"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

POLICY "Users can update own data"
  FOR UPDATE USING (auth.uid() = user_id);

POLICY "Users can delete own data"
  FOR DELETE USING (auth.uid() = user_id);

-- Admin access (where applicable)
POLICY "Admins can view all data"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

### Database Functions

**get_user_streak(user_id UUID)**
- Returns current consecutive day streak
- Checks daily_activity table

**update_updated_at_column()**
- Trigger function for automatic updated_at timestamps

### Indexes
```sql
-- Burnout assessments
CREATE INDEX idx_burnout_user_id ON burnout_assessments(user_id);
CREATE INDEX idx_burnout_date ON burnout_assessments(assessment_date DESC);
CREATE INDEX idx_burnout_user_date ON burnout_assessments(user_id, assessment_date DESC);

-- Reflection entries
CREATE INDEX idx_reflection_user_id ON reflection_entries(user_id);
CREATE INDEX idx_reflection_entry_kind ON reflection_entries(entry_kind);
CREATE INDEX idx_reflection_created_at ON reflection_entries(created_at DESC);

-- Similar indexes on other tables for query optimization
```

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. User signs up/logs in via Supabase Auth
2. JWT token generated and stored in localStorage
3. Token validated on each API request
4. Session expires after 7 days (configurable)

### Authorization Levels
- **Public**: Unauthenticated users (homepage, pricing)
- **User**: Authenticated users (all wellness tools)
- **Admin**: Elevated privileges (view all data, manage users)
- **Subscription-gated**: Premium features require active subscription

### Subscription Check Flow
```typescript
1. Check if user is admin → grant access
2. Check if user has active trial → grant access
3. Check if user has active subscription (status: active/past_due) → grant access
4. Otherwise → show subscription required modal
```

---

## 💳 Payment Integration

### Stripe Configuration
- **Mode**: Test (development) / Live (production)
- **Products**: Monthly subscription ($X/month)
- **Webhooks**: Handle subscription events
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### Payment Flow
1. User clicks "Start Trial" or "Subscribe"
2. Stripe Checkout session created
3. User completes payment on Stripe
4. Redirect to /payment-success
5. Webhook updates subscription status in database
6. User gains access to premium features

---

## 🤖 AI Integration

### Provider: Agentic Flow
- **Agent ID**: Configured via environment variable
- **API Endpoint**: `https://api.agenticflow.ai/v1/agent-threads/`
- **Features**:
  - Contextual wellness coaching
  - Personalized recommendations
  - Reflection analysis
  - Fallback to simulated responses

### AI Service Architecture
```typescript
interface AIService {
  sendMessage(message: string, threadId?: string): Promise<AIResponse>
  createThread(): Promise<string>
  getHistory(threadId: string): Promise<Message[]>
}
```

---

## 📧 Email & Notifications

### Email Provider: Encharge
- **Purpose**: Marketing automation, user lifecycle emails
- **Events Tracked**:
  - User signup
  - Trial started
  - Trial expiring (2 days before)
  - Subscription renewed
  - Payment failed

### Email Types
1. Welcome email
2. Trial expiration reminder
3. Payment confirmation
4. Subscription renewal
5. Password reset

---

## 📊 Data Flow Architecture

### Wellness Assessment Flow
```
User Input → DailyBurnoutGaugeAccessible Component
           ↓
           Save to burnout_assessments table
           ↓
           Save to reflection_entries table
           ↓
           Emit event: 'burnout-assessment-saved'
           ↓
           PersonalizedHomepage listens for event
           ↓
           Re-fetch reflections from database
           ↓
           Calculate mood/energy from latest assessment
           ↓
           Update dashboard display
```

### Mood/Energy Calculation
```typescript
// From burnout assessment
if (type === "burnout_assessment") {
  mood = 10 - total_score  // Invert burnout score
  energy = energy_tank * 2  // Scale from 1-5 to 1-10
}

// From wellness check-in
if (type === "wellness_checkin") {
  mood = 11 - stressLevel  // Invert stress
  energy = energyLevel     // Direct 1-10 scale
}
```

### Streak Calculation
```typescript
1. Get all reflections sorted by date descending
2. Start from today
3. Check if reflection exists for current date
4. If yes: increment streak, move to previous day
5. If no: break loop
6. Return streak count
```

---

## 🔧 Environment Variables

### Required Configuration
```bash
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx  # Server-side only

# AI Provider
VITE_AI_PROVIDER=agenticflow
VITE_AGENTICFLOW_AGENT_ID=xxx

# Email
VITE_ENCHARGE_WRITE_KEY=xxx
VITE_ENCHARGE_API_KEY=xxx
```

---

## 🚀 Deployment

### Platform: Vercel
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment**: Node.js 18.x

### Build Process
```bash
1. npm install
2. npm run build
3. Deploy dist/ folder to CDN
```

### Production URL
- **Primary**: https://www.interpretreflect.com
- **Preview**: Auto-generated for each PR

---

## 📈 Monitoring & Analytics

### Recommended Tools
- **Error Tracking**: Sentry (not yet implemented)
- **Analytics**: Google Analytics / Mixpanel (not yet implemented)
- **Performance**: Vercel Analytics (built-in)
- **Uptime**: Pingdom / UptimeRobot

### Key Metrics to Track
- User sign-ups
- Trial conversions
- Assessment completions
- Tool usage frequency
- Error rates
- Page load times

---

## 🔒 Security Measures

### Implemented
- ✅ HTTPS everywhere
- ✅ JWT authentication
- ✅ Row Level Security (RLS)
- ✅ SQL injection protection (parameterized queries)
- ✅ XSS protection (React escaping)
- ✅ CSRF protection (Supabase built-in)
- ✅ Secure password storage (Supabase Auth)
- ✅ Environment variable encryption

### Data Privacy
- Zero-knowledge wellness verification
- User data encrypted at rest
- Minimal data collection
- GDPR-compliant data deletion
- User consent tracking

---

## 📱 Progressive Web App (PWA)

### Features
- ✅ Offline capability
- ✅ Install prompt
- ✅ Service worker caching
- ✅ App manifest
- ✅ Home screen icon

### Cache Strategy
- Network-first for API calls
- Cache-first for static assets
- Stale-while-revalidate for images

---

## 🧪 Testing Strategy

### Current Testing
- Manual testing (comprehensive test plan executed)
- User acceptance testing (in progress)

### Recommended Additions
- Unit tests (Jest + React Testing Library)
- Integration tests (Playwright)
- E2E tests (Cypress)
- Load testing (k6)
- Security testing (OWASP ZAP)

---

## 📦 Dependencies

### Production Dependencies (Key)
```json
{
  "@stripe/stripe-js": "^4.x",
  "@supabase/supabase-js": "^2.x",
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "tailwindcss": "^3.x",
  "lucide-react": "^0.x",
  "recharts": "^2.x"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.x",
  "vite": "^5.x",
  "@vitejs/plugin-react": "^4.x",
  "autoprefixer": "^10.x",
  "postcss": "^8.x"
}
```

---

## 📞 Support & Maintenance

### Error Handling
- User-friendly error messages
- Console logging for debugging
- Fallback UI for failed components
- Error boundaries (React)

### Data Backup
- Supabase automatic daily backups
- Point-in-time recovery available
- Manual backup option via pg_dump

### Update Strategy
- Rolling updates (zero downtime)
- Feature flags for gradual rollout
- Semantic versioning (v1.0.0-beta)

---

**Document Owner**: Development Team
**Review Cycle**: Monthly
**Next Review**: November 9, 2025
