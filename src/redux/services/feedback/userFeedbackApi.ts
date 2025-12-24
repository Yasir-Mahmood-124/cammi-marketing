// src/redux/services/feedback/userFeedbackApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi"; // import centralized base query

interface FeedbackRequest {
  session_id: string;
  questions: string[];
  answers: string[];
}

interface FeedbackResponse {
  message?: string;
  status?: string;
  [key: string]: any; // flexible for unknown response shape
}

export const userFeedbackApi = createApi({
  reducerPath: "userFeedbackApi",
  baseQuery: baseApiQuery, // use centralized baseApiQuery
  endpoints: (builder) => ({
    sendUserFeedback: builder.mutation<FeedbackResponse, FeedbackRequest>({
      query: (feedbackData) => ({
        url: "/feedback/customer-feedback", // endpoint path
        method: "POST",
        body: feedbackData, // body remains the same
      }),
    }),
  }),
});

export const { useSendUserFeedbackMutation } = userFeedbackApi;
