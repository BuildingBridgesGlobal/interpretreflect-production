# InterpretReflect: Complete Next.js Migration Plan

## Current Status
- ✅ Next.js 16 infrastructure set up
- ✅ Supabase SSR configured
- ✅ AuthContext migrated to Next.js (AuthContext.next.tsx)
- ✅ Login page created
- ⏳ Full migration in progress

## Critical Decision: Migration Strategy

### Option 1: Incremental Migration (RECOMMENDED)
**Timeline:** 2-3 weeks
**Risk:** Low
**Approach:** Keep both Vite and Next.js running, migrate page by page

### Option 2: Big Bang Migration
**Timeline:** 1 week
**Risk:** HIGH
**Approach:** Migrate everything at once

## We Recommend: INCREMENTAL MIGRATION

Here's why and how:

---

## Phase 1: Core Pages (Week 1)

### Day 1-2: Authentication Flow
- [x] Create login page (DONE)
- [ ] Create signup page
- [ ] Create password reset page
- [ ] Test auth flow end-to-end
- [ ] Deploy to preview URL

### Day 3-4: Landing & Marketing
- [x] Homepage (DONE)
- [ ] Pricing page
- [ ] About page
- [ ] Contact page

### Day 5-7: Dashboard Foundation
- [ ] Create `/dashboard` page
- [ ] Migrate `PersonalizedHomepage` component
- [ ] Add CEU progress widget
- [ ] Test navigation

---

## Phase 2: Reflection System (Week 2)

### Critical Components to Migrate:
1. **Core Reflections** (mark as 'use client')
   - BREATHEProtocol
   - PostAssignmentDebrief
   - PreAssignmentPrep
   - WellnessCheckIn
   - BodyAwareness

2. **Specialized Reflections**
   - BIPOCWellnessReflection
   - DeafInterpreterReflection
   - NeurodivergentInterpreterReflection

3. **Framework Reflections**
   - DECIDEFramework
   - RoleSpaceReflection
   - ProfessionalBoundaries

### Migration Pattern:
```tsx
// src/app/reflections/breathe/page.tsx
'use client';

import { BreatheProtocol } from '@/components/BreatheProtocolAccessible';

export default function BreathePage() {
  return <BreatheProtocol />;
}
```

---

## Phase 3: CEU System (Week 3)

### New Features to Build:
1. **Database** (Supabase)
   - CEU programs table
   - CEU enrollments table
   - CEU completions table
   - CEU activity log table

2. **Pages**
   - `/ceu-bundles` - Browse available CEU bundles
   - `/ceu-bundles/[id]` - Individual bundle details
   - `/my-ceus` - User's CEU history and certificates

3. **API Routes**
   - `/api/ceu/enroll` - Enroll in a CEU program
   - `/api/ceu/complete` - Mark CEU program complete
   - `/api/ceu/certificate/[id]` - Generate PDF certificate

4. **Stripe Integration**
   - `/api/stripe/checkout` - Create checkout session for CEU bundle
   - `/api/stripe/webhooks` - Handle payment webhooks
   - `/api/stripe/portal` - Customer portal link

---

## Phase 4: Elya Migration (Week 3-4)

### Migrate from AgenticFlow to Anthropic Claude API

1. **API Route**: `/api/elya/chat`
```typescript
// src/app/api/elya/chat/route.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const { message, userId } = await req.json();

  // Load conversation history from Supabase
  // Include ECCI Model in system prompt
  // Call Claude API
  // Save response to database
  // Return response
}
```

2. **ECCI Integration**
   - Include ECCI frameworks in system prompt
   - Personalize based on user's ECCI assessment
   - Store conversation history in Supabase

3. **Client Component**
   - `/app/elya/page.tsx` - Chat interface
   - Real-time streaming responses
   - Voice input (future)

---

## File Structure After Migration

