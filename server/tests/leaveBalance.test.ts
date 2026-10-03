import request from "supertest";
import app from "../app";
import User from "../models/Users";
import Leave from "../models/Leave";
import LeaveType from "../models/LeaveType";
import { connectTestDb, disconnectTestDb, createTestUser } from "./testUtils";

describe("Leave business rules", () => {
  let adminToken: string;
  let employeeToken: string;
  let employeeId: string;
  let adminEmail: string;
  let employeeEmail: string;
  const leaveTypeName = `Jest Leave Type ${Date.now()}`;

  beforeAll(async () => {
    await connectTestDb();

    const admin = await createTestUser({ role: "Admin" });
    adminEmail = admin.email;
    const employee = await createTestUser({ role: "Employee" });
    employeeEmail = employee.email;
    employeeId = employee.user._id.toString();

    adminToken = (
      await request(app)
        .post("/api/auth/login")
        .send({ email: admin.email, password: "Password@123" })
    ).body.token;

    employeeToken = (
      await request(app)
        .post("/api/auth/login")
        .send({ email: employee.email, password: "Password@123" })
    ).body.token;

    await LeaveType.create({ name: leaveTypeName, daysPerYear: 2 });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: [adminEmail, employeeEmail] } });
    await Leave.deleteMany({ employee: employeeId });
    await LeaveType.deleteMany({ name: leaveTypeName });
    await disconnectTestDb();
  });

  it("rejects an end date before the start date", async () => {
    const res = await request(app)
      .post("/api/leaves")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({
        leaveType: leaveTypeName,
        startDate: "2027-03-10",
        endDate: "2027-03-05",
      });

    expect(res.status).toBe(400);
  });

  it("blocks approval once the request exceeds the leave type's yearly allocation", async () => {
    const createRes = await request(app)
      .post("/api/leaves")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({
        leaveType: leaveTypeName,
        startDate: "2027-04-01",
        endDate: "2027-04-05", // 5 days, allocation is 2
      });

    const leaveId = createRes.body.data._id;

    const approveRes = await request(app)
      .put(`/api/leaves/${leaveId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "Approved" });

    expect(approveRes.status).toBe(400);
    expect(approveRes.body.message).toMatch(/allotted/i);

    const stored = await Leave.findById(leaveId);
    expect(stored?.status).toBe("Pending");
  });

  it("allows approval when the request is within the yearly allocation", async () => {
    const createRes = await request(app)
      .post("/api/leaves")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({
        leaveType: leaveTypeName,
        startDate: "2027-05-01",
        endDate: "2027-05-02", // 2 days, within the allocation
      });

    const leaveId = createRes.body.data._id;

    const approveRes = await request(app)
      .put(`/api/leaves/${leaveId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "Approved" });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe("Approved");
  });

  it("prevents an Employee from checking out before checking in", async () => {
    const res = await request(app)
      .post("/api/attendance/check-out")
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(res.status).toBe(400);
  });
});
