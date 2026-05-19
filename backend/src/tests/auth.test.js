const request = require("supertest");

// Mock mongoose to avoid real DB connection in unit tests
jest.mock("mongoose", () => {
  const actual = jest.requireActual("mongoose");
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(true),
    set: jest.fn(),
  };
});

const app = require("../../server");

describe("Auth Endpoints", () => {
  it("GET /health — should return ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("POST /api/auth/register — should reject empty body", async () => {
    const res = await request(app).post("/api/auth/register").send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("POST /api/auth/login — should reject invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "wrongpass" });
    expect([401, 500]).toContain(res.statusCode);
  });

  it("GET /api/auth/me — should reject request without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });
});
