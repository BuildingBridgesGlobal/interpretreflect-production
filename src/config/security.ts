// Security Configuration
export const SECURITY_CONFIG = {
  // Session management
  session: {
    timeout: 30 * 60 * 1000, // 30 minutes in milliseconds
    warningTime: 5 * 60 * 1000, // 5 minutes before timeout
    checkInterval: 60 * 1000, // Check every minute
    extendOnActivity: true,
  },
  
  // HTTPS enforcement
  https: {
    enforceHttps: true,
    hstsMaxAge: 31536000, // 1 year in seconds
    hstsIncludeSubdomains: true,
    hstsPreload: true,
  },
  
  // Privacy & consent
  privacy: {
    cookieConsentRequired: true,
    dataRetentionDays: 90,
    anonymizeAfterDays: 365,
    gdprCompliant: true,
    hipaaCompliant: true,
  },
  
  // Audit logging
  audit: {
    logLevel: 'INFO', // DEBUG, INFO, WARN, ERROR
    logSensitiveActions: true,
    retentionDays: 90,
    anonymizeUserData: false,
  },
  
  // Role-based access control
  rbac: {
    roles: {
      admin: {
        name: 'Administrator',
        permissions: ['all'],
        description: 'Full system access',
      },
      user: {
        name: 'User',
        permissions: ['read_own', 'write_own', 'delete_own'],
        description: 'Standard user access',
      },
      guest: {
        name: 'Guest',
        permissions: ['read_public'],
        description: 'Limited public access',
      },
    },
    defaultRole: 'user',
  },
  
  // Security headers
  headers: {
    contentSecurityPolicy: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'", 'https://*.supabase.co', 'https://api.stripe.com'],
      'frame-src': ['https://js.stripe.com', 'https://hooks.stripe.com'],
      'font-src': ["'self'", 'data:'],
    },
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
  },
  
  // Encryption
  encryption: {
    algorithm: 'aes-256-gcm',
    saltRounds: 10,
    keyDerivation: 'pbkdf2',
    iterations: 100000,
  },
};

export const SECURITY_MESSAGES = {
  sessionWarning: 'Your session will expire in 5 minutes due to inactivity. Any unsaved work will be lost.',
  sessionExpired: 'Your session has expired for security reasons. Please log in again.',
  privacyConsent: 'We use encryption and follow HIPAA guidelines to protect your wellness data.',
  securityReminder: 'Remember to log out when using shared devices.',
  dataEncrypted: 'Your data is encrypted at rest and in transit.',
  auditNotice: 'This action has been logged for security purposes.',
};