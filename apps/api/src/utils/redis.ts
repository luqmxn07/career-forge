import { createClient } from "redis";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

const redisClient = createClient({
  url: env.REDIS_URL
});

redisClient.on("error", (err) => {
  logger.error("Redis client connection error:", err);
});

redisClient.connect()
  .then(() => {
    logger.info("Connected to Redis successfully.");
  })
  .catch((error) => {
    logger.error("Failed to connect to Redis:", error);
  });

export { redisClient };
