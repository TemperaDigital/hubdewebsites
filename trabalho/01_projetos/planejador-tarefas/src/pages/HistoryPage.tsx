import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Copy, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { db, type Task } from "@/lib/db";
import { useAuth } from "@/hooks/use-auth";

type StatusFilter = "todas" | "concluidas" | "abertas";
type TypeFilter = "ambas" | "profissional" | "pessoal";
type PeriodFilter = "7d" | "30d" | "custom";
type Sort = "date_desc" | "date_asc" | "type";

const PAGE = 20;

function formatTaskText(t: Task) {
  return [
    `📌 ${t.title}`,
    t.description && `\n${t.description}`,
    t.solucao && `\n✅ Solução: ${t.solucao}`,
    t.nup && `🔖 NUP: ${t.nup}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todas");
  const [typeF, setTypeF] = useState<TypeFilter>("ambas");
  const [period, setPeriod] = useState<PeriodFilter>("30d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<Sort>("date_desc");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Task | null>(null);

  const tasks = useLiveQuery(
    async (): Promise<Task[]> =>
      user ? await db.tasks.where({ ownerUserId: user.id }).toArray() : [],
    [user?.id]
  );

  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    let list = (tasks ?? []).filter((t) => t.done || t.date < today);

    // status
    if (status === "concluidas") list = list.filter((t) => t.done);
    else if (status === "abertas") list = list.filter((t) => !t.done);
    // type
    if (typeF !== "ambas") list = list.filter((t) => t.type === typeF);
    // period
    const now = Date.now();
    if (period === "7d") {
      const cut = now - 7 * 86400_000;
      list = list.filter((t) => new Date(t.date).getTime() >= cut);
    } else if (period === "30d") {
      const cut = now - 30 * 86400_000;
      list = list.filter((t) => new Date(t.date).getTime() >= cut);
    } else if (period === "custom" && from && to) {
      list = list.filter((t) => t.date >= from && t.date <= to);
    }
    // query
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.nup ?? "").toLowerCase().includes(q) ||
          t.date.includes(q) ||
          (t.solucao ?? "").toLowerCase().includes(q)
      );
    }
    // sort
    if (sort === "date_desc") list.sort((a, b) => b.date.localeCompare(a.date));
    else if (sort === "date_asc") list.sort((a, b) => a.date.localeCompare(b.date));
    else if (sort === "type") list.sort((a, b) => a.type.localeCompare(b.type));

    return list;
  }, [tasks, status, typeF, period, from, to, query, sort, today]);

  const visible = filtered.slice(0, page * PAGE);

  const copy = async (t: Task) => {
    await navigator.clipboard.writeText(formatTaskText(t));
    toast.success("Tarefa copiada");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Histórico</h1>
        <p className="text-sm text-muted-foreground">
          Tarefas concluídas e de dias anteriores.
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por texto, NUP, data ou solução…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="concluidas">Concluídas</SelectItem>
              <SelectItem value="abertas">Não concluídas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeF} onValueChange={(v) => setTypeF(v as TypeFilter)}>
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ambas">Ambas</SelectItem>
              <SelectItem value="profissional">Profissionais</SelectItem>
              <SelectItem value="pessoal">Pessoais</SelectItem>
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
            <SelectTrigger><SelectValue placeholder="Período" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger><SelectValue placeholder="Ordenar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Mais recentes</SelectItem>
              <SelectItem value="date_asc">Mais antigas</SelectItem>
              <SelectItem value="type">Por tipo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {period === "custom" && (
          <div className="grid grid-cols-2 gap-3">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        )}
      </div>

      {!visible.length && (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nada por aqui ainda.
        </div>
      )}

      <ul className="space-y-2">
        {visible.map((t) => (
          <li
            key={t.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium">{t.title}</h3>
                <Badge variant={t.done ? "default" : "outline"}>
                  {t.done ? "Concluída" : "Aberta"}
                </Badge>
                <Badge variant="secondary">
                  {t.type === "profissional" ? "Trabalho" : "Pessoal"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(t.date).toLocaleDateString("pt-BR")}
                {t.nup && ` • NUP ${t.nup}`}
              </p>
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" variant="ghost" onClick={() => copy(t)}>
                <Copy className="mr-1 h-3.5 w-3.5" /> Copiar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDetail(t)}>
                <Eye className="mr-1 h-3.5 w-3.5" /> Detalhar
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {visible.length < filtered.length && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
            Carregar mais
          </Button>
        </div>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detail?.title}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant={detail.done ? "default" : "outline"}>
                  {detail.done ? "Concluída" : "Aberta"}
                </Badge>
                <Badge variant="secondary">
                  {detail.type === "profissional" ? "Trabalho" : "Pessoal"}
                </Badge>
              </div>
              <p><strong>Data:</strong> {new Date(detail.date).toLocaleDateString("pt-BR")}</p>
              {detail.deadline && (
                <p><strong>Prazo:</strong> {new Date(detail.deadline).toLocaleString("pt-BR")}</p>
              )}
              {detail.description && (
                <p className="whitespace-pre-wrap"><strong>Descrição:</strong> {detail.description}</p>
              )}
              {detail.origem && <p><strong>Origem:</strong> {detail.origem}</p>}
              {detail.nup && <p><strong>NUP:</strong> {detail.nup}</p>}
              {detail.responsavel && <p><strong>Responsável:</strong> {detail.responsavel}</p>}
              {detail.publicacao && (
                <p>
                  <strong>Boletim:</strong> nº {detail.publicacao.boletim} de{" "}
                  {new Date(detail.publicacao.data).toLocaleDateString("pt-BR")}
                </p>
              )}
              {detail.solucao && (
                <p className="whitespace-pre-wrap"><strong>Solução:</strong> {detail.solucao}</p>
              )}
              {detail.attachments?.length > 0 && (
                <div>
                  <strong>Anexos:</strong>
                  <ul className="ml-4 list-disc">
                    {detail.attachments.map((a, i) => (
                      <li key={i}>
                        <a
                          href={URL.createObjectURL(a.blob)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline"
                          download={a.name}
                        >
                          {a.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}