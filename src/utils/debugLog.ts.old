/**
 * Safe logging utility that only logs in development mode
 * Prevents sensitive information from being exposed in production browser consoles
 */

const isDev = import.meta.env.DEV;

/**
 * Development-only console.log
 * @param args - Arguments to log (only in development)
 */
export const debugLog = (...args: any[]) => {
  if (isDev) {
    console.log('[DEBUG]', ...args);
  }
};

/**
 * Development-only console.error
 * @param args - Arguments to log (only in development)
 */
export const debugError = (...args: any[]) => {
  if (isDev) {
    console.error('[DEBUG ERROR]', ...args);
  }
};

/**
 * Development-only console.warn
 * @param args - Arguments to log (only in development)
 */
export const debugWarn = (...args: any[]) => {
  if (isDev) {
    console.warn('[DEBUG WARN]', ...args);
  }
};

/**
 * Safe way to log errors in both dev and production
 * Sanitizes sensitive information
 */
export const logError = (message: string, error?: any) => {
  if (isDev) {
    console.error('[ERROR]', message, error);
  } else {
    // In production, only log the message without potentially sensitive error details
    console.error('[ERROR]', message);
  }
};
