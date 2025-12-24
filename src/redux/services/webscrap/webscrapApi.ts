// src/redux/services/webscrap/webscrapApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseApiQuery } from '../baseApi';

interface WebScrapRequest {
  session_id: string;
  project_id: string;
  website: string;
}

interface WebScrapResponse {
  website: string;
  project_id: string;
  user_id: string;
  email: string;
  s3_url: string;
  model_id: string;
}

// ✅ Create API slice using shared baseApiQuery but with custom baseUrl
export const webscrapApi = createApi({
  reducerPath: 'webscrapApi',
  baseQuery: baseApiQuery, // shared base query
  endpoints: (builder) => ({
    postWebScrap: builder.mutation<WebScrapResponse, WebScrapRequest>({
      query: (body) => ({
        url: '/brandsetup/web-scraping', // empty because baseUrl already points to Lambda URL
        method: 'POST',
        body,
      }),
    }),
  }),
});

// ✅ Export hooks for usage in components
export const { usePostWebScrapMutation } = webscrapApi;
