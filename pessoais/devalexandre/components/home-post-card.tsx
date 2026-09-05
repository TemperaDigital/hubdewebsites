'use client';

import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomePostCardProps {
  slug: string;
  title: string;
  date: string;
  description: string;
  readingTime: number;
  index: number;
}

export function HomePostCard({ slug, title, date, description, readingTime, index }: HomePostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index ?? 0) * 0.1 }}
    >
      <Link
        href={`/blog/${slug}`}
        className="block p-5 rounded-lg bg-card hover:bg-muted/50 transition-all duration-200 h-full group"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
          {title ?? ''}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description ?? ''}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(date ?? '').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {readingTime ?? 1} min
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
