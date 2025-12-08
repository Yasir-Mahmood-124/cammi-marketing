// // redux/services/document/downloadApiSlice.ts
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const downloadDocument = createApi({
//   reducerPath: 'downloadApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: 'https://dvmm2ucegj.execute-api.us-east-1.amazonaws.com/cammi-prod',
//   }),
//   endpoints: (builder) => ({
//     getDocxFile: builder.mutation<
//       { docxBase64: string; fileName: string },
//       { session_id: string; document_type: string; project_id: string } // <-- Accept headers as input
//     >({
//       query: ({ session_id, document_type, project_id }) => ({
//         url: '/fetch',
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           session_id,
//           document_type,
//           project_id,
//         },
//       }),
//     }),
//   }),
// });

// export const { useGetDocxFileMutation } = downloadDocument;


// redux/services/document/downloadApiSlice.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseApiQuery } from '../baseApi';

export const downloadDocument = createApi({
  reducerPath: 'downloadApi',
  baseQuery: baseApiQuery, // ✅ Using your shared base API
  endpoints: (builder) => ({
    getDocxFile: builder.mutation<
      { docxBase64: string; fileName: string },
      { session_id: string; document_type: string; project_id: string }
    >({
      query: ({ session_id, document_type, project_id }) => ({
        url: '/fetch',
        method: 'GET',
        headers: {
          session_id,
          document_type,
          project_id,
        },
      }),
    }),
  }),
});

export const { useGetDocxFileMutation } = downloadDocument;
