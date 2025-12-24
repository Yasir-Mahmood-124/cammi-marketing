// redux/services/linkedin/viewApiSlice.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseApiQuery } from '../baseApi';

export const viewApiSlice = createApi({
  reducerPath: 'viewApi',
  baseQuery: baseApiQuery,
  endpoints: (builder) => ({
    getPosts: builder.mutation<any[], { sub: string }>({
      query: (body) => ({
        url: '/calendar/linkedin-calendar-view',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGetPostsMutation } = viewApiSlice;
