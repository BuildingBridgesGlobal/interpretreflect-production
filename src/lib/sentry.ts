import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for error tracking and performance monitoring
 * Only initializes in production environment with valid DSN
 */
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE;

  // Only initialize if DSN is provided
  if (!dsn) {
    console.log("Sentry DSN not configured - error tracking disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment,

    // Performance Monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring sample rate
    // 1.0 = 100% of transactions, 0.1 = 10%
    tracesSampleRate: environment === "production" ? 0.1 : 1.0,

    // Session Replay sample rate
    // For production: 10% of sessions, 100% of error sessions
    replaysSessionSampleRate: environment === "production" ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    // Send user feedback on errors
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (environment === "development" && !import.meta.env.VITE_SENTRY_DEBUG) {
        return null;
      }

      // Filter out certain errors (optional)
      const error = hint.originalException;

      // Ignore network errors that are expected
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message);
        if (
          message.includes('Failed to fetch') ||
          message.includes('NetworkError') ||
          message.includes('Load failed')
        ) {
          // Still log them, but with lower priority
          event.level = 'warning';
        }
      }

      return event;
    },

    // Set context for all events
    initialScope: (scope) => {
      scope.setTag("application", "interpretreflect");
      return scope;
    },
  });

  console.log(`Sentry initialized in ${environment} mode`);
};

/**
 * Set user context for Sentry (call after user logs in)
 */
export const setSentryUser = (user: { id: string; email?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
  });
};

/**
 * Clear user context (call on logout)
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

/**
 * Manually capture an error
 */
export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, { extra: context });
};

/**
 * Manually capture a message
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = "info") => {
  Sentry.captureMessage(message, level);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    data,
    level: "info",
  });
};
