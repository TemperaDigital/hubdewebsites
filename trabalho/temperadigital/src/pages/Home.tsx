import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Newspaper, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrackCard } from "@/components/site/TrackCard";
import { useTracks, usePosts } from "@/hooks/useSiteData";

export default function Home() {
  const { data: tracks } = useTracks();
  const { data: posts } = usePosts();

  const inProgress = (tracks ?? []).filter((t) => t.status === "in_progress").slice(0, 3);
  const latestPosts = (posts ?? []).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        />
        <div className="container relative py-20 md:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-accent-foreground">
            <GraduationCap className="h-4 w-4" /> Diário de estudos em programação
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] text-balance md:text-6xl">
            Aprendiz de Programação
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Aqui eu registro minhas trilhas de estudo, compartilho posts no blog e acompanho
            as notícias do mundo da tecnologia. Tudo em um lugar só.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/trilhas">Ver minhas trilhas <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link to="/plataformas">Minhas plataformas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trilhas em andamento */}
      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Estudando agora</h2>
            <p className="mt-1 text-muted-foreground">Trilhas que estão em andamento.</p>
          </div>
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/trilhas">Todas <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        {inProgress.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {inProgress.map((t) => <TrackCard key={t.id} track={t} />)}
          </div>
        ) : (
          <Card><CardContent className="p-10 text-center text-muted-foreground">
            Nenhuma trilha em andamento ainda.
          </CardContent></Card>
        )}
      </section>

      {/* Atalhos */}
      <section className="container grid gap-5 pb-16 md:grid-cols-2">
        <Link to="/blog">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary"><BookOpen className="h-6 w-6" /></span>
              <div>
                <h3 className="text-lg font-semibold">Blog</h3>
                <p className="text-sm text-muted-foreground">Anotações e aprendizados da jornada.</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/noticias">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary"><Newspaper className="h-6 w-6" /></span>
              <div>
                <h3 className="text-lg font-semibold">Notícias TEC</h3>
                <p className="text-sm text-muted-foreground">O que está acontecendo no mundo da tecnologia.</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* Últimos posts */}
      {latestPosts.length > 0 && (
        <section className="container pb-20">
          <h2 className="mb-8 text-2xl font-bold md:text-3xl">Últimos posts</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {latestPosts.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="text-lg font-semibold leading-tight">{p.title}</h3>
                    {p.excerpt && <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
