# Personalized Homepage Style Guide & Microcopy

## Design Principles

### Visual Hierarchy

1. **Personalized greeting** takes precedence (largest, boldest)
2. **Wellness stats** provide quick context without overwhelming
3. **Primary CTA** (Start New Reflection) is prominent but not dominating
4. **Content sections** use consistent spacing and clear boundaries
5. **Discovery content** is present but secondary

### Color System (Maintaining Existing Palette)

```css
/* Primary Colors - Keep existing */
--sage-primary: #5c7f4f;
--sage-secondary: #8fa881;

/* Text Colors */
--text-primary: #1a1f36; /* Main headings */
--text-secondary: #64748b; /* Subheadings, labels */
--text-tertiary: #94a3b8; /* Meta information */
--text-body: #475569; /* Body text */

/* Background Colors */
--bg-primary: #fafbfc; /* Main background */
--bg-card: #ffffff; /* Card backgrounds */
--border-light: #f1f5f9; /* Subtle borders */

/* Status Colors */
--mood-excellent: #10b981;
--mood-good: #6ee7b7;
--mood-neutral: #fcd34d;
--mood-challenging: #fb923c;
--mood-difficult: #f87171;
```

### Spacing System

```css
/* Consistent spacing scale */
--space-xs: 0.5rem; /* 8px */
--space-sm: 0.75rem; /* 12px */
--space-md: 1rem; /* 16px */
--space-lg: 1.5rem; /* 24px */
--space-xl: 2rem; /* 32px */
--space-2xl: 3rem; /* 48px */
--space-3xl: 4rem; /* 64px */
```

## Microcopy Guidelines

### Greetings (Time-based)

- **Morning (before 12pm):** "Good morning, [Name]"
- **Afternoon (12pm-5pm):** "Good afternoon, [Name]"
- **Evening (after 5pm):** "Good evening, [Name]"

### Wellness Stats Labels

- **Mood:** "Today's Mood" - Scale descriptions: Excellent (5), Good (4), Neutral (3), Challenging (2), Difficult (1)
- **Energy:** "Energy Level" - Scale descriptions: High, Good, Moderate, Low, Depleted
- **Streak:** "Reflection Streak" - Shows consecutive days of journaling
- **Progress:** "Weekly Progress" - Percentage of wellness goals met

### Call-to-Action Text

- **Primary CTA:** "Start New Reflection" - Clear, action-oriented
- **View Actions:** "View" / "Edit" / "Continue" - Simple verbs
- **Navigation:** "View All" / "Learn More" - Encouraging exploration

### Encouragement Tips (Rotating)

1. "Take a moment to check in with your body. Where are you holding tension?"
2. "Remember: You're not responsible for fixing, only for bridging communication."
3. "Try a 4-7-8 breathing exercise before your next challenging assignment."
4. "Your emotional responses are valid. Acknowledge them without judgment."
5. "Celebrate small wins today—every successful interpretation matters."
6. "Hydration affects focus. Have you had enough water today?"
7. "Set one small boundary this week and notice how it feels."
8. "Your wellness practice doesn't need to be perfect, just consistent."

### Recent Reflections

- **Time stamps:** "Just now", "2 hours ago", "Yesterday", "3 days ago"
- **Preview text:** First 100 characters of reflection with ellipsis
- **Mood indicators:** Visual dot with color coding
- **Tags:** Lowercase, single words when possible

### Discover Tools Descriptions

Keep descriptions under 15 words, focusing on the benefit:

- "Create clear professional boundaries tailored to your interpretation settings"
- "Quick techniques to decompress between challenging assignments"
- "Track your wellness patterns and celebrate your progress over time"

## Accessibility Features

### Semantic Structure

```html
<main>
  <header> - Greeting section
  <section aria-labelledby="wellness-heading"> - Stats
  <section aria-labelledby="new-reflection"> - CTA
  <section aria-labelledby="recent-reflections"> - Journals
  <section aria-labelledby="encouragement"> - Tip
  <section aria-labelledby="discover-tools"> - Tools
  <footer> - Links
</main>
```

### Interactive Elements

- All buttons have clear `aria-label` attributes
- Focus indicators visible on all interactive elements
- Keyboard navigation fully supported
- Color is never the only indicator (icons + text)

### Mobile Responsiveness

- Single column layout on mobile
- Touch targets minimum 44x44px
- Text remains readable without zooming
- Sections stack naturally

## Implementation Notes

### State Management

- User name from authentication context
- Reflections from database/API
- Wellness stats calculated from recent entries
- Tips rotate daily or on page load

### Performance

- Lazy load reflection previews
- Cache wellness calculations
- Minimize re-renders with proper React memo usage

### Future Enhancements

- Add subtle animations for stat changes
- Implement real-time reflection syncing
- Add quick mood check-in widget
- Include assignment calendar preview
- Add peer support notifications
