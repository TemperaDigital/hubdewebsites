import Image from 'next/image';

interface AvatarPortalProps {
  size?: 'sm' | 'lg';
}

export function AvatarPortal({ size = 'sm' }: AvatarPortalProps) {
  const dimensions = size === 'lg'
    ? { width: 260, height: 346, className: 'w-[260px] h-[346px]' }
    : { width: 180, height: 240, className: 'w-[180px] h-[240px]' };

  return (
    <div className={`relative ${dimensions?.className} flex-shrink-0`}>
      <div className="absolute inset-0 avatar-portal rounded-[50%/40%] overflow-hidden">
        <Image
          src="/images/alexandre-guerra.png"
          alt="Alexandre Guerra - Desenvolvedor, educador e criador de conteúdo"
          width={dimensions?.width}
          height={dimensions?.height}
          className="w-full h-full object-cover object-top"
          priority
        />
      </div>
    </div>
  );
}
