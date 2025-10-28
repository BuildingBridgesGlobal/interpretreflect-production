/**
 * Simple in-memory rate limiter for Edge Functions
 * Prevents spam and DDoS attacks
 */

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (will reset when function cold-starts, which is acceptable)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Check if request should be rate limited
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and retry info
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No entry or expired entry
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
    };
  }

  // Increment count
  entry.count++;

  // Check if over limit
  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

/**
 * Get identifier from request (IP address or user ID)
 */
export function getIdentifier(req: Request, userId?: string): string {
  // Prefer user ID if available
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Create rate limit response headers
 */
export function getRateLimitHeaders(result: { allowed: boolean; remaining: number; resetTime: number }) {
  return {
    'X-RateLimit-Limit': '10',
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  };
}

/**
 * Create 429 Too Many Requests response
 */
export function createRateLimitResponse(resetTime: number, corsHeaders: Record<string, string>) {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      retryAfter
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      }
    }
  );
}
