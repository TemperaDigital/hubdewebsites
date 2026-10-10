import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Bookmark } from "./link-utils";
import { sanitizeNotes } from "./rich-notes";

type LinkRow = {
  id: string;
  url: string;
  title: string;
  subject: string;
  theme: string;
  tags: string[] | null;
  notes: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
};

function toBookmark(row: LinkRow): Bookmark {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    subject: row.subject,
    theme: row.theme,
    tags: row.tags ?? [],
    notes: row.notes ?? "",
    image: row.image ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getClient(): SupabaseClient {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ??
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
    process.env["VITE_SUPABASE_ANON_KEY"];
  if (!url || !key) {
    throw new Error(
      "Banco de dados não conectado. Conecte seu Supabase em Project Settings → Connectors.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const linkInput = z.object({
  url: z.string().url("Informe um endereço web válido.").max(4000),
  title: z.string().min(1, "Informe um título.").max(200),
  subject: z.string().min(1).max(200),
  theme: z.string().min(1).max(200),
  tags: z.array(z.string().max(60)).max(20).default([]),
  notes: z.string().max(30000).default("").transform(sanitizeNotes),
  image: z
    .string()
    .max(300_000)
    .refine(
      (v) =>
        v === "" ||
        (v.length <= 2000 && /^https:\/\//i.test(v)) ||
        /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v),
      "Imagem inválida.",
    )
    .nullish(),
});

export const listLinks = createServerFn({ method: "GET" }).handler(
  async (): Promise<Bookmark[]> => {
    const { data, error } = await getClient()
      .from("links")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Não foi possível carregar seus links.");
    return (data as LinkRow[]).map(toBookmark);
  },
);

export const analyzeLink = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ url: z.string().url().max(4000) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { analyze } = await import("./page-analysis.server");
    const { data: rows } = await getClient().from("links").select("subject, theme");
    const existing = (rows ?? []) as { subject: string; theme: string }[];
    return analyze(data.url, {
      subjects: Array.from(new Set(existing.map((r) => r.subject))),
      themes: Array.from(new Set(existing.map((r) => r.theme))),
    });
  });

export const createLink = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => linkInput.parse(input))
  .handler(async ({ data }): Promise<Bookmark> => {
    const { data: row, error } = await getClient()
      .from("links")
      .insert(data)
      .select()
      .single();
    if (error) throw new Error("Não foi possível salvar o link.");
    return toBookmark(row as LinkRow);
  });

export const updateLink = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).extend(linkInput.shape).parse(input),
  )
  .handler(async ({ data }): Promise<Bookmark> => {
    const { id, ...fields } = data;
    const { data: row, error } = await getClient()
      .from("links")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error("Não foi possível salvar as alterações.");
    return toBookmark(row as LinkRow);
  });

/** Busca a imagem de até 6 links que ainda não foram verificados e grava só a coluna `image`. */
export const enrichLinks = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ checked: number }> => {
    const client = getClient();
    const { data: rows, error } = await client
      .from("links")
      .select("id, url")
      .is("image", null)
      .order("created_at", { ascending: false })
      .limit(6);
    if (error || !rows?.length) return { checked: 0 };
    const { readPage } = await import("./page-analysis.server");
    await Promise.all(
      (rows as { id: string; url: string }[]).map(async (r) => {
        const info = await readPage(r.url).catch(() => null);
        await client
          .from("links")
          .update({ image: info?.image ?? "" })
          .eq("id", r.id)
          .is("image", null);
      }),
    );
    return { checked: rows.length };
  },
);

export type SubjectMeta = { name: string; icon: string | null };

/** Ícones escolhidos para os assuntos. Se a tabela ainda não existir, devolve lista vazia. */
export const listSubjects = createServerFn({ method: "GET" }).handler(
  async (): Promise<SubjectMeta[]> => {
    const { data, error } = await getClient().from("subjects").select("name, icon");
    if (error) return [];
    return (data as SubjectMeta[]).map((r) => ({ name: r.name, icon: r.icon ?? null }));
  },
);

export const saveSubject = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().min(1).max(200),
        icon: z
          .string()
          .max(60_000)
          .refine(
            (v) =>
              v === "" ||
              /^lucide:[a-z0-9-]{1,40}$/.test(v) ||
              /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v),
            "Ícone inválido.",
          )
          .nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<SubjectMeta> => {
    const icon = data.icon ? data.icon : null;
    const { error } = await getClient()
      .from("subjects")
      .upsert({ name: data.name, icon }, { onConflict: "name" });
    if (error) throw new Error("Não foi possível salvar o ícone do assunto.");
    return { name: data.name, icon };
  });

export const deleteLink = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await getClient()
      .from("links")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error("Não foi possível excluir o link.");
    return { ok: true };
  });
