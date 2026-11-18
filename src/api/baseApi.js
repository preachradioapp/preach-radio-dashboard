import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { env } from "../config/env";
import { logout } from "../store/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  timeout: 30000,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

/** Ends the session when the backend rejects the token (expired, password changed, etc.). */
const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const hadToken = Boolean(api.getState().auth.accessToken);
  if (result.error?.status === 401 && hadToken) {
    api.dispatch(logout());
  }
  return result;
};

export const TAGS = Object.freeze({
  Profile: "Profile",
  Meta: "Meta",
  User: "User",
  Creator: "Creator",
  Category: "Category",
  SubCategory: "SubCategory",
  Podcast: "Podcast",
  Album: "Album",
  Banner: "Banner",
  Report: "Report",
  Content: "Content",
  Faq: "Faq",
  Station: "Station",
  Live: "Live",
  Notification: "Notification",
});

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: Object.values(TAGS),
  keepUnusedDataFor: 60,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});

/** Standard tag helpers for paginated `{ meta, result }` lists. */
export const listTags = (type) => (res) => [
  ...(res?.result ?? []).map(({ _id }) => ({ type, id: _id })),
  { type, id: "LIST" },
];

/** Unwraps the `{ success, message, data }` envelope while keeping `message` for toasts. */
export const unwrapData = (response) => response?.data;
