import api from "./api";

export interface NotificationRecord {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "danger";
  read: boolean;
  createdAt: string;
}

export const getMyNotifications = async () => {
  const response = await api.get("/notifications/me");
  return response.data;
};

export const markNotificationRead = async (id: string) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.put("/notifications/read-all");
  return response.data;
};
