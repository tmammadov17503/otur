import type { CSSProperties } from 'react';

import type { RestaurantTable } from '@/lib/otur-data';

export function TableGlyph({ table, small = false }: { table: RestaurantTable; small?: boolean }) {
  return (
    <span className={`table-glyph ${table.shape} ${small ? 'small' : ''}`} aria-hidden="true">
      {Array.from({ length: Math.min(table.capacity, 8) }).map((_, index) => (
        <i key={index} style={{ '--chair': index } as CSSProperties} />
      ))}
    </span>
  );
}
