// src/redux/services/document/getGtmDocument.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

// Response interface
interface GTMDocumentResponse {
  message?: string;
  fileName?: string;
  docxBase64?: string;
}

export const getGtmDocumentApi = createApi({
  reducerPath: "getGtmDocumentApi",

  // ✅ Use shared base API
  baseQuery: baseApiQuery,

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
        headers: {
          Accept: "application/json",
        },
        body: {
          session_id: body.session_id,
          project_id: body.project_id,
          document_type: body.document_type,
        },

        // ✅ Custom AWS Lambda response parser kept intact
        responseHandler: async (response) => {
          console.log("📄 [GTM API] Response status:", response.status);
          console.log("📄 [GTM API] Response headers:", response.headers);

          const text = await response.text();
          console.log("📄 [GTM API] Raw response text:", text);

          try {
            const lambdaResponse = JSON.parse(text);
            console.log("📄 [GTM API] Parsed Lambda response:", lambdaResponse);

            if (lambdaResponse.body) {
              const actualData = JSON.parse(lambdaResponse.body);
              console.log("📄 [GTM API] Extracted actual data:", actualData);
              return actualData;
            }

            return lambdaResponse;
          } catch (error) {
            console.error("❌ [GTM API] Failed to parse response:", error);
            console.error("❌ [GTM API] Response text that failed:", text);
            throw new Error("Invalid response format from server");
          }
        },
      }),
    }),
  }),
});

export const { useGetGtmDocumentMutation } = getGtmDocumentApi;
