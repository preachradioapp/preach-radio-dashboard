import { toQueryString } from "../lib/formData";
import { baseApi, listTags, TAGS, unwrapData } from "./baseApi";

/** Dashboard analytics, reports, notifications and CMS content (terms/privacy/about/FAQ/contact). */
export const CONTENT_PAGES = {
  terms: { get: "/manage/get-terms-conditions", save: "/manage/add-terms-conditions", label: "Terms & Conditions" },
  privacy: { get: "/manage/get-privacy-policy", save: "/manage/add-privacy-policy", label: "Privacy Policy" },
  about: { get: "/manage/get-about-us", save: "/manage/add-about-us", label: "About Us" },
};

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardStats: build.query({
      query: () => "/meta/get-dashboard-meta-data",
      transformResponse: unwrapData,
      providesTags: [TAGS.Meta],
    }),
    getGrowthChart: build.query({
      query: (year) => `/meta/user-chart-data${toQueryString({ year })}`,
      transformResponse: unwrapData,
      providesTags: [TAGS.Meta],
    }),

    getReports: build.query({
      query: (params) => `/report/all-reports${toQueryString(params)}`,
      transformResponse: unwrapData,
      providesTags: listTags(TAGS.Report),
    }),

    getNotifications: build.query({
      query: (params) => `/notification/get-notifications${toQueryString(params)}`,
      transformResponse: unwrapData,
      providesTags: listTags(TAGS.Notification),
    }),
    markNotificationsSeen: build.mutation({
      query: () => ({ url: "/notification/see-notifications", method: "PATCH" }),
      invalidatesTags: [{ type: TAGS.Notification, id: "LIST" }],
    }),
    deleteNotification: build.mutation({
      query: (id) => ({ url: `/notification/delete-notification/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: TAGS.Notification, id: "LIST" }],
    }),

    getContentPage: build.query({
      query: (key) => CONTENT_PAGES[key].get,
      transformResponse: unwrapData,
      providesTags: (r, e, key) => [{ type: TAGS.Content, id: key }],
    }),
    saveContentPage: build.mutation({
      query: ({ key, description }) => ({ url: CONTENT_PAGES[key].save, method: "POST", body: { description } }),
      invalidatesTags: (r, e, { key }) => [{ type: TAGS.Content, id: key }],
    }),

    getFaqs: build.query({
      query: () => "/manage/get-faq",
      transformResponse: unwrapData,
      providesTags: [TAGS.Faq],
    }),
    createFaq: build.mutation({
      query: (body) => ({ url: "/manage/add-faq", method: "POST", body }),
      invalidatesTags: [TAGS.Faq],
    }),
    updateFaq: build.mutation({
      query: ({ id, ...body }) => ({ url: `/manage/edit-faq/${id}`, method: "PATCH", body }),
      invalidatesTags: [TAGS.Faq],
    }),
    deleteFaq: build.mutation({
      query: (id) => ({ url: `/manage/delete-faq/${id}`, method: "DELETE" }),
      invalidatesTags: [TAGS.Faq],
    }),

    getContactInfo: build.query({
      query: () => "/manage/get-contact-us",
      transformResponse: unwrapData,
      providesTags: [{ type: TAGS.Content, id: "contact" }],
    }),
    saveContactInfo: build.mutation({
      // backend `add-contact-us` creates a new document each time, so edit when one exists
      query: ({ id, ...body }) =>
        id
          ? { url: `/manage/edit-contact-us/${id}`, method: "PATCH", body }
          : { url: "/manage/add-contact-us", method: "POST", body },
      invalidatesTags: [{ type: TAGS.Content, id: "contact" }],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetGrowthChartQuery,
  useGetReportsQuery,
  useGetNotificationsQuery,
  useMarkNotificationsSeenMutation,
  useDeleteNotificationMutation,
  useGetContentPageQuery,
  useSaveContentPageMutation,
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useGetContactInfoQuery,
  useSaveContactInfoMutation,
} = adminApi;
