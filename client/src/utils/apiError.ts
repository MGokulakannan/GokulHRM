import { isAxiosError } from "axios";

// Pulls the server's message out of an Axios error, falling back to a default.
export const getApiError = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
  }
  return fallback;
};
