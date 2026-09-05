import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Copy,
  Download,
  Edit3,
  Mail,
  MessageCircle,
  Plus,
  Search,
  Trash2,
  Upload,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { db, deleteTask, toggleDone, type Task } from "@/lib/db";
import { useAuth } from "@/hooks/use-auth";
import { downloadBackup, importBackup, type ImportMode } from "@/lib/backup";
import { seedExampleTasks } from "@/lib/seed-examples";
import {
  connectGoogle,
  createEvent,
  deleteEvent,
  isConnected,
  isGoogleConfigured,
} from "@/lib/google-calendar";

function formatTaskText(t: Task) {
  const lines = [
    `📌 ${t.title}`,
    t.description && `\n${t.description}`,
    t.deadline && `\n⏰ Prazo: ${new Date(t.deadline).toLocaleString("pt-BR")}`,
    t.type === "profissional" && t.origem && `📁 Origem: ${t.origem}`,
    t.type === "profissional" && t.nup && `🔖 NUP: ${t.nup}`,
    t.type === "profissional" && t.responsavel && `👤 Responsável: ${t.responsavel}`,
  ].filter(Boolean);
  return lines.join("\n");
}

function deadlineStatus(t: Task): "ok" | "soon" | "overdue" {
  if (!t.deadline || t.done) return "ok";
  const ms = new Date(t.deadline).getTime() - Date.now();
  if (ms < 0) return "overdue";
  if (ms < 24 * 60 * 60 * 1000) return "soon";
  return "ok";
}

