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

export function attachmentErrorMessage(error) {
  if (!navigator.onLine)
    return "The connection was lost. Your attachment is still here; reconnect and retry the upload.";
  if (error?.response?.status === 401)
    return "Your session expired. Sign in again to send attachments.";
  if (error?.code === "ECONNABORTED" || error?.response?.status === 504)
    return "We couldn’t confirm the upload in time. Retry to check whether your message was saved before uploading it again.";
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.status === 413)
    return "This file is too large for the server. Compress it or choose a smaller file.";
  if (error?.response?.status === 429)
    return "Too many uploads at once. Wait a moment, then retry.";
  return "We couldn’t confirm your upload. Check your connection and retry; your attachment is still here.";
}
