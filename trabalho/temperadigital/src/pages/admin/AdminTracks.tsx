import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTracks } from "@/hooks/useSiteData";
import { STATUS_OPTIONS, type LearningTrack, type TrackStatus } from "@/lib/site-types";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Form = {
  title: string; platform: string; status: TrackStatus;
  lessons_completed: string; total_lessons: string;
  start_date: string; end_date: string; url: string; description: string;
};

const empty: Form = { title: "", platform: "", status: "in_progress", lessons_completed: "0", total_lessons: "0", start_date: "", end_date: "", url: "", description: "" };

export default function AdminTracks() {
  const { data: tracks } = useTracks();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LearningTrack | null>(null);
  const [form, setForm] = useState<Form>(empty);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        platform: form.platform.trim() || null,
        status: form.status,
        lessons_completed: Number(form.lessons_completed) || 0,
        total_lessons: Number(form.total_lessons) || 0,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        url: form.url.trim() || null,
        description: form.description.trim() || null,
      };
      if (editing) {
        const { error } = await supabase.from("learning_tracks").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("learning_tracks").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["learning_tracks"] });
      setOpen(false);
      toast({ title: editing ? "Trilha atualizada" : "Trilha criada" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("learning_tracks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["learning_tracks"] });
      toast({ title: "Trilha removida" });
    },
  });

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (t: LearningTrack) => {
    setEditing(t);
    setForm({
      title: t.title, platform: t.platform ?? "", status: t.status,
      lessons_completed: String(t.lessons_completed), total_lessons: String(t.total_lessons),
      start_date: t.start_date ?? "", end_date: t.end_date ?? "", url: t.url ?? "", description: t.description ?? "",
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Trilhas</h1>
        <Button onClick={openNew} className="rounded-full"><Plus className="mr-1 h-4 w-4" /> Nova trilha</Button>
      </header>

      <div className="space-y-3">
        {(tracks ?? []).map((t) => (
          <Card key={t.id}>
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold">{t.title}</h3>
                  <StatusBadge status={t.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.platform || "—"} · {t.lessons_completed}/{t.total_lessons || "—"} aulas
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {(tracks ?? []).length === 0 && <p className="py-8 text-center text-muted-foreground">Nenhuma trilha ainda.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar trilha" : "Nova trilha"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Plataforma</Label><Input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="Alura, DIO..." /></div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TrackStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Aulas concluídas</Label><Input type="number" min={0} value={form.lessons_completed} onChange={(e) => setForm({ ...form, lessons_completed: e.target.value })} /></div>
              <div className="space-y-2"><Label>Total de aulas</Label><Input type="number" min={0} value={form.total_lessons} onChange={(e) => setForm({ ...form, total_lessons: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Início</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Conclusão</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Link do curso</Label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
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
