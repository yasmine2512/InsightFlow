import axios from "axios";

const aiService = axios.create({
  baseURL: process.env.AGENT_API_URL,
  headers: {
    "X-AI-Service-Key": process.env.AI_SERVICE_SECRET,
  },
  timeout: 120000,
});

export async function chatWithAI({
  message,
  organizationId,
  threadId,
}) {
  const response = await aiService.post("/api/agent/chat", {
    message,
    organization_id: organizationId,
    thread_id: threadId,
  });

  return response.data;
}

export async function deleteAIThread(threadId) {
  const response = await aiService.delete("/api/agent/thread", {
    data: {
      thread_id: threadId,
    },
  });

  return response.data;
}

export async function processAIDocument({
  fileId,
  organizationId,
  filename,
  fileUrl,
}) {
  const response = await aiService.post("/api/rag/upload", {
    file_id: fileId,
    organization_id: organizationId,
    filename,
    file_url: fileUrl,
  });

  return response.data;
}