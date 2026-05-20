const request = require("supertest");

// server.js only connects to DB and binds a port when run directly via
// `node server.js`.  When Jest requires it, it just returns the Express
// app — no DB connection, no port conflict.
const app = require("../../server");

describe("Health & Auth endpoints", () => {
  it("GET /health — returns { status: ok }", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("POST /api/auth/register — rejects empty body with 4xx", async () => {
    const res = await request(app).post("/api/auth/register").send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("POST /api/auth/login — rejects unknown credentials with 4xx/5xx", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "wrongpass" });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("GET /api/auth/me — rejects missing token with 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });
});
