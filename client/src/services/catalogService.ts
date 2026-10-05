import api from "./api";

// Typed client for the generic admin lookup lists (see server/routes/catalogRoutes.ts).

export type CatalogStatus = "Active" | "Inactive";

export interface CatalogRow {
  _id: string;
  status?: CatalogStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogApi<T extends CatalogRow> {
  list: () => Promise<T[]>;
  create: (data: Record<string, unknown>) => Promise<T>;
  update: (id: string, data: Record<string, unknown>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  seedDefaults: () => Promise<{ added: number; total: number; message: string }>;
}

export const createCatalogApi = <T extends CatalogRow>(path: string): CatalogApi<T> => ({
  list: async () => (await api.get(path)).data.data as T[],
  create: async (data) => (await api.post(path, data)).data.data as T,
  update: async (id, data) => (await api.put(`${path}/${id}`, data)).data.data as T,
  remove: async (id) => {
    await api.delete(`${path}/${id}`);
  },
  seedDefaults: async () => {
    const { data } = await api.post(`${path}/seed-defaults`);
    return { ...data.data, message: data.message };
  },
});

/* ---------- Job ---------- */

export interface JobCategory extends CatalogRow {
  name: string;
  description?: string;
}

export interface WorkShift extends CatalogRow {
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  description?: string;
}

/* ---------- Organization ---------- */

export interface Location extends CatalogRow {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  zipCode?: string;
  phone?: string;
}

export interface CostCenter extends CatalogRow {
  code: string;
  name: string;
  description?: string;
}

export type OrgUnitType = "Company" | "Division" | "Department" | "Team" | "Branch";

export interface OrgUnit extends CatalogRow {
  name: string;
  unitType: OrgUnitType;
  parent: string | null;
  description?: string;
}

/* ---------- Qualifications & nationalities ---------- */

export interface NamedItem extends CatalogRow {
  name: string;
  description?: string;
}

export const jobCategoryApi = createCatalogApi<JobCategory>("/job-categories");
export const workShiftApi = createCatalogApi<WorkShift>("/work-shifts");
export const locationApi = createCatalogApi<Location>("/locations");
export const costCenterApi = createCatalogApi<CostCenter>("/cost-centers");
export const orgUnitApi = createCatalogApi<OrgUnit>("/org-units");
export const skillApi = createCatalogApi<NamedItem>("/skills");
export const educationApi = createCatalogApi<NamedItem>("/education");
export const licenseApi = createCatalogApi<NamedItem>("/licenses");
export const languageApi = createCatalogApi<NamedItem>("/languages");
export const membershipApi = createCatalogApi<NamedItem>("/memberships");
export const nationalityApi = createCatalogApi<NamedItem>("/nationalities");
