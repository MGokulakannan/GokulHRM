import Department from "../models/Department";

export const createDepartmentService = async (data: any) => {
  const existingDepartment = await Department.findOne({
    name: data.name,
  });

  if (existingDepartment) {
    throw new Error("Department already exists");
  }

  const department = await Department.create(data);

  return department;
};

export const getAllDepartmentsService = async () => {
  return await Department.find();
};

export const getDepartmentByIdService = async (
  id: string
) => {
  const department = await Department.findById(id);

  if (!department) {
    throw new Error("Department not found");
  }

  return department;
};
export const updateDepartmentService = async (
  id: string,
  data: any
) => {
  const department = await Department.findByIdAndUpdate(
    id,
    data,
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!department) {
    throw new Error("Department not found");
  }

  return department;
};
export const deleteDepartmentService = async (
  id: string
) => {
  const department = await Department.findByIdAndDelete(id);

  if (!department) {
    throw new Error("Department not found");
  }

  return department;
};