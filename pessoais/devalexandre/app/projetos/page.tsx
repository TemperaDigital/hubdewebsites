import { Metadata } from 'next';
import { projetos } from '@/content/projetos';
import { ProjectCard } from '@/components/project-card';
import { Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Projetos',
  description: 'Projetos pessoais e profissionais de Alexandre Guerra.',
};

export default function ProjetosPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-2">
          <Layers className="w-7 h-7 text-primary" />
          Projetos
        </h1>
        <p className="text-muted-foreground">
          Projetos pessoais e profissionais que venho construindo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(projetos ?? []).map((proj: any, i: number) => (
          <ProjectCard
            key={proj?.nome}
            nome={proj?.nome ?? ''}
            ano={proj?.ano ?? 2025}
            descricao={proj?.descricao ?? ''}
            stack={proj?.stack ?? []}
            links={proj?.links ?? {}}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
