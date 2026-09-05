'use client';

import Link from 'next/link';
import { Calendar, Clock, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface PostCardProps {
  slug: string;
  title: string;
  date: string;
  description?: string;
  readingTime: number;
  tags?: string[];
  index?: number;
}

export function PostCard({ slug, title, date, description, readingTime, tags, index = 0 }: PostCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index ?? 0) * 0.1 }}
    >
      <Link
        href={`/blog/${slug}`}
        className="block p-5 rounded-lg bg-card hover:bg-muted/50 transition-all duration-200 group"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
          {title ?? 'Sem título'}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(date ?? '').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {readingTime ?? 1} min de leitura
          </span>
          {(tags ?? [])?.length > 0 && (
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {(tags ?? []).slice(0, 3).join(', ')}
            </span>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
