# Assignment Prep Feature Specification
**Feature**: Pre-Assignment Preparation & Team Coordination
**Priority**: HIGH - Build immediately after Cognitive Reset completion
**User Story**: "As an interpreter, I need to organize scattered prep information in one place and coordinate with team interpreters so I can reduce cognitive load and perform at my best"

---

## Business Context

### Problem Statement
Interpreters receive assignment prep through 5+ fragmented channels:
- Slack messages (informal, unstructured)
- Email (attachments get lost, threads buried)
- Text messages (no search, disappears)
- Agency portals (separate login, limited info)
- Phone calls (no documentation)

**Impact**: High cognitive load, missed details, poor coordination, no performance tracking

### Real-World Examples

**Example 1: LTI Meeting (via Slack)**
```
"tmr at 9:30 EST, James R in IT, LTI team in India,
tech development review, tech heavy lots of acronyms,
screen share, captioning helpful for accents"
```

**Example 2: AIIC Annual Meeting (via Email)**
```
- 3-hour conference interpreting assignment
- Multiple attachments (agenda, terminology list, presentations)
- Team interpreter coordination needed
- Zoom link + credentials
- Client background info
- Coordinator contact: Cyril (650-619-7625)
```

### Strategic Value

1. **Daily Workflow Integration** - Makes InterpretReflect essential, not optional
2. **Performance Data Loop** - Track correlation between prep quality and assignment outcomes
3. **Team Collaboration** - Natural viral growth through magic link sharing
4. **Differentiation** - Not wellness journaling, this is workflow tooling
5. **Foundation for Agency Tier** - Architecture supports future B2B expansion

---

## Phase 1: Individual Assignment Prep (Build Now)

### Core Features

#### 1. Assignment Creation Form

**URL**: `/dashboard/assignments/new`

**Form Fields**:

```typescript
interface Assignment {
  // Basic Details
  id: string;
  user_id: string;
  assignment_name: string;
  assignment_date: Date;
  start_time: string;
  end_time: string;
  setup_time?: string; // e.g., "9:15 AM" (auto-calculate 15-min buffer)
  duration_minutes: number; // auto-calculated from start/end

  // Platform & Location
  platform: 'in-person' | 'zoom' | 'teams' | 'vrs' | 'vri' | 'other';
  location_details?: string;
  meeting_link?: string;
  meeting_id?: string;
  meeting_passcode?: string;

  // Assignment Type
  assignment_type: 'medical' | 'legal' | 'conference' | 'educational' |
                   'vrs' | 'vri' | 'business' | 'religious' | 'other';
  setting_details?: string;

  // Client/Organization
  organization_name?: string;
  organization_background?: string; // or link to website
  coordinator_name?: string;
  coordinator_email?: string;
  coordinator_phone?: string;

  // Participants
  deaf_participants: string; // "James R (IT Department)" or "1 participant, unlikely to speak"
  hearing_participants: string; // "LTI team in India" or "AIIC members"
  languages: string; // "ASL/English"
  participant_notes?: string; // accents, preferences, roles

  // Team Interpreters
  team_interpreter_email?: string;
  team_interpreter_name?: string;
  team_interpreter_phone?: string;
  shared_with_emails: string[]; // for magic link tracking

  // Materials & Resources
  attachments: {
    id: string;
    filename: string;
    file_url: string;
    file_type: string;
    uploaded_at: Date;
  }[];
  resource_links: {
    title: string;
    url: string;
  }[];

  // Cognitive Prep Checklist
  prep_checklist: {
    reviewed_materials: boolean;
    studied_terminology: boolean;
    researched_organization: boolean;
    coordinated_with_team: boolean;
    tested_tech_setup: boolean;
    self_care_plan: boolean;
  };

  // Notes & Context
  prep_notes?: string; // free-form prep thoughts
  cognitive_load_factors?: string; // "tech heavy, lots of acronyms"
  support_strategies?: string; // "use captioning for accents"

  // Performance Tracking
  quick_reflect_id?: string; // linked post-assignment reflection
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';

  // Metadata
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}
```

