// Suppress specific errors from browser extensions that we can't control
// This runs as early as possible to catch extension initialization errors

(() => {
  if (typeof window === 'undefined') return;

  // Store original error handler
  const originalError = window.onerror;
  const originalUnhandledRejection = window.onunhandledrejection;

  // List of error patterns from known browser extensions and expected auth states
  const EXTENSION_ERROR_PATTERNS = [
    /mce-autosize-textarea.*already been defined/i,
    /custom element.*already defined/i,
    /webcomponents-ce\.js/i,
    /overlay_bundle\.js/i,
    /grammarly/i,
    /lastpass/i,
    /1password/i,
    /AuthSessionMissingError/i,  // Expected when no user is logged in
    /Auth session missing/i,      // Expected when no user is logged in
  ];

  // Override global error handler
  window.onerror = function(message, source, lineno, colno, error) {
    const messageStr = String(message);
    const sourceStr = String(source || '');
    
    // Check if this is an extension error we want to suppress
    const isExtensionError = EXTENSION_ERROR_PATTERNS.some(pattern => 
      pattern.test(messageStr) || pattern.test(sourceStr)
    );

    if (isExtensionError) {
      console.debug('Suppressed browser extension error:', messageStr);
      return true; // Prevent default error handling
    }

    // Call original handler for other errors
    if (originalError) {
      return originalError.call(window, message, source, lineno, colno, error);
    }
    return false;
  };

  // Also handle unhandled promise rejections
  window.onunhandledrejection = function(event) {
    const reason = event.reason;
    const reasonStr = String(reason?.message || reason || '');
    
    // Check if this is an extension error
    const isExtensionError = EXTENSION_ERROR_PATTERNS.some(pattern => 
      pattern.test(reasonStr)
    );

    if (isExtensionError) {
      console.debug('Suppressed browser extension promise rejection:', reasonStr);
      event.preventDefault();
      return true;
    }

    // Call original handler for other rejections
    if (originalUnhandledRejection) {
      return originalUnhandledRejection.call(window, event);
    }
    return false;
  };

  // Also intercept console.error for extension errors
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const errorStr = args.map(arg => String(arg)).join(' ');
    
    // Check if this is an extension error
    const isExtensionError = EXTENSION_ERROR_PATTERNS.some(pattern => 
      pattern.test(errorStr)
    );

    if (isExtensionError) {
      console.debug('Suppressed browser extension console error:', errorStr);
      return;
    }

    // Call original console.error for other errors
    originalConsoleError.apply(console, args);
  };
})();

export {}; // Make this a module