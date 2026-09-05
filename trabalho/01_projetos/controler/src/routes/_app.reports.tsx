import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getInstallments } from "@/lib/installments.functions";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { CreditCard } from "lucide-react";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

type Tx = {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: "despesa" | "receita";
  occurred_at: string;
  competence_date: string | null;
  payment_date: string | null;
  status: string;
};

const COLORS = [
  "oklch(0.42 0.065 155)",
  "oklch(0.74 0.13 55)",
  "oklch(0.58 0.13 200)",
  "oklch(0.78 0.15 75)",
  "oklch(0.62 0.1 320)",
  "oklch(0.55 0.12 25)",
  "oklch(0.65 0.1 100)",
];

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ReportsPage() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [view, setView] = useState<"competencia" | "caixa">("competencia");

  const fetchInst = useServerFn(getInstallments);
  const { data: inst } = useQuery({
    queryKey: ["installments"],
    queryFn: () => fetchInst(),
  });

  useEffect(() => {
    supabase
      .from("transactions")
      .select("*")
      .order("occurred_at", { ascending: false })
      .limit(1000)
      .then(({ data }) => setTxs((data ?? []) as Tx[]));
  }, []);

  const { totalDesp, totalRec, byCat, byMonth } = useMemo(() => {
    let totalDesp = 0,
      totalRec = 0;
    const cat: Record<string, number> = {};
    const month: Record<string, { rec: number; desp: number }> = {};
    const today = new Date().toISOString().slice(0, 10);

    for (const t of txs) {
      // pick date by view mode
      const dateStr =
        view === "competencia"
          ? (t.competence_date ?? t.occurred_at.slice(0, 10))
          : (t.payment_date ?? t.occurred_at.slice(0, 10));

      // Competência: tudo conta. Caixa: só o que já saiu / vai sair (inclui projetadas futuras).
      if (view === "competencia" && t.status === "projetado" && (t.payment_date ?? "") > today) {
        // skip projected future on competence view if their competence is still future too
        if ((t.competence_date ?? today) > today) continue;
      }

      const amount = Number(t.amount);
      if (t.type === "despesa") {
        totalDesp += amount;
        cat[t.category] = (cat[t.category] ?? 0) + amount;
      } else {
        totalRec += amount;
      }
      const k = dateStr.slice(0, 7);
      if (!month[k]) month[k] = { rec: 0, desp: 0 };
      if (t.type === "despesa") month[k].desp += amount;
      else month[k].rec += amount;
    }
    return {
      totalDesp,
      totalRec,
      byCat: Object.entries(cat).map(([name, value]) => ({ name, value })),
      byMonth: Object.entries(month)
        .sort()
        .slice(-6)
        .map(([k, v]) => ({ month: k.slice(5) + "/" + k.slice(2, 4), ...v })),
    };
  }, [txs, view]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="font-display text-4xl">Relatórios</h1>
      <p className="text-sm text-muted-foreground">Como o seu dinheiro se moveu.</p>

      <div className="mt-5 inline-flex rounded-full border border-border bg-surface p-1 text-xs shadow-soft">
        <button
          onClick={() => setView("competencia")}
          className={
            "rounded-full px-4 py-1.5 transition-colors " +
            (view === "competencia" ? "bg-primary text-primary-foreground" : "text-muted-foreground")
          }
        >
          Competência
        </button>
        <button
          onClick={() => setView("caixa")}
          className={
            "rounded-full px-4 py-1.5 transition-colors " +
            (view === "caixa" ? "bg-primary text-primary-foreground" : "text-muted-foreground")
          }
        >
          Caixa
        </button>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {view === "competencia"
          ? "O que você consumiu (data da compra)."
          : "O que sai/saiu da conta (inclui parcelas projetadas)."}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Receitas" value={totalRec} tone="success" />
        <Stat label="Despesas" value={totalDesp} tone="destructive" />
        <Stat label="Saldo" value={totalRec - totalDesp} tone="primary" />
      </div>

      <section className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-surface p-5 shadow-soft">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
          <CreditCard className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Total comprometido em parcelas
          </div>
          <div className="font-display text-3xl tabular-nums text-primary">
            {fmt(inst?.totalCommitted ?? 0)}
          </div>
          <div className="text-xs text-muted-foreground">
            Parcelas futuras ainda não pagas — veja detalhes em Parcelas.
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <h2 className="font-display text-2xl">Por categoria</h2>
        {byCat.length === 0 ? (
          <Empty />
        ) : (
          <div className="mt-3 grid items-center gap-4 md:grid-cols-2">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCat}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {byCat.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any) => fmt(Number(v))}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-1.5 text-sm">
              {byCat
                .sort((a, b) => b.value - a.value)
                .map((c, i) => (
                  <li key={c.name} className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                      {c.name}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{fmt(c.value)}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <h2 className="font-display text-2xl">Mês a mês</h2>
        {byMonth.length === 0 ? (
          <Empty />
        ) : (
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMonth}>
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  formatter={(v: any) => fmt(Number(v))}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                  }}
                />
                <Bar dataKey="rec" fill="var(--color-success)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="desp" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <h2 className="font-display text-2xl">Últimas transações</h2>
        <ul className="mt-2 divide-y divide-border">
          {txs.slice(0, 15).map((t) => (
            <li key={t.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <div className="font-medium">
                  {t.description}{" "}
                  {t.status === "projetado" && (
                    <span className="ml-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-secondary-foreground">
                      projetado
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.category} · {new Date(t.occurred_at).toLocaleDateString("pt-BR")}
                </div>
              </div>
              <div
                className={
                  "tabular-nums font-medium " +
                  (t.type === "receita" ? "text-[color:var(--success)]" : "text-foreground")
                }
              >
                {t.type === "receita" ? "+" : "−"} {fmt(Number(t.amount))}
              </div>
            </li>
          ))}
          {txs.length === 0 && <Empty />}
        </ul>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "destructive" | "primary";
}) {
  const color =
    tone === "success"
      ? "var(--success)"
      : tone === "destructive"
        ? "var(--destructive)"
        : "var(--primary)";
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl tabular-nums" style={{ color }}>
        {fmt(value)}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground">
      Nenhum dado ainda — registre um gasto na conversa.
    </p>
  );
}
