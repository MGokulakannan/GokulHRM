const generateEmployeeId = (count: number): string => {
  return `EMP${String(count).padStart(4, "0")}`;
};

export default generateEmployeeId;