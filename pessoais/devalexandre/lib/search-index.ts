export interface SearchItem {
  title: string;
  description: string;
  slug: string;
  type: 'post' | 'nota';
  date: string;
  tags?: string[];
}

export function buildSearchIndex(posts: SearchItem[]): SearchItem[] {
  return posts ?? [];
}
