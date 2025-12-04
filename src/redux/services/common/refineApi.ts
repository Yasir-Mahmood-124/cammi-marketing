// redux/services/common/refineApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../customBaseQuery";

interface RefineRequest {
  prompt: string;
  session_id?: string;
}

interface RefineResponse {
  message: string;
  session_id?: string;
  groq_response: string;
}

export const refineApi = createApi({
  reducerPath: "refineApi",
  baseQuery: async (args, api, extraOptions) => {
    const modifiedBaseQuery = customBaseQuery;

    // Merge per-request headers if session_id is provided
    if (typeof args === "object") {
      const { session_id } = args as any;
      const headers: Record<string, string> = {};
      if (session_id) headers["session_id"] = session_id;

      if ("headers" in args) {
        args.headers = { ...headers, ...args.headers };
      } else {
        (args as any).headers = headers;
      }
    }

    return modifiedBaseQuery(args, api, extraOptions);
  },
  endpoints: (builder) => ({
    refine: builder.mutation<RefineResponse, RefineRequest>({
      query: (body) => ({
        url: "refine", // baseUrl already has trailing /
        method: "POST",
        body,
        // headers will be injected in baseQuery
      }),
    }),
  }),
});

export const { useRefineMutation } = refineApi;
