import { cn } from "@/lib/utils";
import { STATUS_LABELS, type TrackStatus } from "@/lib/site-types";

const STYLES: Record<TrackStatus, string> = {
  in_progress: "bg-primary-soft text-accent-foreground",
  planned: "bg-secondary text-secondary-foreground",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export function StatusBadge({ status, className }: { status: TrackStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", STYLES[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
