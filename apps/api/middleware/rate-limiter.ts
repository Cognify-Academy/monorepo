import { Elysia } from "elysia";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (request: Request) => string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;

    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  private getKey(request: Request): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request);
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    const cfConnectingIP = request.headers.get("cf-connecting-ip");

    let ip = "unknown";
    if (cfConnectingIP) ip = cfConnectingIP;
    else if (realIP) ip = realIP;
    else if (forwarded) ip = forwarded.split(",")[0].trim();

    return ip;
  }

  check(request: Request): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const key = this.getKey(request);
    const now = Date.now();

    if (this.store[key] && this.store[key].resetTime < now) {
      delete this.store[key];
    }

    if (!this.store[key]) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.config.windowMs,
      };
    }

    const current = this.store[key];

    if (now > current.resetTime) {
      current.count = 0;
      current.resetTime = now + this.config.windowMs;
    }

    if (current.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
      };
    }

    return {
      allowed: true,
      remaining: this.config.maxRequests - current.count - 1,
      resetTime: current.resetTime,
    };
  }

  increment(request: Request) {
    const key = this.getKey(request);
    if (this.store[key]) {
      this.store[key].count++;
    }
  }
}

export const createRateLimiter = (config: RateLimitConfig) => {
  const limiter = new RateLimiter(config);

  return new Elysia({ name: "rate-limiter" }).onRequest(({ request, set }) => {
    const result = limiter.check(request);

    if (!result.allowed) {
      set.status = 429;
      set.headers = {
        "X-RateLimit-Limit": config.maxRequests.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
        "Retry-After": Math.ceil(
          (result.resetTime - Date.now()) / 1000,
        ).toString(),
      };

      throw new Error("Rate limit exceeded");
    }

    limiter.increment(request);

    set.headers = {
      "X-RateLimit-Limit": config.maxRequests.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
    };
  });
};

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  keyGenerator: (request) => {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    return `auth:${ip}:${userAgent}`;
  },
});

export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
});
