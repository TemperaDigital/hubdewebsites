import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getAllPosts, getAllNotas } from '@/lib/mdx';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = headers();
  const host = headersList?.get?.('x-forwarded-host') || 'eu-alexandre.fguerra.ia.br';
  const baseUrl = `https://${host}`;

  const posts = await getAllPosts();
  const notas = await getAllNotas();

  const staticPages = [
    '', '/sobre', '/blog', '/notas', '/projetos', '/videos',
    '/recursos', '/now', '/busca', '/contato',
  ];

  const staticEntries = staticPages.map((p: string) => ({
    url: `${baseUrl}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.8,
  }));

  const postEntries = (posts ?? []).map((post: any) => ({
    url: `${baseUrl}/blog/${post?.slug ?? ''}`,
    lastModified: new Date(post?.frontmatter?.date ?? ''),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const notaEntries = (notas ?? []).map((nota: any) => ({
    url: `${baseUrl}/notas/${nota?.slug ?? ''}`,
    lastModified: new Date(nota?.frontmatter?.date ?? ''),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticEntries, ...postEntries, ...notaEntries];
}
