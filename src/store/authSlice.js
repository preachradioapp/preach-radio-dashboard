import { createSlice } from "@reduxjs/toolkit";

/** Roles allowed into the admin dashboard (the login endpoint itself accepts every role). */
export const ADMIN_ROLES = ["superAdmin", "admin"];

const initialState = { accessToken: null, role: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      state.accessToken = payload.accessToken;
      if (payload.role) state.role = payload.role;
    },
    logout: () => initialState,
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectRole = (state) => state.auth.role;
export default authSlice.reducer;
