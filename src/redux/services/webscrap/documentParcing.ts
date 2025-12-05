// src/redux/services/webscrap/documentParcing.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

// ✅ Define request body type
interface DocumentParsingRequest {
  session_id: string;
  filename: string;
  project_id: string;
}

// ✅ Define response type
interface DocumentParsingResponse {
  upload_url: string;
  s3_path: string;
  file_name: string;
  session_id: string;
}

// ✅ Create API slice using shared baseApiQuery
export const documentParsingApi = createApi({
  reducerPath: "documentParsingApi",
  baseQuery: baseApiQuery,
  endpoints: (builder) => ({
    // POST request to frontend-to-s3 endpoint
    getUploadUrl: builder.mutation<DocumentParsingResponse, DocumentParsingRequest>({
      query: (body) => ({
        url: "/brandsetup/upload", // this will be appended to BASE_URL from baseApiQuery
        method: "POST",
        body,
      }),
    }),
  }),
});

// ✅ Export hooks for usage in components
export const { useGetUploadUrlMutation } = documentParsingApi;
