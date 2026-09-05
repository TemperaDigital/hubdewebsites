import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LearningTrack, Post, Platform, NewsItem } from "@/lib/site-types";

export function useTracks() {
  return useQuery({
    queryKey: ["learning_tracks"],
    queryFn: async (): Promise<LearningTrack[]> => {
      const { data, error } = await supabase
        .from("learning_tracks")
        .select("*")
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LearningTrack[];
    },
  });
}

export function usePlatforms() {
  return useQuery({
    queryKey: ["platforms"],
    queryFn: async (): Promise<Platform[]> => {
      const { data, error } = await supabase
        .from("platforms")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Platform[];
    },
  });
}

export function usePosts(opts?: { includeDrafts?: boolean }) {
  const includeDrafts = opts?.includeDrafts ?? false;
  return useQuery({
    queryKey: ["posts", includeDrafts],
    queryFn: async (): Promise<Post[]> => {
      let query = supabase.from("posts").select("*");
      if (!includeDrafts) query = query.eq("published", true);
      const { data, error } = await query.order("published_at", {
        ascending: false,
        nullsFirst: false,
      });
      if (error) throw error;
      return (data ?? []) as Post[];
    },
  });
}

export function usePost(slug: string | undefined) {
  return useQuery({
    queryKey: ["post", slug],
    enabled: !!slug,
    queryFn: async (): Promise<Post | null> => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return (data as Post) ?? null;
    },
  });
}

export function useTechNews() {
  return useQuery({
    queryKey: ["tech-news"],
    staleTime: 1000 * 60 * 10,
    queryFn: async (): Promise<NewsItem[]> => {
      const { data, error } = await supabase.functions.invoke("tech-news");
      if (error) throw error;
      return (data?.items ?? []) as NewsItem[];
    },
  });
}
