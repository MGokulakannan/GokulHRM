import request from "supertest";
import app from "../app";
import User from "../models/Users";
import SystemSetting from "../models/SystemSetting";
import OrganizationProfile from "../models/OrganizationProfile";
import { CostCenter, Nationality, OrgUnit, WorkShift } from "../models/OrgCatalogs";
import { connectTestDb, disconnectTestDb, createTestUser } from "./testUtils";

describe("Organization catalogs & configuration", () => {
  let adminToken: string;
  let employeeToken: string;
  let adminEmail: string;
  let employeeEmail: string;
  let employeeCode: string;

  const asAdmin = (req: request.Test) => req.set("Authorization", `Bearer ${adminToken}`);
  const asEmployee = (req: request.Test) => req.set("Authorization", `Bearer ${employeeToken}`);

  beforeAll(async () => {
    await connectTestDb();

    const admin = await createTestUser({ role: "Admin" });
    adminEmail = admin.email;
    const employee = await createTestUser({ role: "Employee" });
    employeeEmail = employee.email;
    employeeCode = employee.user.employeeId;

    adminToken = (
      await request(app).post("/api/auth/login").send({ email: admin.email, password: admin.password })
    ).body.token;
    employeeToken = (
      await request(app)
        .post("/api/auth/login")
        .send({ email: employee.email, password: employee.password })
    ).body.token;
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: [adminEmail, employeeEmail] } });
    await Nationality.deleteMany({ name: /^Testland/ });
    await CostCenter.deleteMany({ code: /^TST/ });
    await WorkShift.deleteMany({ name: /^Test shift/ });
    await OrgUnit.deleteMany({ name: /^Test unit/ });
    await disconnectTestDb();
  });

  describe("access control", () => {
    it("rejects unauthenticated reads", async () => {
      const res = await request(app).get("/api/nationalities");
      expect(res.status).toBe(401);
    });

    it("lets an Employee read but not write", async () => {
      expect((await asEmployee(request(app).get("/api/skills"))).status).toBe(200);

      const create = await asEmployee(request(app).post("/api/skills")).send({ name: "Nope" });
      expect(create.status).toBe(403);

      const seed = await asEmployee(request(app).post("/api/skills/seed-defaults"));
      expect(seed.status).toBe(403);
    });

    it("blocks an Employee from changing settings and the organization profile", async () => {
      const settings = await asEmployee(request(app).put("/api/system-settings/modules")).send({
        leave: false,
      });
      expect(settings.status).toBe(403);

      const profile = await asEmployee(request(app).put("/api/organization")).send({ name: "Hack" });
      expect(profile.status).toBe(403);
    });
  });

  describe("catalog CRUD (nationalities)", () => {
    let id: string;

    it("creates, rejects duplicates, updates and deletes", async () => {
      const created = await asAdmin(request(app).post("/api/nationalities")).send({
        name: "  Testland  ",
      });
      expect(created.status).toBe(201);
      expect(created.body.data.name).toBe("Testland");
      expect(created.body.data.status).toBe("Active");
      id = created.body.data._id;

      const duplicate = await asAdmin(request(app).post("/api/nationalities")).send({
        name: "Testland",
      });
      expect(duplicate.status).toBe(409);

      const updated = await asAdmin(request(app).put(`/api/nationalities/${id}`)).send({
        name: "Testlandian",
        status: "Inactive",
      });
      expect(updated.status).toBe(200);
      expect(updated.body.data.status).toBe("Inactive");

      const bad = await asAdmin(request(app).put(`/api/nationalities/${id}`)).send({
        status: "Banana",
      });
      expect(bad.status).toBe(400);

      expect((await asAdmin(request(app).delete(`/api/nationalities/${id}`))).status).toBe(200);
      expect((await asAdmin(request(app).get(`/api/nationalities/${id}`))).status).toBe(404);
    });

    it("requires a name and rejects malformed ids", async () => {
      const missing = await asAdmin(request(app).post("/api/nationalities")).send({});
      expect(missing.status).toBe(400);

      const badId = await asAdmin(request(app).get("/api/nationalities/not-an-id"));
      expect(badId.status).toBe(400);
    });

    it("ignores fields that are not whitelisted", async () => {
      const res = await asAdmin(request(app).post("/api/nationalities")).send({
        name: "Testland Extra",
        _id: "000000000000000000000000",
        isAdmin: true,
      });
      expect(res.status).toBe(201);
      expect(res.body.data._id).not.toBe("000000000000000000000000");
      expect(res.body.data.isAdmin).toBeUndefined();
    });
  });

  describe("starter data", () => {
    it("adds only missing defaults and is repeatable", async () => {
      const first = await asAdmin(request(app).post("/api/job-categories/seed-defaults"));
      expect(first.status).toBe(200);

      const second = await asAdmin(request(app).post("/api/job-categories/seed-defaults"));
      expect(second.body.data.added).toBe(0);
    });
  });

  describe("work shifts & cost centers", () => {
    it("validates shift times", async () => {
      const bad = await asAdmin(request(app).post("/api/work-shifts")).send({
        name: "Test shift bad",
        startTime: "9am",
        endTime: "17:00",
      });
      expect(bad.status).toBe(400);

      const ok = await asAdmin(request(app).post("/api/work-shifts")).send({
        name: "Test shift day",
        startTime: "09:00",
        endTime: "17:30",
        breakMinutes: 45,
      });
      expect(ok.status).toBe(201);
      expect(ok.body.data.breakMinutes).toBe(45);
    });

    it("upper-cases cost center codes and keeps them unique", async () => {
      const first = await asAdmin(request(app).post("/api/cost-centers")).send({
        code: "tst-100",
        name: "Test Cost Centre",
      });
      expect(first.status).toBe(201);
      expect(first.body.data.code).toBe("TST-100");

      const dup = await asAdmin(request(app).post("/api/cost-centers")).send({
        code: "TST-100",
        name: "Another",
      });
      expect(dup.status).toBe(409);
    });
  });

  describe("organization structure", () => {
    it("builds a tree, blocks cycles and blocks deleting units with children", async () => {
      const root = await asAdmin(request(app).post("/api/org-units")).send({
        name: "Test unit root",
        unitType: "Company",
      });
      expect(root.status).toBe(201);

      const child = await asAdmin(request(app).post("/api/org-units")).send({
        name: "Test unit child",
        parent: root.body.data._id,
      });
      expect(child.status).toBe(201);
      expect(child.body.data.parent).toBe(root.body.data._id);

      const cycle = await asAdmin(request(app).put(`/api/org-units/${root.body.data._id}`)).send({
        parent: child.body.data._id,
      });
      expect(cycle.status).toBe(400);

      const self = await asAdmin(request(app).put(`/api/org-units/${root.body.data._id}`)).send({
        parent: root.body.data._id,
      });
      expect(self.status).toBe(400);

      const blocked = await asAdmin(request(app).delete(`/api/org-units/${root.body.data._id}`));
      expect(blocked.status).toBe(409);

      expect(
        (await asAdmin(request(app).delete(`/api/org-units/${child.body.data._id}`))).status
      ).toBe(200);
      expect(
        (await asAdmin(request(app).delete(`/api/org-units/${root.body.data._id}`))).status
      ).toBe(200);
    });

    it("rejects an unknown parent", async () => {
      const res = await asAdmin(request(app).post("/api/org-units")).send({
        name: "Test unit orphan",
        parent: "000000000000000000000001",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("general information", () => {
    let original: Record<string, unknown> | null;

    beforeAll(async () => {
      original = (await OrganizationProfile.findOne().lean()) as Record<string, unknown> | null;
    });

    afterAll(async () => {
      await OrganizationProfile.deleteMany({});
      if (original) await OrganizationProfile.create(original);
    });

    it("saves and returns the profile with an employee count", async () => {
      const bad = await asAdmin(request(app).put("/api/organization")).send({
        name: "Gokul HRM Test",
        email: "not-an-email",
      });
      expect(bad.status).toBe(400);

      const saved = await asAdmin(request(app).put("/api/organization")).send({
        name: "Gokul HRM Test",
        city: "Chennai",
      });
      expect(saved.status).toBe(200);
      expect(saved.body.data.city).toBe("Chennai");

      const read = await asEmployee(request(app).get("/api/organization"));
      expect(read.status).toBe(200);
      expect(read.body.data.name).toBe("Gokul HRM Test");
      expect(typeof read.body.data.employeeCount).toBe("number");
    });
  });

  describe("system settings", () => {
    afterAll(async () => {
      await SystemSetting.deleteMany({ key: { $in: ["modules", "localization", "notifications"] } });
    });

    it("returns defaults, merges partial updates and persists them", async () => {
      await asAdmin(request(app).delete("/api/system-settings/modules"));

      const initial = await asEmployee(request(app).get("/api/system-settings/modules"));
      expect(initial.body.data.recruitment).toBe(true);

      const updated = await asAdmin(request(app).put("/api/system-settings/modules")).send({
        recruitment: false,
        unknownModule: true,
      });
      expect(updated.status).toBe(200);
      expect(updated.body.data.recruitment).toBe(false);
      expect(updated.body.data.leave).toBe(true);
      expect(updated.body.data.unknownModule).toBeUndefined();

      const again = await asEmployee(request(app).get("/api/system-settings/modules"));
      expect(again.body.data.recruitment).toBe(false);
    });

    it("validates types, enums, time zones and emails", async () => {
      const wrongType = await asAdmin(request(app).put("/api/system-settings/modules")).send({
        leave: "yes",
      });
      expect(wrongType.status).toBe(400);

      const badEnum = await asAdmin(request(app).put("/api/system-settings/localization")).send({
        dateFormat: "whenever",
      });
      expect(badEnum.status).toBe(400);

      const badZone = await asAdmin(request(app).put("/api/system-settings/localization")).send({
        timezone: "Mars/Olympus",
      });
      expect(badZone.status).toBe(400);

      const badEmail = await asAdmin(request(app).put("/api/system-settings/notifications")).send({
        senderEmail: "nope",
      });
      expect(badEmail.status).toBe(400);

      const nested = await asAdmin(request(app).put("/api/system-settings/notifications")).send({
        events: { leaveApplied: false },
      });
      expect(nested.status).toBe(200);
      expect(nested.body.data.events.leaveApplied).toBe(false);
      expect(nested.body.data.events.leaveDecision).toBe(true);
    });

    it("404s for an unknown group", async () => {
      const res = await asAdmin(request(app).get("/api/system-settings/nope"));
      expect(res.status).toBe(404);
    });
  });

  describe("login by Employee ID", () => {
    it("accepts the employee ID (case-insensitive) or the email", async () => {
      const byId = await request(app)
        .post("/api/auth/login")
        .send({ identifier: employeeCode.toLowerCase(), password: "Password@123" });
      expect(byId.status).toBe(200);
      expect(byId.body.user.role).toBe("Employee");
      expect(byId.body.user.password).toBeUndefined();

      const byEmail = await request(app)
        .post("/api/auth/login")
        .send({ identifier: employeeEmail, password: "Password@123" });
      expect(byEmail.status).toBe(200);
    });

    it("rejects a wrong password and an unknown ID", async () => {
      const wrong = await request(app)
        .post("/api/auth/login")
        .send({ identifier: employeeCode, password: "wrong" });
      expect(wrong.status).toBe(401);

      const unknown = await request(app)
        .post("/api/auth/login")
        .send({ identifier: "EMP999999", password: "Password@123" });
      expect(unknown.status).toBe(404);
    });
  });
});
