// src/services/document/documentInfoApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../customBaseQuery";

export interface DocumentInfoRequest {
  user_id: string;
  document_type_uuid: string;
}

export interface DocumentInfoResponse {
  organization_name: string;
  project_name: string;
  document_name: string;
  document_type: string;
  created_at: string;
  user_name: string;
}

export const documentInfoApi = createApi({
  reducerPath: "documentInfoApi",
  baseQuery: customBaseQuery, // ✅ use shared base query
  endpoints: (builder) => ({
    documentInfo: builder.mutation<
      DocumentInfoResponse,
      DocumentInfoRequest
    >({
      query: (body) => ({
        url: `/dashboard/document-info`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useDocumentInfoMutation } = documentInfoApi;
