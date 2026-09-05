import { Metadata } from 'next';
import { getPageContent } from '@/lib/mdx';
import { Zap, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Agora',
  description: 'O que Alexandre Guerra está fazendo agora.',
};

export default async function NowPage() {
  const content = await getPageContent('now');

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-2">
          <Zap className="w-7 h-7 text-primary" />
          Agora
        </h1>
        {content?.frontmatter?.updated && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Atualizado em {new Date(content.frontmatter.updated).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        )}
      </div>

      {content?.htmlContent && (
        <div
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: content.htmlContent }}
        />
      )}

      <div className="mt-10 p-5 rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground">
          Esta página é inspirada no movimento{' '}
          <a href="https://nownownow.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            nownownow.com
          </a>
          . Ela mostra o que estou focando no momento, atualizada manualmente quando faz sentido.
        </p>
      </div>
    </div>
  );
}
