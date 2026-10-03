import api from "./api";



export const getLeaves = async () => {

  const response =
    await api.get("/leaves");

  return response.data;
};


// =====================================================
// GET TODAY'S LEAVES
// =====================================================

export const getTodayLeaves = async () => {

  const response =
    await api.get("/leaves/today");

  return response.data;
};


// =====================================================
// CREATE LEAVE
// =====================================================

export const createLeave = async (
  data: {
    employee: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason?: string;
    status?:
      | "Pending"
      | "Approved"
      | "Rejected";
  }
) => {

  const response =
    await api.post(
      "/leaves",
      data
    );

  return response.data;
};


// =====================================================
// UPDATE LEAVE
// =====================================================

export const updateLeave = async (
  id: string,
  data: {
    employee?: string;
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    reason?: string;
    status?:
      | "Pending"
      | "Approved"
      | "Rejected";
  }
) => {

  const response =
    await api.put(
      `/leaves/${id}`,
      data
    );

  return response.data;
};


// =====================================================
// DELETE LEAVE
// =====================================================

export const deleteLeave = async (
  id: string
) => {

  const response =
    await api.delete(
      `/leaves/${id}`
    );

  return response.data;
};