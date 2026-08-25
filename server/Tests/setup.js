import { jest } from "@jest/globals";
import connectDB from "../config/db.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config({
  path: ".env.test"
});

await connectDB();

jest.unstable_mockModule("../config/ragQueue.js", () => ({
  redisConnection: {},
  ragQueue: {
    add: jest.fn(),
  },
}));

const { default: app } = await import("../app.js");

afterAll(async () => {
  await mongoose.connection.close();
});

export default app;