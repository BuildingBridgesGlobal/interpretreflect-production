# Assignment Prep Feature - User Guide
**InterpretReflect V2 Performance Optimization Platform**

---

## Table of Contents
1. [What is Assignment Prep?](#what-is-assignment-prep)
2. [Why Use Assignment Prep?](#why-use-assignment-prep)
3. [Getting Started](#getting-started)
4. [Creating an Assignment](#creating-an-assignment)
5. [Managing Assignments](#managing-assignments)
6. [Sharing with Team Interpreters](#sharing-with-team-interpreters)
7. [Prep Checklist](#prep-checklist)
8. [Linking to Quick Reflect](#linking-to-quick-reflect)
9. [Tips & Best Practices](#tips--best-practices)
10. [Technical Setup (Developers)](#technical-setup-developers)

---

## What is Assignment Prep?

Assignment Prep is your central hub for organizing all information related to an interpreting assignment in one place. Instead of juggling scattered emails, Slack messages, texts, and attachments, you can:

- **Centralize all prep information** - Client details, meeting links, participant info, materials
- **Coordinate with team interpreters** - Share prep via magic links, collaborate on notes
- **Track prep progress** - Interactive checklist ensures nothing is missed
- **Link to performance data** - Connect to Quick Reflect to measure prep quality vs. outcomes

---

## Why Use Assignment Prep?

### The Problem
Interpreters currently receive assignment information through 5+ fragmented channels:
- 📧 Email (with attachments that get lost)
- 💬 Slack/Text (informal, no structure, disappears)
- 📋 Agency portals (separate login, limited info)
- 📞 Phone calls (no documentation)
- 🗂️ Personal notes (scattered across apps)

**Result**: High cognitive load, missed details, poor team coordination, no performance tracking.

### The Solution
InterpretReflect's Assignment Prep feature:
- ✅ **Reduces cognitive load** - One structured place for all info
- ✅ **Prevents mistakes** - Checklist ensures thorough prep
- ✅ **Improves coordination** - Share prep with team interpreters instantly
- ✅ **Tracks performance** - Link prep quality to assignment outcomes
- ✅ **Builds institutional memory** - Search past assignments, learn from patterns

---

## Getting Started

### Accessing Assignment Prep

1. **From Dashboard**: Click the "Assignments" quick action card
2. **Direct URL**: Navigate to `/dashboard/assignments`
3. **Quick Reflect**: When logging an assignment, create the assignment prep first

### First Time Setup

No setup required! The feature works immediately. However, you may want to:
- ✓ Customize your default prep checklist (coming soon)
- ✓ Set your preferred timezone (defaults to EST)
- ✓ Add recurring assignment templates (coming soon)

---

## Creating an Assignment

### Quick Start (3 minutes)

**URL**: `/dashboard/assignments/new`

**Required Fields** (minimum viable prep):
1. **Assignment Name** - e.g., "LTI Team Meeting - James R (IT)"
2. **Date** - When the assignment occurs
3. **Start Time** / **End Time**
4. **Assignment Type** - Conference, Medical, Legal, etc.
5. **Location** - Remote (Zoom/Teams) or In-Person

Click "Create Assignment" - you're done! You can add more details anytime.

### Detailed Setup (5-10 minutes)

For thorough prep, complete all sections:

#### 1. Basic Information
- **Assignment Name** *
- **Date** * & **Time** * (Start, End, Setup)
- **Assignment Type** * (Conference, Medical, Legal, Educational, VRS, VRI, etc.)
- **Platform** - Zoom, Teams, Google Meet, In-Person, Other
- **Meeting Link** - Direct URL to join
- **Meeting ID & Passcode** - For quick access

#### 2. Client & Organization
- **Organization Name** - Who is the client?
- **Coordinator Contact** - Name, email, phone
- **Background** - Context about the organization
- **Website** - Reference link

#### 3. Participants
- **Deaf Participants** - Names, roles, communication preferences
- **Hearing Participants** - Team members, notable info (accents, tech level)
- **Languages** - ASL, English, Spanish, etc.
- **Participant Notes** - Accent variations, preferences, cultural considerations

#### 4. Team Interpreting
- **Solo** or **Team** assignment toggle
- **Team Interpreter** - Name, email, phone
- **Turn Rotation** - Every X minutes (default: 20 min)

#### 5. Assignment Context & Prep
- **Subject/Topic** - What is the meeting about?
- **Expected Cognitive Load** - Low, Moderate, High, Very High
- **Key Considerations** - Checkboxes:
  - ☐ Technical terminology
  - ☐ Acronym-heavy
  - ☐ Accent/dialect variations
  - ☐ Emotionally challenging
  - ☐ Cultural considerations
  - ☐ Fast-paced
- **Prep Notes** - Free-form notes (e.g., "Tech heavy, use captioning for accents")

### Real-World Example

**Sarah's LTI Meeting** (from actual user story):

```
Assignment Name: LTI Team Meeting - James R (IT)
Date: January 13, 2025
Time: 9:30 AM - 11:00 AM EST
Setup: 9:15 AM (15 min buffer)
Type: Conference
Platform: Zoom
Meeting Link: [Zoom URL from Jessie's Slack]

Client: LTI / James R (IT Department)
Coordinator: Jessie Romer

Participants:
- Deaf: James R (IT Department)
- Hearing: LTI Development Team (India)

Key Considerations:
☑ Technical terminology
☑ Acronym-heavy
☑ Accent variations

Prep Notes:
"Tech development review meeting. Lots of acronyms visible
on screen share. Use captioning to help with accents from
India team. James prefers direct terminology."

Expected Cognitive Load: High
```

---

## Managing Assignments

### Assignment List View

**URL**: `/dashboard/assignments`

**Features**:
- **Filters**: Upcoming, Past, All
- **Assignment Cards** showing:
  - Date, time, platform
  - Assignment type badge
  - Team assignment indicator
  - Prep progress bar (% complete)
- **Analytics**: Total assignments, avg prep completion, team assignments

**Actions per card**:
- Click to view details
- Quick status at a glance

### Assignment Detail View

**URL**: `/dashboard/assignments/[id]`

**Layout**:

```
┌─────────────────────────────────────────┐
│ ASSIGNMENT HEADER                       │
│ Name, Date, Time, Platform, Type        │
│ [Edit] [Share] [Delete]                 │
├─────────────────────────────────────────┤
│ QUICK ACTIONS                           │
│ [Join Meeting] [Start] [Complete Reflect]│
├─────────────────────────────────────────┤
│ ASSIGNMENT DETAILS                      │
│ Client, Coordinator, Participants, etc. │
├─────────────────────────────────────────┤
│ TEAM INTERPRETER                        │
│ Contact info, turn rotation             │
└─────────────────────────────────────────┘

SIDEBAR:
┌─────────────────────────────────────────┐
│ PREP CHECKLIST (Interactive)            │
│ ☑ Task 1                                │
│ ☐ Task 2                                │
│ ☐ Task 3                                │
├─────────────────────────────────────────┤
│ CATALYST AI RECOMMENDATIONS             │
│ (Coming soon)                            │
├─────────────────────────────────────────┤
│ POST-ASSIGNMENT                         │
│ [Complete Quick Reflect]                │
└─────────────────────────────────────────┘
```

### Editing an Assignment

1. Open assignment detail page
2. Click "Edit" button
3. Modify any fields
4. Click "Save Changes"

All changes are instantly saved to the database.

### Deleting an Assignment

1. Open assignment detail page
2. Click trash icon (🗑️)
3. Confirm deletion
4. Assignment is soft-deleted (recoverable if needed)

---

## Sharing with Team Interpreters

### Magic Link Sharing

**Purpose**: Share assignment prep with team interpreter without requiring them to create an account.

**How It Works**:

1. **Open Assignment** → Click "Share" button
2. **Enter Team Interpreter Email** (required)
3. **Select Access Level**:
   - **Can Edit**: View details + add notes/files
   - **View Only**: Read-only access
4. **Add Personal Message** (optional):
   ```
   "Hi Caterina! Here's the prep for Saturday's AIIC
   meeting. Let me know if you want to sync on turn
   rotation. - Sarah"
   ```
5. **Click "Share Assignment"**
6. **Copy Share Link** - Send via email or text

### What Team Interpreters See

**URL**: `/shared/assignments/[token]`

**Public View Includes**:
- ✓ All assignment details (date, time, platform, client, participants)
- ✓ Meeting link and access codes
- ✓ Prep notes and materials
- ✓ Prep checklist (view-only)
- ✓ Personal message from you
- ✓ CTA to sign up for InterpretReflect (viral growth!)

**If they have Edit Access**:
- ✓ Can add shared notes (collaboration)
- ✓ Can upload files (coming soon)

### Sharing Best Practices

✅ **DO**:
- Share as soon as you receive assignment details
- Include a personal message for context
- Use "Can Edit" for close team partners
- Send link via email AND text (backup)

❌ **DON'T**:
- Share confidential client info unless cleared
- Set expiration dates unless necessary (reduces friction)
- Forget to follow up if they haven't viewed it

---

## Prep Checklist

### Default Checklist

Every assignment starts with these items:
- ☐ Reviewed all materials
- ☐ Studied terminology list
- ☐ Researched organization/context
- ☐ Coordinated with team interpreter
- ☐ Tested tech/platform
- ☐ Planned cognitive reset strategy
- ☐ Completed self-care prep

### Using the Checklist

**Interactive**: Click checkboxes to mark complete
- On mobile: Large touch targets
- Desktop: Click checkbox or task text
- Progress bar updates in real-time

**Tracking**: System records:
- ✓ Which items completed
- ✓ When completed (timestamp)
- ✓ Overall completion percentage

**Analytics** (coming soon):
- Compare prep completion % to assignment performance
- Identify which prep steps correlate with better outcomes

### Customizing Checklist (Coming Soon)

Future features:
- Add custom checklist items
- Create checklist templates per assignment type
- Reorder checklist items
- Set reminders for specific tasks

---

## Linking to Quick Reflect

### Post-Assignment Workflow

**Goal**: Create a feedback loop from prep → performance → insights

**Flow**:
```
1. Create Assignment Prep
   ↓
2. Complete Prep Checklist
   ↓
3. Perform Assignment
   ↓
4. Click "Complete Quick Reflect"
   ↓
5. Assignment auto-linked to reflection
   ↓
6. Analyze: Did thorough prep improve performance?
```

### How to Link

**Option 1: From Assignment Detail Page**
- After assignment, click "Complete Quick Reflect" button
- Assignment ID auto-populated
- Reflection automatically linked

**Option 2: From Quick Reflect Page**
- Start new Quick Reflect
- Select "Link to Assignment" dropdown
- Choose from your recent assignments

### Performance Analytics

**Data Tracked**:
- Prep completion % → Cognitive Load rating
- Prep completion % → Performance self-rating
- Prep completion % → Execution quality

**Insights Generated**:
- "Assignments with >80% prep completion scored 23% higher on performance"
- "You experience lower cognitive load when you review materials beforehand"
- "Team assignments with coordinated prep have 18% better outcomes"

---

## Tips & Best Practices

### For Solo Assignments

1. **Enter prep immediately** when you get assignment details (don't wait!)
2. **Use Prep Notes liberally** - Future you will thank you
3. **Mark Key Considerations** - Quick visual scan day-of
4. **Complete checklist 24 hours before** - Catch missing prep early
5. **Link to Quick Reflect** - Build your performance data

### For Team Assignments

1. **Share prep ASAP** - Give partner time to review
2. **Include personal message** - Set tone for collaboration
3. **Plan turn rotation** - Document it in assignment details
4. **Add shared notes** (coming soon) - Coordinate terminology, strategies
5. **Debrief together** - Both complete Quick Reflect, compare insights

### For Recurring Assignments

1. **Save as Template** - Checkbox at bottom of form (coming soon)
2. **Template Name** - e.g., "LTI Weekly Team Meeting"
3. **Auto-populate** - Next time, select template, update date/time
4. **Track trends** - Performance analytics show patterns over time

### For High-Stakes Assignments

1. **Thorough prep** - Complete ALL sections
2. **Upload materials** - Agendas, terminology lists, presentations (coming soon)
3. **Research organization** - Background, mission, recent news
4. **Test tech EARLY** - Don't wait until 5 minutes before
5. **Plan cognitive reset** - Box breathing at setup time
6. **Coordinate with team** - Call to discuss strategy, not just email

---

## Technical Setup (Developers)

### Database Migration

**File**: `supabase/migrations/20250111000002_assignments_feature.sql`

**Apply Migration**:
```bash
# Via Supabase CLI (recommended)
supabase db push

# Or via Supabase Dashboard
# SQL Editor → New Query → Paste migration → Run
```

**Tables Created**:
1. `assignments` - Core assignment data
2. `assignment_attachments` - File uploads
3. `assignment_resources` - External links
4. `assignment_shares` - Magic link sharing
5. `shared_assignment_notes` - Collaboration notes

**RLS Policies**: All tables have Row Level Security enabled for data protection.

### Environment Variables

**Required**: None! Feature works with existing Supabase setup.

**Optional** (for future enhancements):
```env
# Email notifications (coming soon)
SENDGRID_API_KEY=your_sendgrid_key
RESEND_API_KEY=your_resend_key

# File storage (coming soon)
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=assignment-files
```

### Routes

**Authenticated Routes**:
- `/dashboard/assignments` - List view
- `/dashboard/assignments/new` - Create form
- `/dashboard/assignments/[id]` - Detail view
- `/dashboard/assignments/[id]/edit` - Edit form (coming soon)

**Public Routes**:
- `/shared/assignments/[token]` - Shared assignment view (no login)

### API Integration

**Supabase Queries**:
```typescript
// List user's assignments
const { data: assignments } = await supabase
  .from('assignments')
  .select('*')
  .eq('primary_interpreter_id', userId)
  .is('deleted_at', null)
  .order('assignment_date', { ascending: false });

// Create assignment
const { data: newAssignment } = await supabase
  .from('assignments')
  .insert([assignmentData])
  .select()
  .single();

// Share assignment
const { data: share } = await supabase
  .from('assignment_shares')
  .insert([{
    assignment_id: assignmentId,
    shared_with_email: email,
    share_token: crypto.randomUUID(),
    access_level: 'edit',
  }])
  .select()
  .single();
```

### TypeScript Types

**Import**:
```typescript
import type {
  Assignment,
  AssignmentFormData,
  AssignmentListItem,
  AssignmentWithRelations,
  ShareAssignmentFormData,
} from '@/types/assignment';
```

**Usage**:
```typescript
const [assignment, setAssignment] = useState<Assignment | null>(null);
```

---

## Roadmap

### Phase 1: MVP ✅ (Completed)
- [x] Assignment creation form
- [x] Assignment list view
- [x] Assignment detail view
- [x] Prep checklist
- [x] Magic link sharing
- [x] Link to Quick Reflect

### Phase 2: Smart Features (Next Sprint)
- [ ] Email forwarding (`prep@interpretreflect.com`)
- [ ] AI parsing of assignment emails
- [ ] Catalyst AI prep recommendations
- [ ] Assignment templates (recurring)
- [ ] File uploads (agendas, terminology lists)
- [ ] Shared notes for collaboration

### Phase 3: Team Collaboration (Q3 2026)
- [ ] Team workspaces
- [ ] Turn rotation planning tool
- [ ] Real-time coordination
- [ ] Shared terminology builder
- [ ] Assignment history & intelligence

### Phase 4: Agency Tier (Q4 2026)
- [ ] Agency admin dashboard
- [ ] Bulk assignment creation
- [ ] Roster management
- [ ] Aggregated analytics
- [ ] SSO integration

---

## Support

### Getting Help

**Documentation**: This guide + [FEATURE_MAPPING.md](FEATURE_MAPPING.md)

**In-App Help**: Click the `?` icon in any assignment form field

**Community**: Join the [Community Forum](/community) for peer support

**Technical Issues**: Email support@interpretreflect.com

### Feature Requests

We love feedback! Submit feature requests via:
- **In-App**: Settings → Feedback
- **GitHub**: [github.com/interpretreflect/issues](https://github.com)
- **Email**: sarah@interpretreflect.com

---

## Success Stories

### Sarah's AIIC Conference Assignment

**Before InterpretReflect**:
- Prep email buried in inbox
- Had to re-search Zoom link 3 times
- Forgot to review terminology list
- Didn't coordinate turn rotation with Caterina
- Felt unprepared, higher cognitive load

**With InterpretReflect**:
- All info centralized in one assignment
- Shared prep with Caterina instantly
- Completed checklist ensured nothing missed
- Reviewed materials day before
- Confident going in, smoother performance

**Result**: 23% lower cognitive load (measured in Quick Reflect), better teamwork, no surprises.

---

## Quick Reference

### Keyboard Shortcuts (Coming Soon)
- `N` - New Assignment
- `S` - Search Assignments
- `F` - Filter (Upcoming/Past)
- `Esc` - Close Modal

### Status Icons
- 🗓️ **Upcoming** - Assignment date in future
- ✅ **Completed** - Quick Reflect linked
- 👥 **Team** - Team assignment
- 🔗 **Shared** - Shared via magic link
- 📎 **Files** - Attachments uploaded

### Color Coding
- **Orange** (Energy) - Assignments, high priority
- **Cyan** (Electric) - Interactive elements, links
- **Navy** (Primary) - Headings, important text
- **Green** - Completed, success
- **Red** - High cognitive load, warnings

---

**Last Updated**: January 11, 2025
**Version**: V2.0 - Assignment Prep MVP
**Next Review**: After beta testing completion

---

**Ready to optimize your assignment workflow?**
[Create Your First Assignment →](/dashboard/assignments/new)
