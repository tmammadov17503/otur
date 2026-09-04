import { Coffee, Leaf, Utensils, Wine } from 'lucide-react';

type Motif = 'fork' | 'knife' | 'coffee' | 'leaf' | 'wine';
type Placement = readonly [Motif, number, number, number, number];

const placements: Record<'discovery' | 'experience' | 'partners', readonly Placement[]> = {
  discovery: [
    ['fork', -4, 13, -24, 32], ['coffee', 48, -5, 14, 26], ['knife', 70, -7, 32, 34],
    ['leaf', 103, 40, -18, 28], ['knife', 103, 77, -25, 32], ['wine', 23, 104, 18, 28],
    ['fork', 57, 105, -32, 34], ['leaf', -4, 53, 25, 25],
  ],
  experience: [
    ['knife', 8, -4, 24, 32], ['leaf', 43, -3, -18, 26], ['fork', 98, -3, 34, 30],
    ['coffee', -1, 24, -12, 25], ['wine', 102, 67, 16, 28], ['fork', 17, 104, -30, 32],
    ['knife', 61, 104, 22, 30], ['leaf', 87, 103, 35, 27],
  ],
  partners: [
    ['fork', -4, 18, -20, 32], ['knife', 39, 15, 24, 32], ['coffee', 67, -8, -12, 28],
    ['leaf', 103, 30, 30, 26], ['wine', -4, 75, -16, 27], ['fork', 12, 108, 32, 32],
    ['knife', 48, 109, -24, 30], ['leaf', 71, 105, -18, 26],
  ],
};

function DiningIcon({ kind }: { kind: Motif }) {
  // Crop the two halves of the existing Lucide icon into separate utensils.
  if (kind === 'fork' || kind === 'knife') {
    return <Utensils viewBox={kind === 'fork' ? '0 0 14 24' : '14 0 10 24'} strokeWidth={1.5} />;
  }
  const Icon = { coffee: Coffee, leaf: Leaf, wine: Wine }[kind];
  return <Icon strokeWidth={1.5} />;
}

export function DiningScatter({ variant }: { variant: keyof typeof placements }) {
  return (
    <div className={`dining-scatter scatter-${variant}`} aria-hidden="true">
      {placements[variant].map(([kind, left, top, angle, size], index) => (
        <span key={`${kind}-${index}`} className={`dining-motif motif-${kind}`}
          style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, transform: `rotate(${angle}deg)` }}>
          <DiningIcon kind={kind} />
        </span>
      ))}
    </div>
  );
}
