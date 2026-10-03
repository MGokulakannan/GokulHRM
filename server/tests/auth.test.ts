import request from "supertest";
import app from "../app";
import User from "../models/Users";
import { connectTestDb, disconnectTestDb, createTestUser } from "./testUtils";

describe("Authentication", () => {
  let testEmail: string;

  beforeAll(async () => {
    await connectTestDb();
    const created = await createTestUser({ role: "Employee" });
    testEmail = created.email;
  });

  afterAll(async () => {
    await User.deleteMany({ email: testEmail });
    await disconnectTestDb();
  });

  it("logs in successfully with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: "Password@123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.password).toBeUndefined();
  });

  it("rejects an incorrect password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: "WrongPassword" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects a login for an email that doesn't exist", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@gokulhrm.test", password: "Password@123" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("rejects a malformed email with a validation error, not a DB query", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "not-an-email", password: "Password@123" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects a login with a missing password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: testEmail });

    expect(res.status).toBe(400);
  });

  it("rejects an unauthenticated request to a protected route", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
  });

  it("accepts a valid token on a protected route", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: "Password@123" });

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${loginRes.body.token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(testEmail);
  });

  it("rejects a garbage/invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-real-token");

    expect(res.status).toBe(401);
  });
});
