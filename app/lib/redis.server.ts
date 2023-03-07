import { EventEmitter } from 'node:events';
import Redis from 'ioredis';

import type { Redis as RedisType, RedisOptions } from 'ioredis';

// Using Redis means we'll need a lot more event listeners for BullMQ
// or we will hit the default max limit of 10 listeners. The preferred
// fix for this warning is to increase that default.
EventEmitter.defaultMaxListeners = 64;

let redis: RedisType;

declare global {
  var __redis: RedisType | undefined;
}

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the Redis with every change either.
if (process.env.NODE_ENV === 'production') {
  redis = new Redis(process.env.REDIS_URL || '', redisOptions);
} else {
  if (!global.__redis) {
    global.__redis = new Redis(process.env.REDIS_URL || '', redisOptions);
  }
  redis = global.__redis;
}

export { redis };
