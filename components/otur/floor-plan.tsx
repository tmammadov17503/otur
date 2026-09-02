import { DoorOpen, Minus, Plus } from 'lucide-react';

import { TableGlyph } from '@/components/otur/table-glyph';
import type { Language, Restaurant, RestaurantTable } from '@/lib/otur-data';

type AvailableTable = RestaurantTable & { available: boolean };

type FloorPlanProps = {
  restaurant: Restaurant;
  tables: AvailableTable[];
  selectedId: string;
  language: Language;
  labels: Record<string, string>;
  scale: number;
  onScale: (scale: number) => void;
  onSelect: (id: string) => void;
};

function PlanArchitecture({ restaurant, labels }: Pick<FloorPlanProps, 'restaurant' | 'labels'>) {
  if (restaurant.planVariant === 'garden') {
    return (
      <>
        <div className="plan-wall wall-left" />
        <div className="plan-wall wall-bottom" />
        <div className="plan-zone garden-strip"><span>{labels.gardenZone}</span></div>
        <div className="plan-zone terrace-strip"><span>{labels.terraceZone}</span></div>
        <div className="garden-feature"><span>{labels.feature}</span><i /></div>
        <div className="plan-plant plant-a">✦</div><div className="plan-plant plant-b">✦</div><div className="plan-plant plant-c">✦</div><div className="plan-plant plant-d">✦</div>
        <div className="plan-entrance"><DoorOpen /><span>{labels.entrance}</span></div>
      </>
    );
  }

  if (restaurant.planVariant === 'coastal') {
    return (
      <>
        <div className="plan-wall wall-left" />
        <div className="plan-wall wall-bottom" />
        <div className="plan-zone sea-window"><span>{labels.seaZone}</span></div>
        <div className="plan-zone coastal-terrace"><span>{labels.terraceZone}</span></div>
        <div className="coastal-axis" />
        <div className="plan-plant plant-a">✦</div><div className="plan-plant plant-d">✦</div>
        <div className="plan-entrance"><DoorOpen /><span>{labels.entrance}</span></div>
      </>
    );
  }

  return (
    <>
      <div className="plan-wall wall-left" />
      <div className="plan-wall wall-bottom" />
      <div className="plan-zone heritage-window"><span>{labels.windowZone}</span></div>
      <div className="plan-zone heritage-quiet"><span>{labels.quietZone}</span></div>
      <div className="heritage-screen"><span>{labels.premiumCorner}</span></div>
      <div className="plan-plant plant-a">✦</div><div className="plan-plant plant-c">✦</div><div className="plan-plant plant-d">✦</div>
      <div className="plan-entrance"><DoorOpen /><span>{labels.entrance}</span></div>
    </>
  );
}

export function FloorPlan({ restaurant, tables, selectedId, labels, scale, onScale, onSelect }: FloorPlanProps) {
  return (
    <div className="plan-viewport" data-restaurant={restaurant.id}>
      <div className="zoom-controls" aria-label={labels.choose}>
        <button type="button" onClick={() => onScale(Math.max(.84, scale - .08))} aria-label={`${labels.choose} −`}><Minus /></button>
        <span>{Math.round(scale * 100)}%</span>
        <button type="button" onClick={() => onScale(Math.min(1.24, scale + .08))} aria-label={`${labels.choose} +`}><Plus /></button>
      </div>
      <div className={`floorplan-canvas plan-${restaurant.planVariant}`} style={{ transform: `scale(${scale})` }}>
        <PlanArchitecture restaurant={restaurant} labels={labels} />
        {tables.map((table) => (
          <button
            key={table.id}
            type="button"
            className={`floor-table ${table.available ? 'available' : 'reserved'} ${selectedId === table.id ? 'selected' : ''}`}
            style={{ left: `${table.left}%`, top: `${table.top}%` }}
            disabled={!table.available}
            onClick={() => onSelect(table.id)}
            aria-label={`${table.id} · ${table.capacity}`}
          >
            <TableGlyph table={table} />
            <span>{table.id.replace(/^[A-Z]/, '')}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
