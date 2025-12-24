// src/redux/services/auth/googleApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi"; // <-- use shared base api

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
  baseQuery: baseApiQuery,   // <-- shared baseQuery (json + baseUrl)
  endpoints: (builder) => ({
    googleLogin: builder.query<GoogleLoginResponse, void>({
      query: () => "/auth/google-login",
    }),
  }),
});

export const { useLazyGoogleLoginQuery } = googleApi;
