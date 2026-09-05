import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [agentName, setAgentName] = useState("Fin");
  const [email, setEmail] = useState("");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("display_name, agent_name")
        .eq("id", u.user.id)
        .single();
      if (data) {
        setDisplayName(data.display_name ?? "");
        setAgentName(data.agent_name ?? "Fin");
      }
    })();
  }, []);

  async function save() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, agent_name: agentName })
      .eq("id", u.user.id);
    if (error) toast.error(error.message);
    else toast.success("Salvo!");
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-8">
      <h1 className="font-display text-4xl">Ajustes</h1>
      <p className="text-sm text-muted-foreground">Personalize sua experiência.</p>

      <div className="mt-6 space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <Field label="Email">
          <input
            disabled
            value={email}
            className="w-full rounded-xl border border-input bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground"
          />
        </Field>
        <Field label="Seu nome">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <Field label="Nome do seu agente financeiro">
          <input
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <button
          onClick={save}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground"
        >
          Salvar
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <h2 className="font-display text-2xl">Privacidade</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Seus dados ficam protegidos por regras de acesso — só você pode ver suas
          transações, metas e conversas.
        </p>
      </div>

      <button
        onClick={logout}
        className="mt-4 w-full rounded-xl border border-border bg-surface py-2.5 text-sm text-muted-foreground hover:text-destructive"
      >
        Sair da conta
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
