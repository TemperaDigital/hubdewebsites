import { Construction } from 'lucide-react'
import { Card, CardBody } from '@/components/ui'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <Card>
      <CardBody className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-hub-accent/15 text-hub-primary">
          <Construction className="h-6 w-6" />
        </span>
        <h1 className="text-lg font-bold text-hub-primary">{title}</h1>
        <p className="max-w-md text-sm text-hub-muted">
          Esta página faz parte do roadmap (PRD v3). Será construída nas próximas fases.
        </p>
      </CardBody>
    </Card>
  )
}
