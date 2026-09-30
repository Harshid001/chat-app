import axios from "axios";

const configuredUrl = import.meta.env.VITE_API_URL;
export const serverUrl =
  configuredUrl === undefined
    ? "https://chat-app-oi25.onrender.com"
    : configuredUrl.replace(/\/$/, "");
export const api = axios.create({
  baseURL: `${serverUrl}/api`,
  timeout: 30000,
  withCredentials: true,
});
let tokenProvider = null;
export function setTokenProvider(provider) {
  tokenProvider = provider;
}
export async function getSessionToken() {
  return tokenProvider?.();
}
api.interceptors.request.use(async (config) => {
  const token = await getSessionToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export function errorMessage(error) {
  if (!navigator.onLine) return "You’re offline. Reconnect and try again.";
  if (error?.response?.status === 401)
    return "Your session expired. Please sign in again.";
  if (error?.code === "ECONNABORTED")
    return "The server is taking a little longer. Please try again.";
  return (
    error?.response?.data?.message || "Couldn’t connect. Please try again."
  );
}
