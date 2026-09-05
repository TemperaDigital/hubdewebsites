import { useEffect, useState, type ClipboardEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db, saveTask, type Task, type TaskAttachment, type TaskType } from "@/lib/db";
import { useAuth } from "@/hooks/use-auth";

const MAX_FILE_MB = 5;

export default function TaskFormPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const editingId = id ? Number(id) : undefined;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [deadline, setDeadline] = useState("");
  const [type, setType] = useState<TaskType>("profissional");
  const [origem, setOrigem] = useState("");
  const [nup, setNup] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [hasPub, setHasPub] = useState(false);
  const [boletim, setBoletim] = useState("");
  const [pubData, setPubData] = useState("");
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editingId) return;
    db.tasks.get(editingId).then((t) => {
      if (!t) return;
      setTitle(t.title);
      setDescription(t.description);
      setDate(t.date);
      setDeadline(t.deadline ?? "");
      setType(t.type);
      setOrigem(t.origem ?? "");
      setNup(t.nup ?? "");
      setResponsavel(t.responsavel ?? "");
      if (t.publicacao) {
        setHasPub(true);
        setBoletim(t.publicacao.boletim);
        setPubData(t.publicacao.data);
      }
      setAttachments(t.attachments ?? []);
    });
  }, [editingId]);

  const addFiles = async (files: FileList | File[]) => {
    const list: TaskAttachment[] = [];
    for (const f of Array.from(files)) {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`${f.name} excede ${MAX_FILE_MB}MB`);
        continue;
      }
      list.push({ name: f.name, type: f.type, size: f.size, blob: f });
    }
    setAttachments((prev) => [...prev, ...list]);
  };

  const handlePaste = async (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (const it of Array.from(items)) {
      if (it.kind === "file") {
        const f = it.getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length) {
      e.preventDefault();
      await addFiles(files);
      toast.success(`${files.length} arquivo(s) colado(s)`);
    }
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      await saveTask({
        id: editingId,
        ownerUserId: user.id,
        title,
        description,
        date,
        deadline: deadline || undefined,
        type,
        origem: type === "profissional" ? origem || undefined : undefined,
        nup: type === "profissional" ? nup || undefined : undefined,
        responsavel: type === "profissional" ? responsavel || undefined : undefined,
        publicacao:
          type === "profissional" && hasPub
            ? { boletim, data: pubData }
            : undefined,
        done: false,
        attachments,
      });
      toast.success(editingId ? "Tarefa atualizada" : "Tarefa criada");
      navigate("/");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
      </Button>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        {editingId ? "Editar tarefa" : "Nova tarefa"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Título *</Label>
          <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="desc">Descrição</Label>
          <Textarea
            id="desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onPaste={handlePaste}
            placeholder="Detalhes da tarefa… (você pode colar imagens aqui)"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deadline">Prazo</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Tipo de tarefa</Label>
          <Select value={type} onValueChange={(v) => setType(v as TaskType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profissional">Profissional (Trabalho)</SelectItem>
              <SelectItem value="pessoal">Pessoal (Particular)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {type === "profissional" && (
          <div className="space-y-4 rounded-lg border border-dashed border-border p-4">
            <div className="space-y-1.5">
              <Label htmlFor="origem">Origem da tarefa</Label>
              <Input
                id="origem"
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                placeholder="Ex.: DIEX - Documento Interno de Expediente"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nup">NUP (Número Único do Processo)</Label>
              <Input id="nup" value={nup} onChange={(e) => setNup(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="resp">Responsável</Label>
              <Input
                id="resp"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="pub"
                checked={hasPub}
                onCheckedChange={(c) => setHasPub(Boolean(c))}
              />
              <Label htmlFor="pub" className="cursor-pointer">
                Publicação em boletim interno
              </Label>
            </div>
            {hasPub && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bol">Número do boletim</Label>
                  <Input
                    id="bol"
                    value={boletim}
                    onChange={(e) => setBoletim(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bdate">Data do boletim</Label>
                  <Input
                    id="bdate"
                    type="date"
                    value={pubData}
                    onChange={(e) => setPubData(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label>Anexos</Label>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
              <Paperclip className="h-4 w-4" />
              Adicionar arquivo
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </label>
            <span className="self-center text-xs text-muted-foreground">
              ou cole conteúdo na descrição
            </span>
          </div>
          {attachments.length > 0 && (
            <ul className="space-y-1">
              {attachments.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded border border-border bg-muted/30 px-2 py-1 text-sm"
                >
                  <span className="truncate">{a.name} <span className="text-xs text-muted-foreground">({Math.round(a.size / 1024)} KB)</span></span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeAttachment(i)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar tarefa
        </Button>
      </form>
    </div>
  );
}