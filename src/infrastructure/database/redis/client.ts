import Redis from 'ioredis';
import { config } from '../../../config';

let redis: Redis;

export function connectRedis(): Redis {
  if (redis) return redis;

  redis = new Redis(config.redis.url);

  redis.on('connect', () => console.log('Redis connected'));
  redis.on('error', (err) => console.error('Redis error:', err));

  return redis;
}

export function getRedis(): Redis {
  if (!redis) {
    throw new Error('Redis not connected. Call connectRedis() first.');
  }
  return redis;
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    console.log('Redis disconnected');
  }
}
