import { apiSlice } from './apiSlice';
import { adminApiPath } from '../../utils/website';
import type { ApiResponse } from '../../types/auth';
import type { PaginatedResponse } from '../../types/user';
import type {
  AdminMenu,
  MenuBox,
  MenuBoxItemsResponse,
  MenuLocationsResponse,
  MenuPayload,
} from '../../types/menu';

export const menuApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMenus: builder.query<PaginatedResponse<AdminMenu>, void>({
      query: () => `${adminApiPath('/menus')}?per_page=100`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'AdminMenu' as const, id })),
              { type: 'AdminMenu' as const, id: 'LIST' },
            ]
          : [{ type: 'AdminMenu' as const, id: 'LIST' }],
    }),

    getMenu: builder.query<ApiResponse<AdminMenu>, string>({
      query: (id) => adminApiPath(`/menus/${id}`),
      providesTags: (_result, _error, id) => [{ type: 'AdminMenu', id }],
    }),

    createMenu: builder.mutation<ApiResponse<AdminMenu>, { name: string }>({
      query: (body) => ({ url: adminApiPath('/menus'), method: 'POST', body }),
      invalidatesTags: [{ type: 'AdminMenu', id: 'LIST' }],
    }),

    updateMenu: builder.mutation<ApiResponse<AdminMenu>, { id: string; body: MenuPayload }>({
      query: ({ id, body }) => ({ url: adminApiPath(`/menus/${id}`), method: 'PUT', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminMenu', id },
        { type: 'AdminMenu', id: 'LIST' },
      ],
    }),

    deleteMenu: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: adminApiPath(`/menus/${id}`), method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'AdminMenu', id },
        { type: 'AdminMenu', id: 'LIST' },
      ],
    }),

    getMenuBoxes: builder.query<{ data: MenuBox[] }, void>({
      query: () => adminApiPath('/menus/boxes'),
    }),

    getMenuBoxItems: builder.query<MenuBoxItemsResponse, { box: string; q?: string }>({
      query: ({ box, q }) => {
        const query = q ? `?q=${encodeURIComponent(q)}` : '';

        return `${adminApiPath(`/menus/boxes/${box}`)}${query}`;
      },
    }),

    getMenuLocations: builder.query<MenuLocationsResponse, void>({
      query: () => adminApiPath('/menus/locations'),
    }),
  }),
});

export const {
  useGetMenusQuery,
  useGetMenuQuery,
  useCreateMenuMutation,
  useUpdateMenuMutation,
  useDeleteMenuMutation,
  useGetMenuBoxesQuery,
  useGetMenuBoxItemsQuery,
  useGetMenuLocationsQuery,
} = menuApi;
