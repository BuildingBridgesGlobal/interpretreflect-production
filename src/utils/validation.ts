/**
 * Comprehensive input validation utilities
 * Prevents XSS, injection attacks, and validates user input
 */

/**
 * Strong email validation
 * RFC 5322 compliant with additional security checks
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  // Remove whitespace
  const trimmed = email.trim();

  // Length check
  if (trimmed.length === 0) {
    return { valid: false, error: 'Email cannot be empty' };
  }

  if (trimmed.length > 254) {
    return { valid: false, error: 'Email is too long (max 254 characters)' };
  }

  // RFC 5322 compliant regex (simplified but secure)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check for common dangerous patterns
  if (/<script|javascript:|onerror=|onclick=/i.test(trimmed)) {
    return { valid: false, error: 'Email contains invalid characters' };
  }

  // Validate domain has at least one dot
  const [, domain] = trimmed.split('@');
  if (!domain || !domain.includes('.')) {
    return { valid: false, error: 'Invalid email domain' };
  }

  return { valid: true };
}

/**
 * Strong password validation
 * Enforces OWASP recommendations
 */
export function validatePassword(password: string): { valid: boolean; error?: string; strength?: 'weak' | 'medium' | 'strong' } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  // Minimum length (OWASP recommends 8+)
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }

  // Maximum length (prevent DoS)
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long (max 128 characters)' };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character (!@#$%^&*...)' };
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty', 'abc123',
    'password1', 'Password1', 'Password123', '123456789', 'welcome'
  ];

  if (commonPasswords.some(weak => password.toLowerCase().includes(weak))) {
    return { valid: false, error: 'Password is too common. Please choose a stronger password.' };
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'medium';
  if (password.length >= 12 && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    strength = 'strong';
  } else if (password.length < 10) {
    strength = 'weak';
  }

  return { valid: true, strength };
}

/**
 * Sanitize text input (prevent XSS)
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate name field
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Name is too long (max 100 characters)' };
  }

  // Only allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  // Check for XSS patterns
  if (/<script|javascript:|onerror=|onclick=/i.test(trimmed)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Validate URL
 */
export function validateURL(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  try {
    const parsed = new URL(url);

    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }

    // Check for XSS in URL
    if (/javascript:|data:|vbscript:/i.test(url)) {
      return { valid: false, error: 'URL contains invalid protocol' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate and sanitize reflection text
 */
export function validateReflection(text: string): { valid: boolean; error?: string; sanitized?: string } {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Reflection text is required' };
  }

  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Reflection cannot be empty' };
  }

  if (trimmed.length > 10000) {
    return { valid: false, error: 'Reflection is too long (max 10,000 characters)' };
  }

  // Check for script tags and other dangerous HTML
  if (/<script|<iframe|<object|<embed|javascript:|onerror=|onclick=/i.test(trimmed)) {
    return { valid: false, error: 'Reflection contains invalid content' };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Validate numeric input
 */
export function validateNumber(
  value: any,
  options: { min?: number; max?: number; integer?: boolean } = {}
): { valid: boolean; error?: string; value?: number } {
  const num = Number(value);

  if (isNaN(num)) {
    return { valid: false, error: 'Must be a valid number' };
  }

  if (options.integer && !Number.isInteger(num)) {
    return { valid: false, error: 'Must be a whole number' };
  }

  if (options.min !== undefined && num < options.min) {
    return { valid: false, error: `Must be at least ${options.min}` };
  }

  if (options.max !== undefined && num > options.max) {
    return { valid: false, error: `Must be at most ${options.max}` };
  }

  return { valid: true, value: num };
}

/**
 * Rate limit score (1-10)
 */
export function validateBurnoutScore(score: any): { valid: boolean; error?: string; value?: number } {
  return validateNumber(score, { min: 1, max: 10, integer: true });
}
