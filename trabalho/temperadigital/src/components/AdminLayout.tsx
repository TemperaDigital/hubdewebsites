import { Navigate, NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, GraduationCap, FileText, Link2, LogOut, Loader2, ExternalLink } from "lucide-react";

const adminNav = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, end: true },
  { to: "/admin/trilhas", label: "Trilhas", icon: GraduationCap },
  { to: "/admin/posts", label: "Blog", icon: FileText },
  { to: "/admin/plataformas", label: "Plataformas", icon: Link2 },
];

export function AdminLayout() {
  const { session, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col gap-2 border-b bg-sidebar p-4 text-sidebar-foreground md:w-64 md:border-b-0 md:border-r">
        <Link to="/" className="mb-4 hidden md:block">
          <span className="text-sidebar-foreground">
            <Logo />
          </span>
        </Link>
        <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden flex-col gap-2 md:flex">
          <Button asChild variant="ghost" size="sm" className="justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <Link to="/"><ExternalLink className="mr-2 h-4 w-4" /> Ver site</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut} className="justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut} className="justify-start text-sidebar-foreground/70 md:hidden">
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </aside>

      <main className="flex-1 overflow-auto bg-background p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
