import type { PaginatedResponse, PaginationMeta } from './user';

export type { PaginatedResponse, PaginationMeta };

export type MediaType = 'image' | 'document';

export interface AdminMedia {
  id: string;
  title: string | null;
  alt: string | null;
  caption: string | null;
  description: string | null;
  name: string | null;
  file_name: string | null;
  mime_type: string | null;
  extension: string | null;
  size: number | null;
  size_formatted: string | null;
  url: string | null;
  thumb_url: string | null;
  medium_url: string | null;
  width: number | null;
  height: number | null;
  is_image: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface MediaListParams {
  page?: number;
  per_page?: number;
  search?: string;
  type?: MediaType;
  month?: string;
  sort?: 'created_at' | 'updated_at' | 'title';
  direction?: 'asc' | 'desc';
}

export interface UpdateMediaPayload {
  title?: string | null;
  alt?: string | null;
  caption?: string | null;
  description?: string | null;
}

export type MediaPaginatedResponse = PaginatedResponse<AdminMedia>;
