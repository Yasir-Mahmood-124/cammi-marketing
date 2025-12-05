// src/redux/services/projects/projectsApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiQuery } from "../baseApi";

export interface CreateProjectPayload {
  organization_name: string;
  project_name: string;
  session_id: string;
}

export interface GetSpecificOrganizationsPayload {
  session_id: string;
}

export interface GetSpecificProjectsPayload {
  organization_id: string;
}

export const projectsApi = createApi({
  reducerPath: "projectsApi",
  baseQuery: baseApiQuery, // ⭐ Using centralized base query
  endpoints: (builder) => ({
    // API 1: Create Project
    createProject: builder.mutation<
      { message: string; organization_id: string; project_id: string },
      CreateProjectPayload
    >({
      query: (body) => ({
        url: "/project-organization/projects",
        method: "POST",
        body,
      }),
    }),

    // API 2: Get Organizations of a specific user
    getSpecificOrganizations: builder.query<
      { message: string; organizations: any[] },
      GetSpecificOrganizationsPayload
    >({
      query: ({ session_id }) => ({
        url: "/project-organization/get-specific-organization",
        method: "GET",
        headers: {
          session_id, // session_id as header
        },
      }),
    }),

    // API 3: Get Projects of a specific organization
    getSpecificProjects: builder.query<
      { message: string; projects: any[] },
      GetSpecificProjectsPayload
    >({
      query: ({ organization_id }) => ({
        url: "/project-organization/get-specific-projects",
        method: "GET",
        headers: {
          organization_id, // organization_id as header
        },
      }),
    }),
  }),
});

export const {
  useCreateProjectMutation,
  useGetSpecificOrganizationsQuery,
  useGetSpecificProjectsQuery,
} = projectsApi;