#### 2. Assignment List View

**URL**: `/dashboard/assignments`

**Features**:
- Upcoming assignments (sorted by date)
- Past assignments (with linked Quick Reflect)
- Filter by type, status
- Search by client, participant
- Calendar view (future enhancement)

**List Item Shows**:
- Assignment name
- Date/time
- Platform badge
- Team interpreter indicator (if shared)
- Status badge
- Quick actions: View, Edit, Share, Complete

#### 3. Assignment Detail View

**URL**: `/dashboard/assignments/[id]`

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ AIIC USA Annual Meeting                         │
│ Nov 15, 2025 • 9:30 AM - 12:30 PM EST          │
│ [Zoom] [Conference] [Team Interpreting]         │
└─────────────────────────────────────────────────┘

┌─ Meeting Details ────────────────────────────────┐
│ Platform: Zoom                                   │
│ Link: [Join Zoom Meeting]                        │
│ Meeting ID: 836 5906 8000                        │
│ Passcode: 123977                                 │
│ Setup: 9:15 AM (15-min buffer)                   │
└──────────────────────────────────────────────────┘

┌─ Client & Coordinator ───────────────────────────┐
│ Organization: AIIC USA                           │
│ Background: International Association of         │
│   Conference Interpreters - US Chapter           │
│   🔗 aiic.org/about-us                           │
│                                                  │
│ Coordinator: Cyril Flerov                        │
│ 📧 cyril@mailfence.com                           │
│ 📞 650-619-7625                                  │
└──────────────────────────────────────────────────┘

┌─ Participants ───────────────────────────────────┐
│ Deaf: 1 participant, unlikely to speak           │
│ Hearing: AIIC members, conference interpreters   │
│ Languages: ASL/English                           │
└──────────────────────────────────────────────────┘

┌─ Team Interpreter ───────────────────────────────┐
│ Caterina Phillips                                │
│ 📧 caterina@example.com                          │
│ 📞 919-451-3499                                  │
│ Credentials: NIC                                 │
│ [Share Prep] [Message]                           │
└──────────────────────────────────────────────────┘

┌─ Materials & Resources ──────────────────────────┐
│ 📎 Tentative Agenda.pdf                          │
│ 📎 Terminology_Abbreviations.pdf                 │
│ 📎 Presentations.zip                             │
│ 🔗 AIIC Background Info                          │
└──────────────────────────────────────────────────┘

┌─ Cognitive Prep Checklist ───────────────────────┐
│ ✅ Reviewed agenda                               │
│ ✅ Studied terminology list                      │
│ ✅ Researched organization                       │
│ ✅ Coordinated with team interpreter             │
│ ☐ Tested Zoom/tech setup                        │
│ ☐ Self-care plan (pre/post)                     │
└──────────────────────────────────────────────────┘

┌─ Prep Notes ─────────────────────────────────────┐
│ Conference interpreting context - professional   │
│ association. Annual meeting format, likely       │
│ formal. Presentations may be technical           │
│ (interpreting theory/practice).                  │
│                                                  │
│ Coordinate turn-taking with Caterina.            │
│ Use terminology list as reference during         │
│ assignment.                                      │
└──────────────────────────────────────────────────┘

┌─ Catalyst AI Recommendations ────────────────────┐
│ Sarah, this is a professional conference with:   │
│ • Formal register (high cognitive load)          │
│ • Specialized terminology (interpreting field)   │
│ • 3-hour duration (plan rest breaks)             │
│ • Team interpreting (coordinate turns)           │
│                                                  │
│ Your past data shows:                            │
│ • Conference settings = 15% higher cognitive load│
│ • Team interpreting improves sustained focus 22% │
│ • You perform best with 15-min prep buffer ✓     │
│                                                  │
│ Recommended strategy:                            │
│ 1. Review AIIC background (credibility)          │
│ 2. Sync with Caterina on turn rotation (20-min) │
│ 3. Box breathing at 9:20 AM                      │
│ 4. Plan mini-reset at 11:00 AM (halfway point)  │
└──────────────────────────────────────────────────┘

