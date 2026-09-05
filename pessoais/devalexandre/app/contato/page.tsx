import { Metadata } from 'next';
import { ContactForm } from '@/components/contact-form';
import { Mail, Instagram, Linkedin, Github } from 'lucide-react';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Entre em contato com Alexandre Guerra para projetos, parcerias ou uma conversa.',
};

export default function ContatoPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-2">
          <Mail className="w-7 h-7 text-primary" />
          Contato
        </h1>
        <p className="text-muted-foreground">
          Quer trocar uma ideia sobre um projeto, parceria ou sobre a Tempera Digital? Preencha o formulário abaixo ou me encontre nas redes.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ContactForm />
        </div>
        <div className="lg:col-span-2">
          <div className="p-5 rounded-lg bg-card" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h3 className="font-display font-semibold text-foreground mb-4">Outras formas de contato</h3>
            <div className="space-y-3">
              <a href={`mailto:${siteConfig?.email}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4" /> {siteConfig?.email ?? ''}
              </a>
              <a href={siteConfig?.social?.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-4 h-4" /> Instagram
              </a>
              <a href={siteConfig?.social?.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
              <a href={siteConfig?.social?.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-4 h-4" /> GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
