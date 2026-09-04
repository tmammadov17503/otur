'use client';

import { useRef, type PointerEvent, type ReactNode } from 'react';

export function DepthSurface({ children }: { children: ReactNode }) {
  const surface = useRef<HTMLDivElement>(null);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const node = surface.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - box.top) / box.height * 2 - 1));
    node.style.setProperty('--tilt-x', `${-y * 2.5}deg`);
    node.style.setProperty('--tilt-y', `${x * 3}deg`);
  }

  function reset() {
    surface.current?.style.setProperty('--tilt-x', '0deg');
    surface.current?.style.setProperty('--tilt-y', '0deg');
  }

  return <div ref={surface} className="depth-surface" onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>{children}</div>;
}
