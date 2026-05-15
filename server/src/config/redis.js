import { createClient } from "redis";
import env from "./env.js";

const redis = createClient({
  url: env.redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 20) return new Error('Max reconnection attempts reached');
      return Math.min(retries * 100, 3000);
    }
  },
  commandsQueueMaxLength: 1024,
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

await redis.connect();

console.log("Redis connected");

export default redis;