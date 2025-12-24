// redux/services/linkedin/linkedinPostApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

export interface LinkedInPostRequest {
  sub: string;
  post_message: string;
  images?: { image: string }[];
}

export interface LinkedInPostResponse {
  success?: boolean;
  message?: string;
  id?: string;
  [key: string]: any;
}

export const linkedinPostApi = createApi({
  reducerPath: "linkedinPostApi",
  baseQuery: baseApiQuery,
  endpoints: (builder) => ({
    createLinkedInPost: builder.mutation<
      LinkedInPostResponse,
      LinkedInPostRequest
    >({
      query: (body) => ({
        url: "/LinkedIn/linkedIn-post",
        method: "POST",
        body,
      }),

      transformResponse: (response: any) => {
        console.log("API Response:", response);
        return response;
      },

      transformErrorResponse: (response: any) => {
        console.error("API Error:", response);
        return response;
      },
    }),
  }),
});

export const { useCreateLinkedInPostMutation } = linkedinPostApi;
