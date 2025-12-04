// src/redux/services/documents/documentsApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '../customBaseQuery';

// Define the Document type based on your API response
export interface UserDocument {
  document_name: string;
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  // ... other fields
}

interface GetDocumentsRequest {
  session_id: string;
}

interface GetDocumentsResponse {
  documents: UserDocument[];
  // Add other response fields if any
}

export const documentsApi = createApi({
  reducerPath: 'documentsApi',
  baseQuery: customBaseQuery, // ✅ use central base query
  tagTypes: ['Documents'],
  endpoints: (builder) => ({
    getUserDocuments: builder.mutation<GetDocumentsResponse, GetDocumentsRequest>({
      query: (body) => ({
        url: '/dashboard/view-all-documents',
        method: 'POST',
        body, // headers handled in customBaseQuery
      }),
      invalidatesTags: ['Documents'],
    }),
  }),
});

export const { useGetUserDocumentsMutation } = documentsApi;