```
src/
├── app/                           # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   ├── providers.tsx             # Client providers
│   ├── globals.css               # Global styles
│   │
│   ├── (auth)/                   # Auth route group
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── dashboard/
│   │   └── page.tsx             # User dashboard
│   │
│   ├── reflections/              # All reflection protocols
│   │   ├── breathe/page.tsx
│   │   ├── post-assignment/page.tsx
│   │   ├── pre-assignment/page.tsx
│   │   └── [slug]/page.tsx      # Dynamic reflection pages
│   │
│   ├── ceu-bundles/
│   │   ├── page.tsx             # Browse bundles
│   │   └── [id]/page.tsx        # Bundle details
│   │
│   ├── my-ceus/
│   │   └── page.tsx             # User's CEU history
│   │
│   ├── elya/
│   │   └── page.tsx             # Chat with Elya
│   │
│   ├── settings/
│   │   └── page.tsx             # User settings
│   │
│   ├── api/                      # API Routes
│   │   ├── ceu/
│   │   │   ├── enroll/route.ts
│   │   │   ├── complete/route.ts
│   │   │   └── certificate/[id]/route.ts
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts
│   │   │   ├── webhooks/route.ts
│   │   │   └── portal/route.ts
│   │   └── elya/
│   │       └── chat/route.ts
│   │
│   └── (marketing)/             # Marketing pages
│       ├── pricing/page.tsx
│       ├── about/page.tsx
│       └── contact/page.tsx
│
├── components/                   # Existing components (most mark as 'use client')
│   ├── reflections/
│   ├── layout/
│   └── ...
│
├── contexts/
│   ├── AuthContext.tsx          # OLD (Vite)
│   └── AuthContext.next.tsx     # NEW (Next.js)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   └── server.ts            # Server client
│   └── ...
│
└── middleware.ts                # Auth middleware
```

---

## Migration Checklist

### Infrastructure
- [x] Next.js 16 installed
- [x] Supabase SSR configured
- [x] Middleware for auth protection
- [x] Environment variables (NEXT_PUBLIC_*)
- [ ] Remove Vite config once migration complete

### Authentication
- [x] AuthContext migrated
- [x] Login page
- [ ] Signup page
- [ ] Password reset
- [ ] Magic link support

### Core Features
- [ ] Dashboard
- [ ] All reflection components
- [ ] Profile settings
- [ ] Subscription management

### New Features (CEU System)
- [ ] CEU database schema
- [ ] CEU bundles page
- [ ] Stripe checkout for bundles
- [ ] Certificate generation
- [ ] CEU tracking dashboard

### Elya Migration
- [ ] Claude API integration
- [ ] ECCI system prompts
- [ ] Conversation history
- [ ] Voice input (future)

### API Routes
- [ ] Stripe webhooks
- [ ] CEU enrollment/completion
- [ ] Certificate generation
- [ ] Elya chat endpoint

### Deployment
- [ ] Test on Vercel preview
- [ ] Update DNS once stable
- [ ] Monitor errors (Sentry)
- [ ] Update documentation

---

## Testing Strategy

### Before Going Live:
1. **Auth Flow**: Login, signup, logout, password reset
2. **Protected Routes**: Middleware working correctly
3. **Reflections**: All components render and save data
4. **Stripe**: Checkout, webhooks, subscriptions
5. **CEUs**: Enrollment, completion, certificates
6. **Elya**: Chat functionality, history

### Performance Metrics:
- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- No console errors

---

## Rollback Plan

If something goes wrong:
1. Keep Vite version deployed
2. Point domain back to Vite deployment
3. Fix issues in Next.js on preview URL
4. Re-deploy when stable

---

## Next Immediate Actions

**Choose one:**

**Option A:** Continue incremental migration
- I'll create signup page, dashboard, and core reflection pages
- Test thoroughly
- Deploy to Vercel preview
- Gradually shift traffic

**Option B:** Focus on CEU system first
- Build CEU database and API routes
- Create CEU bundles page
- Integrate Stripe checkout
- Deploy CEU features on Next.js
- Keep everything else on Vite

**Option C:** Hybrid approach
- Migrate ONLY the landing page, auth, and dashboard to Next.js
- Keep reflections on Vite for now
- Build CEU system on Next.js
- Gradually migrate reflections over time

---

## Recommendation

I recommend **Option C (Hybrid)**:
1. Next.js handles: Landing, auth, dashboard, CEU system
2. Vite handles: Reflections (for now - they work!)
3. Gradually migrate reflections one by one

This minimizes risk while letting you launch the CEU system on Next.js.

**What do you want to do?**
