// redux/services/common/onboardingApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../customBaseQuery";

export const onboardingApi = createApi({
  reducerPath: "onboardingApi",
  baseQuery: customBaseQuery, // ✅ use central base query
  endpoints: (builder) => ({
    // Submit answer mutation
    submitAnswer: builder.mutation<
      any, // replace with proper response type if available
      { session_id: string; question: string; answer: string }
    >({
      query: ({ session_id, question, answer }) => ({
        url: "/onboarding/user-onboarding", // baseUrl already has trailing /
        method: "POST",
        body: { session_id, question, answer },
      }),
    }),
  }),
});

export const { useSubmitAnswerMutation } = onboardingApi;
