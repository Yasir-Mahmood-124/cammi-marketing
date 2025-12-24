// redux/services/common/refineApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

interface RefineRequest {
  prompt: string;
  session_id?: string;
}

interface RefineResponse {
  message: string;
  session_id?: string;
  groq_response: string;
}

export const refineApi = createApi({
  reducerPath: "refineApi",
  baseQuery: baseApiQuery, // use shared base query
  endpoints: (builder) => ({
    refine: builder.mutation<RefineResponse, RefineRequest>({
      query: (body) => ({
        url: "/document-generation/user-input-enhancement", // endpoint relative to baseUrl
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useRefineMutation } = refineApi;
