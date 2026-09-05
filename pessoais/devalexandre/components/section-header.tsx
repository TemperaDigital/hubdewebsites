import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  href?: string;
  linkText?: string;
  icon?: LucideIcon;
}

export function SectionHeader({ title, href, linkText = 'Ver todos', icon: Icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-primary" />}
        {title}
      </h2>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
          {linkText} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
