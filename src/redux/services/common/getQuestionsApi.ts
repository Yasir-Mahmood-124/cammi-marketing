// src/redux/services/common/getQuestionsApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

interface Question {
  question_id: string;
  question_text: string;
  answer_text?: string;
  status: string;
  user_id: string;
  project_id: string;
  createdAt: string;
  updatedAt: string;
}

interface GetQuestionsResponse {
  questions: Question[];
  document_type: string;
}

export const getQuestionsApi = createApi({
  reducerPath: "getQuestionsApi",
  baseQuery: baseApiQuery, // ✅ use centralized base query
  endpoints: (builder) => ({
    getQuestions: builder.query<GetQuestionsResponse, { project_id: string; document_type: string }>({
      query: ({ project_id, document_type }) => ({
        url: "/document-generation/get-questions-against-doc-type",
        method: "GET",
        headers: {
          project_id,
          document_type,
        },
      }),
    }),
  }),
});

export const { useGetQuestionsQuery } = getQuestionsApi;