import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePosts } from "@/hooks/useSiteData";

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function Blog() {
  const { data: posts, isLoading } = usePosts();

  return (
    <div className="container py-12 md:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold md:text-4xl text-balance">Blog</h1>
        <p className="mt-2 text-muted-foreground">Anotações, aprendizados e reflexões da jornada.</p>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (posts ?? []).length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {(posts ?? []).map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                {p.cover_url && (
                  <img src={p.cover_url} alt={p.title} className="h-44 w-full rounded-t-xl object-cover" loading="lazy" />
                )}
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground">{formatDate(p.published_at)}</p>
                  <h2 className="mt-1 text-xl font-semibold leading-tight">{p.title}</h2>
                  {p.excerpt && <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          Nenhum post publicado ainda.
        </CardContent></Card>
      )}
    </div>
  );
}
