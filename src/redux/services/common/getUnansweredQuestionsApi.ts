// src/redux/services/common/getUnansweredQuestionsApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../customBaseQuery";

interface GetUnansweredQuestionsResponse {
  missing_questions: string[];
}

export const getUnansweredQuestionsApi = createApi({
  reducerPath: "getUnansweredQuestionsApi",
  baseQuery: async (args, api, extraOptions) => {
    const modifiedBaseQuery = customBaseQuery;

    // Merge per-request headers
    if (typeof args === "object") {
      const { project_id, document_type } = args as any;
      const headers: Record<string, string> = {};
      if (project_id) headers["project_id"] = project_id;
      if (document_type) headers["document_type"] = document_type;

      if ("headers" in args) {
        args.headers = { ...headers, ...args.headers };
      } else {
        (args as any).headers = headers;
      }
    }

    return modifiedBaseQuery(args, api, extraOptions);
  },
  endpoints: (builder) => ({
    get_unanswered_questions: builder.query<
      GetUnansweredQuestionsResponse,
      { project_id: string; document_type: string }
    >({
      query: ({ project_id, document_type }) => ({
        url: "/get-unanswered-questions",
        method: "GET",
        // headers will be injected in baseQuery
        project_id,
        document_type,
      }),
    }),
  }),
});

export const { useGet_unanswered_questionsQuery } = getUnansweredQuestionsApi;
