// src/redux/services/review/reviewApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { baseApiQuery } from "../baseApi";

export interface Review {
  id: number;
  DocumentName: string;
  Organization: string;
  Date: string;
  Project: string;
  Status: string;
}

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: baseApiQuery, // ⭐ Using centralized base query
  endpoints: (builder) => ({
    getReviews: builder.mutation<Review[], void>({
      query: () => {
        const sessionId = Cookies.get("token");
        if (!sessionId) {
          console.warn("Session token not found in cookies!");
        }
        return {
          url: "/dashboard/view-review-documents-status",
          method: "POST",
          body: {
            session_id: sessionId,
          },
        };
      },
    }),
  }),
});

export const { useGetReviewsMutation } = reviewApi;
