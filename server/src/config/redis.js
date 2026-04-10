import { createClient } from "redis";
import env from "./env.js";

const redis = createClient({
  url: env.redisUrl
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

await redis.connect();

console.log("Redis connected");

export default redis;