// redux/services/reviewApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { customBaseQuery } from "../customBaseQuery"; // import your custom base query

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
  baseQuery: customBaseQuery, // use custom base query
  endpoints: (builder) => ({
    getReviews: builder.mutation<Review[], void>({
      // Using mutation for POST
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
