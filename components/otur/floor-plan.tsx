import { DoorOpen } from 'lucide-react';

import { TableGlyph } from '@/components/otur/table-glyph';
import { localizeTag, type Language, type Restaurant, type RestaurantTable } from '@/lib/otur-data';

type AvailableTable = RestaurantTable & { available: boolean };

type FloorPlanProps = {
  restaurant: Restaurant;
  tables: AvailableTable[];
  selectedId: string;
  language: Language;
  labels: Record<string, string>;
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

export function FloorPlan({ restaurant, tables, selectedId, language, labels, onSelect }: FloorPlanProps) {
  return (
    <div className="plan-viewport" data-restaurant={restaurant.id}>
      <div className="floorplan-world">
        <div className={`floorplan-canvas plan-${restaurant.planVariant}`}>
          <PlanArchitecture restaurant={restaurant} labels={labels} />
          {tables.map((table) => (
            <button
              key={table.id}
              type="button"
              className={`floor-table ${table.available ? 'available' : 'reserved'} ${selectedId === table.id ? 'selected' : ''}`}
              style={{ left: `${table.left}%`, top: `${table.top}%` }}
              data-shape={table.shape}
              data-capacity={table.capacity}
              disabled={!table.available}
              onClick={() => onSelect(table.id)}
              aria-label={`${table.id} · ${table.capacity} ${labels.seats} · ${table.tags.map((tag) => localizeTag(tag, language)).join(', ')} · ${selectedId === table.id ? labels.selected : table.available ? labels.available : labels.reserved}`}
            >
              <TableGlyph table={table} />
              <span className="table-number">{table.id.replace(/^[A-Z]/, '')}</span>
              {table.available && <span className="table-peek">{table.capacity} {labels.seats}<small>{localizeTag(table.tags[0], language)}</small></span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
