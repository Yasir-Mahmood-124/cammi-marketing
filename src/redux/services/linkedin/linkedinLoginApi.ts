// redux/services/linkedin/linkedinLoginApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

export const linkedinLoginApi = createApi({
  reducerPath: "linkedinLoginApi",
  baseQuery: baseApiQuery,
  endpoints: (builder) => ({
    getLoginUrl: builder.query<{ login_url: string }, void>({
      query: () => ({
        url: "/LinkedIn/linkedInLogin",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetLoginUrlQuery, useLazyGetLoginUrlQuery } = linkedinLoginApi;
