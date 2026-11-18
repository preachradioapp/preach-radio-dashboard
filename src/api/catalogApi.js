import { toQueryString } from "../lib/formData";
import { baseApi, listTags, TAGS, unwrapData } from "./baseApi";

/** Categories, sub-categories, albums and banners — all multipart (`data` JSON + file field). */
export const catalogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Categories ------------------------------------------------------------
    getCategories: build.query({
      query: (params) => `/category/all-categories${toQueryString(params)}`,
      transformResponse: unwrapData,
      providesTags: listTags(TAGS.Category),
    }),
    createCategory: build.mutation({
      query: (formData) => ({ url: "/category/create-category", method: "POST", body: formData }),
      invalidatesTags: [{ type: TAGS.Category, id: "LIST" }, TAGS.Meta],
    }),
    updateCategory: build.mutation({
      query: ({ id, formData }) => ({ url: `/category/update-category/${id}`, method: "PATCH", body: formData }),
      invalidatesTags: (r, e, { id }) => [{ type: TAGS.Category, id }, { type: TAGS.Category, id: "LIST" }],
    }),
    deleteCategory: build.mutation({
      query: (id) => ({ url: `/category/delete-category/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: TAGS.Category, id: "LIST" }, { type: TAGS.SubCategory, id: "LIST" }, TAGS.Meta],
    }),

    // Sub-categories --------------------------------------------------------
    getSubCategories: build.query({
      query: (params) => `/sub-category/all-subcategories${toQueryString(params)}`,
      transformResponse: unwrapData,
      providesTags: listTags(TAGS.SubCategory),
    }),
    createSubCategory: build.mutation({
      query: (formData) => ({ url: "/sub-category/create", method: "POST", body: formData }),
      invalidatesTags: [{ type: TAGS.SubCategory, id: "LIST" }, { type: TAGS.Category, id: "LIST" }],
    }),
    updateSubCategory: build.mutation({
      query: ({ id, formData }) => ({ url: `/sub-category/update/${id}`, method: "PATCH", body: formData }),
      invalidatesTags: [{ type: TAGS.SubCategory, id: "LIST" }, { type: TAGS.Category, id: "LIST" }],
    }),
    deleteSubCategory: build.mutation({
      query: (id) => ({ url: `/sub-category/delete/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: TAGS.SubCategory, id: "LIST" }, { type: TAGS.Category, id: "LIST" }],
    }),

    // Albums ----------------------------------------------------------------
    getAlbums: build.query({
      query: (params) => `/album/all-albums${toQueryString(params)}`,
      transformResponse: unwrapData,
      providesTags: listTags(TAGS.Album),
    }),
    getAlbum: build.query({
      query: (id) => `/album/get-single/${id}`,
      transformResponse: unwrapData,
      providesTags: (r, e, id) => [{ type: TAGS.Album, id }],
    }),
    createAlbum: build.mutation({
      query: (formData) => ({ url: "/album/create", method: "POST", body: formData }),
      invalidatesTags: [{ type: TAGS.Album, id: "LIST" }, TAGS.Meta],
    }),
    updateAlbum: build.mutation({
      query: ({ id, formData }) => ({ url: `/album/update/${id}`, method: "PATCH", body: formData }),
      invalidatesTags: (r, e, { id }) => [{ type: TAGS.Album, id }, { type: TAGS.Album, id: "LIST" }],
    }),
    deleteAlbum: build.mutation({
      query: (id) => ({ url: `/album/delete/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: TAGS.Album, id: "LIST" }, TAGS.Meta],
    }),
    removePodcastFromAlbum: build.mutation({
      query: ({ albumId, podcastId }) => ({ url: `/album/remove-podcast/${albumId}/${podcastId}`, method: "DELETE" }),
      invalidatesTags: (r, e, { albumId }) => [{ type: TAGS.Album, id: albumId }, { type: TAGS.Album, id: "LIST" }],
    }),

    // Banners ---------------------------------------------------------------
    getBanners: build.query({
      query: (params) => `/banner/get-all${toQueryString(params)}`,
      transformResponse: unwrapData,
      providesTags: listTags(TAGS.Banner),
    }),
    createBanner: build.mutation({
      query: (formData) => ({ url: "/banner/create", method: "POST", body: formData }),
      invalidatesTags: [{ type: TAGS.Banner, id: "LIST" }],
    }),
    updateBanner: build.mutation({
      query: ({ id, formData }) => ({ url: `/banner/update/${id}`, method: "PATCH", body: formData }),
      invalidatesTags: [{ type: TAGS.Banner, id: "LIST" }],
    }),
    deleteBanner: build.mutation({
      query: (id) => ({ url: `/banner/delete/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: TAGS.Banner, id: "LIST" }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useGetAlbumsQuery,
  useGetAlbumQuery,
  useCreateAlbumMutation,
  useUpdateAlbumMutation,
  useDeleteAlbumMutation,
  useRemovePodcastFromAlbumMutation,
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = catalogApi;
