// src/redux/services/credits/credits.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../customBaseQuery";

// 🔹 Define the response type
interface CreditsResponse {
  total_credits: number;
}

// 🔹 Define the request body type
interface CreditsRequest {
  session_id: string;
}

// 🔹 Create the RTK Query API
export const creditsApi = createApi({
  reducerPath: "creditsApi",
  baseQuery: customBaseQuery, // ✅ use central base query
  endpoints: (builder) => ({
    updateTotalCredits: builder.mutation<CreditsResponse, CreditsRequest>({
      query: (body) => ({
        url: "/dashboard/total-credits-update",
        method: "POST",
        body, // headers handled in customBaseQuery
      }),
    }),
  }),
});

// 🔹 Export the hook
export const { useUpdateTotalCreditsMutation } = creditsApi;
