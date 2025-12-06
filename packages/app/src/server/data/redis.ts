import { REDIS_HOST, REDIS_PORT } from '@/server/common/env';
import { createClient } from 'redis';

export const redis = createClient({
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
});

await redis.connect();
