// @vitest-environment node
// (Node environment: jsdom's AbortSignal is incompatible with Node's native Request used by fetchBaseQuery.)
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer, { setCredentials } from "../store/authSlice";
import { baseApi } from "./baseApi";
import { peopleApi } from "./peopleApi";
import { mediaApi } from "./mediaApi";

const makeStore = () =>
  configureStore({
    reducer: combineReducers({ auth: authReducer, [baseApi.reducerPath]: baseApi.reducer }),
    middleware: (gdm) => gdm({ serializableCheck: false }).concat(baseApi.middleware),
  });

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("API layer", () => {
  let fetchMock;
  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("sends a Bearer token and unwraps paginated data", async () => {
    const store = makeStore();
    store.dispatch(setCredentials({ accessToken: "tok123", role: "superAdmin" }));
    fetchMock.mockResolvedValueOnce(json(200, { success: true, data: { meta: { total: 1 }, result: [{ _id: "u1" }] } }));

    const res = await store.dispatch(peopleApi.endpoints.getUsers.initiate({ page: 2, limit: 10, searchTerm: "" }));

    const request = fetchMock.mock.calls[0][0];
    expect(request.headers.get("Authorization")).toBe("Bearer tok123");
    expect(request.url).toMatch(/\/normal-user\/get-all-user\?page=2&limit=10$/);
    expect(res.data).toEqual({ meta: { total: 1 }, result: [{ _id: "u1" }] });
  });

  it("logs out when the server rejects the token (401)", async () => {
    const store = makeStore();
    store.dispatch(setCredentials({ accessToken: "expired", role: "superAdmin" }));
    fetchMock.mockResolvedValueOnce(json(401, { success: false, message: "Token is expired" }));

    await store.dispatch(peopleApi.endpoints.getUsers.initiate({}));
    expect(store.getState().auth.accessToken).toBeNull();
  });

  it("keeps the session on 403 (forbidden ≠ signed out)", async () => {
    const store = makeStore();
    store.dispatch(setCredentials({ accessToken: "ok", role: "admin" }));
    fetchMock.mockResolvedValueOnce(json(403, { success: false, message: "You do not have permission" }));

    const res = await store.dispatch(peopleApi.endpoints.getUsers.initiate({}));
    expect(res.error.status).toBe(403);
    expect(store.getState().auth.accessToken).toBe("ok");
  });

  it("uses the real delete endpoint and refetches the podcast list afterwards", async () => {
    const store = makeStore();
    store.dispatch(setCredentials({ accessToken: "t", role: "superAdmin" }));
    fetchMock.mockImplementation(async (req) =>
      req.method === "DELETE"
        ? json(200, { success: true, message: "Podcast deleted" })
        : json(200, { success: true, data: { meta: { total: 0 }, result: [] } })
    );

    const sub = store.dispatch(mediaApi.endpoints.getPodcasts.initiate({ page: 1, limit: 12 }));
    await sub;
    await store.dispatch(mediaApi.endpoints.deletePodcast.initiate("p1"));
    await vi.waitFor(() => expect(fetchMock.mock.calls.filter(([r]) => r.method === "GET")).toHaveLength(2));

    const del = fetchMock.mock.calls.find(([r]) => r.method === "DELETE")[0];
    expect(del.url).toMatch(/\/podcast\/delete-podcast\/p1$/);
    sub.unsubscribe();
  });
});
