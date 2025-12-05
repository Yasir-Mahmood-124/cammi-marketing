// redux/services/linkedin/aiGenerateApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

interface AIGenerateRequest {
  prompt: string;
  organization_id: string;
  session_id: string;
}

interface AIGenerateResponse {
  message: string;
  final_response: string;
}

export const aiGenerateApi = createApi({
  reducerPath: "aiGenerateApi",
  baseQuery: baseApiQuery,
  endpoints: (builder) => ({
    generateIdea: builder.mutation<AIGenerateResponse, AIGenerateRequest>({
      query: (body) => ({
        url: "/ai-generation/text-generation",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGenerateIdeaMutation } = aiGenerateApi;
