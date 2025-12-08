// src/redux/services/common/send_review.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

// Define the request body type
export interface SendReviewRequest {
  session_id: string;
  project_id: string;
  document_type: string;
  document_text: string;
}

// Define the response type
export interface SendReviewResponse {
  message: string;
  document_type_uuid: string;
  s3_url: string;
}

export const sendReviewApi = createApi({
  reducerPath: "sendReviewApi",
  baseQuery: baseApiQuery, // ✅ Using shared baseApiQuery
  endpoints: (builder) => ({
    sendReviewDocument: builder.mutation<
      SendReviewResponse,
      SendReviewRequest
    >({
      query: (body) => ({
        url: "/common-lambda/add-review-documents",
        method: "POST",
        body,
      }),
    }),
  }),
});

// Export the mutation hook
export const { useSendReviewDocumentMutation } = sendReviewApi;
