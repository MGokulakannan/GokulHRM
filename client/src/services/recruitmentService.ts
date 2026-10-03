import api from "./api";

export interface Vacancy {
  _id: string;
  title: string;
  department: string | { _id: string; name: string };
  designation: string | { _id: string; name: string };
  location: string;
  status: "Open" | "On Hold" | "Closed";
  description?: string;
  postedDate: string;
}

export interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  vacancy: string | { _id: string; title: string };
  status:
    | "Applied"
    | "Shortlisted"
    | "Interview Scheduled"
    | "Interviewed"
    | "Hired"
    | "Rejected";
  interviewDate?: string;
  notes?: string;
  appliedDate: string;
}

export const getVacancies = async () => {
  const response = await api.get("/recruitment/vacancies");
  return response.data;
};

export const createVacancy = async (data: Partial<Vacancy>) => {
  const response = await api.post("/recruitment/vacancies", data);
  return response.data;
};

export const updateVacancy = async (id: string, data: Partial<Vacancy>) => {
  const response = await api.put(`/recruitment/vacancies/${id}`, data);
  return response.data;
};

export const deleteVacancy = async (id: string) => {
  const response = await api.delete(`/recruitment/vacancies/${id}`);
  return response.data;
};

export const getCandidates = async (vacancyId?: string) => {
  const response = await api.get("/recruitment/candidates", {
    params: vacancyId ? { vacancy: vacancyId } : undefined,
  });
  return response.data;
};

export const createCandidate = async (data: Partial<Candidate>) => {
  const response = await api.post("/recruitment/candidates", data);
  return response.data;
};

export const updateCandidate = async (id: string, data: Partial<Candidate>) => {
  const response = await api.put(`/recruitment/candidates/${id}`, data);
  return response.data;
};

export const deleteCandidate = async (id: string) => {
  const response = await api.delete(`/recruitment/candidates/${id}`);
  return response.data;
};
