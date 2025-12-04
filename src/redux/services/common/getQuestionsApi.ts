// src/redux/services/common/getQuestionsApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../customBaseQuery";

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
  baseQuery: async (args, api, extraOptions) => {
    // Extend central customBaseQuery
    const modifiedBaseQuery = customBaseQuery;

    // Merge headers per request
    if (typeof args === "object" && "headers" in args) {
      args.headers = args.headers || {};
    }

    if (typeof args === "object") {
      const { project_id, document_type } = args as any;
      const headers: Record<string, string> = {};
      if (project_id) headers["project_id"] = project_id;
      if (document_type) headers["document_type"] = document_type;

      args.headers = { ...headers, ...args.headers };
    }

    return modifiedBaseQuery(args, api, extraOptions);
  },
  endpoints: (builder) => ({
    getQuestions: builder.query<GetQuestionsResponse, { project_id: string; document_type: string }>({
      query: ({ project_id, document_type }) => ({
        url: "/get-questions",
        method: "GET",
        // headers will be injected in baseQuery
        project_id,
        document_type,
      }),
    }),
  }),
});

export const { useGetQuestionsQuery } = getQuestionsApi;
