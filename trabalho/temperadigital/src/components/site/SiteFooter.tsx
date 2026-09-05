import { Logo } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="container flex flex-col items-center gap-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <Logo />
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Aprendiz de Programação. Estudando todos os dias.
        </p>
      </div>
    </footer>
  );
}