[Complete Assignment] [Edit] [Share with Team]
```

#### 4. Team Interpreter Sharing (Magic Link)

**Flow**:
1. Sarah clicks "Share with Team Interpreter"
2. Modal appears:
   ```
   Share Assignment Prep

   Team Interpreter Email:
   [caterina@example.com]

   Access Level:
   ○ View Only (can see prep, cannot edit)
   ● Edit Access (can add notes, upload files)

   Personal Message (optional):
   "Hey Caterina! Here's the prep for our AIIC
    assignment on Nov 15. Let me know if you want
    to add anything!"

   [Cancel] [Share Prep]
   ```

3. Caterina receives email:
   ```
   Subject: Sarah shared "AIIC USA Annual Meeting" prep with you

   Hi Caterina,

   Sarah Wheeler shared assignment prep with you for:
   AIIC USA Annual Meeting
   November 15, 2025 • 9:30 AM - 12:30 PM EST

   Sarah's message:
   "Hey Caterina! Here's the prep for our AIIC assignment
    on Nov 15. Let me know if you want to add anything!"

   [View Assignment Prep]

   ---
   Want to track your own assignments and performance?
   Sign up for InterpretReflect - the performance
   optimization platform for interpreters.
   [Start Free Trial]
   ```

4. Caterina clicks link → Lands on assignment page (no login required)
5. If she has edit access, she can add notes, upload files
6. Bottom of page shows: "This prep shared by Sarah Wheeler via InterpretReflect. [Learn More]"

**Magic Link Security**:
- Secure token (UUID)
- Optional expiration (e.g., 7 days after assignment)
- Revocable (Sarah can unshare)
- Tracked (Sarah sees "Viewed by Caterina on Nov 10")

#### 5. Link to Quick Reflect

**Post-Assignment Flow**:
1. Assignment date passes
2. Dashboard shows: "Complete reflection for AIIC USA Annual Meeting"
3. Click → Quick Reflect form pre-populated with:
   - Assignment name
   - Assignment date
   - Assignment type
   - Duration
4. Sarah completes reflection
5. Assignment status → "Completed"
6. Quick Reflect linked to assignment

**Performance Analytics**:
- Compare prep quality to performance outcomes
- Track: assignments with thorough prep vs. rushed prep
- Insight: "Assignments where you reviewed materials scored 23% higher on Execution Quality"

---

## Phase 2: Smart Integration (Next Sprint)

### Features

#### 1. Email Forwarding
- **Email**: `prep@interpretreflect.com`
- **Flow**: Forward Cyril's email → AI parses → Creates draft assignment
- **AI Extraction**:
  - Date/time from "Nov 15, 2025 09:30 AM Eastern"
  - Platform from "Zoom meeting"
  - Participant from "deaf participant will be on Zoom"
  - Attachments auto-uploaded
  - Coordinator contact extracted

#### 2. Assignment Templates
- Save recurring assignments (e.g., "LTI Team Meeting - Weekly")
- Auto-populate common fields
- Track performance trends for specific assignment types
- Insight: "Your LTI meetings average 7.2 cognitive load - here's how to reduce it"

#### 3. Catalyst AI Brief
- Auto-generated prep summary
- Based on assignment type + historical performance data
- Personalized recommendations
- Pre-assignment confidence builder

---

## Phase 3: Team Collaboration Hub (Q3 2026)

### Features

#### 1. Team Workspaces
- Shared assignment calendar
- Turn rotation planning
- Real-time assignment handoff notes
- Shared terminology builder

#### 2. Assignment History & Intelligence
- Track all assignments with same client/team
- Build institutional knowledge
- Identify patterns (cognitive load spikes, successful strategies)
- Export assignment history (for taxes, reporting)

#### 3. Viral Growth Mechanics
- Non-member team interpreters can access prep via magic link
- See value, convert to paid users
- Network effects: Team interpreter brings their team partners

---

## Phase 4: Agency Tier (Q4 2026)

**Build ONLY when you have**:
- 50+ active individual users
- Multiple agencies requesting features
- Case studies showing ROI

### Features
- Agency admin dashboard
- Bulk assignment creation
- Roster management
- Aggregated performance analytics
- SSO integration

**Pricing Model**:
- Free: 3 assignments/month
- Pro ($29/mo): Unlimited assignments + AI recommendations
- Team ($49/mo): Collaborative features + shared analytics
- Agency ($299/mo): 10 interpreters + admin dashboard

---

## Database Schema

```sql
-- Assignments Table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id), -- nullable, for future agency tier

  -- Basic Details
  assignment_name TEXT NOT NULL,
  assignment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  setup_time TIME,
  duration_minutes INTEGER,

  -- Platform & Location
  platform TEXT, -- 'in-person', 'zoom', 'teams', 'vrs', 'vri', 'other'
  location_details TEXT,
  meeting_link TEXT,
  meeting_id TEXT,
  meeting_passcode TEXT,

  -- Assignment Type
  assignment_type TEXT, -- 'medical', 'legal', 'conference', etc.
  setting_details TEXT,

  -- Client/Organization
  organization_name TEXT,
  organization_background TEXT,
  coordinator_name TEXT,
  coordinator_email TEXT,
  coordinator_phone TEXT,

  -- Participants
  deaf_participants TEXT,
  hearing_participants TEXT,
  languages TEXT,
  participant_notes TEXT,

  -- Team Interpreters
  team_interpreter_email TEXT,
  team_interpreter_name TEXT,
  team_interpreter_phone TEXT,
  shared_with_emails TEXT[], -- array of emails for magic link tracking

  -- Cognitive Prep
  prep_checklist JSONB, -- {reviewed_materials: true, studied_terminology: false, ...}
  prep_notes TEXT,
  cognitive_load_factors TEXT,
  support_strategies TEXT,

  -- Performance Tracking
  quick_reflect_id UUID REFERENCES quick_reflect_entries(id),
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'in-progress', 'completed', 'cancelled'

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  CONSTRAINT valid_status CHECK (status IN ('upcoming', 'in-progress', 'completed', 'cancelled'))
);

