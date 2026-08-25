import request from "supertest";
import app from "../setup.js";

test("rejects login with incorrect password", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: process.env.TEST_EMAIL,
      password: "WrongPassword123!",
    });

  expect(response.statusCode).toBe(401);
});