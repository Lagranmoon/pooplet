import { RateLimiterMemory } from 'rate-limiter-flexible';

const isDevelopment = process.env.NODE_ENV === 'development';
const enableRateLimit = !isDevelopment || process.env.ENABLE_RATE_LIMITING === 'true';

const defaultLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
  blockDuration: 60,
});

const strictLimiter = new RateLimiterMemory({
  points: 5,
  duration: 300,
  blockDuration: 300,
});

export const rateLimiter = {
  async check(ip: string, max: number = 10, duration: number = 60): Promise<boolean> {
    if (!enableRateLimit) {
      return true;
    }

    try {
      await defaultLimiter.consume(ip, 1);
      return true;
    } catch (rejRes) {
      return false;
    }
  },

  async checkStrict(ip: string): Promise<boolean> {
    if (!enableRateLimit) {
      return true;
    }

    try {
      await strictLimiter.consume(ip, 1);
      return true;
    } catch (rejRes) {
      return false;
    }
  },

  async consume(ip: string, points: number = 1): Promise<{ msBeforeNext: number }> {
    if (!enableRateLimit) {
      return { msBeforeNext: 0 };
    }

    try {
      await defaultLimiter.consume(ip, points);
      return { msBeforeNext: 0 };
    } catch (rejRes) {
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      throw new Error(`请求过于频繁，请稍后再试 (${secs}秒)`);
    }
  },

  async consumeStrict(ip: string, points: number = 1): Promise<{ msBeforeNext: number }> {
    if (!enableRateLimit) {
      return { msBeforeNext: 0 };
    }

    try {
      await strictLimiter.consume(ip, points);
      return { msBeforeNext: 0 };
    } catch (rejRes) {
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      throw new Error(`请求过于频繁，请稍后再试 (${secs}秒)`);
    }
  }
};

export const getClientIP = (headers: Headers): string => {
  const forwarded = headers.get('x-forwarded-for');
  const realIP = headers.get('x-real-ip');
  const cfConnectingIP = headers.get('cf-connecting-ip');
  
  return cfConnectingIP || realIP || forwarded?.split(',')[0]?.trim() || 'unknown';
};