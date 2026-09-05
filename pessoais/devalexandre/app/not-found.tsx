import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-20 text-center">
      <h1 className="font-display text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="font-display text-2xl font-bold text-foreground mb-3">
        Página não encontrada
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        A página que você procura não existe ou foi movida. Que tal voltar para a home ou fazer uma busca?
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Home className="w-4 h-4" /> Ir para a home
        </Link>
        <Link
          href="/busca"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground font-medium text-sm hover:bg-muted/80 transition-colors"
        >
          <Search className="w-4 h-4" /> Buscar
        </Link>
      </div>
    </div>
  );
}
