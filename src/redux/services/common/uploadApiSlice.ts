// src/redux/services/common/uploadApiSlice.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseApiQuery } from '../baseApi';

export const uploadApiSlice = createApi({
  reducerPath: 'uploadApi',
  baseQuery: baseApiQuery, // ✅ use centralized base query
  endpoints: (builder) => ({
    uploadTextFile: builder.mutation<any, any>({
      query: (body) => ({
        url: '/document-generation/upload-to-s3',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useUploadTextFileMutation } = uploadApiSlice;
