'use client';

import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window?.location?.href : '';
    if (typeof navigator !== 'undefined' && navigator?.share) {
      try {
        await navigator.share({ title: title ?? '', url });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    const url = typeof window !== 'undefined' ? window?.location?.href : '';
    try {
      await navigator?.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Compartilhar:</span>
      <button
        onClick={handleShare}
        className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
        aria-label="Compartilhar"
      >
        <Share2 className="w-4 h-4" />
      </button>
      <button
        onClick={handleCopy}
        className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
        aria-label="Copiar link"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