-- Assignment Attachments
CREATE TABLE assignment_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL, -- Supabase Storage URL
  file_type TEXT, -- 'pdf', 'doc', 'image', etc.
  file_size INTEGER, -- bytes
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignment Resource Links
CREATE TABLE assignment_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignment Shares (Magic Links)
CREATE TABLE assignment_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  shared_by UUID REFERENCES auth.users(id),
  access_level TEXT DEFAULT 'view', -- 'view' or 'edit'
  share_token UUID DEFAULT uuid_generate_v4(), -- for magic link
  personal_message TEXT,

  -- Tracking
  viewed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,

  -- Expiration
  expires_at TIMESTAMPTZ, -- optional expiration
  revoked_at TIMESTAMPTZ, -- if Sarah unshares

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_access_level CHECK (access_level IN ('view', 'edit'))
);

-- Organizations (for future agency tier)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT, -- 'agency', 'client', 'educational_program'
  tier TEXT DEFAULT 'individual', -- 'individual', 'team', 'agency', 'enterprise'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_assignments_user_date ON assignments(user_id, assignment_date DESC);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignment_shares_token ON assignment_shares(share_token);
CREATE INDEX idx_assignment_shares_email ON assignment_shares(shared_with_email);

-- Row Level Security
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own assignments"
  ON assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assignments"
  ON assignments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assignments"
  ON assignments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assignments"
  ON assignments FOR DELETE
  USING (auth.uid() = user_id);

