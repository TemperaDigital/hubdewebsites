export type TrackStatus = "in_progress" | "planned" | "completed";

export interface LearningTrack {
  id: string;
  title: string;
  platform: string | null;
  status: TrackStatus;
  lessons_completed: number;
  total_lessons: number;
  start_date: string | null;
  end_date: string | null;
  url: string | null;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Platform {
  id: string;
  name: string;
  url: string | null;
  description: string | null;
  color: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  description: string;
  source: string;
  author: string | null;
  image: string | null;
  publishedAt: string | null;
}

export const STATUS_LABELS: Record<TrackStatus, string> = {
  in_progress: "Em andamento",
  planned: "Pretendo fazer",
  completed: "Concluído",
};

export const STATUS_OPTIONS: { value: TrackStatus; label: string }[] = [
  { value: "in_progress", label: "Em andamento" },
  { value: "planned", label: "Pretendo fazer" },
  { value: "completed", label: "Concluído" },
];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function trackProgress(t: { lessons_completed: number; total_lessons: number }): number {
  if (!t.total_lessons || t.total_lessons <= 0) return 0;
  return Math.min(100, Math.round((t.lessons_completed / t.total_lessons) * 100));
}
