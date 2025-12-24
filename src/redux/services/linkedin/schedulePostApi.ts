// redux/services/linkedin/schedulePostApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

export interface SchedulePostRequest {
  sub: string;
  message: string;
  scheduled_time: string;
  images?: { image: string }[];
}

export interface SchedulePostResponse {
  message: string;
  scheduled_time_pkt: string;
  scheduled_time_utc: string;
  schedule_name: string;
  id?: string;
  [key: string]: any;
}

export const schedulePostApi = createApi({
  reducerPath: "schedulePostApi",
  baseQuery: baseApiQuery,
  endpoints: (builder) => ({
    schedulePost: builder.mutation<SchedulePostResponse, SchedulePostRequest>({
      query: (body) => ({
        url: "/LinkedIn/linkedIn-schedule",
        method: "POST",
        body,
      }),

      transformResponse: (response: any) => {
        console.log("Schedule API Response:", response);
        return response;
      },

      transformErrorResponse: (response: any) => {
        console.error("Schedule API Error:", response);
        return response;
      },
    }),
  }),
});

export const { useSchedulePostMutation } = schedulePostApi;
