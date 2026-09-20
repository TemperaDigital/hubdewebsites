export function Footer() {
  return (
    <footer className="mt-10 border-t border-hub-border bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-hub-muted sm:flex-row">
        <span>© {new Date().getFullYear()} The Hub — Portal do Colaborador</span>
        <span>Contato da intranet: suporte@org.gov.br</span>
      </div>
    </footer>
  )
}
