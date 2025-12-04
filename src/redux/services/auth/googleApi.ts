// redux/services/auth/googleApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../customBaseQuery"; // <- use your custom base query

interface GoogleLoginResponse {
  user: string;
  login_url: string;
  state: string;
  session_id?: string;
  email: string;
  name: string;
  access_token?: string;
  id?: string;
}

export const googleApi = createApi({
  reducerPath: "googleApi",
  baseQuery: customBaseQuery, // ✅ use the custom base query
  endpoints: (builder) => ({
    googleLogin: builder.query<GoogleLoginResponse, void>({
      query: () => ({
        url: "/auth/google-login", // relative path only
        method: "GET", // optional, GET is default for queries
      }),
    }),
  }),
});

export const { useLazyGoogleLoginQuery } = googleApi;
