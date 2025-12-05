import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";
import { LoginResponse, LoginRequest } from "@/types/auth";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseApiQuery,   // ⬅️ shared base query used here
  endpoints: (builder) => ({
    register: builder.mutation<
      { message: string },
      { firstName: string; lastName: string; email: string; password: string }
    >({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),

    verifyEmail: builder.mutation<
      {
        message: string;
        user: {
          id: string;
          email: string;
          firstName: string;
          lastName: string;
        };
      },
      { email: string; code: string }
    >({
      query: (body) => ({ url: "/auth/verify-email", method: "POST", body }),
    }),

    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),

    googleLogin: builder.mutation<LoginResponse, { tokenId: string }>({
      query: (body) => ({
        url: "/auth/google-login",
        method: "POST",
        body,
      }),
    }),

    logout: builder.mutation<{ message: string }, { token: string }>({
      query: ({ token }) => ({
        url: "/auth/logout",
        method: "POST",
        body: { token },
      }),
    }),

    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),

    resetPassword: builder.mutation<
      { message: string },
      {
        email: string;
        code: string;
        newPassword: string;
        confirmPassword: string;
      }
    >({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),

    verifyCode: builder.mutation<
      { message: string },
      { email: string; code: string }
    >({
      query: (body) => ({ url: "/auth/verify-code", method: "POST", body }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyEmailMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyCodeMutation,
  useGoogleLoginMutation,
} = authApi;
