import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlatforms } from "@/hooks/useSiteData";

export default function Platforms() {
  const { data: platforms, isLoading } = usePlatforms();

  return (
    <div className="container py-12 md:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold md:text-4xl text-balance">Plataformas de aprendizagem</h1>
        <p className="mt-2 text-muted-foreground">
          Acesso rápido a todas as plataformas onde eu estudo.
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(platforms ?? []).map((p) => (
            <a key={p.id} href={p.url ?? "#"} target="_blank" rel="noopener noreferrer" className="group">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white"
                      style={{ backgroundColor: p.color ?? "hsl(var(--primary))" }}
                    >
                      {p.name.charAt(0)}
                    </span>
                    <h3 className="text-lg font-semibold leading-tight">{p.name}</h3>
                  </div>
                  {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:underline">
                    Acessar <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
