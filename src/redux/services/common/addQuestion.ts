// src/redux/services/common/addQuestion.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";
import Cookies from "js-cookie";

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

// Wrap baseApiQuery to inject session_id and project_id headers
const addQuestionBaseQuery = async (args: any, api: any, extraOptions: any) => {
  const token = Cookies.get("token");
  const project = localStorage.getItem("currentProject");

  const modifiedArgs = {
    ...args,
    headers: {
      ...(args.headers || {}),
      ...(token ? { session_id: token } : {}),
      ...(project
        ? (() => {
            try {
              const parsed = JSON.parse(project);
              return parsed.project_id ? { project_id: parsed.project_id } : {};
            } catch {
              return {};
            }
          })()
        : {}),
    },
  };

  return baseApiQuery(modifiedArgs, api, extraOptions);
};

export const addQuestionApi = createApi({
  reducerPath: "addQuestionApi",
  baseQuery: addQuestionBaseQuery,
  endpoints: (builder) => ({
    addQuestion: builder.mutation<AddQuestionResponse, AddQuestionRequest>({
      query: (body) => ({
        url: "/document-generation/add-questions", // relative to baseUrl
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useAddQuestionMutation } = addQuestionApi;
