/**
 * Unified Design System for Reflection Components
 * 
 * Provides consistent theming, colors, and accessibility features
 * across all reflection and assessment components
 * 
 * @module reflectionTheme
 */

import { LucideIcon } from 'lucide-react';

/**
 * Core color palette following accessibility guidelines
 * All colors meet WCAG AAA contrast requirements
 */
export const COLORS = {
  // Soothing background colors - lighter for better contrast
  backgrounds: {
    primary: '#fafbfc',    // Very light blue-gray
    secondary: '#fffef5',  // Soft light yellow (replaced green)
    tertiary: '#fff9e6',   // Warmer light yellow
    quaternary: '#faf5fb', // Very light purple
    quinary: '#fff5f7',    // Very light rose
    selected: '#fff7dc',   // Soft yellow for selected states
  },
  
  // Accent colors with better contrast for white text
  accents: {
    teal: '#00897b',       // Darker teal (WCAG AA with white)
    tealLight: '#1de9b6',  // Original teal for backgrounds
    yellow: '#f9a825',     // Darker yellow (better with dark text)
    yellowDark: '#e65100', // Dark orange for yellow buttons
    purple: '#5e35b1',     // Medium purple (WCAG AA with white)
    purpleLight: '#7e57c2', // Lighter purple option
    green: '#2e7d32',      // Darker green (WCAG AA with white)
    greenLight: '#00c853', // Original green for backgrounds
    blue: '#1565c0',       // Darker blue (WCAG AA with white)
    blueLight: '#2962ff',  // Original blue for backgrounds
    coral: '#d84315',      // Darker coral (WCAG AA with white)
    coralLight: '#ff6e40', // Original coral for backgrounds
  },
  
  // Neutral colors
  neutral: {
    white: '#ffffff',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
    black: '#000000',
  },
  
  // Semantic colors
  semantic: {
    error: '#dc2626',
    errorLight: '#fee2e2',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    success: '#10b981',
    successLight: '#d1fae5',
    info: '#3b82f6',
    infoLight: '#dbeafe',
  }
};

/**
 * Category themes for different reflection types
 */
export interface CategoryTheme {
  id: string;
  label: string;
  icon?: LucideIcon;
  gradient: string;
  background: string;
  borderColor: string;
  textColor: string;
  hoverColor: string;
}

/**
 * Typography scales for consistent text sizing
 */
export const TYPOGRAPHY = {
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  }
};

/**
 * Spacing scale for consistent margins and padding
 */
export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

/**
 * Border radius values for consistent rounding
 */
export const BORDERS = {
  radius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  width: {
    thin: '1px',
    medium: '2px',
    thick: '3px',
    heavy: '4px',
  }
};

/**
 * Shadow values for depth and elevation
 */
export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

/**
 * Animation transitions for smooth interactions
 */
export const TRANSITIONS = {
  fast: 'all 0.15s ease',
  base: 'all 0.2s ease',
  slow: 'all 0.3s ease',
  slower: 'all 0.5s ease',
};

/**
 * Accessibility constants
 */
export const ACCESSIBILITY = {
  minTouchTarget: 44, // Minimum touch target size in pixels
  focusRingWidth: 3,  // Focus ring width in pixels
  focusRingOffset: 2, // Focus ring offset in pixels
  focusRingColor: COLORS.accents.teal,
  highContrastBorder: `${BORDERS.width.medium} solid currentColor`,
};

/**
 * Component-specific styles
 */
