// src/redux/services/document/getSpecificDocument.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../customBaseQuery";

export interface GetSpecificDocumentRequest {
  user_id: string;
  document_type_uuid: string;
}

export interface GetSpecificDocumentResponse {
  user_id: string;
  document_type_uuid: string;
  document_url: string;
  document_base64: string;
}

export const getSpecificDocumentApi = createApi({
  reducerPath: "getSpecificDocumentApi",
  baseQuery: customBaseQuery, // ✅ use central base query
  endpoints: (builder) => ({
    getSpecificDocument: builder.mutation<
      GetSpecificDocumentResponse,
      GetSpecificDocumentRequest
    >({
      query: (body) => ({
        url: "/dashboard/view-specific-documents",
        method: "POST",
        body, // headers handled in customBaseQuery
      }),
    }),
  }),
});

export const { useGetSpecificDocumentMutation } = getSpecificDocumentApi;
