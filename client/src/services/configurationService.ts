import api from "./api";

/* ---------- Organization → General Information ---------- */

export interface OrganizationProfile {
  name: string;
  registrationNumber: string;
  taxId: string;
  industry: string;
  phone: string;
  fax: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes: string;
  employeeCount?: number;
}

export const getOrganization = async (): Promise<Partial<OrganizationProfile>> =>
  (await api.get("/organization")).data.data;

export const saveOrganization = async (
  data: Partial<OrganizationProfile>
): Promise<Partial<OrganizationProfile>> => (await api.put("/organization", data)).data.data;

/* ---------- Configuration → Email / Localization / Modules ---------- */

export interface NotificationSettings {
  enabled: boolean;
  senderName: string;
  senderEmail: string;
  replyTo: string;
  events: {
    leaveApplied: boolean;
    leaveDecision: boolean;
    newEmployee: boolean;
    vacancyPosted: boolean;
    performanceReview: boolean;
    passwordChanged: boolean;
  };
}

export interface LocalizationSettings {
  language: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  timezone: string;
  currency: string;
  weekStart: string;
}

export interface ModuleSettings {
  attendance: boolean;
  leave: boolean;
  recruitment: boolean;
  performance: boolean;
  reports: boolean;
}

export interface SettingsMap {
  notifications: NotificationSettings;
  localization: LocalizationSettings;
  modules: ModuleSettings;
}

export const getSettings = async <K extends keyof SettingsMap>(key: K): Promise<SettingsMap[K]> =>
  (await api.get(`/system-settings/${key}`)).data.data;

export const saveSettings = async <K extends keyof SettingsMap>(
  key: K,
  value: unknown
): Promise<SettingsMap[K]> => (await api.put(`/system-settings/${key}`, value)).data.data;

export const resetSettings = async <K extends keyof SettingsMap>(key: K): Promise<SettingsMap[K]> =>
  (await api.delete(`/system-settings/${key}`)).data.data;
