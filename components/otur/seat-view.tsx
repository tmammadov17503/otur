'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { ArrowLeft, ArrowRight, Compass, Eye } from 'lucide-react';

import { PreviewScene } from '@/components/otur/preview-scene';
import { Button } from '@/components/ui/button';
import { getSeatPositions, wrapViewAngle } from '@/lib/seat-journey';
import { localizeTag, type Language, type Restaurant, type RestaurantTable } from '@/lib/otur-data';

type SeatViewProps = {
  restaurant: Restaurant;
  table: RestaurantTable;
  selectedSeat: number;
  language: Language;
  labels: Record<string, string>;
  guests: number;
  time: string;
  onBack: () => void;
  onReserve: () => void;
};

export function SeatView({ restaurant, table, selectedSeat, language, labels, guests, time, onBack, onReserve }: SeatViewProps) {
  const seats = getSeatPositions(table);
  const seat = seats.find((item) => item.id === selectedSeat) ?? seats[0];
  const [yaw, setYaw] = useState(seat.facingAngle);
  const drag = useRef<{ x: number; yaw: number } | null>(null);

  function startTurning(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('button')) return;
    drag.current = { x: event.clientX, yaw };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function turn(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    setYaw(wrapViewAngle(drag.current.yaw, (drag.current.x - event.clientX) * .35));
  }

  function stopTurning(event: PointerEvent<HTMLDivElement>) {
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div
      className="seat-look-stage"
      data-yaw={Math.round(yaw)}
      onPointerDown={startTurning}
      onPointerMove={turn}
      onPointerUp={stopTurning}
      onPointerCancel={stopTurning}
    >
      <PreviewScene
        key={`${restaurant.id}-${selectedSeat}`}
        restaurantId={restaurant.id}
        fallback={restaurant.image}
        scene={table.scene}
        label={`${restaurant.name} · ${labels.interiorConcept}`}
        pauseMotion={labels.pauseMotion}
        playMotion={labels.playMotion}
        yaw={yaw}
      />
      <div className="preview-wash" />
      <button className="preview-back" type="button" onClick={onBack}><ArrowLeft />{labels.backToTable}</button>
      <span className="seat-view-chip"><Eye />{labels.seatLabel} {selectedSeat} · {table.id}</span>
      <div className="seat-view-progress" aria-label={`${labels.viewAngle} ${Math.round(yaw)}°`}>
        <Compass style={{ transform: `rotate(${yaw}deg)` }} />
        <span>{labels.viewAngle}</span>
        <strong>{Math.round(yaw)}°</strong>
      </div>
      <div className="turn-view-controls">
        <button className="turn-view-left" type="button" aria-label={labels.turnLeft} onClick={() => setYaw((angle) => wrapViewAngle(angle, -45))}><ArrowLeft /></button>
        <span>{labels.dragToLook}</span>
        <button className="turn-view-right" type="button" aria-label={labels.turnRight} onClick={() => setYaw((angle) => wrapViewAngle(angle, 45))}><ArrowRight /></button>
      </div>
      <div className="preview-place-label">
        <span>{restaurant.name} · {table.id}</span>
        <strong>{table.tags.map((tag) => localizeTag(tag, language)).join(' · ')}</strong>
      </div>
      <Button className="reserve-on-table" type="button" onClick={onReserve}>
        <small>{labels.seatLabel} {selectedSeat} · {time} · {guests} {labels.seats}</small>
        <span>{labels.reserve}<ArrowRight /></span>
      </Button>
      <span className="preview-orientation">{labels.interiorDisclaimer}</span>
    </div>
  );
}
