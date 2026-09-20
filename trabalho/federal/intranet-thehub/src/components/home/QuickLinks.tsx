import { Plus, Palmtree, Clock, HeartPulse, LifeBuoy, BarChart3, Kanban, Users, type LucideIcon } from 'lucide-react'
import { quickLinks } from '@/data/mock'

const iconMap: Record<string, LucideIcon> = {
  palmtree: Palmtree, clock: Clock, 'heart-pulse': HeartPulse, 'life-buoy': LifeBuoy,
  'bar-chart-3': BarChart3, kanban: Kanban, users: Users,
}

export function QuickLinks() {
  return (
    <section>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {/* Adicionar/gerenciar favoritos */}
        <button className="flex w-24 shrink-0 flex-col items-center gap-2 rounded-xl border border-dashed border-hub-border bg-white p-3 text-hub-muted transition hover:border-hub-accent hover:text-hub-primary">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100">
            <Plus className="h-5 w-5" />
          </span>
          <span className="text-xs font-medium">Gerenciar</span>
        </button>

        {quickLinks.map((q) => {
          const Icon = iconMap[q.icon] ?? Users
          return (
            <a
              key={q.id}
              href={q.url}
              className="flex w-24 shrink-0 flex-col items-center gap-2 rounded-xl border border-hub-border bg-white p-3 text-center shadow-card transition hover:-translate-y-0.5 hover:shadow-cardHover"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full text-white" style={{ backgroundColor: q.color }}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold text-slate-700">{q.label}</span>
            </a>
          )
        })}
      </div>
    </section>
  )
}
