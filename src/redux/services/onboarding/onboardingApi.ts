import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi"; // <-- shared base query

export const onboardingApi = createApi({
  reducerPath: "onboardingApi",
  baseQuery: baseApiQuery, // <-- uses .env base URL + JSON headers
  endpoints: (builder) => ({
    submitAnswer: builder.mutation({
      query: ({ session_id, question, answer }) => ({
        url: "/onboarding/user-onboarding",
        method: "POST",
        body: { session_id, question, answer },
      }),
    }),
  }),
});

export const { useSubmitAnswerMutation } = onboardingApi;