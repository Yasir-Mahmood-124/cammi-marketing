// src/redux/document/editDocumentNameApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

export interface EditDocumentNameRequest {
  user_id: string;
  document_type_uuid: string;
  document_name: string;
}

export interface EditDocumentNameResponse {
  message: string;
  updated_item: {
    user_id: string;
    document_type_uuid: string;
    old_document_name: string;
    new_document_name: string;
    old_document_url: string;
    new_document_url: string;
  };
}

export const editDocumentNameApi = createApi({
  reducerPath: "editDocumentNameApi",
  baseQuery: baseApiQuery,   // ⭐ Using centralized base query
  endpoints: (builder) => ({
    editDocumentName: builder.mutation<
      EditDocumentNameResponse,
      EditDocumentNameRequest
    >({
      query: (body) => ({
        url: "/dashboard/edit-document-name",
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const { useEditDocumentNameMutation } = editDocumentNameApi;
