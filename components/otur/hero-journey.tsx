'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { assetUrl } from '@/lib/assets';

type HeroJourneyProps = {
  steps: readonly [string, string, string];
  notes: readonly [string, string, string];
  imageLabel: string;
  selectedLabel: string;
  tableCountLabel: string;
  pauseMotion: string;
  playMotion: string;
};

type DataAwareNavigator = Navigator & {
  connection?: { effectiveType?: string; saveData?: boolean };
};

const posters = ['/og.webp', '/otur-room-poster.webp', '/otur-table-poster.webp'] as const;
const films = [null, '/otur-room-motion.mp4', '/otur-table-motion.mp4'] as const;
const filmNames = [null, 'plan', 'table'] as const;

export function HeroJourney({ steps, notes, imageLabel, selectedLabel, tableCountLabel, pauseMotion, playMotion }: HeroJourneyProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [motionFailed, setMotionFailed] = useState<Record<number, boolean>>({});
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

  function chooseStep(index: number) {
    setMotionReady(false);
    setPaused(false);
    setActiveStep(index);
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

  const film = films[activeStep];
  const canPlay = Boolean(film && motionAllowed && !motionFailed[activeStep]);

  return (
    <div className={`hero-model hero-journey hero-stage-${activeStep}`} aria-label={imageLabel}>
      <div className="hero-media">
        <Image src={assetUrl(posters[activeStep], import.meta.env.BASE_URL)} alt={imageLabel} fill
          priority={activeStep === 0} unoptimized sizes="(max-width: 760px) 100vw, 55vw" />
        {canPlay && film && <video key={film} ref={video} data-journey={filmNames[activeStep] ?? undefined}
          className={motionReady ? 'is-ready' : undefined} src={assetUrl(film, import.meta.env.BASE_URL)}
          poster={assetUrl(posters[activeStep], import.meta.env.BASE_URL)} muted loop playsInline autoPlay preload="metadata"
          aria-hidden="true" onCanPlay={() => setMotionReady(true)}
          onError={() => setMotionFailed((failed) => ({ ...failed, [activeStep]: true }))}
          onPause={() => setPaused(true)} onPlay={() => setPaused(false)} />}
      </div>
      <div className="hero-model-wash" />
      <div className="hero-sequence" role="tablist" aria-label={imageLabel}>
        {steps.map((step, index) => <button key={step} type="button" role="tab"
          className={`hero-journey-tab ${activeStep === index ? 'active' : ''}`}
          aria-selected={activeStep === index} onClick={() => chooseStep(index)}>
          0{index + 1} · {step}
        </button>)}
      </div>
      {activeStep === 1 && <div className="hero-room-count"><span>06</span><small>{tableCountLabel}</small></div>}
      {activeStep === 2 && <div className="hero-table-marker"><i /><strong>08</strong><small>{selectedLabel}</small></div>}
      <p className="hero-stage-note" aria-live="polite">{notes[activeStep]}</p>
      {activeStep > 0 && canPlay && motionReady && <button className="hero-motion-toggle" type="button"
        aria-label={paused ? playMotion : pauseMotion} title={paused ? playMotion : pauseMotion}
        aria-pressed={paused} onClick={toggleMotion}>{paused ? <Play /> : <Pause />}</button>}
    </div>
  );
}
