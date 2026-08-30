import axios from "axios";

const aiService = axios.create({
  baseURL: process.env.AGENT_API_URL,
  headers: {
    "X-AI-Service-Key": process.env.AI_SERVICE_SECRET,
  },
  timeout: 120000,
});

async function waitForAIService() {
  const maxAttempts = 30; 
  const delay = 3000;     

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const url = `${process.env.AGENT_API_URL}/health`;
      console.log(`Waking AI service (Attempt ${attempt}/${maxAttempts})...`);

      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Cache-Control': 'no-cache',
        },
      });
      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      const status = error.response?.status;
      console.log(`Attempt ${attempt} failed (Status: ${status || 'Network/Timeout'}). Retrying...`);
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