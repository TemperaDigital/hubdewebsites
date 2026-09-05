import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/mdx';
import { Calendar, Clock, Tag, ArrowLeft, ArrowRight } from 'lucide-react';
import { ShareButton } from '@/components/share-button';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return (posts ?? []).map((post: any) => ({ slug: post?.slug ?? '' }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params?.slug ?? '');
  if (!post) return { title: 'Post não encontrado' };
  return {
    title: post?.frontmatter?.title ?? '',
    description: post?.frontmatter?.description ?? '',
    openGraph: {
      title: post?.frontmatter?.title ?? '',
      description: post?.frontmatter?.description ?? '',
      type: 'article',
      ...(post?.frontmatter?.cover ? { images: [{ url: post.frontmatter.cover }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params?.slug ?? '');
  if (!post) notFound();

  const allPosts = await getAllPosts();
  const currentIndex = (allPosts ?? []).findIndex((p: any) => p?.slug === params?.slug);
  const prevPost = currentIndex < (allPosts?.length ?? 0) - 1 ? allPosts?.[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts?.[currentIndex - 1] : null;

  return (
    <article className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao blog
      </Link>

      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
          {post?.frontmatter?.title ?? ''}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(post?.frontmatter?.date ?? '').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {post?.readingTime ?? 1} min de leitura
          </span>
        </div>
        {(post?.frontmatter?.tags ?? [])?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {(post?.frontmatter?.tags ?? []).map((tag: string) => (
              <Link
                key={tag}
                href={`/blog/tag/${tag}`}
                className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1"
              >
                <Tag className="w-3 h-3" /> {tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div
        className="prose-custom"
        dangerouslySetInnerHTML={{ __html: post?.htmlContent ?? '' }}
      />

      {/* Share */}
      <div className="mt-10 pt-6 border-t border-border/50">
        <ShareButton title={post?.frontmatter?.title ?? ''} />
      </div>

      {/* Previous/Next navigation */}
      <nav className="mt-8 pt-6 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevPost && (
          <Link
            href={`/blog/${prevPost?.slug}`}
            className="p-4 rounded-lg bg-card hover:bg-muted/50 transition-colors group"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <ArrowLeft className="w-3 h-3" /> Anterior
            </span>
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {prevPost?.frontmatter?.title ?? ''}
            </span>
          </Link>
        )}
        {nextPost && (
          <Link
            href={`/blog/${nextPost?.slug}`}
            className="p-4 rounded-lg bg-card hover:bg-muted/50 transition-colors group sm:text-right sm:col-start-2"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1 sm:justify-end">
              Próximo <ArrowRight className="w-3 h-3" />
            </span>
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {nextPost?.frontmatter?.title ?? ''}
            </span>
          </Link>
        )}
      </nav>
    </article>
  );
}
