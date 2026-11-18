import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer, { logout } from "./authSlice";
import { baseApi } from "../api/baseApi";

const rootReducer = combineReducers({
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

/** Clearing the whole API cache on logout prevents one admin's data leaking into the next session. */
const appReducer = (state, action) => {
  if (action.type === logout.type) {
    return rootReducer({ ...state, [baseApi.reducerPath]: undefined }, action);
  }
  return rootReducer(state, action);
};

const persistedReducer = persistReducer(
  { key: "preach-admin", version: 1, storage, whitelist: ["auth"] },
  appReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }).concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
});

export const persistor = persistStore(store);

// Refetch on window focus / reconnect for queries that opt in.
setupListeners(store.dispatch);
