import { toQueryString } from "../lib/formData";
import { baseApi, listTags, TAGS, unwrapData } from "./baseApi";

/** Podcasts, reels, station and live room. */
export const mediaApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPodcasts: build.query({
      query: (params) => `/podcast/all${toQueryString(params)}`,
      transformResponse: unwrapData,
      providesTags: listTags(TAGS.Podcast),
    }),
    getPodcast: build.query({
      query: (id) => `/podcast/get-single/${id}`,
      transformResponse: unwrapData,
      providesTags: (r, e, id) => [{ type: TAGS.Podcast, id }],
    }),
    /** JSON body; media must already be uploaded via a presigned URL. */
    createPodcast: build.mutation({
      query: (body) => ({ url: "/podcast/create", method: "POST", body }),
      invalidatesTags: [{ type: TAGS.Podcast, id: "LIST" }, { type: TAGS.Album, id: "LIST" }, TAGS.Meta],
    }),
    /** Multipart: `data` JSON (changed fields only) + optional `podcast_cover` file. */
    updatePodcast: build.mutation({
      query: ({ id, formData }) => ({ url: `/podcast/update/${id}`, method: "PATCH", body: formData }),
      invalidatesTags: (r, e, { id }) => [{ type: TAGS.Podcast, id }, { type: TAGS.Podcast, id: "LIST" }],
    }),
    /** Moderation: hide a podcast from the apps without deleting it, or publish it again. */
    setPodcastStatus: build.mutation({
      query: ({ id, status }) => ({ url: `/podcast/status/${id}`, method: "PATCH", body: { status } }),
      invalidatesTags: (r, e, { id }) => [{ type: TAGS.Podcast, id }, { type: TAGS.Podcast, id: "LIST" }],
    }),
    /** Admin: convert (or re-convert) a podcast's media to HLS — e.g. after a failure. */
    reprocessPodcast: build.mutation({
      query: (id) => ({ url: `/podcast/reprocess/${id}`, method: "POST" }),
      transformResponse: unwrapData,
      invalidatesTags: (r, e, id) => [{ type: TAGS.Podcast, id }, { type: TAGS.Podcast, id: "LIST" }],
    }),
    deletePodcast: build.mutation({
      query: (id) => ({ url: `/podcast/delete-podcast/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: TAGS.Podcast, id: "LIST" }, { type: TAGS.Album, id: "LIST" }, TAGS.Meta],
    }),

    /** Raw (non-enveloped) response: { uploadURL, fileName }. URL expires in 60s. */
    getPresignedUrl: build.mutation({
      query: (body) => ({ url: "/generate-presigned-url", method: "POST", body }),
    }),

    getStation: build.query({
      query: () => "/station/get-station",
      transformResponse: unwrapData,
      providesTags: [TAGS.Station],
    }),
    updateStation: build.mutation({
      query: (formData) => ({ url: "/station/update", method: "PATCH", body: formData }),
      invalidatesTags: [TAGS.Station],
    }),

    getLiveRoom: build.query({
      query: () => "/live-stream/get-my-live-room",
      transformResponse: unwrapData,
      providesTags: [TAGS.Live],
    }),
    createLiveRoom: build.mutation({
      query: () => ({ url: "/live-stream/create-streaming-room", method: "POST" }),
      invalidatesTags: [TAGS.Live],
    }),
  }),
});

export const {
  useGetPodcastsQuery,
  useGetPodcastQuery,
  useCreatePodcastMutation,
  useUpdatePodcastMutation,
  useDeletePodcastMutation,
  useSetPodcastStatusMutation,
  useReprocessPodcastMutation,
  useGetPresignedUrlMutation,
  useGetStationQuery,
  useUpdateStationMutation,
  useGetLiveRoomQuery,
  useCreateLiveRoomMutation,
} = mediaApi;
