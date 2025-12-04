// src/redux/services/common/addQuestion.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { customBaseQuery } from "../customBaseQuery";

interface AddQuestionRequest {
  question_text: string;
  answer_text: string;
  document_type?: string;
}

interface AddQuestionResponse {
  message: string;
  question_id: string;
  document_type?: string;
}

export const addQuestionApi = createApi({
  reducerPath: "addQuestionApi",
  baseQuery: async (args, api, extraOptions) => {
    // Extend the central customBaseQuery
    const modifiedBaseQuery = customBaseQuery;

    // Get default headers from central query
    if (typeof args === "object" && "headers" in args) {
      args.headers = args.headers || {};
    }

    // Add session_id and project_id for this API
    const token = Cookies.get("token");
    const project = localStorage.getItem("currentProject");

    const headers: Record<string, string> = {};
    if (token) headers["session_id"] = token;
    if (project) {
      try {
        const parsed = JSON.parse(project);
        if (parsed.project_id) headers["project_id"] = parsed.project_id;
      } catch (err) {
        console.error("Error parsing currentProject from localStorage:", err);
      }
    }

    // Merge headers into args
    if (typeof args === "object" && "headers" in args) {
      args.headers = { ...headers, ...args.headers };
    }

    return modifiedBaseQuery(args, api, extraOptions);
  },
  endpoints: (builder) => ({
    addQuestion: builder.mutation<AddQuestionResponse, AddQuestionRequest>({
      query: (body) => ({
        url: "/add-question",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useAddQuestionMutation } = addQuestionApi;
