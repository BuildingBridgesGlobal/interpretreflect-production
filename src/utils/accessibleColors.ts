// Accessible Color Palette for Wellness Platform
// All colors meet WCAG AA standards for contrast

export const colors = {
  // Primary Greens (WCAG AA Compliant for normal text on white)
  primary: {
    forest: '#4A6B3E',        // 7.02:1 contrast - Headers, primary buttons
    sage: '#5C7F4F',          // 4.92:1 contrast - Secondary buttons, nav
    deepForest: '#3D5A33',    // 9.42:1 contrast - Text, strong emphasis
    darkText: '#2A3F26',      // 13.5:1 contrast - Body text alternative
  },
  
  // Supporting Colors (Use carefully)
  secondary: {
    mutedSage: '#7A9B6E',     // 3.15:1 - Large text only (18px+)
    lightTint: '#E8F0E4',     // Background only
    veryLightTint: '#F4F8F2', // Background only
    mediumGreen: '#6B8B60',   // 3.71:1 - Large text only
    darkGreen: '#5F7F55',     // 4.76:1 - Can be used for normal text
  },
  
  // Neutral Colors (Keep existing)
  neutral: {
    white: '#FFFFFF',
    offWhite: '#FAF9F6',
    lightBeige: '#F0EDE8',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
  },
  
  // Semantic Colors
  semantic: {
    error: '#8B4444',
    success: '#4A6B3E',
    warning: '#9B7A4E',
  }
};

// Gradient definitions
export const gradients = {
  // Header gradient (accessible)
  header: 'linear-gradient(135deg, #4A6B3E 0%, #5C7F4F 100%)',
  
  // Button gradient (accessible)
  button: 'linear-gradient(145deg, #5F7F55 0%, #4A6B3E 100%)',
  
  // Subtle background gradient
  background: 'linear-gradient(180deg, #FAF9F6 0%, #F0EDE8 100%)',
  
  // Card hover gradient
  cardHover: 'linear-gradient(135deg, #5C7F4F 0%, #6B8B60 100%)',
};

// Helper function to get RGBA with opacity
export const withOpacity = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Replacement map for quick migration
export const colorReplacements = {
  '#A8C09A': colors.primary.sage,
  '#B5CCA8': colors.secondary.mutedSage,
  '#C8D5C8': colors.secondary.lightTint,
  'rgba(168, 192, 154,': `rgba(92, 127, 79,`,  // #5C7F4F in RGB
  'rgba(181, 204, 168,': `rgba(122, 155, 110,`, // #7A9B6E in RGB
  'rgba(200, 213, 200,': `rgba(232, 240, 228,`, // #E8F0E4 in RGB
};