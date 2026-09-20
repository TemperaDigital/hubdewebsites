import { useState } from 'react'
import { Search, ChevronDown, Bell, Menu } from 'lucide-react'
import { Avatar } from './ui'
import { currentUser } from '@/data/mock'

const menus = [
  { label: 'Recursos da Empresa', items: ['Políticas', 'Formulários', 'Modelos', 'Manuais'] },
  { label: 'Recursos do Colaborador', items: ['Benefícios', 'Férias', 'Ponto', 'Treinamentos'] },
  { label: 'Áreas & Equipes', items: ['Diretório', 'Organograma', 'Projetos'] },
  { label: 'Empresa & Notícias', items: ['Notícias', 'Eventos', 'Mural'] },
]

export function TopNav() {
  const [open, setOpen] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-hub-border bg-hub-primary text-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-hub-accent text-hub-primary">H</span>
          <span className="text-lg">The Hub</span>
        </a>

        {/* Menus (desktop) */}
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {menus.map((m) => (
            <div
              key={m.label}
              className="relative"
              onMouseEnter={() => setOpen(m.label)}
              onMouseLeave={() => setOpen(null)}
            >
              <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10">
                {m.label}
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>
              {open === m.label && (
                <div className="absolute left-0 top-full w-56 rounded-xl border border-hub-border bg-white p-2 text-slate-700 shadow-cardHover">
                  {m.items.map((it) => (
                    <a key={it} href="#" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50">
                      {it}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Busca */}
        <div className="ml-auto hidden items-center md:flex">
          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5">
            <Search className="h-4 w-4 text-white/70" />
            <input
              placeholder="Buscar na intranet…"
              className="w-48 bg-transparent text-sm text-white placeholder:text-white/60 focus:outline-none"
              aria-label="Buscar na intranet"
            />
          </div>
        </div>

        {/* Ações */}
        <button className="ml-auto grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 md:ml-2" aria-label="Notificações">
          <Bell className="h-5 w-5" />
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <Avatar name={currentUser.fullName} className="bg-white/15" />
        </div>
        <button
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-hub-primary px-4 py-2 lg:hidden">
          {menus.map((m) => (
            <div key={m.label} className="py-1">
              <p className="px-1 py-1 text-xs font-semibold uppercase tracking-wide text-white/60">{m.label}</p>
              <div className="flex flex-wrap gap-2">
                {m.items.map((it) => (
                  <a key={it} href="#" className="rounded-md bg-white/10 px-2.5 py-1 text-sm">{it}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  )
}
