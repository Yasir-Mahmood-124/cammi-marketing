import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

/* =========================
   Allowed Status Keys
========================= */

export type OnboardingStatusKey =
  | "dashboard_status"
  | "document_preview_status"
  | "final_preview_status"
  | "onboarding_status"
  | "user_input_status";

/* =========================
   Generic Payload Type
========================= */

export type OnboardingStatusPayload = {
  session_id: string;
} & {
  [K in OnboardingStatusKey]?: boolean;
};

/* =========================
   Response Type
========================= */

export interface UpdateOnboardingStatusResponse {
  message: string;
  email: string;
  updated_status: Partial<Record<OnboardingStatusKey, boolean>>;
}

/* =========================
   API Slice
========================= */

export const onboardingStatusApi = createApi({
  reducerPath: "onboardingStatusApi",
  baseQuery: baseApiQuery,
  endpoints: (builder) => ({
    updateOnboardingStatus: builder.mutation<
      UpdateOnboardingStatusResponse,
      OnboardingStatusPayload
    >({
      query: (body) => ({
        url: "/tour/onboarding-tour",
        method: "POST",
        body,
      }),
    }),
  }),
});

/* =========================
   Hooks
========================= */

export const {
  useUpdateOnboardingStatusMutation,
} = onboardingStatusApi;
