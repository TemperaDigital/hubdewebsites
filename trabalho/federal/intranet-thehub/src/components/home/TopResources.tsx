import { useState } from 'react'
import { Search, FileText, ArrowUpRight } from 'lucide-react'
import { Card, CardBody } from '../ui'
import { SectionHeader } from '../SectionHeader'
import { resources, resourceCategories } from '@/data/mock'

export function TopResources() {
  const [active, setActive] = useState(resourceCategories[0])
  const [q, setQ] = useState('')

  const list = resources.filter(
    (r) => (r.category === active) && r.title.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <Card>
      <CardBody>
        <SectionHeader title="Recursos" />
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-hub-border bg-slate-50 px-3 py-2">
          <Search className="h-4 w-4 text-hub-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar documentos…"
            className="w-full bg-transparent text-sm focus:outline-none"
            aria-label="Buscar documentos"
          />
        </div>

        <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto">
          {resourceCategories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={
                'shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ' +
                (active === c ? 'bg-hub-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
              }
            >
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          {list.length === 0 && (
            <p className="py-6 text-center text-sm text-hub-muted">Nenhum documento nesta categoria.</p>
          )}
          {list.map((r) => (
            <a
              key={r.id}
              href={r.url}
              className="group flex items-center gap-3 rounded-lg border border-hub-border p-2.5 transition hover:bg-slate-50"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-hub-primary/5 text-hub-primary">
                <FileText className="h-4.5 w-4.5" />
              </span>
              <span className="flex-1 text-sm font-medium text-slate-700">{r.title}</span>
              <ArrowUpRight className="h-4 w-4 text-hub-muted opacity-0 transition group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
