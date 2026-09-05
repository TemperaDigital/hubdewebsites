import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getInstallments, deleteInstallment } from "@/lib/installments.functions";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/_app/installments")({
  component: InstallmentsPage,
});

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtMonth(key: string) {
  const [y, m] = key.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

function InstallmentsPage() {
  const fetchData = useServerFn(getInstallments);
  const delFn = useServerFn(deleteInstallment);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["installments"],
    queryFn: () => fetchData(),
  });

  const [dialogGroup, setDialogGroup] = useState<any | null>(null);

  const delMutation = useMutation({
    mutationFn: (args: { groupId: string; scope: "one" | "future" | "all"; installmentNumber?: number }) =>
      delFn({ data: args }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["installments"] });
      setDialogGroup(null);
    },
  });

  const chartData = useMemo(() => data?.monthly.map((m) => ({ ...m, label: fmtMonth(m.month) })) ?? [], [data]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-4xl leading-none">Parcelamentos</h1>
          <p className="text-sm text-muted-foreground">Suas compras parceladas e o que ainda está por vir.</p>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-surface p-5 shadow-soft">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Total comprometido</div>
        <div className="mt-1 font-display text-4xl tabular-nums text-primary">
          {fmt(data?.totalCommitted ?? 0)}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Soma de todas as parcelas ainda não pagas.
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <h2 className="font-display text-2xl">Comprometimento futuro</h2>
        {chartData.length === 0 ? (
          <Empty text="Nenhuma parcela futura — você está leve!" />
        ) : (
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  formatter={(v: any) => fmt(Number(v))}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                  }}
                />
                <Bar dataKey="amount" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <h2 className="font-display text-2xl">Compras ativas</h2>
        {isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Carregando...</p>
        ) : (data?.groups.length ?? 0) === 0 ? (
          <Empty text="Nenhuma compra parcelada registrada." />
        ) : (
          <ul className="mt-3 space-y-3">
            {data!.groups.map((g) => {
              const pct = g.installments_total ? (g.paid_count / g.installments_total) * 100 : 0;
              const done = g.paid_count >= g.installments_total;
              return (
                <li
                  key={g.group_id}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{g.description}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {g.category} · {fmt(g.installment_amount)} / mês
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg tabular-nums">{fmt(g.total_amount)}</div>
                      <div className="text-xs text-muted-foreground">total</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>
                        {g.paid_count}/{g.installments_total} pagas
                      </span>
                      <span>
                        {done
                          ? "Quitada"
                          : `Falta ${fmt(g.remaining_amount)} · quita em ${
                              g.last_payment_date
                                ? new Date(g.last_payment_date).toLocaleDateString("pt-BR", {
                                    month: "short",
                                    year: "2-digit",
                                  })
                                : "—"
                            }`}
                      </span>
                    </div>
                    <Progress value={pct} />
                  </div>
                  {!done && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => setDialogGroup(g)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Trash2 className="h-3 w-3" /> Excluir
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {dialogGroup && (
        <DeleteDialog
          group={dialogGroup}
          onClose={() => setDialogGroup(null)}
          onConfirm={(scope, installmentNumber) =>
            delMutation.mutate({ groupId: dialogGroup.group_id, scope, installmentNumber })
          }
          pending={delMutation.isPending}
        />
      )}
    </div>
  );
}

function DeleteDialog({
  group,
  onClose,
  onConfirm,
  pending,
}: {
  group: any;
  onClose: () => void;
  onConfirm: (scope: "one" | "future" | "all", installmentNumber?: number) => void;
  pending: boolean;
}) {
  const nextNumber = group.items
    .filter((i: any) => i.status !== "realizado")
    .map((i: any) => i.installment_number)
    .sort((a: number, b: number) => a - b)[0] ?? group.paid_count + 1;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-2xl">Excluir parcelas</h3>
            <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm">O que você quer fazer?</p>
        <div className="mt-3 space-y-2">
          <button
            disabled={pending}
            onClick={() => onConfirm("one", nextNumber)}
            className="w-full rounded-xl border border-border bg-background p-3 text-left text-sm hover:bg-secondary disabled:opacity-50"
          >
            <div className="font-medium">Só a próxima parcela ({nextNumber}/{group.installments_total})</div>
            <div className="text-xs text-muted-foreground">Mantém as outras parcelas projetadas.</div>
          </button>
          <button
            disabled={pending}
            onClick={() => onConfirm("future", nextNumber)}
            className="w-full rounded-xl border border-border bg-background p-3 text-left text-sm hover:bg-secondary disabled:opacity-50"
          >
            <div className="font-medium">Esta e todas as futuras</div>
            <div className="text-xs text-muted-foreground">Mantém o histórico das parcelas já pagas.</div>
          </button>
          <button
            disabled={pending}
            onClick={() => onConfirm("all")}
            className="w-full rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-left text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            <div className="font-medium">Apagar a compra inteira</div>
            <div className="text-xs opacity-80">Remove pagas e projetadas.</div>
          </button>
        </div>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{text}</p>;
}
