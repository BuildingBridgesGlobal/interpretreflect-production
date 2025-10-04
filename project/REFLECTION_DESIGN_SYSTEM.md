# Unified Reflection Design System

## 🎨 Overview

All reflection components now follow a unified design system with consistent theming, accessibility features, and user experience patterns. The system uses a linear (one-question-at-a-time) format with review/edit capabilities for advanced users.

## 🎯 Key Components Implemented

### 1. Design System (`/src/styles/reflectionTheme.ts`)

Central theme configuration providing:

- **Color Palette**: Soothing backgrounds (#f5f7fb, #e8f5e9) with vibrant accents
- **Typography Scale**: Consistent font sizes and weights
- **Spacing System**: Standardized margins and padding
- **Component Styles**: Pre-defined styles for buttons, inputs, cards
- **Accessibility Constants**: Focus rings, touch targets, high contrast support

### 2. ReflectionBase Component (`/src/components/shared/ReflectionBase.tsx`)

Shared foundation for all reflection tools:

- **Linear Navigation**: One question per screen with smooth transitions
- **Review Mode**: Non-linear review/edit at completion
- **Progress Tracking**: Visual progress bar and category indicators
- **Auto-save**: Periodic saving to Supabase
- **Keyboard Navigation**: Ctrl/Cmd + Arrow keys for navigation
- **Accessibility**: WCAG AAA compliant with full keyboard and screen reader support

### 3. Updated Components

#### Pre-Assignment Prep V2 (`/pre-assignment-v2`)

- Role-Space awareness questions
- Neuroscience-based mental readiness
- Ethics and reflective practice
- 15 questions across 5 categories

#### Post-Assignment Debrief V2 (`/post-assignment-v2`)

- Comparative analysis with pre-assignment
- Emotional and physical processing
- Growth identification
- Recovery planning

## 🎨 Color Scheme

### Primary Accents

- **Teal** (#1de9b6): Primary actions, progress, success
- **Yellow** (#ffd600): Attention, warnings, ethics
- **Deep Purple** (#4527a0): Focus states, mental readiness

### Backgrounds

- **Light Blue-Gray** (#f5f7fb): Primary background
- **Light Green** (#e8f5e9): Secondary background
- **Light Yellow** (#fef9e7): Tertiary background
- **Light Purple** (#f3e5f5): Quaternary background
- **Light Rose** (#fce4ec): Quinary background

## ♿ Accessibility Features

### Keyboard Navigation

- **Tab Order**: Logical flow through all interactive elements
- **Arrow Keys**: Navigate between questions (with Ctrl/Cmd)
- **Enter**: Submit/proceed (with Ctrl/Cmd)
- **Escape**: Close modals/overlays
- **R**: Enter review mode (with Ctrl/Cmd)

### Visual Accessibility

- **Focus Indicators**: 3px teal outline with 2px offset
- **Touch Targets**: Minimum 44x44px for all interactive elements
- **Color Contrast**: All text meets WCAG AAA standards (7:1+)
- **Non-color Indicators**: Icons and text supplement color coding
- **High Contrast Mode**: Automatic border adjustments

### Screen Reader Support

- **ARIA Labels**: All inputs properly labeled
- **ARIA Live Regions**: Status updates announced
- **Semantic HTML**: Proper heading hierarchy
- **Role Attributes**: Clear component roles

### Motion & Animation

- **Reduced Motion**: Respects `prefers-reduced-motion`
- **Smooth Transitions**: 200-300ms for standard interactions
- **No Auto-play**: User controls all animations

## 📱 Responsive Design

### Breakpoints

- **Mobile**: 320px - 639px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px+

### Mobile Optimizations

- Single column layouts
- Larger touch targets (48px minimum)
- Simplified navigation
- Optimized font sizes

## 🔄 User Flow

### Linear Mode (Default)

1. User answers one question at a time
2. Can navigate back/forward freely
3. Progress auto-saves every 3 questions
4. Validation occurs on navigation
5. Required fields marked with asterisk and text

### Review Mode (Advanced)

1. Available after completing all questions
2. Shows all responses in summary view
3. Click any question to edit
4. Validation errors highlighted
5. Complete button submits all data

## 💾 Data Persistence

### Auto-save Strategy

- Saves every 3 answered questions
- Saves on mode switch (linear ↔ review)
- Saves on completion
- Draft status for incomplete sessions

### Data Structure

```typescript
{
  user_id: string;
  reflection_type: string;
  data: {
    [questionId]: any;
    question_times: Record<string, number>;
    total_duration: number;
  };
  status: 'draft' | 'completed';
  created_at: string;
  updated_at: string;
}
```

## 🚀 Implementation Guide

### Using ReflectionBase

```typescript
import { ReflectionBase } from './shared/ReflectionBase';
import { REFLECTION_THEME } from '../styles/reflectionTheme';

const questions: ReflectionQuestion[] = [
  {
    id: 'q1',
    category: 'Category',
    text: 'Question text',
    type: 'text',
    required: true,
    // ... other options
  }
];

function MyReflection() {
  return (
    <ReflectionBase
      title="My Reflection"
      questions={questions}
      reflectionType="my_reflection"
      customTheme={REFLECTION_THEME}
    />
  );
}
```

### Customizing Theme

```typescript
import { REFLECTION_THEME } from '../styles/reflectionTheme';

const customTheme = {
  ...REFLECTION_THEME,
  colors: {
    ...REFLECTION_THEME.colors,
    accents: {
      ...REFLECTION_THEME.colors.accents,
      teal: '#00bfa5', // Custom teal
    },
  },
};
```

## 📊 Component Status

| Component          | Linear Nav | Review Mode | Auto-save | Accessibility | Status          |
| ------------------ | ---------- | ----------- | --------- | ------------- | --------------- |
| Pre-Assignment V2  | ✅         | ✅          | ✅        | ✅            | Complete        |
| Post-Assignment V2 | ✅         | ✅          | ✅        | ✅            | Complete        |
| Wellness Check-In  | 🔄         | 🔄          | 🔄        | 🔄            | Ready to update |
| Ethics/Compass     | 🔄         | 🔄          | 🔄        | 🔄            | Ready to update |
| Teaming Prep       | 🔄         | 🔄          | 🔄        | 🔄            | Ready to update |
| Teaming Reflection | 🔄         | 🔄          | 🔄        | 🔄            | Ready to update |

## 🔧 Next Steps

To update remaining components:

1. Import `ReflectionBase` and `REFLECTION_THEME`
2. Convert questions to `ReflectionQuestion[]` format
3. Replace component body with `ReflectionBase`
4. Add any custom header/footer components
5. Test accessibility and responsiveness

## 📝 Best Practices

### Question Design

- Keep questions focused and specific
- Use progressive disclosure (dependencies)
- Provide helpful placeholder text
- Include validation for data quality
- Add help text for complex questions

### Category Organization

- Group related questions
- Limit categories to 5-7
- Use clear, descriptive names
- Provide visual differentiation
- Show category progress

### Validation

- Validate on blur for immediate feedback
- Clear errors on user input
- Provide specific error messages
- Allow saving drafts despite errors
- Highlight issues in review mode

## 🎯 Benefits

### For Users

- **Reduced Cognitive Load**: Focus on one question at a time
- **Clear Progress**: Always know how far along they are
- **Flexibility**: Review and edit before submitting
- **Accessibility**: Works for all abilities
- **Mobile-Friendly**: Optimized for any device

### For Developers

- **Consistency**: Single source of truth for design
- **Reusability**: Shared components reduce duplication
- **Maintainability**: Centralized theme updates
- **Type Safety**: TypeScript interfaces throughout
- **Documentation**: Self-documenting component props

## 🏆 Success Metrics

- **Completion Rate**: Track % of started vs. completed
- **Time to Complete**: Monitor average duration
- **Error Rate**: Track validation failures
- **Accessibility Score**: Regular audit compliance
- **User Satisfaction**: Feedback on experience

This unified design system ensures all reflection tools provide a consistent, accessible, and delightful user experience while maintaining the flexibility needed for different assessment types.
