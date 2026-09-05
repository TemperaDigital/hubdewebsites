import { Metadata } from 'next';
import { getAllPosts, getAllNotas } from '@/lib/mdx';
import { SearchBox } from '@/components/search-box';
import { Search } from 'lucide-react';
import type { SearchItem } from '@/lib/search-index';

export const metadata: Metadata = {
  title: 'Busca',
  description: 'Buscar posts e notas no site.',
};

export default async function BuscaPage() {
  const posts = await getAllPosts();
  const notas = await getAllNotas();

  const searchItems: SearchItem[] = [
    ...(posts ?? []).map((p: any) => ({
      title: p?.frontmatter?.title ?? '',
      description: p?.frontmatter?.description ?? '',
      slug: p?.slug ?? '',
      type: 'post' as const,
      date: p?.frontmatter?.date ?? '',
      tags: p?.frontmatter?.tags ?? [],
    })),
    ...(notas ?? []).map((n: any) => ({
      title: n?.frontmatter?.title ?? '',
      description: '',
      slug: n?.slug ?? '',
      type: 'nota' as const,
      date: n?.frontmatter?.date ?? '',
    })),
  ];

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Search className="w-7 h-7 text-primary" />
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Busca</h1>
        </div>
        <p className="text-muted-foreground">
          Encontre posts e notas por título, descrição ou tags.
        </p>
      </div>

      <SearchBox items={searchItems} />
    </div>
  );
}
