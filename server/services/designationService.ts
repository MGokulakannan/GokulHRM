import Designation from "../models/Desiganation";

export const createDesignationService = async (data: any) => {
     return await Designation.create(data);
};

export const getAllDesignationService = async () => {
    return await Designation.find().populate("department");
};

export const getDesignationByIdService = async (id: string) => {
    return await Designation.findById(id).populate("department");
};

export const updateDesignationService = async (
  id: string,
  data: any
) => {
     return await Designation.findByIdAndUpdate(id, data, {
    returnDocument: "after",
  });
};

export const deleteDesignationService = async (id: string) => {
    return await Designation.findByIdAndDelete(id);
};