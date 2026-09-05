import { Metadata } from 'next';
import { getPageContent } from '@/lib/mdx';
import { AvatarPortal } from '@/components/avatar-portal';
import { Github, Linkedin, Instagram, Mail } from 'lucide-react';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Sobre',
  description: 'Conheça Alexandre Guerra — desenvolvedor web, servidor público, educador e criador de conteúdo.',
};

export default async function SobrePage() {
  const content = await getPageContent('sobre');

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col items-center mb-10">
        <AvatarPortal size="lg" />
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mt-6 mb-2">Sobre mim</h1>
        <p className="text-muted-foreground text-center max-w-lg">
          Desenvolvedor, educador e criador — compartilhando o que aprendo no caminho.
        </p>
      </div>

      {content?.htmlContent && (
        <div
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: content.htmlContent }}
        />
      )}

      <div className="mt-10 pt-6 border-t border-border/50">
        <h3 className="font-display font-semibold text-foreground mb-4">Onde me encontrar</h3>
        <div className="flex flex-wrap gap-3">
          <a href={siteConfig?.social?.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card text-muted-foreground hover:text-primary hover:bg-muted transition-colors text-sm" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <Github className="w-4 h-4" /> GitHub
          </a>
          <a href={siteConfig?.social?.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card text-muted-foreground hover:text-primary hover:bg-muted transition-colors text-sm" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <Linkedin className="w-4 h-4" /> LinkedIn
          </a>
          <a href={siteConfig?.social?.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card text-muted-foreground hover:text-primary hover:bg-muted transition-colors text-sm" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <Instagram className="w-4 h-4" /> Instagram
          </a>
          <a href={`mailto:${siteConfig?.email}`} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card text-muted-foreground hover:text-primary hover:bg-muted transition-colors text-sm" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <Mail className="w-4 h-4" /> Email
          </a>
        </div>
      </div>
    </div>
  );
}
