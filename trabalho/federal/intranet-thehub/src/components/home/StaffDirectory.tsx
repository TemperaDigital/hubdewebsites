import { useState } from 'react'
import { Search, Mail, Phone, Building2 } from 'lucide-react'
import { Card, CardBody, Avatar } from '../ui'
import { SectionHeader } from '../SectionHeader'
import { people } from '@/data/mock'

export function StaffDirectory() {
  const [q, setQ] = useState('')
  const list = people.filter((p) =>
    (p.fullName + ' ' + (p.department ?? '')).toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <Card>
      <CardBody>
        <SectionHeader title="Diretório de Pessoas" moreLabel="Ver diretório" onMore={() => {}} />
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-hub-border bg-slate-50 px-3 py-2">
          <Search className="h-4 w-4 text-hub-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome ou departamento…"
            className="w-full bg-transparent text-sm focus:outline-none"
            aria-label="Buscar pessoas"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((p) => (
            <div key={p.ref} className="rounded-lg border border-hub-border p-3">
              <div className="flex items-center gap-3">
                <Avatar name={p.fullName} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{p.fullName}</p>
                  <p className="text-xs text-hub-muted">{p.jobTitle}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-xs text-hub-muted">
                <p className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {p.department}</p>
                <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {p.businessPhone}</p>
                <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {p.email}</p>
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <p className="col-span-full py-6 text-center text-sm text-hub-muted">Ninguém encontrado.</p>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
