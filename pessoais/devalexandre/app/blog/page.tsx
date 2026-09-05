import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts, getAllTags } from '@/lib/mdx';
import { PostCard } from '@/components/post-card';
import { Search, Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Posts sobre tecnologia, desenvolvimento web, carreira e aprendizado.',
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  const tags = getAllTags();

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2">Blog</h1>
        <p className="text-muted-foreground">
          Posts sobre tecnologia, desenvolvimento e aprendizado.
        </p>
      </div>

      {/* Tags */}
      {(tags?.length ?? 0) > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Tag className="w-4 h-4 text-muted-foreground mt-1" />
          {(tags ?? []).map((t: any) => (
            <Link
              key={t?.tag}
              href={`/blog/tag/${t?.tag}`}
              className="px-3 py-1 rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 text-xs font-medium transition-colors"
            >
              {t?.tag} ({t?.count ?? 0})
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/busca"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <Search className="w-4 h-4" /> Buscar posts
      </Link>

      <div className="space-y-3">
        {(posts ?? []).map((post: any, i: number) => (
          <PostCard
            key={post?.slug}
            slug={post?.slug ?? ''}
            title={post?.frontmatter?.title ?? ''}
            date={post?.frontmatter?.date ?? ''}
            description={post?.frontmatter?.description ?? ''}
            readingTime={post?.readingTime ?? 1}
            tags={post?.frontmatter?.tags ?? []}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
