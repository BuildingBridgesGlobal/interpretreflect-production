/**
 * Mobile optimization utilities for better touch interactions and responsive design
 */

export const MOBILE_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export const TOUCH_TARGET_SIZES = {
  minimum: 44, // Apple's recommended minimum touch target
  comfortable: 48, // Google's recommended comfortable touch target
  large: 56, // For important actions
} as const;

/**
 * Check if device is mobile based on screen width
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINTS.md;
};

/**
 * Check if device supports touch
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get optimal touch target size based on device
 */
export const getTouchTargetSize = (importance: 'minimum' | 'comfortable' | 'large' = 'comfortable'): number => {
  return TOUCH_TARGET_SIZES[importance];
};

/**
 * Mobile-optimized input styles
 */
export const getMobileInputStyles = () => ({
  fontSize: isMobileDevice() ? '16px' : '14px', // Prevents zoom on iOS
  minHeight: `${getTouchTargetSize('comfortable')}px`,
  padding: isMobileDevice() ? '12px 16px' : '8px 12px',
  borderRadius: '8px',
  border: '1px solid #E5E5E5',
  backgroundColor: '#FFFFFF',
  transition: 'border-color 0.2s ease',
  touchAction: 'manipulation',
  WebkitAppearance: 'none', // Remove iOS styling
  MozAppearance: 'none',
});

/**
 * Mobile-optimized button styles
 */
export const getMobileButtonStyles = (size: 'small' | 'medium' | 'large' = 'medium') => {
  const sizes = {
    small: { minHeight: '36px', padding: '8px 16px', fontSize: '14px' },
    medium: { minHeight: '44px', padding: '12px 20px', fontSize: '16px' },
    large: { minHeight: '56px', padding: '16px 24px', fontSize: '18px' },
  };

  return {
    ...sizes[size],
    borderRadius: '8px',
    fontWeight: '500',
    touchAction: 'manipulation',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    WebkitTapHighlightColor: 'transparent',
  };
};

/**
 * Mobile-optimized modal styles
 */
export const getMobileModalStyles = () => ({
  maxWidth: isMobileDevice() ? '95vw' : '600px',
  maxHeight: isMobileDevice() ? '90vh' : '80vh',
  margin: isMobileDevice() ? '5vh auto' : '10vh auto',
  borderRadius: isMobileDevice() ? '16px' : '12px',
  overflow: 'hidden',
});

/**
 * Mobile-optimized form container styles
 */
export const getMobileFormStyles = () => ({
  padding: isMobileDevice() ? '16px' : '24px',
  gap: isMobileDevice() ? '16px' : '20px',
});

/**
 * Prevent zoom on input focus (iOS Safari)
 */
export const preventZoomOnFocus = (element: HTMLElement): void => {
  if (!isMobileDevice()) return;
  
  element.addEventListener('focus', () => {
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  });

  element.addEventListener('blur', () => {
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover');
    }
  });
};

/**
 * Add mobile-specific CSS classes
 */
export const addMobileStyles = (): void => {
  if (typeof document === 'undefined') return;

  const styleId = 'mobile-optimization-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* Mobile-optimized scrollbars */
    .mobile-scroll {
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .mobile-scroll::-webkit-scrollbar {
      display: none;
    }

    /* Mobile touch targets */
    .mobile-touch-target {
      min-height: 44px;
      min-width: 44px;
      touch-action: manipulation;
    }

    /* Mobile input optimization */
    .mobile-input {
      font-size: 16px !important;
      min-height: 44px;
      padding: 12px 16px;
      border-radius: 8px;
      -webkit-appearance: none;
      -moz-appearance: none;
    }

    /* Mobile button optimization */
    .mobile-button {
      min-height: 44px;
      padding: 12px 20px;
      font-size: 16px;
      border-radius: 8px;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }

    /* Mobile modal optimization */
    @media (max-width: 768px) {
      .mobile-modal {
        max-width: 95vw !important;
        max-height: 90vh !important;
        margin: 5vh auto !important;
        border-radius: 16px !important;
      }
      
      .mobile-modal-content {
        padding: 16px !important;
        max-height: calc(90vh - 32px) !important;
        overflow-y: auto !important;
      }
    }

    /* Mobile navigation optimization */
    @media (max-width: 640px) {
      .mobile-nav-tabs {
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .mobile-nav-tabs::-webkit-scrollbar {
        display: none;
      }
      
      .mobile-nav-tab {
        min-width: 44px;
        min-height: 44px;
        white-space: nowrap;
        touch-action: manipulation;
      }
    }

    /* Mobile textarea optimization */
    .mobile-textarea {
      font-size: 16px !important;
      min-height: 44px;
      padding: 12px 16px;
      border-radius: 8px;
      resize: vertical;
      -webkit-appearance: none;
    }

    /* Mobile form spacing */
    @media (max-width: 768px) {
      .mobile-form {
        gap: 16px !important;
      }
      
      .mobile-form-field {
        margin-bottom: 16px !important;
      }
    }
  `;

  document.head.appendChild(style);
};

/**
 * Initialize mobile optimizations
 */
export const initializeMobileOptimizations = (): void => {
  addMobileStyles();
  
  // Add mobile class to body for CSS targeting
  if (typeof document !== 'undefined' && isMobileDevice()) {
    document.body.classList.add('mobile-device');
  }
  
  // Add touch class if device supports touch
  if (typeof document !== 'undefined' && isTouchDevice()) {
    document.body.classList.add('touch-device');
  }
};

export default {
  isMobileDevice,
  isTouchDevice,
  getTouchTargetSize,
  getMobileInputStyles,
  getMobileButtonStyles,
  getMobileModalStyles,
  getMobileFormStyles,
  preventZoomOnFocus,
  addMobileStyles,
  initializeMobileOptimizations,
};
