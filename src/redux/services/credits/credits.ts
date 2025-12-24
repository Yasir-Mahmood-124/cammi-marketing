import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi"; // <-- shared base query

// Response type
interface CreditsResponse {
  total_credits: number;
}

// Request body type
interface CreditsRequest {
  session_id: string;
}

export const creditsApi = createApi({
  reducerPath: "creditsApi",
  baseQuery: baseApiQuery,   // <-- shared baseQuery (env URL + JSON headers)
  endpoints: (builder) => ({
    updateTotalCredits: builder.mutation<CreditsResponse, CreditsRequest>({
      query: (body) => ({
        url: "/dashboard/total-credits-update",
        method: "POST",
        body,
      }),
    }),
  }),
});

// Hook
export const { useUpdateTotalCreditsMutation } = creditsApi;
