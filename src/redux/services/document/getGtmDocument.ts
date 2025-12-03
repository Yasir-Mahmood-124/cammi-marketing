//src/redux/services/document/getGtmDocument

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the response interface
interface GTMDocumentResponse {
  message?: string;
  fileName?: string;
  docxBase64?: string;
}

export const getGtmDocumentApi = createApi({
  reducerPath: "getGtmDocumentApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev",
  }),

  endpoints: (builder) => ({
    getGtmDocument: builder.mutation<
      GTMDocumentResponse,
      {
        session_id: string;
        project_id: string;
        document_type: string;
      }
    >({
      query: (body) => ({
        url: "/gtm-doc-creator",
        method: "POST",
        body: {
          session_id: body.session_id,
          project_id: body.project_id,
          document_type: body.document_type,
        },
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        // ✅ Use custom responseHandler for AWS Lambda format
        responseHandler: async (response) => {
          console.log("📄 [GTM API] Response status:", response.status);
          console.log("📄 [GTM API] Response headers:", response.headers);
          
          const text = await response.text();
          console.log("📄 [GTM API] Raw response text:", text);
          
          try {
            const lambdaResponse = JSON.parse(text);
            console.log("📄 [GTM API] Parsed Lambda response:", lambdaResponse);
            
            // AWS Lambda returns data in the body field as a string
            if (lambdaResponse.body) {
              const actualData = JSON.parse(lambdaResponse.body);
              console.log("📄 [GTM API] Extracted actual data:", actualData);
              return actualData;
            }
            
            // If body doesn't exist, return the whole response
            return lambdaResponse;
          } catch (error) {
            console.error("❌ [GTM API] Failed to parse response:", error);
            console.error("❌ [GTM API] Raw text that failed:", text);
            throw new Error("Invalid response format from server");
          }
        },
      }),
    }),
  }),
});

export const { useGetGtmDocumentMutation } = getGtmDocumentApi;