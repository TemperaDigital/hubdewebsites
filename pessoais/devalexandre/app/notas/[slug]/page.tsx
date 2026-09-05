import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllNotas, getNotaBySlug } from '@/lib/mdx';
import { Calendar, ArrowLeft } from 'lucide-react';

export async function generateStaticParams() {
  const notas = await getAllNotas();
  return (notas ?? []).map((nota: any) => ({ slug: nota?.slug ?? '' }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const nota = await getNotaBySlug(params?.slug ?? '');
  if (!nota) return { title: 'Nota não encontrada' };
  return {
    title: nota?.frontmatter?.title ?? 'Nota',
  };
}

export default async function NotaPage({ params }: { params: { slug: string } }) {
  const nota = await getNotaBySlug(params?.slug ?? '');
  if (!nota) notFound();

  return (
    <article className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
      <Link href="/notas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar às notas
      </Link>

      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-3">
          {nota?.frontmatter?.title ?? ''}
        </h1>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {new Date(nota?.frontmatter?.date ?? '').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </span>
      </header>

      <div
        className="prose-custom"
        dangerouslySetInnerHTML={{ __html: nota?.htmlContent ?? '' }}
      />
    </article>
  );
}
