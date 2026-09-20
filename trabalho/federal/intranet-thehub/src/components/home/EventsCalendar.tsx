import { Card, CardBody, Badge } from '../ui'
import { SectionHeader } from '../SectionHeader'
import { events } from '@/data/mock'

const WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function useMonthGrid() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const first = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(first).fill(null)
  for (let d = 1; d <= days; d++) cells.push(d)
  const eventDays = new Set(
    events
      .map((e) => new Date(e.startAt))
      .filter((d) => d.getFullYear() === year && d.getMonth() === month)
      .map((d) => d.getDate()),
  )
  const label = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return { cells, eventDays, today: now.getDate(), label }
}

export function EventsCalendar() {
  const { cells, eventDays, today, label } = useMonthGrid()

  return (
    <Card>
      <CardBody>
        <SectionHeader title="Calendário" />
        <p className="mb-2 text-center text-sm font-semibold capitalize text-slate-700">{label}</p>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {WEEK.map((w, i) => (
            <span key={i} className="py-1 font-medium text-hub-muted">{w}</span>
          ))}
          {cells.map((d, i) => (
            <div
              key={i}
              className={
                'relative aspect-square rounded-md py-1 ' +
                (d === today ? 'bg-hub-primary font-semibold text-white' : d ? 'text-slate-700 hover:bg-slate-100' : '')
              }
            >
              {d ?? ''}
              {d && eventDays.has(d) && d !== today && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-hub-accent" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-hub-muted">Próximos eventos</p>
          {events.map((e) => (
            <div key={e.id} className="flex items-start gap-3 rounded-lg border border-hub-border p-2.5">
              <div className="text-center">
                <p className="text-sm font-bold leading-none text-hub-primary">
                  {new Date(e.startAt).getDate()}
                </p>
                <p className="text-[10px] uppercase text-hub-muted">
                  {new Date(e.startAt).toLocaleDateString('pt-BR', { month: 'short' })}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium leading-snug text-slate-700">{e.title}</p>
                <p className="text-xs text-hub-muted">{e.time}</p>
              </div>
              {e.category && <Badge>{e.category}</Badge>}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
