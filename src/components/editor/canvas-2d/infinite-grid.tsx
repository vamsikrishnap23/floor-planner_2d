import { Line } from 'react-konva';
import { useViewport } from '../store/useviewport';


interface InfiniteGridProps {
  width: number;
  height: number;
}

export function InfiniteGrid({ width, height }: InfiniteGridProps) {
  const { pan, zoom } = useViewport();
  
  let baseSize = 50;
  if (zoom < 0.4) baseSize = 250;
  if (zoom < 0.1) baseSize = 1000;

  const startX = Math.floor(-pan.x / zoom / baseSize) * baseSize;
  const endX = Math.floor((width - pan.x) / zoom / baseSize) * baseSize;
  
  const startY = Math.floor(-pan.y / zoom / baseSize) * baseSize;
  const endY = Math.floor((height - pan.y) / zoom / baseSize) * baseSize;

  const gridLines = [];

  for (let x = startX; x <= endX; x += baseSize) {
    gridLines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY - baseSize, x, endY + baseSize]} 
        stroke="#e5e5e5"
        strokeWidth={1 / zoom} 
      />
    );
  }

  for (let y = startY; y <= endY; y += baseSize) {
    gridLines.push(
      <Line
        key={`h-${y}`}
        points={[startX - baseSize, y, endX + baseSize, y]}
        stroke="#e5e5e5"
        strokeWidth={1 / zoom}
      />
    );
  }

  return <>{gridLines}</>;
}