export default function MainPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [gConnected, setGConnected] = useState(false);

  const tasks = useLiveQuery(
    async (): Promise<Task[]> =>
      user ? await db.tasks.where({ ownerUserId: user.id }).reverse().sortBy("date") : [],
    [user?.id]
  );

  const today = new Date().toISOString().slice(0, 10);

  const visible = useMemo(() => {
    const list = (tasks ?? []).filter((t) => !t.done || t.date === today);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((t) => {
      if (q === "concluida" || q === "concluída") return t.done;
      if (q === "pendente" || q === "aberta") return !t.done;
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.date.includes(q) ||
        (t.nup ?? "").toLowerCase().includes(q)
      );
    });
  }, [tasks, query, today]);

  const handleToggle = async (t: Task, checked: boolean) => {
    if (checked) {
      const solucao = window.prompt("Solução dada (opcional):") ?? "";
      await toggleDone(t.id!, true, solucao);
      if (gConnected && t.googleEventId) {
        try {
          await deleteEvent(t.googleEventId);
        } catch {/* ignore */}
      }
    } else {
      await toggleDone(t.id!, false, undefined);
    }
  };

  const handleDelete = async (t: Task) => {
    if (gConnected && t.googleEventId) {
      try {
        await deleteEvent(t.googleEventId);
      } catch {/* ignore */}
    }
    await deleteTask(t.id!);
    toast.success("Tarefa removida");
  };

  const handleCopy = async (t: Task) => {
    await navigator.clipboard.writeText(formatTaskText(t));
    toast.success("Tarefa copiada");
  };

  const handleEmail = (t: Task) => {
    const subject = encodeURIComponent(`[Tarefa] ${t.title}`);
    const body = encodeURIComponent(formatTaskText(t));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleWhatsApp = (t: Task) => {
    const text = encodeURIComponent(formatTaskText(t));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleConnectGoogle = async () => {
    if (!isGoogleConfigured()) {
      toast.error("Configure VITE_GOOGLE_CLIENT_ID");
      return;
    }
    try {
      await connectGoogle();
      setGConnected(true);
      toast.success("Google Calendar conectado");
      // Sync open tasks with deadline
      const open = (tasks ?? []).filter((t) => !t.done && t.deadline && !t.googleEventId);
      for (const t of open) {
        const start = new Date(t.deadline!).toISOString();
        const end = new Date(new Date(t.deadline!).getTime() + 30 * 60 * 1000).toISOString();
        try {
          const eventId = await createEvent({
            summary: t.title,
            description: t.description,
            start,
            end,
          });
          await db.tasks.update(t.id!, { googleEventId: eventId });
        } catch {/* ignore */}
      }
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  useEffect(() => {
    setGConnected(isConnected());
  }, []);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [busyBackup, setBusyBackup] = useState(false);

  const handleExport = async () => {
    setBusyBackup(true);
    try {
      await downloadBackup();
      toast.success("Backup exportado");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusyBackup(false);
    }
  };

  const handlePickFile = () => fileInputRef.current?.click();

  const handleSeedExamples = async () => {
    if (!user) return;
    try {
      const n = await seedExampleTasks(user.id);
      toast.success(`${n} tarefas de exemplo adicionadas`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) setPendingFile(f);
  };

  const runImport = async (mode: ImportMode) => {
    if (!pendingFile) return;
    setBusyBackup(true);
    try {
      const r = await importBackup(pendingFile, mode);
      toast.success(
        `${r.imported} tarefa(s) importada(s)` +
          (r.skipped ? ` • ${r.skipped} ignorada(s)` : "")
      );
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPendingFile(null);
      setBusyBackup(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suas tarefas</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleConnectGoogle}>
            <CalendarDays className="mr-1 h-4 w-4" />
            {gConnected ? "Google conectado" : "Conectar Google Calendar"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={busyBackup}
          >
            <Download className="mr-1 h-4 w-4" /> Exportar backup
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePickFile}
            disabled={busyBackup}
          >
            <Upload className="mr-1 h-4 w-4" /> Importar backup
          </Button>
          <Button variant="outline" size="sm" onClick={handleSeedExamples}>
            <Sparkles className="mr-1 h-4 w-4" /> Carregar exemplos
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileChosen}
          />
          <Button size="sm" asChild>
            <Link to="/cadastro">
              <Plus className="mr-1 h-4 w-4" /> Adicionar
            </Link>
          </Button>
        </div>
      </div>

      <AlertDialog
        open={!!pendingFile}
        onOpenChange={(o) => !o && setPendingFile(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Importar backup</AlertDialogTitle>
            <AlertDialogDescription>
              Escolha como restaurar os dados de{" "}
              <strong>{pendingFile?.name}</strong>:
              <br />
              <strong>Mesclar</strong> mantém suas tarefas atuais e adiciona as
              do backup (ignora duplicadas).
              <br />
              <strong>Substituir</strong> apaga tudo e restaura apenas o que
              está no arquivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => runImport("merge")}
              disabled={busyBackup}
            >
              Mesclar
            </Button>
            <AlertDialogAction
              onClick={() => runImport("replace")}
              disabled={busyBackup}
            >
              Substituir tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por texto, NUP, data ou status (pendente/concluída)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {!visible.length && (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nenhuma tarefa por aqui. <Link to="/cadastro" className="text-primary underline">Crie a primeira</Link>.
        </div>
      )}

      <ul className="space-y-3">
        {visible.map((t) => {
          const status = deadlineStatus(t);
          return (
            <motion.li
              key={t.id}
              animate={status === "overdue" ? { opacity: [1, 0.55, 1] } : { opacity: 1 }}
              transition={status === "overdue" ? { duration: 1.4, repeat: Infinity } : undefined}
              className={
                "rounded-lg border bg-card p-4 shadow-sm transition-colors " +
                (status === "overdue"
                  ? "border-destructive/60 bg-destructive/5"
                  : status === "soon"
                  ? "border-amber-500/60 bg-amber-500/5"
                  : "border-border")
              }
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={t.done}
                  onCheckedChange={(c) => handleToggle(t, Boolean(c))}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={
                        "font-medium " +
                        (t.done ? "text-muted-foreground line-through" : "")
                      }
                    >
                      {t.title}
                    </h3>
                    <Badge variant={t.type === "profissional" ? "default" : "secondary"}>
                      {t.type === "profissional" ? "Trabalho" : "Pessoal"}
                    </Badge>
                    {status === "overdue" && (
                      <Badge variant="destructive">Vencida</Badge>
                    )}
                    {status === "soon" && (
                      <Badge className="bg-amber-500 text-white hover:bg-amber-600">
                        Vence em breve
                      </Badge>
                    )}
                  </div>
                  {t.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {t.deadline && (
                      <span>⏰ {new Date(t.deadline).toLocaleString("pt-BR")}</span>
                    )}
                    {t.nup && <span>NUP: {t.nup}</span>}
                    {t.responsavel && <span>👤 {t.responsavel}</span>}
                    {t.attachments.length > 0 && (
                      <span>📎 {t.attachments.length} anexo(s)</span>
                    )}
                  </div>
                  {t.done && t.solucao && (
                    <Textarea
                      readOnly
                      value={t.solucao}
                      className="mt-3 bg-muted/30 text-sm"
                      rows={2}
                    />
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Button size="sm" variant="ghost" onClick={() => handleCopy(t)}>
                  <Copy className="mr-1 h-3.5 w-3.5" /> Copiar
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link to={`/cadastro/${t.id}`}>
                    <Edit3 className="mr-1 h-3.5 w-3.5" /> Editar
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleEmail(t)}>
                  <Mail className="mr-1 h-3.5 w-3.5" /> AVISAR
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleWhatsApp(t)}>
                  <MessageCircle className="mr-1 h-3.5 w-3.5" /> WhatsApp
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-destructive">
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Deletar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(t)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}