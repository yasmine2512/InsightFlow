import request from "supertest";
import app from "../setup.js";

const agent = request.agent(app);

async function loginTestUser() {
  return await agent
    .post("/api/auth/login")
    .send({
      email: process.env.TEST_EMAIL,
      password: process.env.TEST_PASSWORD,
    });
}

export { agent, loginTestUser };