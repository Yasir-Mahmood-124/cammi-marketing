// src/redux/services/linkedin/getPostQuestionsApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { baseApiQuery } from "../baseApi"; // ✅ import your base query

interface GetPostQuestionsResponse {
  session_id: string;
  organization_id: string;
  questions: string[];
}

export const getPostQuestionsApi = createApi({
  reducerPath: "getPostQuestionsApi",
  baseQuery: baseApiQuery, // ✅ use the shared baseApiQuery
  endpoints: (builder) => ({
    getPostQuestions: builder.query<GetPostQuestionsResponse | string, void>({
      query: () => {
        // ✅ Get session_id (token) from cookies
        const session_id = Cookies.get("token");

        // ✅ Get organization_id from localStorage
        const orgData = localStorage.getItem("currentProject");
        let organization_id = "";

        if (orgData) {
          try {
            const parsed = JSON.parse(orgData);
            organization_id = parsed.organization_id;
          } catch (err) {
            console.error("Error parsing currentProject:", err);
          }
        }

        // ✅ Build body
        const body = {
          organization_id,
          session_id,
        };

        return {
          url: "/schedular/get-post-questions",
          method: "POST",
          body,
        };
      },
      transformResponse: (response: GetPostQuestionsResponse | string) => {
        // Handle both "Not found" and normal responses
        if (typeof response === "string") {
          return { session_id: "", organization_id: "", questions: [] };
        }
        return response;
      },
    }),
  }),
});

export const { useGetPostQuestionsQuery } = getPostQuestionsApi;
