import { Metadata } from 'next';
import { recursos } from '@/content/recursos';
import { BookOpen, ExternalLink, Wrench, GraduationCap, FileText, BookMarked } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Recursos',
  description: 'Livros, cursos, ferramentas e artigos recomendados por Alexandre Guerra.',
};

const typeIcons: Record<string, any> = {
  livro: BookMarked,
  curso: GraduationCap,
  ferramenta: Wrench,
  artigo: FileText,
};

const typeLabels: Record<string, string> = {
  livro: 'Livro',
  curso: 'Curso',
  ferramenta: 'Ferramenta',
  artigo: 'Artigo',
};

export default function RecursosPage() {
  const tipos = ['ferramenta', 'curso', 'livro', 'artigo'];

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-primary" />
          Recursos
        </h1>
        <p className="text-muted-foreground">
          Ferramentas, cursos, livros e artigos que recomendo.
        </p>
      </div>

      {tipos.map((tipo: string) => {
        const items = (recursos ?? []).filter((r: any) => r?.tipo === tipo);
        if ((items?.length ?? 0) === 0) return null;
        const Icon = typeIcons[tipo] ?? BookOpen;

        return (
          <section key={tipo} className="mb-10">
            <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2 capitalize">
              <Icon className="w-5 h-5 text-primary" /> {typeLabels[tipo] ?? tipo}s
            </h2>
            <div className="space-y-3">
              {(items ?? []).map((recurso: any) => (
                <a
                  key={recurso?.titulo}
                  href={recurso?.link ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 rounded-lg bg-card hover:bg-muted/50 transition-all duration-200 group"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {recurso?.titulo ?? ''}
                        </h3>
                        {recurso?.gratuito && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium">Gratuito</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{recurso?.descricao ?? ''}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </a>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
