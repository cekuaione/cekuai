import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type RateLimiter = Ratelimit | null

function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[RateLimit] Redis credentials missing. Rate limiting disabled.')
    }
    return null
  }

  return new Redis({ url, token })
}

function createLimiter(redis: Redis | null, prefix: string, limit: number, interval: `${number} ${'s' | 'm' | 'h'}`): RateLimiter {
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, interval),
    analytics: true,
    prefix,
  })
}

const redis = createRedisClient()

export const apiRateLimiter = createLimiter(redis, '@upstash/ratelimit/api', 10, '1 m')
export const loginRateLimiter = createLimiter(redis, '@upstash/ratelimit/login', 5, '15 m')
export const actionRateLimiter = createLimiter(redis, '@upstash/ratelimit/actions', 10, '1 m')

export async function applyRateLimit(limiter: RateLimiter, identifier: string) {
  if (!limiter) {
    return { success: true }
  }
  return limiter.limit(identifier)
}
