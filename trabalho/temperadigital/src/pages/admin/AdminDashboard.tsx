import { Link } from "react-router-dom";
import { GraduationCap, FileText, Link2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTracks, usePosts, usePlatforms } from "@/hooks/useSiteData";

export default function AdminDashboard() {
  const { data: tracks } = useTracks();
  const { data: posts } = usePosts({ includeDrafts: true });
  const { data: platforms } = usePlatforms();

  const cards = [
    { label: "Trilhas", count: tracks?.length ?? 0, icon: GraduationCap, to: "/admin/trilhas" },
    { label: "Posts", count: posts?.length ?? 0, icon: FileText, to: "/admin/posts" },
    { label: "Plataformas", count: platforms?.length ?? 0, icon: Link2, to: "/admin/plataformas" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Painel</h1>
        <p className="mt-1 text-muted-foreground">Gerencie o conteúdo do seu site.</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="text-3xl font-bold">{c.count}</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <c.icon className="h-6 w-6" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <p className="text-sm text-muted-foreground">Pronto para escrever algo novo?</p>
          <Link to="/admin/posts" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Ir para o blog <ArrowRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
