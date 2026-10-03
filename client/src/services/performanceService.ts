import api from "./api";

export interface PerformanceReviewRecord {
  _id: string;
  employee: string | { _id: string; firstName: string; lastName: string; employeeId: string };
  reviewer: string | { _id: string; firstName: string; lastName: string };
  reviewPeriod: string;
  status: "Pending" | "Completed";
  dueDate?: string;
  rating?: number;
  comments?: string;
}

export interface GoalRecord {
  _id: string;
  employee: string | { _id: string; firstName: string; lastName: string; employeeId: string };
  title: string;
  description?: string;
  dueDate?: string;
  status: "Not Started" | "In Progress" | "Completed";
  progress: number;
}

export const getReviews = async () => {
  const response = await api.get("/performance/reviews");
  return response.data;
};

export const createReview = async (data: {
  employee: string;
  reviewPeriod: string;
  dueDate?: string;
}) => {
  const response = await api.post("/performance/reviews", data);
  return response.data;
};

export const updateReview = async (
  id: string,
  data: Partial<PerformanceReviewRecord>
) => {
  const response = await api.put(`/performance/reviews/${id}`, data);
  return response.data;
};

export const deleteReview = async (id: string) => {
  const response = await api.delete(`/performance/reviews/${id}`);
  return response.data;
};

export const getGoals = async () => {
  const response = await api.get("/performance/goals");
  return response.data;
};

export const createGoal = async (data: {
  employee: string;
  title: string;
  description?: string;
  dueDate?: string;
}) => {
  const response = await api.post("/performance/goals", data);
  return response.data;
};

export const updateGoal = async (id: string, data: Partial<GoalRecord>) => {
  const response = await api.put(`/performance/goals/${id}`, data);
  return response.data;
};

export const deleteGoal = async (id: string) => {
  const response = await api.delete(`/performance/goals/${id}`);
  return response.data;
};
