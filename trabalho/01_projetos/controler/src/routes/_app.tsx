import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { MessageCircle, Target, BarChart3, Settings, CreditCard } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const tabs = [
  { to: "/chat", label: "Conversa", icon: MessageCircle },
  { to: "/goals", label: "Metas", icon: Target },
  { to: "/installments", label: "Parcelas", icon: CreditCard },
  { to: "/reports", label: "Relatórios", icon: BarChart3 },
  { to: "/settings", label: "Ajustes", icon: Settings },
] as const;

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm pb-24">
      <Outlet />
      <nav className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full border border-border bg-surface/90 px-2 py-2 shadow-soft backdrop-blur">
        <ul className="flex items-center gap-1">
          {tabs.map((t) => {
            const active = location.pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className={
                    "flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors " +
                    (active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
