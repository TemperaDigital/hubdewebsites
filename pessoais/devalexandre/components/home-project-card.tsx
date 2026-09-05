'use client';

import { ExternalLink, Github, FileText, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomeProjectCardProps {
  nome: string;
  ano: number;
  descricao: string;
  stack: string[];
  links: { github?: string; demo?: string; artigo?: string };
  index: number;
}

export function HomeProjectCard({ nome, ano, descricao, stack, links, index }: HomeProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index ?? 0) * 0.1 }}
      className="p-5 rounded-lg bg-card hover:bg-muted/50 transition-all duration-200 h-full"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Layers className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-foreground">{nome ?? ''}</h3>
        <span className="text-xs text-muted-foreground font-mono ml-auto">{ano ?? ''}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{descricao ?? ''}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {(stack ?? []).slice(0, 4).map((tech: string) => (
          <span key={tech} className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">{tech}</span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {links?.demo && (
          <a href={links.demo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
            <ExternalLink className="w-3 h-3" /> Demo
          </a>
        )}
        {links?.github && (
          <a href={links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
            <Github className="w-3 h-3" /> GitHub
          </a>
        )}
        {links?.artigo && (
          <a href={links.artigo} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
            <FileText className="w-3 h-3" /> Artigo
          </a>
        )}
      </div>
    </motion.div>
  );
}
