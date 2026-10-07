/**
 * In-Memory Sliding Window Rate Limiter
 * Enforces per-user limit (default: 10 analyses per user per hour)
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 10; // 10 analyses per hour

/**
 * Check if the user is within rate limits.
 * Returns { allowed: true } or { allowed: false, retryAfterSeconds: number }
 */
export function checkRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  let record = rateLimitStore.get(userId);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(userId, record);
  }

  // Filter out timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > cutoff);

  if (record.timestamps.length >= MAX_REQUESTS) {
    const oldest = record.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  // Record this request
  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: MAX_REQUESTS - record.timestamps.length,
  };
}
