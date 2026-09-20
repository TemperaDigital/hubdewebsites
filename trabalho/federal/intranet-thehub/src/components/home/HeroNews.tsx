import { ArrowRight } from 'lucide-react'
import { Button } from '../ui'
import { currentUser, heroNews, news } from '@/data/mock'

export function HeroNews() {
  return (
    <section className="overflow-hidden rounded-xl bg-hub-primary text-white shadow-card">
      <div className="px-5 pt-6 sm:px-7">
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          Olá, {currentUser.firstName}!
        </h1>
        <p className="mt-1 text-sm text-white/70">Bem-vindo(a) de volta ao portal do colaborador.</p>
      </div>

      <div className="grid gap-4 p-5 sm:p-7 md:grid-cols-3">
        {/* Card mensagem da direção */}
        <div className="flex flex-col justify-between rounded-xl bg-white/10 p-5 ring-1 ring-white/10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-hub-accent">{heroNews.category}</p>
            <h3 className="mt-2 text-lg font-bold leading-snug">{heroNews.title}</h3>
            <p className="mt-2 text-sm text-white/75">{heroNews.summary}</p>
          </div>
          <Button variant="accent" className="mt-4 self-start">Ler mais</Button>
        </div>

        {/* Notícia destaque */}
        <div className="relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-xl bg-gradient-to-br from-hub-primary-600 to-hub-primary-700 p-5">
          <span className="absolute right-4 top-4 rounded-full bg-hub-accent px-2.5 py-0.5 text-xs font-semibold text-hub-primary">
            Destaque
          </span>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/60">{news[0].category}</p>
          <h3 className="mt-1 text-lg font-bold leading-snug">{news[0].title}</h3>
          <a href="#" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-hub-accent">
            Ver notícia <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Lista lateral */}
        <div className="flex flex-col rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="space-y-3">
            {news.map((n) => (
              <a key={n.id} href="#" className="block rounded-lg p-2 transition hover:bg-white/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-hub-accent/90">{n.category}</p>
                <p className="text-sm font-medium leading-snug">{n.title}</p>
              </a>
            ))}
          </div>
          <a href="#" className="mt-3 inline-flex items-center gap-1 self-end text-xs font-semibold text-white/80 hover:text-white">
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  )
}
