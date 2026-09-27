export type PageStatus = 'published' | 'draft';

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  description: string | null;
  status: PageStatus;
  template: string | null;
  created_at: string;
}

export interface PagePayload {
  title: string;
  slug: string;
  content?: string | null;
  description?: string | null;
  status?: PageStatus;
  template?: string | null;
  locale?: string;
}
