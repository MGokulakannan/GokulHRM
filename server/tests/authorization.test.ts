import request from "supertest";
import app from "../app";
import User from "../models/Users";
import Leave from "../models/Leave";
import { connectTestDb, disconnectTestDb, createTestUser } from "./testUtils";

describe("Authorization", () => {
  let adminToken: string;
  let employeeToken: string;
  let employeeId: string;
  let adminEmail: string;
  let employeeEmail: string;

  beforeAll(async () => {
    await connectTestDb();

    const admin = await createTestUser({ role: "Admin" });
    adminEmail = admin.email;

    const employee = await createTestUser({ role: "Employee" });
    employeeEmail = employee.email;
    employeeId = employee.user._id.toString();

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: admin.email, password: "Password@123" });
    adminToken = adminLogin.body.token;

    const employeeLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: employee.email, password: "Password@123" });
    employeeToken = employeeLogin.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: [adminEmail, employeeEmail] } });
    await Leave.deleteMany({ employee: employeeId });
    await disconnectTestDb();
  });

  // Regression test: POST /api/auth/create-employee used to have NO auth
  // middleware at all, letting anyone mint an Admin account.
  it("blocks unauthenticated requests to create-employee", async () => {
    const res = await request(app).post("/api/auth/create-employee").send({
      firstName: "Should",
      lastName: "Fail",
      email: "should-fail@gokulhrm.test",
      password: "Password@123",
      role: "Admin",
    });

    expect(res.status).toBe(401);

    const created = await User.findOne({ email: "should-fail@gokulhrm.test" });
    expect(created).toBeNull();
  });

  it("blocks an Employee from calling create-employee", async () => {
    const res = await request(app)
      .post("/api/auth/create-employee")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({
        firstName: "Should",
        lastName: "StillFail",
        email: "should-still-fail@gokulhrm.test",
        password: "Password@123",
        role: "Admin",
      });

    expect(res.status).toBe(403);
  });

  // Regression test: job titles / pay grades / employment status / user
  // roles write routes used to have no roleMiddleware("Admin") at all.
  it("blocks an Employee from creating a job title", async () => {
    const res = await request(app)
      .post("/api/job-titles")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ name: "Should Not Be Created" });

    expect(res.status).toBe(403);
  });

  it("blocks an Employee from creating a pay grade", async () => {
    const res = await request(app)
      .post("/api/pay-grades")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ name: "Should Not Be Created" });

    expect(res.status).toBe(403);
  });

  it("blocks an Employee from listing all employees", async () => {
    const res = await request(app)
      .get("/api/employees")
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(res.status).toBe(403);
  });

  it("allows an Admin to list all employees", async () => {
    const res = await request(app)
      .get("/api/employees")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("only returns an Employee's own leave requests, never everyone's", async () => {
    await Leave.create({
      employee: employeeId,
      leaveType: "Annual Leave",
      startDate: new Date("2027-01-10"),
      endDate: new Date("2027-01-11"),
      status: "Pending",
    });

    const res = await request(app)
      .get("/api/leaves")
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
    expect(
      res.body.data.every((leave: any) => {
        const owner =
          typeof leave.employee === "object" ? leave.employee._id : leave.employee;
        return owner === employeeId;
      })
    ).toBe(true);
  });

  it("does not let an Employee approve their own leave request", async () => {
    const createRes = await request(app)
      .post("/api/leaves")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({
        leaveType: "Annual Leave",
        startDate: "2027-02-01",
        endDate: "2027-02-02",
      });

    const leaveId = createRes.body.data._id;

    const approveRes = await request(app)
      .put(`/api/leaves/${leaveId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ status: "Approved" });

    // The status field is silently stripped for non-admins, so the
    // request succeeds but the leave stays Pending - it must never end
    // up Approved by the requester themselves.
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe("Pending");
  });
});
