const request = require("supertest");

// setup.js (loaded via jest.setupFiles) already set mongoose.set('bufferCommands', false)
// so any Mongoose query attempted without a live connection throws immediately
// instead of buffering for 10 s — tests stay fast in CI.
//
// server.js uses `require.main === module` so it does NOT call connectDB()
// or app.listen() when Jest requires it — only the Express app is exported.
const app = require("../../server");

describe("Health endpoint", () => {
  it("GET /health — returns 200 { status: ok }", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("Auth endpoints (no DB)", () => {
  it("GET /api/auth/me — 401 when no token provided", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });

  it("POST /api/auth/register — 4xx/5xx when body is empty", async () => {
    // With no DB connection, Mongoose throws instantly (bufferCommands=false)
    // → error handler returns 500. Either way statusCode >= 400.
    const res = await request(app).post("/api/auth/register").send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("POST /api/auth/login — 4xx/5xx for unknown credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "wrongpass" });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});
