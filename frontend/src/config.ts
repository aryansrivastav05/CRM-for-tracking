/**
 * Centralized Application Configuration & API Helper
 */

export const BACKEND_URL: string =
  ((import.meta as any)?.env?.VITE_BACKEND_URL as string) || "http://localhost:8000";

export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${BACKEND_URL}${cleanEndpoint}`;
};

export const authenticatedFetch = async (
  endpoint: string,
  token?: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(getApiUrl(endpoint), {
    ...options,
    headers
  });
};
