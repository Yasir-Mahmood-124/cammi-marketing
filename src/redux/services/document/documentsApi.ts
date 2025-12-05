// src/redux/services/document/documentsApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi"; 

// Define the Document type based on your API response
export interface UserDocument {
  document_name: string;
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

interface GetDocumentsRequest {
  session_id: string;
}

interface GetDocumentsResponse {
  documents: UserDocument[];
}

export const documentsApi = createApi({
  reducerPath: "documentsApi",
  baseQuery: baseApiQuery,         // ⭐ << using your shared base query
  tagTypes: ["Documents"],
  endpoints: (builder) => ({
    getUserDocuments: builder.mutation<GetDocumentsResponse, GetDocumentsRequest>({
      query: (body) => ({
        url: "/dashboard/view-all-documents",  // base URL auto-applied
        method: "POST",
        body,
      }),
      invalidatesTags: ["Documents"],
    }),
  }),
});

export const { useGetUserDocumentsMutation } = documentsApi;
