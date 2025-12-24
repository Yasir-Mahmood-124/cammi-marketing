// // src/redux/services/document/download-pdf.ts
// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// // Define the expected response type
// interface DownloadPdfResponse {
//   fileName: string;
//   base64_pdf: string;
// }

// // Define the request body type (if applicable)
// interface DownloadPdfRequest {
//   session_id: string;
//   project_id: string;
//   document_type: string;
// }

// export const downloadPdfApi = createApi({
//   reducerPath: "downloadPdfApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev/",
//   }),
//   endpoints: (builder) => ({
//     downloadPdf: builder.mutation<DownloadPdfResponse, DownloadPdfRequest>({
//       query: (body) => ({
//         url: "s3-gateway-pdf",
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           session_id: body.session_id,
//           project_id: body.project_id,
//           document_type: body.document_type,
//         },
//         body: JSON.stringify(body),
//       }),
//     }),
//   }),
// });

// // Export the auto-generated hook
// export const { useDownloadPdfMutation } = downloadPdfApi;

// src/redux/services/document/download-pdf.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

// Response type
interface DownloadPdfResponse {
  fileName: string;
  base64_pdf: string;
}

// Request body type
interface DownloadPdfRequest {
  session_id: string;
  project_id: string;
  document_type: string;
}

export const downloadPdfApi = createApi({
  reducerPath: "downloadPdfApi",
  baseQuery: baseApiQuery, // ✅ using shared base query
  endpoints: (builder) => ({
    downloadPdf: builder.mutation<
      DownloadPdfResponse,
      DownloadPdfRequest
    >({
      query: (body) => ({
        url: "/common-lambda/download-as-pdf",
        method: "POST",
        body, // ✅ automatic JSON stringify done by baseApiQuery
      }),
    }),
  }),
});

// Export hook
export const { useDownloadPdfMutation } = downloadPdfApi;
