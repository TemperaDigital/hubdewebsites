import { useState } from "react";
import { TrackCard } from "@/components/site/TrackCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useTracks } from "@/hooks/useSiteData";
import { STATUS_OPTIONS, type TrackStatus } from "@/lib/site-types";
import { cn } from "@/lib/utils";

type Filter = "all" | TrackStatus;

export default function Tracks() {
  const { data: tracks, isLoading } = useTracks();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = (tracks ?? []).filter((t) => filter === "all" || t.status === filter);

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "Todas" },
    ...STATUS_OPTIONS,
  ];

  return (
    <div className="container py-12 md:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold md:text-4xl text-balance">Minhas trilhas</h1>
        <p className="mt-2 text-muted-foreground">
          Cursos em andamento, que pretendo fazer e os que já concluí.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "default" : "outline"}
            className={cn("rounded-full")}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => <TrackCard key={t.id} track={t} />)}
        </div>
      ) : (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          Nenhuma trilha por aqui ainda.
        </CardContent></Card>
      )}
    </div>
  );
}
