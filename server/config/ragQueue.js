import { Queue } from "bullmq";
import IORedis from "ioredis";

export const redisConnection = new IORedis(
  process.env.REDIS_URL,
  {
    maxRetriesPerRequest: null,
  }
);

export const ragQueue = new Queue("rag-processing", {
  connection: redisConnection,
});