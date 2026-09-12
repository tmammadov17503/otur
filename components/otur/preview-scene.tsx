'use client';

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { assetUrl } from '@/lib/assets';

type PreviewSceneProps = {
  restaurantId: string;
  label: string;
  fallback: string;
  scene: number;
  pauseMotion: string;
  playMotion: string;
  yaw?: number;
};

type DataAwareNavigator = Navigator & {
  connection?: { effectiveType?: string; saveData?: boolean };
};

/** Full-frame concept interior with an on-demand, data-aware cinematic layer. */
export function PreviewScene({ restaurantId, label, fallback, scene, pauseMotion, playMotion, yaw }: PreviewSceneProps) {
  const surface = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [motionFailed, setMotionFailed] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as DataAwareNavigator).connection;
    const syncPreference = () => {
      const constrained = connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType ?? '');
      setMotionAllowed(!preference.matches && !constrained);
    };
    syncPreference();
    preference.addEventListener('change', syncPreference);
    return () => preference.removeEventListener('change', syncPreference);
  }, []);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (yaw !== undefined || event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

  function toggleMotion() {
    const player = video.current;
    if (!player) return;
    if (player.paused) {
      void player.play().then(() => setPaused(false)).catch(() => setPaused(true));
      return;
    }
    player.pause();
    setPaused(true);
  }

  return (
    <div
      ref={surface}
      className={`preview-photo ${yaw === undefined ? '' : 'is-seat-view'}`}
      style={yaw === undefined ? undefined : { '--seat-shift': `${Math.max(-14, Math.min(14, yaw * .08))}%` } as CSSProperties}
      onPointerMove={move}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      {failed ? (
        <div className={`scene-image scene-${scene}`}
          style={{ backgroundImage: `url(${assetUrl(fallback, import.meta.env.BASE_URL)})` }}><span className="sr-only">{label}</span></div>
      ) : (
        <Image src={assetUrl(`/restaurants/${restaurantId}-interior.webp`, import.meta.env.BASE_URL)}
          alt={label} fill unoptimized sizes="100vw" loading="eager" onError={() => setFailed(true)} />
      )}
      {motionAllowed && !motionFailed && (
        <video ref={video} className={motionReady ? 'is-ready' : undefined}
          src={assetUrl(`/restaurants/${restaurantId}-motion.mp4`, import.meta.env.BASE_URL)}
          poster={assetUrl(`/restaurants/${restaurantId}-interior.webp`, import.meta.env.BASE_URL)}
          muted loop playsInline autoPlay preload="metadata" aria-hidden="true"
          onCanPlay={() => setMotionReady(true)} onError={() => setMotionFailed(true)}
          onPause={() => setPaused(true)} onPlay={() => setPaused(false)} />
      )}
      {motionAllowed && motionReady && !motionFailed && (
        <button className="preview-motion-toggle" type="button" onClick={toggleMotion}
          aria-label={paused ? playMotion : pauseMotion} title={paused ? playMotion : pauseMotion}
          aria-pressed={paused}>{paused ? <Play /> : <Pause />}</button>
      )}
    </div>
  );
}
