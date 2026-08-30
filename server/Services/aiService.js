import axios from "axios";

const aiService = axios.create({
  baseURL: process.env.AGENT_API_URL,
  headers: {
    "X-AI-Service-Key": process.env.AI_SERVICE_SECRET,
  },
  timeout: 120000,
});

async function waitForAIService() {
  const maxAttempts = 20;
  const delay = 3000;   
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const url = `${process.env.AGENT_API_URL}/health`;
      const response = await axios.get(url, {
        timeout: 10000,
      });
      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      const status = error.response?.status;
      if (status === 502 || status === 503 || status === 504 || error.code === 'ECONNREFUSED') {
        console.log(`AI service is still booting up (Status/Error: ${status || error.code}). Retrying...`);
      } else {
        console.log(`AI service health check warning: ${error.message}`);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error("AI service did not wake up in time");
}

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
  await waitForAIService();
  const response = await aiService.post("/api/rag/upload", {
    file_id: fileId,
    organization_id: organizationId,
    filename,
    file_url: fileUrl,
  });

  return response.data;
}