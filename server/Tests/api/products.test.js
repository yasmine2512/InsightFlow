import { agent, loginTestUser } from "../helpers/auth.js";
import request from "supertest";
import app from "../setup.js";

describe("Products API", () => {
  beforeAll(async () => {
    const response = await loginTestUser();

    expect(response.statusCode).toBe(200);
  });

  test("authenticated user can get products", async () => {
    const response = await agent
      .get(`/api/products/${process.env.TEST_ORG_ID}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.productslist).toBeDefined();
    expect(Array.isArray(response.body.productslist.products)).toBe(true);
    expect(response.body.productslist.total).toBe(3);

  });

  test("rejects unauthenticated requests", async () => {
    const response = await request(app)
      .get(`/api/products/${process.env.TEST_ORG_ID}`);

    expect(response.statusCode).toBe(401);
  });

});
