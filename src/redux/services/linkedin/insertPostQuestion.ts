// src/redux/services/linkedin/insertPostQuestion.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

interface InsertPostQuestionRequest {
  organization_id: string;
  post_question: string;
  post_answer: string;
}

interface InsertPostQuestionResponse {
  message: string;
  data: {
    id: string;
    organization_id: string;
    post_question: string;
    post_answer: string;
    created_at: string;
  };
}

export const insertPostQuestionApi = createApi({
  reducerPath: "insertPostQuestionApi",

  // ✅ Using shared base API
  baseQuery: baseApiQuery,

  endpoints: (builder) => ({
    insertPostQuestion: builder.mutation<
      InsertPostQuestionResponse,
      InsertPostQuestionRequest
    >({
      query: (body) => ({
        url: "/schedular/insert-post-question",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useInsertPostQuestionMutation } = insertPostQuestionApi;
