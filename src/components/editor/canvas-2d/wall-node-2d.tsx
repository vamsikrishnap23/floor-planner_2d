import { Line } from 'react-konva';
import type { WallNode } from '@pascal-app/core/src/schema/nodes/wall';

export const PIXELS_PER_METER = 50;

interface WallNode2DProps {
  wall: WallNode;
  pass: 'outline' | 'core';
}

export function WallNode2D({ wall, pass }: WallNode2DProps) {
  // Convert Pascal's Metric coordinates [x, y] to Canvas Pixels
  const startX = wall.start[0] * PIXELS_PER_METER;
  const startY = wall.start[1] * PIXELS_PER_METER;
  const endX = wall.end[0] * PIXELS_PER_METER;
  const endY = wall.end[1] * PIXELS_PER_METER;

  // Pascal usually defaults to 0.15m (15cm) thickness
  const thicknessMeters = wall.thickness ?? 0.15;
  const thicknessPixels = thicknessMeters * PIXELS_PER_METER;

  const outlineColor = "#171717";
  const coreColor = "#f5f5f5";
  const coreThickness = Math.max(1, thicknessPixels - 4); // 2px outer boundary

  return (
    <Line
      points={[startX, startY, endX, endY]}
      stroke={pass === 'outline' ? outlineColor : coreColor}
      strokeWidth={pass === 'outline' ? thicknessPixels : coreThickness}
      lineCap="round"
      lineJoin="round"
    />
  );
}