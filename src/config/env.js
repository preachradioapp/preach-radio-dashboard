/**
 * Centralised runtime configuration.
 * Values come from Vite env variables (see `.env.example`) with safe fallbacks
 * so the existing production deployment keeps working without new secrets.
 */
const trimSlash = (value) => value.replace(/\/+$/, "");

export const env = Object.freeze({
  apiBaseUrl: trimSlash(
    import.meta.env.VITE_API_BASE_URL || "https://api.preachradio.com"
  ),
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  appName: import.meta.env.VITE_APP_NAME || "Preach Radio",
  isDev: import.meta.env.DEV,
});
