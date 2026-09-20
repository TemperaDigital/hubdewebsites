import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { SectionHeader } from '../SectionHeader'
import { kpis } from '@/data/mock'

const trendIcon = { up: TrendingUp, down: TrendingDown, flat: Minus }

export function KpiTiles() {
  return (
    <section>
      <SectionHeader title="Indicadores" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k) => {
          const Icon = trendIcon[k.trend]
          return (
            <div
              key={k.id}
              className="rounded-xl p-4 text-white shadow-card"
              style={{ backgroundColor: k.colorToken }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-white/80">{k.label}</p>
                <Icon className="h-4 w-4 text-white/80" />
              </div>
              <p className="mt-2 text-2xl font-extrabold">{k.displayValue}</p>
              <p className="text-[11px] text-white/70">{k.period}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
