// src/redux/services/help/helpApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

/**
 * Request payload type
 */
export interface EmailSupportRequest {
  session_id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
}

/**
 * API response type (adjust if backend sends more fields)
 */
export interface EmailSupportResponse {
  success: boolean;
  message: string;
}

export const helpApi = createApi({
  reducerPath: "helpApi",
  baseQuery: baseApiQuery,
  endpoints: (builder) => ({
    sendEmailSupport: builder.mutation<
      EmailSupportResponse,
      EmailSupportRequest
    >({
      query: (payload) => ({
        url: "/support/email-support",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useSendEmailSupportMutation,
} = helpApi;
