# Assignment Collaboration Hub - Feature Specification

**Status:** Planned for Q3 2026
**Priority:** Phase 2 (Post-V2 Launch)
**Owner:** Product Team
**Last Updated:** January 11, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Strategic Rationale](#strategic-rationale)
3. [User Flow](#user-flow)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Email Templates](#email-templates)
7. [Conversion Funnel](#conversion-funnel)
8. [Technical Implementation Phases](#technical-implementation-phases)
9. [Success Metrics](#success-metrics)

---

## Overview

### The Problem

Team interpreting prep is currently chaotic:
- ❌ Email threads (scattered, hard to track)
- ❌ Google Docs (separate from assignment details)
- ❌ Phone calls (no written record)
- ❌ Text messages (ephemeral)

### The Solution

**Assignment Collaboration Hub:** A shareable, temporary workspace where interpreters teaming on an assignment can collaborate on:
- ✅ Shared vocabulary lists
- ✅ Prep materials & file uploads
- ✅ Notes & context
- ✅ Assignment logistics (Zoom links, schedules, participant info)

**Key Innovation:** **Guest access via magic link** (no signup required for invited collaborators)

### Value Proposition

**For Individual Interpreters:**
- "Stop coordinating via email threads"
- Everything in one place
- Real-time collaboration
- Persistent record for future reference

**For Agencies:**
- See which teams are prepared vs. not
- Reduce assignment failures due to poor prep
- Track team engagement metrics

---

## Strategic Rationale

### Why This Feature Wins

1. **Viral Growth Loop**
   - Sarah invites Caterina (guest, no signup)
   - Caterina sees value ("This is way better than email!")
   - Caterina signs up to create her own hubs
   - **Network effects:** Every team assignment = 1-2 new users

2. **Differentiation**
   - Zero competitors have this
   - Calm/Headspace: No collaboration
   - RID webinars: No daily-use tools
   - **First-mover advantage:** 12-18 month moat

3. **B2B Sellable**
   - Agency dashboard view: See which teams prep well
   - **Measurable ROI:** Prepared teams = fewer assignment failures = client retention
   - Fits "reduce turnover by 20%" value prop

4. **Natural Upsell Path**
   - Guest → Freemium (3 hubs/month) → Premium ($29/mo unlimited) → Agency tier

---

## User Flow

### Example: Sarah & Caterina Preparing for AIIC Conference

#### Step 1: Sarah Receives Email from Cyril (Event Organizer)

**Current pain:** Sarah has to email Caterina separately, set up Google Doc for vocab, schedule prep call, etc.

#### Step 2: Sarah Creates Assignment Hub

Sarah logs into InterpretReflect → Clicks "New Assignment" button

**Form:**
```
CREATE ASSIGNMENT HUB

Assignment Name: AIIC USA Annual Meeting
Date: November 15, 2025
Time: 9:30 AM - 12:30 PM EST
Setting: Conference (AIIC)
Zoom Link: [paste]

Team Interpreters:
+ Add Interpreter (email or search InterpretReflect users)

Caterina Phillips
📧 caterina@example.com
[X] Send invitation

[Create Hub] [Cancel]
```

#### Step 3: Caterina Receives Invitation Email

**Subject:** Sarah Wheeler invited you to collaborate on AIIC USA Annual Meeting

**Email body:** (See [Email Templates](#email-templates) section)

#### Step 4: Caterina Clicks "View Assignment Hub" (Guest Access)

**No signup required.** Magic link takes Caterina to:

```
╔════════════════════════════════════════════════════════╗
║  AIIC USA Annual Meeting - Assignment Hub              ║
║  November 15, 2025 | 9:30 AM - 12:30 PM EST           ║
╚════════════════════════════════════════════════════════╝

Invited by: Sarah Wheeler
Team: Sarah Wheeler, Caterina Phillips

[Tabs across top:]
📋 Overview | 📝 Vocab List | 📎 Materials | 💬 Notes | ✅ Debrief
```

##### Tab 1: Overview

- Assignment details (date, time, Zoom link)
- Contact info (Cyril Flerov)
- Team interpreters list
- Uploaded files
- Quick actions (Add to Calendar, Download All, Copy Zoom Link)

##### Tab 2: Vocab List Builder

- Shared vocabulary terms
- Each term includes:
  - Full form/definition
  - Sign notation
  - Context notes
  - Added by (user)
- Flag terms that need review
- Comment threads on specific terms

**Example vocab entry:**
```
AIIC
├─ Full: Association Internationale des Interprètes de Conférence
├─ Sign: A-I-I-C fingerspelled
├─ Notes: International Association of Conference Interpreters
├─ Added by: Sarah | 2 hours ago
└─ 💬 Comment: "Confirmed with Cyril" - Caterina
```

##### Tab 3: Materials

- File uploads (PDFs, images, etc.)
- Link sharing
- Actions: View, Download, Extract Terms to Vocab List

##### Tab 4: Notes & Context

- Threaded discussions
- Assignment-specific notes
- Team coordination

**Example note:**
```
📝 Note from Sarah (2 hours ago)
Subject: Participant Info - Deaf attendee

From email: "Our deaf participant will be on Zoom and is
very unlikely to speak."

My notes:
- Likely ASL-to-voice only
- Check if participant wants to ask questions via chat vs. signing

💬 Reply from Caterina (1 hour ago):
Good catch. I'll handle ASL-to-voice. Sarah, you take voice-to-ASL?

💬 Reply from Sarah (45 min ago):
Yes! Let's do 20-min rotations?
```

##### Tab 5: Debrief (Post-Assignment)

- Available after assignment date
- Quick Reflect integration
- Team discussion threads
- Save assignment for future reference

#### Step 5: Conversion (Guest → Paid User)

**When Caterina (guest) is actively collaborating:**

**Top banner (subtle):**
```
💡 You're viewing this as a guest. Create your own assignment hubs for free!
[Sign Up - 2 Minutes] [Dismiss]
```

**After she adds 3+ vocab terms:**
```
🎉 You're collaborating like a pro! Want to create your own hubs?
[Create Free Account] [Maybe Later]
```

**When assignment is complete:**
```
✅ Assignment complete! Want to save this workspace and create more?
[Sign Up to Save] [No Thanks]
```

---

## Database Schema

### Tables

#### `assignments`
```sql
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  time_start TIME,
  time_end TIME,
  setting VARCHAR(100), -- conference, medical, legal, etc.
  zoom_link TEXT,
  participant_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `assignment_collaborators`
```sql
CREATE TABLE assignment_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  access_token VARCHAR(255) UNIQUE NOT NULL, -- magic link token
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `vocab_terms`
```sql
CREATE TABLE vocab_terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  term VARCHAR(255) NOT NULL,
  definition TEXT,
  sign_note TEXT,
  context_notes TEXT,
  added_by VARCHAR(255), -- user_id or email
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `vocab_comments`
```sql
CREATE TABLE vocab_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vocab_term_id UUID REFERENCES vocab_terms(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  author VARCHAR(255), -- user_id or email
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `assignment_files`
```sql
CREATE TABLE assignment_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL, -- S3/Cloudflare link
  file_size INTEGER,
  uploaded_by VARCHAR(255), -- user_id or email
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `assignment_notes`
```sql
CREATE TABLE assignment_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  subject VARCHAR(255),
  note_text TEXT NOT NULL,
  author VARCHAR(255), -- user_id or email
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `note_replies`
```sql
CREATE TABLE note_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES assignment_notes(id) ON DELETE CASCADE,
  reply_text TEXT NOT NULL,
  author VARCHAR(255), -- user_id or email
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

### Assignments

#### Create Assignment
```
POST /api/assignments/create

Body:
{
  "name": "AIIC USA Annual Meeting",
  "date": "2025-11-15T09:30:00Z",
  "time_start": "09:30:00",
  "time_end": "12:30:00",
  "setting": "conference",
  "zoom_link": "https://zoom.us/j/123456789",
  "collaborators": ["caterina@example.com"]
}

Response:
{
  "assignment_id": "uuid",
  "magic_links": {
    "caterina@example.com": "https://interpretreflect.com/assignments/uuid?token=xyz"
  }
}
```

#### Get Assignment (Guest Access)
```
GET /api/assignments/:id?token=:access_token

Response:
{
  "assignment": { ... },
  "collaborators": [ ... ],
  "vocab_terms": [ ... ],
  "files": [ ... ],
  "notes": [ ... ]
}
```

#### Invite Collaborator
```
POST /api/assignments/:id/invite

Body:
{
  "email": "newperson@example.com"
}

Response:
{
  "magic_link": "https://interpretreflect.com/assignments/:id?token=xyz"
}
```

### Vocabulary

#### Add Vocab Term
```
POST /api/assignments/:id/vocab/add

Body:
{
  "term": "AIIC",
  "definition": "Association Internationale des Interprètes de Conférence",
  "sign_note": "A-I-I-C fingerspelled",
  "context_notes": "International Association of Conference Interpreters",
  "added_by": "sarah@example.com"
}

Response:
{
  "vocab_id": "uuid"
}
```

#### Get All Vocab Terms
```
GET /api/assignments/:id/vocab

Response:
{
  "vocab_terms": [
    {
      "id": "uuid",
      "term": "AIIC",
      "definition": "...",
      "sign_note": "...",
      "context_notes": "...",
      "added_by": "sarah@example.com",
      "flagged": false,
      "comments": [ ... ],
      "created_at": "2025-01-11T10:00:00Z"
    }
  ]
}
```

#### Add Comment to Vocab Term
```
POST /api/assignments/:id/vocab/:vocab_id/comment

Body:
{
  "comment_text": "Confirmed with Cyril",
  "author": "caterina@example.com"
}

Response:
{
  "comment_id": "uuid"
}
```

### Files

#### Upload File
```
POST /api/assignments/:id/files/upload

Body (multipart/form-data):
{
  "file": [File object],
  "uploaded_by": "sarah@example.com"
}

Response:
{
  "file_id": "uuid",
  "file_url": "https://s3.amazonaws.com/..."
}
```

### Notes

#### Add Note
```
POST /api/assignments/:id/notes/add

Body:
{
  "subject": "Participant Info - Deaf attendee",
  "note_text": "From email: Our deaf participant will be...",
  "author": "sarah@example.com"
}

Response:
{
  "note_id": "uuid"
}
```

#### Add Reply to Note
```
POST /api/assignments/:id/notes/:note_id/reply

Body:
{
  "reply_text": "Good catch. I'll handle ASL-to-voice.",
  "author": "caterina@example.com"
}

Response:
{
  "reply_id": "uuid"
}
```

---

## Email Templates

### Invitation Email

**Subject:** Sarah Wheeler invited you to collaborate on [Assignment Name]

**Body:**
```html
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Hi Caterina,</h2>

  <p>Sarah Wheeler has invited you to collaborate on an upcoming assignment:</p>

  <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0;">📅 <strong>AIIC USA Annual Meeting</strong></p>
    <p style="margin: 5px 0;">🗓️ November 15, 2025, 9:30 AM - 12:30 PM EST</p>
    <p style="margin: 5px 0;">📍 Conference interpreting (Zoom)</p>
  </div>

  <p>Sarah has created a shared workspace where you can:</p>

  <ul>
    <li>✓ Review assignment details & prep materials</li>
    <li>✓ Build shared vocabulary list</li>
    <li>✓ Add notes & context</li>
    <li>✓ Coordinate logistics</li>
  </ul>

  <p style="text-align: center; margin: 30px 0;">
    <a href="https://interpretreflect.com/assignments/{assignment_id}?token={access_token}"
       style="background: #FF6B35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
      View Assignment Hub
    </a>
  </p>

  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">

  <p style="color: #666; font-size: 14px;">
    Not on InterpretReflect yet? This is a free collaboration feature.<br>
    <a href="https://interpretreflect.com">Learn more about InterpretReflect</a>
  </p>
</body>
</html>
```

---

## Conversion Funnel

### Guest → Free User Journey

#### Phase 1: Awareness
- Guest views assignment hub (first touch)
- Sees value: "This is easier than email!"

#### Phase 2: Engagement
- Adds 1-3 vocab terms
- Uploads file or adds note
- **Trigger:** Subtle top banner: "Create your own hubs for free!"

#### Phase 3: Activation
- Guest adds 3+ vocab terms OR collaborates for 10+ minutes
- **Trigger:** Modal: "You're collaborating like a pro! Want to create your own hubs?"
- CTA: "Sign Up - 2 Minutes"

#### Phase 4: Conversion
- Assignment completes
- **Trigger:** "Want to save this workspace and create more?"
- CTA: "Sign Up to Save"

### Conversion Funnel Metrics (Target)

| Stage | Metric | Target |
|-------|--------|--------|
| **Invited guests** | Emails sent | 100% |
| **Hub views** | Click email link | 60% |
| **Engaged guests** | Add vocab/note | 40% |
| **Signups** | Guest → Free user | 30% |
| **Paid conversion** | Free → Premium | 15% |

**Example:**
- 100 invited guests
- 60 view hub (60%)
- 40 engage (40%)
- 12 sign up (30% of engaged guests)
- **12 new users per 100 invitations**

---

## Technical Implementation Phases

### Phase 1: MVP (Month 7-9, Q3 2026)

**Goal:** Basic collaboration without real-time features

**Features:**
- Assignment creation form
- Guest access (magic link authentication)
- Vocab list builder (basic CRUD)
- File uploads (S3 integration)
- Notes/comments (basic threading)
- Email invitations (SendGrid/Postmark)

**Tech Stack:**
- Frontend: React/Next.js
- Backend: Node.js/Express or Next.js API routes
- Database: PostgreSQL (Supabase)
- File Storage: AWS S3 or Cloudflare R2
- Email: SendGrid or Postmark

**Estimated Cost:** $100-150k (3 months, 2 engineers)

---

### Phase 2: Enhanced Collaboration (Month 10-12, Q4 2026)

**Goal:** Real-time features + agency dashboard view

**Features:**
- Real-time collaboration (see who's online)
- WebSockets for live updates
- Calendar integration (add to Google/Outlook)
- Agency dashboard (view all team assignments)
- Vocab list export (flashcards, PDF)

**Tech Stack:**
- WebSockets: Socket.io or Pusher
- Calendar: Google Calendar API, iCal export
- Real-time sync: Redis for state management

**Estimated Cost:** $80-120k (3 months, 2 engineers)

---

### Phase 3: AI & Advanced Features (Month 13-15, 2027)

**Goal:** Reduce manual work with AI + mobile app

**Features:**
- Vocab AI extraction from PDFs (GPT-4 Vision)
- Assignment templates (save frequently used settings)
- Mobile app (iOS/Android) for on-the-go access
- Post-assignment team debrief automation
- VRS/VRI platform integrations

**Tech Stack:**
- AI: OpenAI GPT-4, Claude API
- Mobile: React Native or Flutter
- Integrations: VRS provider APIs (Sorenson, Purple, CSD)

**Estimated Cost:** $150-200k (3 months, 3 engineers)

---

## Success Metrics

### Product Metrics

| Metric | Target (Month 9) | Target (Month 12) | Target (Month 18) |
|--------|------------------|-------------------|-------------------|
| **Hubs created** | 100 | 500 | 2,000 |
| **Invited guests** | 200 | 1,000 | 4,000 |
| **Guest → Signup rate** | 25% | 30% | 35% |
| **Vocab terms added** | 1,000 | 5,000 | 20,000 |
| **Files uploaded** | 300 | 1,500 | 6,000 |

### Business Metrics

| Metric | Target (Month 9) | Target (Month 12) | Target (Month 18) |
|--------|------------------|-------------------|-------------------|
| **New users (from hubs)** | 50 | 300 | 1,400 |
| **Free → Premium conversion** | 10% | 15% | 20% |
| **Agencies using hub dashboard** | 2 | 8 | 20 |

### Engagement Metrics

| Metric | Target |
|--------|--------|
| **Average vocab terms per hub** | 10-15 |
| **Average files uploaded per hub** | 2-3 |
| **Average notes per hub** | 3-5 |
| **Return hub creation rate** | 40%+ (users create 2+ hubs) |

---

## Future Enhancements (Post-2027)

1. **AI-Powered Smart Suggestions**
   - "Based on this assignment type, we recommend adding these vocab terms"
   - Auto-populate common terms from past similar assignments

2. **White-Label for Agencies**
   - Agencies can brand hubs with their logo
   - Custom domain (e.g., `prep.myagency.com`)

3. **Assignment Marketplace**
   - Agencies post assignments → interpreters apply via hub
   - Include prep materials in job posting

4. **Performance Analytics Integration**
   - Link hub prep quality to Quick Reflect data
   - "Teams that prep 10+ vocab terms perform 15% better"

5. **International Expansion**
   - Multi-language support (Spanish, French vocab lists)
   - Global sign language notation standards

---

## Appendix

### Competitive Analysis

**What Competitors DON'T Have:**

| Feature | InterpretReflect | Calm/Headspace | BetterHelp | RID Webinars |
|---------|-----------------|----------------|------------|--------------|
| Team collaboration | ✅ | ❌ | ❌ | ❌ |
| Assignment prep tools | ✅ | ❌ | ❌ | ❌ |
| Guest access (no signup) | ✅ | ❌ | ❌ | ❌ |
| Vocab list builder | ✅ | ❌ | ❌ | ❌ |
| B2B agency dashboard | ✅ | ❌ | ❌ | ❌ |

**First-Mover Advantage:** 12-18 months to build moat before competitors can replicate.

---

## Questions & Decisions

### Open Questions

1. **Data Retention:** How long do we keep assignment hubs after completion?
   - Proposal: 90 days for free users, unlimited for Premium

2. **File Storage Limits:** Max file size per hub?
   - Proposal: 50MB for free users, 500MB for Premium

3. **Collaboration Limits:** Max collaborators per hub?
   - Proposal: 5 for free users, unlimited for Premium

4. **Real-Time vs. Eventual Consistency:** Phase 1 MVP without WebSockets?
   - Decision: Start without real-time, add in Phase 2

### Decisions Made

- **Guest Access:** Magic links (no password required)
- **Email Service:** SendGrid (scalable, reliable)
- **File Storage:** AWS S3 (cost-effective at scale)
- **Database:** PostgreSQL via Supabase (existing infrastructure)

---

## Contact

**Questions about this spec?**
- Product Lead: [Your Name]
- Engineering Lead: [Maddox Wheeler]
- Design Lead: [TBD]

**Last Updated:** January 11, 2025
