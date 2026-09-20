import { HeroNews } from '@/components/home/HeroNews'
import { QuickLinks } from '@/components/home/QuickLinks'
import { TopResources } from '@/components/home/TopResources'
import { Kudos } from '@/components/home/Kudos'
import { EventsCalendar } from '@/components/home/EventsCalendar'
import { StaffDirectory } from '@/components/home/StaffDirectory'
import { Anniversaries } from '@/components/home/Anniversaries'
import { KpiTiles } from '@/components/home/KpiTiles'

export function HomePage() {
  return (
    <div className="space-y-6">
      <HeroNews />
      <QuickLinks />

      {/* Três colunas: Recursos | Kudos | Calendário */}
      <div className="grid gap-4 lg:grid-cols-3">
        <TopResources />
        <Kudos />
        <EventsCalendar />
      </div>

      {/* Duas colunas: Diretório | Aniversários */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StaffDirectory />
        </div>
        <Anniversaries />
      </div>

      <KpiTiles />
    </div>
  )
}
