// src/redux/services/linkedin/imageGeneration.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

// Define image type
export interface ImageData {
  mime_type: string;
  data: string; // base64 data URL
}

// Define request type
export interface ImageGenerationRequest {
  session_id: string;
  prompt?: string;
  images?: ImageData[];
}

// Define response type
export interface ImageGenerationResponse {
  session_id: string;
  remaining_credits: number;
  image_base64: string;
}

export const imageGenerationApi = createApi({
  reducerPath: "imageGenerationApi",
  baseQuery: baseApiQuery,
  endpoints: (builder) => ({
    generateImage: builder.mutation<
      ImageGenerationResponse,
      ImageGenerationRequest
    >({
      query: (body) => ({
        url: "/ai-generation/image-generation",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGenerateImageMutation } = imageGenerationApi;
