import Link from 'next/link';
import { Github, Instagram, Linkedin, Facebook, Rss, Mail } from 'lucide-react';
import { siteConfig } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Links */}
          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">Navegação</h3>
            <div className="flex flex-col gap-2">
              <Link href="/sobre" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sobre</Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link>
              <Link href="/projetos" className="text-sm text-muted-foreground hover:text-primary transition-colors">Projetos</Link>
            </div>
          </div>

          {/* External */}
          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">Projetos</h3>
            <div className="flex flex-col gap-2">
              <a href={siteConfig?.externalLinks?.temperaDigital} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Tempera Digital</a>
              <a href={siteConfig?.externalLinks?.estudosDev} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Estudos.dev</a>
              <Link href="/feed.xml" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><Rss className="w-3 h-3" /> RSS Feed</Link>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">Redes</h3>
            <div className="flex items-center gap-3">
              <a href={siteConfig?.social?.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"><Github className="w-4 h-4" /></a>
              <a href={siteConfig?.social?.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"><Linkedin className="w-4 h-4" /></a>
              <a href={siteConfig?.social?.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href={siteConfig?.social?.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href={`mailto:${siteConfig?.email}`} aria-label="Email" className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"><Mail className="w-4 h-4" /></a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            © 2025 Alexandre Guerra · Feito com ♥ e código
          </p>
        </div>
      </div>
    </footer>
  );
}
