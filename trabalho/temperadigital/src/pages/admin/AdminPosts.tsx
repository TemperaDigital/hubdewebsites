import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePosts } from "@/hooks/useSiteData";
import { slugify, type Post } from "@/lib/site-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Form = { title: string; excerpt: string; content: string; cover_url: string; published: boolean };
const empty: Form = { title: "", excerpt: "", content: "", cover_url: "", published: false };

export default function AdminPosts() {
  const { data: posts } = usePosts({ includeDrafts: true });
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState<Form>(empty);

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {
        title: form.title.trim(),
        slug: slugify(form.title),
        excerpt: form.excerpt.trim() || null,
        content: form.content.trim() || null,
        cover_url: form.cover_url.trim() || null,
        published: form.published,
        published_at: form.published ? (editing?.published_at ?? new Date().toISOString()) : null,
      };
      if (editing) {
        const { error } = await supabase.from("posts").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("posts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      setOpen(false);
      toast({ title: editing ? "Post atualizado" : "Post criado" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts"] }); toast({ title: "Post removido" }); },
  });

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Post) => {
    setEditing(p);
    setForm({ title: p.title, excerpt: p.excerpt ?? "", content: p.content ?? "", cover_url: p.cover_url ?? "", published: p.published });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog</h1>
        <Button onClick={openNew} className="rounded-full"><Plus className="mr-1 h-4 w-4" /> Novo post</Button>
      </header>

      <div className="space-y-3">
        {(posts ?? []).map((p) => (
          <Card key={p.id}>
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold">{p.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.published ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-secondary-foreground"}`}>
                    {p.published ? "Publicado" : "Rascunho"}
                  </span>
                </div>
                {p.excerpt && <p className="truncate text-sm text-muted-foreground">{p.excerpt}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {(posts ?? []).length === 0 && <p className="py-8 text-center text-muted-foreground">Nenhum post ainda.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar post" : "Novo post"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Resumo</Label><Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} /></div>
            <div className="space-y-2"><Label>Imagem de capa (URL)</Label><Input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} placeholder="https://..." /></div>
            <div className="space-y-2"><Label>Conteúdo</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label>Publicado</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={() => save.mutate()} disabled={!form.title.trim() || save.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
