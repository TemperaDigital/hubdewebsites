import { Code2 } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Code2 className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-base font-bold tracking-tight">Aprendiz</span>
        <span className="text-[11px] font-medium text-muted-foreground">de Programação</span>
      </span>
    </span>
  );
}
