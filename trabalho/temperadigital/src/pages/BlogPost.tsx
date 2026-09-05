import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePost } from "@/hooks/useSiteData";

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, isLoading } = usePost(slug);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Post não encontrado</h1>
        <Button asChild variant="link" className="mt-4">
          <Link to="/blog">Voltar ao blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <article className="container max-w-3xl py-12 md:py-16">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 rounded-full">
        <Link to="/blog"><ArrowLeft className="mr-1 h-4 w-4" /> Blog</Link>
      </Button>

      <p className="text-sm text-muted-foreground">{formatDate(post.published_at)}</p>
      <h1 className="mt-2 text-3xl font-bold leading-tight text-balance md:text-4xl">{post.title}</h1>
      {post.excerpt && <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>}

      {post.cover_url && (
        <img src={post.cover_url} alt={post.title} className="mt-8 w-full rounded-xl object-cover" />
      )}

      {post.content && (
        <div className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
          {post.content}
        </div>
      )}
    </article>
  );
}
