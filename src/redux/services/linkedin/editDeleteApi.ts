// src/redux/services/editDeleteApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi"; // centralized base query

interface EditDeleteRequest {
  sub: string;
  post_time: string;
  action: "edit" | "delete";
  new_values?: {
    message?: string;
    status?: string;
    scheduled_time?: string;
    // add other editable fields if API allows more
  };
}

interface EditDeleteResponse {
  success: boolean;
  error?: string;
}

export const editDeleteApi = createApi({
  reducerPath: "editDeleteApi",
  baseQuery: baseApiQuery, // use centralized baseApiQuery
  endpoints: (builder) => ({
    editDelete: builder.mutation<EditDeleteResponse, EditDeleteRequest>({
      query: (body: any) => ({
        url: "/calendar/linkedin-edit-delete",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useEditDeleteMutation } = editDeleteApi;
