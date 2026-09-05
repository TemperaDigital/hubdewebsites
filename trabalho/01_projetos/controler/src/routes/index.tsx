import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Target, BarChart3, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fin — finanças por conversa" },
      {
        name: "description",
        content:
          "Um agente financeiro que registra gastos, acompanha metas e dá dicas — tudo conversando em português.",
      },
      { property: "og:title", content: "Fin — finanças por conversa" },
      {
        property: "og:description",
        content:
          "Organize suas finanças pessoais conversando. Sem formulários, sem planilhas.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-warm">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground font-display text-xl">
            f
          </div>
          <span className="font-display text-2xl">Fin</span>
        </div>
        <Link
          to="/auth"
          className="rounded-full border border-border bg-surface/80 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-surface"
        >
          Entrar
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="grid items-center gap-10 pt-8 pb-20 md:grid-cols-2 md:pt-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Seu agente financeiro
            </span>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] text-balance md:text-7xl">
              Finanças que cabem em uma <em className="text-primary">conversa</em>.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Diga ao Fin “gastei 32 no almoço” e pronto — ele categoriza, atualiza
              seus relatórios e te ajuda a manter as metas. Sem planilhas, sem
              formulários.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90"
              >
                Começar grátis
              </Link>
              <a
                href="#como-funciona"
                className="rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium hover:bg-secondary"
              >
                Como funciona
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
              <div className="space-y-3 text-sm">
                <Bubble who="me">Gastei 48 reais no mercado agora</Bubble>
                <Bubble who="fin">
                  Anotado ✦ R$ 48 em <b>alimentação</b>. Esse mês você já tá em 72%
                  do limite — quer ver o resumo?
                </Bubble>
                <Bubble who="me">Quanto falta pra minha viagem?</Bubble>
                <Bubble who="fin">
                  Faltam R$ 1.240 dos R$ 3.000. No ritmo atual, você chega lá em
                  <b> 7 semanas</b>. Posso sugerir 2 cortes pra acelerar?
                </Bubble>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 rounded-2xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-soft">
              + R$ 120 economizados esta semana
            </div>
          </div>
        </section>

        <section id="como-funciona" className="grid gap-5 pb-24 md:grid-cols-3">
          <Feature
            icon={<MessageCircle className="h-5 w-5" />}
            title="Converse, não preencha"
            desc="Registre gastos em linguagem natural. O Fin entende e categoriza por você."
          />
          <Feature
            icon={<Target className="h-5 w-5" />}
            title="Metas que respiram"
            desc="Defina objetivos e acompanhe o progresso com lembretes gentis e recomendações."
          />
          <Feature
            icon={<BarChart3 className="h-5 w-5" />}
            title="Relatórios que ensinam"
            desc="Gráficos simples e comentados pelo agente, explicando o que mudou no seu mês."
          />
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Feito com cuidado · Fin {new Date().getFullYear()}
      </footer>
    </div>
  );
}

function Bubble({ who, children }: { who: "me" | "fin"; children: React.ReactNode }) {
  return (
    <div className={who === "me" ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          "max-w-[85%] rounded-2xl px-4 py-2.5 " +
          (who === "me"
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-secondary text-secondary-foreground rounded-bl-sm")
        }
      >
        {children}
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-2xl">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
