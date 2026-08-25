import request from "supertest";
import { jest } from "@jest/globals";
jest.unstable_mockModule("../../config/ragQueue.js", () => ({
  redisConnection: {},
  ragQueue: {
    add: jest.fn(),
  },
}));

const { default: app } = await import("../../app.js");

describe("GET /health", () => {
  test("returns API health status", async () => {
    const response = await request(app)
      .get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
    });
  });
});