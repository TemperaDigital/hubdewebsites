import { Metadata } from 'next';
import { videos } from '@/content/videos';
import { Video, ExternalLink, Play } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Vídeos',
  description: 'Vídeos próprios e indicados sobre tecnologia, desenvolvimento e carreira.',
};

export default function VideosPage() {
  const meusVideos = (videos ?? []).filter((v: any) => v?.tipo === 'proprio');
  const indicados = (videos ?? []).filter((v: any) => v?.tipo === 'indicacao');

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-2">
          <Video className="w-7 h-7 text-primary" />
          Vídeos
        </h1>
        <p className="text-muted-foreground">
          Conteúdo próprio e curadoria de vídeos que recomendo.
        </p>
      </div>

      {/* Meus vídeos */}
      {(meusVideos?.length ?? 0) > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" /> Meus vídeos
          </h2>
          <div className="space-y-3">
            {(meusVideos ?? []).map((video: any) => (
              <a
                key={video?.titulo}
                href={video?.link ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 rounded-lg bg-card hover:bg-muted/50 transition-all duration-200 group"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                      {video?.titulo ?? ''}
                    </h3>
                    <p className="text-sm text-muted-foreground">{video?.descricao ?? ''}</p>
                    <span className="text-xs text-muted-foreground mt-2 block">{video?.plataforma ?? ''}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Vídeos indicados */}
      {(indicados?.length ?? 0) > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" /> Vídeos que indico
          </h2>
          <div className="space-y-3">
            {(indicados ?? []).map((video: any) => (
              <a
                key={video?.titulo}
                href={video?.link ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 rounded-lg bg-card hover:bg-muted/50 transition-all duration-200 group"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                      {video?.titulo ?? ''}
                    </h3>
                    <p className="text-sm text-muted-foreground">{video?.descricao ?? ''}</p>
                    <span className="text-xs text-muted-foreground mt-2 block">{video?.plataforma ?? ''}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
