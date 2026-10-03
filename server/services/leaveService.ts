import Leave from "../models/Leave";
import mongoose from "mongoose";


// =====================================================
// GET ALL LEAVES
// =====================================================

export const getAllLeavesService = async () => {
  const leaves = await Leave.find()
    .populate(
      "employee",
      "employeeId firstName lastName email designation"
    )
    .sort({
      createdAt: -1,
    });

  return leaves;
};


// =====================================================
// GET LEAVES FOR A SPECIFIC EMPLOYEE
// =====================================================

export const getLeavesByEmployeeService = async (employeeId: string) => {
  const leaves = await Leave.find({ employee: employeeId })
    .populate("employee", "employeeId firstName lastName email designation")
    .sort({ createdAt: -1 });

  return leaves;
};


// =====================================================
// GET TODAY'S LEAVES
// =====================================================

export const getTodayLeavesService = async () => {

  const today = new Date();

  const startOfDay = new Date(today);
  startOfDay.setHours(
    0,
    0,
    0,
    0
  );

  const endOfDay = new Date(today);
  endOfDay.setHours(
    23,
    59,
    59,
    999
  );


  const leaves = await Leave.find({

    startDate: {
      $lte: endOfDay,
    },

    endDate: {
      $gte: startOfDay,
    },

    status: "Approved",

  })
    .populate(
      "employee",
      "employeeId firstName lastName email designation"
    )
    .sort({
      startDate: 1,
    });


  return leaves;
};


// =====================================================
// GET LEAVE BY ID
// =====================================================

export const getLeaveByIdService = async (
  id: string
) => {

  if (
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    throw new Error(
      "Invalid leave ID"
    );
  }


  const leave =
    await Leave.findById(id)
      .populate(
        "employee",
        "employeeId firstName lastName email designation"
      );


  if (!leave) {
    throw new Error(
      "Leave not found"
    );
  }


  return leave;
};


// =====================================================
// CREATE LEAVE
// =====================================================

interface CreateLeaveData {
  employee: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  status?:
    | "Pending"
    | "Approved"
    | "Rejected";
}


export const createLeaveService = async (
  data: CreateLeaveData
) => {

  if (
    !mongoose.Types.ObjectId.isValid(
      data.employee
    )
  ) {
    throw new Error(
      "Invalid employee ID"
    );
  }


  const leave =
    await Leave.create({
      employee: data.employee,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      status:
        data.status || "Pending",
    });


  return Leave.findById(
    leave._id
  ).populate(
    "employee",
    "employeeId firstName lastName email designation"
  );
};


// =====================================================
// UPDATE LEAVE
// =====================================================

export const updateLeaveService = async (
  id: string,
  data: Partial<CreateLeaveData>
) => {

  if (
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    throw new Error(
      "Invalid leave ID"
    );
  }


  const leave =
    await Leave.findByIdAndUpdate(
      id,
      data,
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).populate(
      "employee",
      "employeeId firstName lastName email designation"
    );


  if (!leave) {
    throw new Error(
      "Leave not found"
    );
  }


  return leave;
};


// =====================================================
// DELETE LEAVE
// =====================================================

export const deleteLeaveService = async (
  id: string
) => {

  if (
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    throw new Error(
      "Invalid leave ID"
    );
  }


  const leave =
    await Leave.findByIdAndDelete(id);


  if (!leave) {
    throw new Error(
      "Leave not found"
    );
  }


  return leave;
};