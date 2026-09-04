import Image from 'next/image';
import { assetUrl } from '@/lib/assets';

const artwork = {
  plates: '/dining-plates.webp',
  cutlery: '/dining-cutlery.png',
  room: '/dining-room-miniature.webp',
} as const;

export function DiningAccent({ kind }: { kind: keyof typeof artwork }) {
  return (
    <div className={`ambient-object ambient-${kind}`} aria-hidden="true">
      <Image src={assetUrl(artwork[kind], import.meta.env.BASE_URL)} alt="" width={1024} height={1024}
        sizes="(max-width: 760px) 180px, 340px" />
    </div>
  );
}
