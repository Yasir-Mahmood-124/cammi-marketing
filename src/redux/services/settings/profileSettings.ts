// src/redux/services/settings/profileSettings.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../customBaseQuery";

// 🔹 Define request body type
export interface EditProfileRequest {
  session_id: string;
  name: string;
  picture: string; // base64 string
}

// 🔹 Define response type
export interface EditProfileResponse {
  message?: string;
  success?: boolean;
  [key: string]: any; // handle extra unknown keys
}

// 🔹 Create the RTK Query API
export const profileSettingsApi = createApi({
  reducerPath: "profileSettingsApi",
  baseQuery: customBaseQuery, // ✅ use central base query
  endpoints: (builder) => ({
    editProfile: builder.mutation<EditProfileResponse, EditProfileRequest>({
      query: (body) => ({
        url: "/profile/edit-profile",
        method: "POST",
        body, // headers already handled in customBaseQuery
      }),
    }),
  }),
});

// 🔹 Export hooks
export const { useEditProfileMutation } = profileSettingsApi;
