import { Metadata } from 'next';
import { getAllPosts, getAllTags } from '@/lib/mdx';
import { PostCard } from '@/components/post-card';
import { Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export async function generateStaticParams() {
  const tags = getAllTags();
  return (tags ?? []).map((t: any) => ({ tag: t?.tag ?? '' }));
}

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  return {
    title: `Posts com a tag: ${params?.tag ?? ''}`,
    description: `Todos os posts marcados com a tag ${params?.tag ?? ''}.`,
  };
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const allPosts = await getAllPosts();
  const tag = decodeURIComponent(params?.tag ?? '');
  const filteredPosts = (allPosts ?? []).filter((post: any) =>
    (post?.frontmatter?.tags ?? []).includes(tag)
  );

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao blog
      </Link>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-2">
          <Tag className="w-6 h-6 text-primary" />
          Posts com a tag: <span className="text-primary">{tag}</span>
        </h1>
        <p className="text-muted-foreground">
          {filteredPosts?.length ?? 0} post(s) encontrado(s)
        </p>
      </div>

      <div className="space-y-3">
        {(filteredPosts ?? []).map((post: any, i: number) => (
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
