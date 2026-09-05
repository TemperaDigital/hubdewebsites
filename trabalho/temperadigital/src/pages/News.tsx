import { ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTechNews } from "@/hooks/useSiteData";

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - Date.parse(iso);
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "agora há pouco";
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

export default function News() {
  const { data: news, isLoading, isFetching, refetch } = useTechNews();

  return (
    <div className="container py-12 md:py-16">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl text-balance">Notícias TEC</h1>
          <p className="mt-2 text-muted-foreground">
            O que está rolando no mundo da tecnologia, atualizado automaticamente.
          </p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-1.5 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Atualizar
        </Button>
      </header>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(news ?? []).map((item) => (
            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="group">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex h-full gap-4 p-4">
                  {item.image && (
                    <img src={item.image} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" loading="lazy" />
                  )}
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">{item.source}</span>
                      <span>{timeAgo(item.publishedAt)}</span>
                    </div>
                    <h3 className="mt-1.5 font-semibold leading-snug group-hover:text-primary">{item.title}</h3>
                    {item.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                    )}
                    <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-medium text-primary">
                      Ler matéria <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
