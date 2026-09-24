import { ArrowRight, CalendarCheck, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { localize, localizeTag, type Language, type Restaurant, type RestaurantTable } from '@/lib/otur-data';

type TableFocusProps = {
  restaurant: Restaurant;
  table: RestaurantTable;
  language: Language;
  labels: Record<string, string>;
  onReserve: () => void;
};

const shapeLabel = {
  round: 'roundTable',
  square: 'squareTable',
  long: 'longTable',
} as const;

export function TableFocus({ restaurant, table, language, labels, onReserve }: TableFocusProps) {
  return (
    <div className="table-focus">
      <div className="table-focus-copy">
        <span className="focus-kicker">02 · {labels.tableOverview}</span>
        <h3>{labels.yourSelectedTable}</h3>
        <p>{localize(table.detail, language)}</p>
        <dl className="focus-facts">
          <div><dt><Users />{labels.capacityLabel}</dt><dd>{table.capacity} {labels.seats}</dd></div>
          <div><dt>{labels.shapeLabel}</dt><dd>{labels[shapeLabel[table.shape]]}</dd></div>
        </dl>
        <div className="focus-tags" aria-label={labels.tableCategories}>
          {table.tags.map((tag) => <span key={tag}>{localizeTag(tag, language)}</span>)}
        </div>
        <div className="table-focus-summary" aria-live="polite">
          <span>{labels.tableSelected}</span>
          <strong>{restaurant.name} · {table.id}</strong>
          <small>{table.capacity} {labels.seats}</small>
        </div>
        <Button className="reserve-selected-table" type="button" onClick={onReserve}>
          <CalendarCheck /><span><small>{restaurant.name} · {table.id}</small>{labels.reserveTable}</span><ArrowRight />
        </Button>
      </div>

      <div className="table-focus-world" aria-label={`${table.id} · ${labels.yourSelectedTable}`}>
        <div className="focus-orbit orbit-one" aria-hidden="true" />
        <div className="focus-orbit orbit-two" aria-hidden="true" />
        <div className={`focus-table-slab shape-${table.shape}`} aria-hidden="true">
          <span>{table.id}</span>
          <small>{table.capacity} {labels.seats}</small>
        </div>
        <span className="table-capacity-ring" aria-hidden="true">{table.capacity} ×</span>
        <span className="focus-north" aria-hidden="true">N</span>
        <p className="focus-instruction">{labels.tableOnlyNote}</p>
      </div>
    </div>
  );
}