-- Magic link access (public read via token)
CREATE POLICY "Anyone with share token can view assignment"
  ON assignments FOR SELECT
  USING (
    id IN (
      SELECT assignment_id FROM assignment_shares
      WHERE revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );
```

---

## UI/UX Design Principles

### Performance-Focused Language
- ❌ "How are you feeling about this assignment?"
- ✅ "Cognitive load factors for this assignment"

- ❌ "Wellness check before assignment"
- ✅ "Pre-assignment readiness assessment"

### Professional Aesthetic
- Clean, data-focused design
- Brand colors: Navy primary, Orange energy, Cyan electric
- Typography: Inter (headings), IBM Plex Sans (body), JetBrains Mono (data)
- Tight spacing, sharp corners (performance platform feel)

### Mobile-Responsive
- Interpreters often check prep on phone
- Simplified mobile view with essential info
- Quick access to meeting link, coordinator contact
- Offline access (future enhancement)

---

## Success Metrics

### Usage Metrics
- Assignments created per user per month
- % of assignments with Quick Reflect completed
- Magic link shares per assignment
- Magic link conversion rate (shared → signup)

### Performance Metrics
- Correlation: Prep quality score vs. Quick Reflect ratings
- Time to create assignment (should be < 5 min)
- User satisfaction with assignment prep feature

### Business Metrics
- Feature adoption rate (% of users creating assignments)
- Retention impact (users with assignments vs. without)
- Viral growth via magic links

---

## Implementation Priority

### Week 1: Core MVP
- [ ] Assignment creation form
- [ ] Assignment list view
- [ ] Assignment detail view
- [ ] Basic attachment upload
- [ ] Link to Quick Reflect

### Week 2: Team Sharing
- [ ] Magic link generation
- [ ] Share modal UI
- [ ] Email notifications
- [ ] Public assignment view (token-based)
- [ ] Access tracking

### Week 3: Intelligence
- [ ] Catalyst AI recommendations
- [ ] Prep checklist functionality
- [ ] Assignment templates (recurring)
- [ ] Performance correlation analytics

### Week 4: Polish
- [ ] Mobile responsive design
- [ ] Search and filters
- [ ] Calendar view (optional)
- [ ] Email forwarding (if time permits)

---

## Testing Plan

### Real-World Validation
1. **Sarah's LTI Assignment** (Jan 13, 9:30 AM)
   - Enter assignment details
   - Test prep workflow
   - Complete Quick Reflect post-assignment
   - Measure: Did it reduce cognitive load?

2. **Sarah's AIIC Assignment** (Nov 15, 9:30 AM)
   - Enter with full details (attachments, team interpreter)
   - Share prep with Caterina via magic link
   - Get Caterina's feedback on shared experience
   - Track: Did she sign up after seeing shared prep?

3. **Beta User Testing** (5-10 interpreters)
   - Each enters 3 upcoming assignments
   - Each shares 1 assignment with team interpreter
   - Each completes Quick Reflect after assignments
   - Gather feedback: What's missing? What's confusing?

### Success Criteria
- ✅ Assignment creation < 5 minutes
- ✅ 80% of shared links are viewed
- ✅ 20% of magic link recipients sign up
- ✅ Users report lower cognitive load with prep vs. without

---

## Open Questions

1. **File Storage**: Supabase Storage or external (S3, Cloudinary)?
2. **Email Forwarding**: Build now or Phase 2?
3. **Calendar Integration**: Google Calendar sync? (Future enhancement)
4. **Reminders**: Email/SMS reminder 1 day before assignment?
5. **Recurring Assignments**: How to handle weekly LTI meetings?

---

**Next Steps**:
1. Review spec with Sarah
2. Finalize UI mockups
3. Database migration
4. Build assignment creation form
5. Test with real assignments (LTI Jan 13, AIIC Nov 15)

---

**Document Version**: 1.0
**Last Updated**: November 11, 2025
**Status**: Ready for Implementation
