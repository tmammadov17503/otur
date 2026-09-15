import { ArrowRight, CalendarCheck, Users } from 'lucide-react';
import type { CSSProperties } from 'react';

import { Button } from '@/components/ui/button';
import { getSeatPositions } from '@/lib/seat-journey';
import { localize, localizeTag, type Language, type Restaurant, type RestaurantTable } from '@/lib/otur-data';

type TableFocusProps = {
  restaurant: Restaurant;
  table: RestaurantTable;
  language: Language;
  labels: Record<string, string>;
  selectedSeat: number;
  onSeatSelect: (seat: number) => void;
  onReserve: () => void;
};

const shapeLabel = {
  round: 'roundTable',
  square: 'squareTable',
  long: 'longTable',
} as const;

export function TableFocus({ restaurant, table, language, labels, selectedSeat, onSeatSelect, onReserve }: TableFocusProps) {
  const seats = getSeatPositions(table);

  return (
    <div className="table-focus">
      <div className="table-focus-copy">
        <span className="focus-kicker">02 · {labels.tableOverview}</span>
        <h3>{labels.chooseSeat}</h3>
        <p>{localize(table.detail, language)}</p>
        <dl className="focus-facts">
          <div><dt><Users />{labels.capacityLabel}</dt><dd>{table.capacity} {labels.seats}</dd></div>
          <div><dt>{labels.shapeLabel}</dt><dd>{labels[shapeLabel[table.shape]]}</dd></div>
        </dl>
        <div className="focus-tags" aria-label={labels.tableCategories}>
          {table.tags.map((tag) => <span key={tag}>{localizeTag(tag, language)}</span>)}
        </div>
        <div className="seat-focus-summary" aria-live="polite">
          <span>{labels.seatSelected}</span>
          <strong>{labels.seatLabel} {selectedSeat}</strong>
          <small>{restaurant.name} · {table.id}</small>
        </div>
        <Button className="reserve-selected-seat" type="button" onClick={onReserve}>
          <CalendarCheck /><span><small>{labels.seatLabel} {selectedSeat}</small>{labels.reserveSeat}</span><ArrowRight />
        </Button>
      </div>

      <div className="table-focus-world" aria-label={`${table.id} · ${labels.chooseSeat}`}>
        <div className="focus-orbit orbit-one" aria-hidden="true" />
        <div className="focus-orbit orbit-two" aria-hidden="true" />
        <div className={`focus-table-slab shape-${table.shape}`} aria-hidden="true">
          <span>{table.id}</span>
          <small>{table.capacity} {labels.seats}</small>
        </div>
        {seats.map((seat) => (
          <button
            key={seat.id}
            type="button"
            className={`seat-choice ${selectedSeat === seat.id ? 'selected' : ''}`}
            style={{ left: `${seat.left}%`, top: `${seat.top}%`, '--seat-angle': `${seat.angle + 90}deg` } as CSSProperties}
            aria-label={`${labels.seatLabel} ${seat.id}`}
            aria-pressed={selectedSeat === seat.id}
            onClick={() => onSeatSelect(seat.id)}
          >
            <i aria-hidden="true" />
            <span>{seat.id}</span>
          </button>
        ))}
        <span className="focus-north" aria-hidden="true">N</span>
        <p className="focus-instruction">{labels.chooseSeat}</p>
      </div>
    </div>
  );
}
