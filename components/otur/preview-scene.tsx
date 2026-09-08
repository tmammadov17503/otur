'use client';

import { useRef, useState, type PointerEvent } from 'react';
import Image from 'next/image';
import { assetUrl } from '@/lib/assets';

type PreviewSceneProps = {
  restaurantId: string;
  label: string;
  fallback: string;
  scene: number;
};

/** Full-frame concept interior; never enlarge a contact-sheet crop for this view. */
export function PreviewScene({ restaurantId, label, fallback, scene }: PreviewSceneProps) {
  const surface = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const node = surface.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - box.top) / box.height * 2 - 1));
    node.style.setProperty('--preview-x', `${x * -7}px`);
    node.style.setProperty('--preview-y', `${y * -5}px`);
  }

  function reset() {
    surface.current?.style.setProperty('--preview-x', '0px');
    surface.current?.style.setProperty('--preview-y', '0px');
  }

  return (
    <div ref={surface} className="preview-photo" onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>
      {failed ? (
        <div className={`scene-image scene-${scene}`}
          style={{ backgroundImage: `url(${assetUrl(fallback, import.meta.env.BASE_URL)})` }}><span className="sr-only">{label}</span></div>
      ) : (
        <Image src={assetUrl(`/restaurants/${restaurantId}-interior.webp`, import.meta.env.BASE_URL)}
          alt={label} fill unoptimized sizes="100vw" loading="eager" onError={() => setFailed(true)} />
      )}
    </div>
  );
}
