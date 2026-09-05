import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/goals")({
  component: GoalsPage,
});

type Goal = {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
};

function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");

  async function load() {
    const { data } = await supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });
    setGoals((data ?? []) as Goal[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("goals").insert({
      user_id: u.user.id,
      title,
      target_amount: Number(target),
      deadline: deadline || null,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Meta criada!");
      setTitle("");
      setTarget("");
      setDeadline("");
      setOpen(false);
      load();
    }
  }

  async function addProgress(g: Goal, value: number) {
    const newAmt = Math.max(0, g.current_amount + value);
    await supabase.from("goals").update({ current_amount: newAmt }).eq("id", g.id);
    load();
  }

  async function remove(id: string) {
    await supabase.from("goals").delete().eq("id", id);
    load();
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl">Suas metas</h1>
          <p className="text-sm text-muted-foreground">
            Defina objetivos e acompanhe o progresso aos poucos.
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Nova
        </button>
      </div>

      {open && (
        <form
          onSubmit={create}
          className="mt-5 space-y-3 rounded-2xl border border-border bg-surface p-5 shadow-soft"
        >
          <input
            required
            placeholder="Ex.: Viagem para a praia"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="number"
              min="1"
              step="0.01"
              placeholder="Valor alvo (R$)"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground">
            Criar meta
          </button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {goals.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-8 text-center text-sm text-muted-foreground">
            Você ainda não tem metas. Crie a primeira ✨
          </div>
        )}
        {goals.map((g) => {
          const pct = Math.min(
            100,
            Math.round((g.current_amount / g.target_amount) * 100),
          );
          return (
            <div
              key={g.id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl">{g.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    R$ {g.current_amount.toFixed(2)} de R$ {g.target_amount.toFixed(2)}
                    {g.deadline ? ` · até ${new Date(g.deadline).toLocaleDateString("pt-BR")}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => remove(g.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-3 flex gap-2">
                {[50, 100, 250].map((v) => (
                  <button
                    key={v}
                    onClick={() => addProgress(g, v)}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:bg-secondary"
                  >
                    + R$ {v}
                  </button>
                ))}
                <button
                  onClick={() => addProgress(g, -50)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:bg-secondary"
                >
                  − R$ 50
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
