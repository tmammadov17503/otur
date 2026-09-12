import type { TableShape } from './otur-data';

export type SeatPosition = {
  id: number;
  left: number;
  top: number;
  angle: number;
  facingAngle: number;
};

type SeatGeometry = {
  capacity: number;
  shape: TableShape;
};

export function wrapViewAngle(current: number, delta: number) {
  return ((current + delta + 180) % 360 + 360) % 360 - 180;
}

export function getSeatPositions({ capacity, shape }: SeatGeometry): SeatPosition[] {
  const radius = shape === 'long'
    ? { x: 44, y: 29 }
    : shape === 'square'
      ? { x: 38, y: 38 }
      : { x: 36, y: 36 };

  return Array.from({ length: capacity }, (_, index) => {
    const angle = -90 + (360 / capacity) * index;
    const radians = angle * Math.PI / 180;
    return {
      id: index + 1,
      left: Math.round((50 + Math.cos(radians) * radius.x) * 10) / 10,
      top: Math.round((50 + Math.sin(radians) * radius.y) * 10) / 10,
      angle,
      facingAngle: wrapViewAngle(angle, 180),
    };
  });
}
