import { PartyPopper } from 'lucide-react'
import { Card, CardBody, Avatar, Badge } from '../ui'
import { SectionHeader } from '../SectionHeader'
import { anniversaries } from '@/data/mock'

export function Anniversaries() {
  return (
    <Card>
      <CardBody>
        <SectionHeader title="Aniversários de Casa" />
        <div className="space-y-2">
          {anniversaries.map((a) => (
            <div key={a.ref} className="flex items-center gap-3 rounded-lg border border-hub-border p-2.5">
              <Avatar name={a.fullName} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{a.fullName}</p>
                <p className="text-xs text-hub-muted">{a.jobTitle} · {a.date}</p>
              </div>
              <Badge className="bg-hub-accent/15 text-hub-primary">
                <PartyPopper className="mr-1 h-3 w-3" />
                {a.years} {a.years === 1 ? 'ano' : 'anos'}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
