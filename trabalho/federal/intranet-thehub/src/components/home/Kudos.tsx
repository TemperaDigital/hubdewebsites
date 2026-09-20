import { Heart, PartyPopper } from 'lucide-react'
import { Card, CardBody, Button, Avatar } from '../ui'
import { SectionHeader } from '../SectionHeader'
import { kudos } from '@/data/mock'

export function Kudos() {
  return (
    <Card>
      <CardBody>
        <SectionHeader title="Reconhecimentos" />
        <div className="space-y-3">
          {kudos.map((k) => (
            <div key={k.id} className="rounded-lg border border-hub-border p-3">
              <div className="flex items-center gap-2">
                <Avatar name={k.from} className="h-8 w-8" />
                <p className="text-sm">
                  <span className="font-semibold text-slate-800">{k.from}</span>
                  <span className="text-hub-muted"> reconheceu </span>
                  <span className="font-semibold text-slate-800">{k.to}</span>
                </p>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">{k.message}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-hub-muted">
                <Heart className="h-3.5 w-3.5 text-hub-accent" /> {k.reactions}
              </div>
            </div>
          ))}
        </div>
        <Button variant="accent" className="mt-3 w-full">
          <PartyPopper className="h-4 w-4" /> Reconhecer alguém
        </Button>
      </CardBody>
    </Card>
  )
}
