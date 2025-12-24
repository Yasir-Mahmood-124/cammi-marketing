// src/redux/services/document/getSpecificDocumentApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

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
  baseQuery: baseApiQuery,   // ⭐ Using your global base API
  endpoints: (builder) => ({
    getSpecificDocument: builder.mutation<
      GetSpecificDocumentResponse,
      GetSpecificDocumentRequest
    >({
      query: (body) => ({
        url: "/dashboard/view-specific-documents",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetSpecificDocumentMutation } = getSpecificDocumentApi;
