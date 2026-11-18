import { toQueryString } from "../lib/formData";
import { baseApi, listTags, TAGS, unwrapData } from "./baseApi";

/** App users (NormalUser) and creators. Block/delete act on the linked `User` id (`row.user._id`). */
export const peopleApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query({
      query: (params) => `/normal-user/get-all-user${toQueryString(params)}`,
      transformResponse: unwrapData,
      providesTags: listTags(TAGS.User),
    }),
    getCreators: build.query({
      query: (params) => `/creator/get-all-creators${toQueryString(params)}`,
      transformResponse: unwrapData,
      providesTags: listTags(TAGS.Creator),
    }),
    setCreatorApproval: build.mutation({
      query: ({ id, isApproved }) => ({
        url: `/creator/approve-reject/${id}`,
        method: "PATCH",
        body: { isApproved },
      }),
      invalidatesTags: [{ type: TAGS.Creator, id: "LIST" }, TAGS.Meta],
    }),
    toggleBlock: build.mutation({
      query: (userId) => ({ url: `/user/block-unblock/${userId}`, method: "PATCH" }),
      invalidatesTags: [
        { type: TAGS.User, id: "LIST" },
        { type: TAGS.Creator, id: "LIST" },
      ],
    }),
    deleteAccount: build.mutation({
      query: (userId) => ({ url: `/user/delete-user/${userId}`, method: "DELETE" }),
      invalidatesTags: [{ type: TAGS.User, id: "LIST" }, { type: TAGS.Creator, id: "LIST" }, TAGS.Meta],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetCreatorsQuery,
  useSetCreatorApprovalMutation,
  useToggleBlockMutation,
  useDeleteAccountMutation,
} = peopleApi;
