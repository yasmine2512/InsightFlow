import { Worker } from "bullmq";
import axios from "axios";
import { redisConnection } from "../config/ragQueue.js";
import File from "../Models/File.js";

const worker = new Worker(
  "rag-processing",

  async (job) => {
    const {
      fileId,
      organizationId,
      filename,
      fileUrl,
    } = job.data;

    console.log(`Processing RAG file: ${filename}`);

    await File.findByIdAndUpdate(fileId, {
      ragStatus: "processing",
      ragError: null,
    });

    try {
      const response = await axios.post(
        `${process.env.AGENT_API_URL}/api/rag/upload`,
        {
          file_id: fileId,
          organization_id: organizationId,
          filename,
          file_url: fileUrl,
        }
      );

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

worker.on("completed", (job) => {
  console.log(`RAG job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`RAG job ${job?.id} failed:`, error.message);
});