export const COMPONENTS = {
  button: {
    primary: {
      background: `linear-gradient(135deg, ${COLORS.accents.teal}, ${COLORS.accents.blue})`,
      color: COLORS.neutral.white,
      hoverBackground: `linear-gradient(135deg, ${COLORS.accents.blue}, ${COLORS.accents.teal})`,
      focusRing: `${ACCESSIBILITY.focusRingWidth}px solid ${COLORS.accents.teal}`,
      padding: `${SPACING.sm} ${SPACING.lg}`,
      borderRadius: BORDERS.radius.lg,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      minHeight: `${ACCESSIBILITY.minTouchTarget}px`,
      transition: TRANSITIONS.base,
    },
    secondary: {
      background: COLORS.neutral.white,
      color: COLORS.neutral.gray700,
      border: `${BORDERS.width.medium} solid ${COLORS.neutral.gray300}`,
      hoverBackground: COLORS.neutral.gray50,
      focusRing: `${ACCESSIBILITY.focusRingWidth}px solid ${COLORS.accents.teal}`,
      padding: `${SPACING.sm} ${SPACING.lg}`,
      borderRadius: BORDERS.radius.lg,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      minHeight: `${ACCESSIBILITY.minTouchTarget}px`,
      transition: TRANSITIONS.base,
    },
    disabled: {
      background: COLORS.neutral.gray200,
      color: COLORS.neutral.gray400,
      cursor: 'not-allowed',
      opacity: 0.6,
    }
  },
  
  input: {
    base: {
      background: COLORS.neutral.white,
      border: `${BORDERS.width.medium} solid ${COLORS.neutral.gray300}`,
      borderRadius: BORDERS.radius.lg,
      padding: `${SPACING.sm} ${SPACING.md}`,
      fontSize: TYPOGRAPHY.fontSize.base,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      minHeight: `${ACCESSIBILITY.minTouchTarget}px`,
      transition: TRANSITIONS.fast,
    },
    focus: {
      borderColor: COLORS.accents.teal,
      boxShadow: `0 0 0 ${ACCESSIBILITY.focusRingOffset}px ${COLORS.accents.teal}20`,
      outline: 'none',
    },
    error: {
      borderColor: COLORS.semantic.error,
      background: COLORS.semantic.errorLight,
    },
    disabled: {
      background: COLORS.neutral.gray100,
      color: COLORS.neutral.gray500,
      cursor: 'not-allowed',
    }
  },
  
  card: {
    base: {
      background: COLORS.neutral.white,
      borderRadius: BORDERS.radius.xl,
      boxShadow: SHADOWS.lg,
      overflow: 'hidden',
    },
    header: {
      padding: SPACING.lg,
      borderBottom: `${BORDERS.width.thin} solid ${COLORS.neutral.gray200}`,
    },
    body: {
      padding: SPACING.lg,
    },
    footer: {
      padding: SPACING.md,
      background: COLORS.neutral.gray50,
      borderTop: `${BORDERS.width.thin} solid ${COLORS.neutral.gray200}`,
    }
  },
  
  progressBar: {
    track: {
      height: '8px',
      background: COLORS.neutral.gray200,
      borderRadius: BORDERS.radius.full,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      background: `linear-gradient(90deg, ${COLORS.accents.teal}, ${COLORS.accents.blue})`,
      borderRadius: BORDERS.radius.full,
      transition: 'width 0.3s ease',
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.neutral.gray600,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    }
  },
  
  alert: {
    info: {
      background: COLORS.semantic.infoLight,
      borderLeft: `${BORDERS.width.heavy} solid ${COLORS.semantic.info}`,
      color: COLORS.neutral.gray800,
      padding: SPACING.md,
      borderRadius: BORDERS.radius.md,
    },
    warning: {
      background: COLORS.semantic.warningLight,
      borderLeft: `${BORDERS.width.heavy} solid ${COLORS.semantic.warning}`,
      color: COLORS.neutral.gray800,
      padding: SPACING.md,
      borderRadius: BORDERS.radius.md,
    },
    error: {
      background: COLORS.semantic.errorLight,
      borderLeft: `${BORDERS.width.heavy} solid ${COLORS.semantic.error}`,
      color: COLORS.neutral.gray800,
      padding: SPACING.md,
      borderRadius: BORDERS.radius.md,
    },
    success: {
      background: COLORS.semantic.successLight,
      borderLeft: `${BORDERS.width.heavy} solid ${COLORS.semantic.success}`,
      color: COLORS.neutral.gray800,
      padding: SPACING.md,
      borderRadius: BORDERS.radius.md,
    }
  }
};

/**
 * Responsive breakpoints
 */
export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/**
 * Z-index scale for layering
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
};

/**
 * Helper function to generate category theme
 */
export function createCategoryTheme(
  id: string,
  label: string,
  primaryColor: string,
  icon?: LucideIcon
): CategoryTheme {
  return {
    id,
    label,
    icon,
    gradient: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
    background: `${primaryColor}10`,
    borderColor: primaryColor,
    textColor: COLORS.neutral.gray800,
    hoverColor: `${primaryColor}20`,
  };
}

/**
 * Pre-defined category themes for reflection components
 */
export const CATEGORY_THEMES = {
  roleSpace: createCategoryTheme('role_space', 'Role-Space', COLORS.accents.teal),
  neuroscience: createCategoryTheme('neuroscience', 'Mental Readiness', COLORS.accents.purple),
  ethics: createCategoryTheme('ethics', 'Ethics & Reflection', COLORS.accents.yellow),
  emotional: createCategoryTheme('emotional', 'Emotional Wellness', COLORS.accents.coral),
  strategic: createCategoryTheme('strategic', 'Strategic Planning', COLORS.accents.green),
  wellness: createCategoryTheme('wellness', 'Wellness Check', COLORS.accents.blue),
};

/**
 * CSS-in-JS helper for focus visible styles
 */
export const focusVisibleStyles = `
  &:focus-visible {
    outline: ${ACCESSIBILITY.focusRingWidth}px solid ${ACCESSIBILITY.focusRingColor};
    outline-offset: ${ACCESSIBILITY.focusRingOffset}px;
  }
`;

/**
 * CSS-in-JS helper for reduced motion
 */
export const reducedMotionStyles = `
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

/**
 * CSS-in-JS helper for high contrast mode
 */
export const highContrastStyles = `
  @media (prefers-contrast: high) {
    * {
      border-color: currentColor !important;
    }
  }
`;

/**
 * Export all theme constants as a single object
 */
export const REFLECTION_THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borders: BORDERS,
  shadows: SHADOWS,
  transitions: TRANSITIONS,
  accessibility: ACCESSIBILITY,
  components: COMPONENTS,
  breakpoints: BREAKPOINTS,
  zIndex: Z_INDEX,
  categoryThemes: CATEGORY_THEMES,
  helpers: {
    focusVisibleStyles,
    reducedMotionStyles,
    highContrastStyles,
  }
};

export default REFLECTION_THEME;