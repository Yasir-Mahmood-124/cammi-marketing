import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi"; // <-- shared base query

// Request body type
export interface EditProfileRequest {
  session_id: string;
  name: string;
  picture: string; // base64 string
}

// Response type
export interface EditProfileResponse {
  message?: string;
  success?: boolean;
  [key: string]: any; // to allow unknown keys
}

export const profileSettingsApi = createApi({
  reducerPath: "profileSettingsApi",
  baseQuery: baseApiQuery, // <-- unified baseQuery for all APIs
  endpoints: (builder) => ({
    editProfile: builder.mutation<
      EditProfileResponse,
      EditProfileRequest
    >({
      query: (body: any) => ({
        url: "/profile/edit-profile",
        method: "POST",
        body,
      }),
    }),
  }),
});

// Export RTK hook
export const { useEditProfileMutation } = profileSettingsApi;
