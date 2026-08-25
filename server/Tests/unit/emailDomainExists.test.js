import { jest } from "@jest/globals";
import axios from "axios";
import emailDomainExists from "../../utils/emailDomainExists.js";

describe("emailDomainExists", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns true when domain has MX records", async () => {
    jest.spyOn(axios, "get").mockResolvedValue({
      data: {
        Answer: [
          {
            type: 15,
            data: "mail.example.com",
          },
        ],
      },
    });

    const result = await emailDomainExists("user@example.com");

    expect(result).toBe(true);
  });

  test("returns false when domain has no MX records", async () => {
    jest.spyOn(axios, "get").mockResolvedValue({
      data: {},
    });

    const result = await emailDomainExists("user@example.com");

    expect(result).toBe(false);
  });

  test("returns false when DNS request fails", async () => {
    jest
      .spyOn(axios, "get")
      .mockRejectedValue(new Error("DNS request failed"));

    const result = await emailDomainExists("user@example.com");

    expect(result).toBe(false);
  });
});