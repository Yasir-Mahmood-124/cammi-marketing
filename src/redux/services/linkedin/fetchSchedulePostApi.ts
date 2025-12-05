// src/redux/services/fetchSchedulePostApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi"; // import your centralized base query

interface FetchSchedulePostRequest {
  sub: string;
  post_time: string;
}

interface FetchSchedulePostResponse {
  image_keys: string[]; // base64 strings from API
}

export const fetchSchedulePostApi = createApi({
  reducerPath: "fetchSchedulePostApi",
  baseQuery: baseApiQuery, // use centralized baseApiQuery
  endpoints: (builder) => ({
    fetchSchedulePost: builder.mutation<
      FetchSchedulePostResponse,
      FetchSchedulePostRequest
    >({
      query: (body) => ({
        url: "/calendar/fetch-post-linkedin", // endpoint path
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useFetchSchedulePostMutation } = fetchSchedulePostApi;
