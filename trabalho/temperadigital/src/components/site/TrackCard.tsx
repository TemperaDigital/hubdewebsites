import { ExternalLink, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/site/StatusBadge";
import { trackProgress, type LearningTrack } from "@/lib/site-types";

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function TrackCard({ track }: { track: LearningTrack }) {
  const progress = trackProgress(track);
  const start = formatDate(track.start_date);
  const end = formatDate(track.end_date);

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            {track.platform && (
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{track.platform}</p>
            )}
            <h3 className="text-lg font-semibold leading-tight">{track.title}</h3>
          </div>
          <StatusBadge status={track.status} />
        </div>

        {track.description && (
          <p className="text-sm text-muted-foreground">{track.description}</p>
        )}

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {track.lessons_completed} / {track.total_lessons || "—"} aulas
            </span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {(start || end) && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>
              {start ?? "—"}
              {end ? ` → ${end}` : ""}
            </span>
          </div>
        )}

        {track.url && (
          <a
            href={track.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Acessar curso <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
