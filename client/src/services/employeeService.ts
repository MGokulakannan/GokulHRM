import api from "./api";

export interface EmployeeData {
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: string;
  department?: string;
  designation?: string;
  phone?: string;
  gender?: string;
  profileImage?: string;
  status?: string;
  dateOfJoining?: string;
}



export const getEmployees = async () => {
  const response = await api.get("/employees");

  return response.data;
};



export const getEmployeeById = async (id: string) => {
  const response = await api.get(`/employees/${id}`);

  return response.data;
};




export const createEmployee = async (
  employeeData: EmployeeData
) => {
  const response = await api.post(
    "/employees",
    employeeData
  );

  return response.data;
};




export const updateEmployee = async (
  id: string,
  employeeData: EmployeeData
) => {
  const response = await api.put(
    `/employees/${id}`,
    employeeData
  );

  return response.data;
};




export const deleteEmployee = async (id: string) => {
  const response = await api.delete(
    `/employees/${id}`
  );

  return response.data;
};