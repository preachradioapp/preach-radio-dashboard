import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://api.preachradio.com',
  // prepareHeaders: (headers) => {
  //   const token = JSON.parse(localStorage.getItem("accessToken"));
  //   if (token) {
  //     headers.set("Authorization", `${token}`);
  //   }
  //   return headers;
  // },
  prepareHeaders: (headers, { getState }) => {
    const accessToken = getState().logInUser.accessToken;
    console.log('from baseApi', accessToken);
    if (accessToken) {
      headers.set('authorization', `${accessToken}`);
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQuery,
  tagTypes: ['overview', 'host'],
  endpoints: () => ({}),
});

export const imageUrl = 'https://api.preachradio.com';
// asdfsf
