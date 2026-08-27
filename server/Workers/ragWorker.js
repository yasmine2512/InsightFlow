import { Worker } from "bullmq";
import { redisConnection } from "../config/ragQueue.js";
import File from "../Models/File.js";
import { processAIDocument } from "../Services/aiService.js";

const worker = new Worker(
  "rag-processing",

  async (job) => {
    const {
      fileId,
      organizationId,
      filename,
      fileUrl,
    } = job.data;

    await File.findByIdAndUpdate(fileId, {
      ragStatus: "processing",
      ragError: null,
    });

    try {
      const response = await processAIDocument({fileId,organizationId,filename,fileUrl});

      await File.findByIdAndUpdate(fileId, {
        ragStatus: "ready",
        ragError: null,
      });

      return response.data;

    } catch (error) {

      await File.findByIdAndUpdate(fileId, {
        ragStatus: "failed",
        ragError:
          error.response?.data?.detail ||
          error.message,
      });

      throw error;
    }
  },

  {
    connection: redisConnection,
    concurrency: 1,
  }
);

worker.on("failed", (job, error) => {
  console.error(`RAG job ${job?.id} failed:`, error.message);
});