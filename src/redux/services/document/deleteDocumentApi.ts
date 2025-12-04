// src/redux/services/document/deleteDocumentApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../customBaseQuery";

export interface DeleteDocumentRequest {
  user_id: string;
  document_type_uuid: string;
}

export interface DeleteDocumentResponse {
  message: string;
  deleted_item: {
    user_id: string;
    document_type_uuid: string;
    document_name: string;
    document_url: string;
  };
}

export const deleteDocumentApi = createApi({
  reducerPath: "deleteDocumentApi",
  baseQuery: customBaseQuery, // ✅ use shared base query
  endpoints: (builder) => ({
    deleteDocument: builder.mutation<
      DeleteDocumentResponse,
      DeleteDocumentRequest
    >({
      query: (body) => ({
        url: `/dashboard/delete-document`,
        method: "DELETE",
        body,
      }),
    }),
  }),
});

export const { useDeleteDocumentMutation } = deleteDocumentApi;
