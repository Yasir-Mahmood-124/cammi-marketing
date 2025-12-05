// src/redux/services/feedback/checkFeedbackApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';
import { baseApiQuery } from '../baseApi'; // import your centralized base query

export const checkFeedbackApi = createApi({
  reducerPath: 'checkFeedbackApi',
  baseQuery: baseApiQuery, // use the centralized baseApiQuery
  endpoints: (builder) => ({
    checkFeedback: builder.mutation<any, void>({
      query: () => {
        const sessionId = Cookies.get('token'); // Get session_id from cookies
        return {
          url: '/feedback/check-customer-feedback', // endpoint path
          method: 'POST',
          body: { session_id: sessionId }, // Pass session_id in body
        };
      },
    }),
  }),
});

export const { useCheckFeedbackMutation } = checkFeedbackApi;
