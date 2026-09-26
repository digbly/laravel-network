import { apiSlice } from './apiSlice';
import type { ApiResponse } from '../../types/auth';
import type { NetworkConfig } from '../../types/website';

export const networkApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNetworkConfig: builder.query<ApiResponse<NetworkConfig>, void>({
      query: () => '/network/config',
    }),
  }),
});

export const { useGetNetworkConfigQuery } = networkApi;