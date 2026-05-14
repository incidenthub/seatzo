import { createClient } from 'redis';
import env from './env.js';

let connectionData;

if (env.redisUrl) {
  try {
    const url = new URL(env.redisUrl);
    connectionData = {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      username: url.username || undefined,
      password: url.password || undefined,
      tls: url.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null,
    };
  } catch (err) {
    console.error('[Redis] Failed to parse REDIS_URL:', err.message);
    connectionData = {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
    };
  }
} else {
  connectionData = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
  };
}

export const redis = createClient({
  url: env.redisUrl,
  socket: {
    maxRetriesPerRequest: null,
  },
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

await redis.connect();

export const queueConnection = { ...connectionData };

console.log('Redis connected');

export default redis;