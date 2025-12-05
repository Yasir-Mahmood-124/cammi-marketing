// src/redux/services/common/getUnansweredQuestionsApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

interface GetUnansweredQuestionsResponse {
  body: any;
  gtm_exists: boolean;
  missing_questions: string[];
}

export const getUnansweredQuestionsApi = createApi({
  reducerPath: "getUnansweredQuestionsApi",
  baseQuery: baseApiQuery, // ⭐ Using centralized base query
  keepUnusedDataFor: 0, // Don't cache data globally
  refetchOnMountOrArgChange: true,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  
  endpoints: (builder) => ({
    get_unanswered_questions: builder.query<
      GetUnansweredQuestionsResponse,
      { project_id: string; document_type: string }
    >({
      query: ({ project_id, document_type }) => ({
        url: "/document-generation/get-unanswered-questions",
        method: "GET",
        headers: {
          project_id,
          document_type,
        },
      }),
      keepUnusedDataFor: 0, // Force fresh data at endpoint level
    }),
  }),
});

export const { useGet_unanswered_questionsQuery } = getUnansweredQuestionsApi;