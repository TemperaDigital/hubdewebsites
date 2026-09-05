'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, FileText, StickyNote } from 'lucide-react';
import Fuse from 'fuse.js';
import type { SearchItem } from '@/lib/search-index';

interface SearchBoxProps {
  items: SearchItem[];
}

export function SearchBox({ items }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);

  const fuse = useMemo(() => new Fuse(items ?? [], {
    keys: ['title', 'description', 'tags'],
    threshold: 0.3,
    includeScore: true,
  }), [items]);

  useEffect(() => {
    if (!query?.trim()) {
      setResults([]);
      return;
    }
    const searchResults = fuse?.search?.(query) ?? [];
    setResults(searchResults.map((r: any) => r?.item).filter(Boolean));
  }, [query, fuse]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e: any) => setQuery(e?.target?.value ?? '')}
          placeholder="Buscar posts e notas..."
          className="w-full pl-12 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          autoFocus
        />
      </div>

      {query?.trim() && (
        <div className="mt-4">
          {(results?.length ?? 0) === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum resultado encontrado para "{query}"</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">{results?.length ?? 0} resultado(s) encontrado(s)</p>
              {(results ?? []).map((item: SearchItem) => (
                <Link
                  key={`${item?.type}-${item?.slug}`}
                  href={item?.type === 'post' ? `/blog/${item?.slug}` : `/notas/${item?.slug}`}
                  className="block p-4 rounded-lg bg-card hover:bg-muted/50 transition-colors"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <div className="flex items-start gap-3">
                    {item?.type === 'post' ? <FileText className="w-4 h-4 text-primary mt-0.5" /> : <StickyNote className="w-4 h-4 text-primary mt-0.5" />}
                    <div>
                      <h3 className="font-medium text-foreground">{item?.title ?? ''}</h3>
                      {item?.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{item.description}</p>
                      )}
                      <span className="text-xs text-muted-foreground mt-1 block capitalize">{item?.type === 'post' ? 'Blog' : 'Nota'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
