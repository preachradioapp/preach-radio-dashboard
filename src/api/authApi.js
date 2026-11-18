import { baseApi, TAGS, unwrapData } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    forgotPassword: build.mutation({
      query: (body) => ({ url: "/auth/forget-password", method: "POST", body }),
    }),
    verifyResetOtp: build.mutation({
      // backend zod schema requires a numeric resetCode
      query: ({ email, resetCode }) => ({
        url: "/auth/verify-reset-otp",
        method: "POST",
        body: { email, resetCode: Number(resetCode) },
      }),
    }),
    resendResetCode: build.mutation({
      query: (body) => ({ url: "/auth/resend-reset-code", method: "POST", body }),
    }),
    resetPassword: build.mutation({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
    changePassword: build.mutation({
      query: (body) => ({ url: "/auth/change-password", method: "POST", body }),
    }),

    getProfile: build.query({
      query: () => "/user/get-my-profile",
      transformResponse: unwrapData,
      providesTags: [TAGS.Profile],
    }),
    updateProfile: build.mutation({
      query: (formData) => ({ url: "/super-admin/update-profile", method: "PATCH", body: formData }),
      invalidatesTags: [TAGS.Profile],
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResendResetCodeMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;
