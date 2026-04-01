import { Stage, Layer, Line } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useRef, useEffect, useState } from 'react';
// import { useViewport } from '../../../store/use-viewport';
import { useViewport } from '../store/useviewport';
import { InfiniteGrid } from './infinite-grid';
import { WallNode2D, PIXELS_PER_METER } from './wall-node-2d';

// IMPORT PASCAL'S CORE STORE
import { useScene } from '@pascal-app/core';
import type { WallNode } from '@pascal-app/core/src/schema/nodes/wall';

export function CanvasWorkspace() {
  const { pan, zoom, setPan, setZoom } = useViewport();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const isPanning = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Read the active nodes directly from Pascal's engine
  const nodes = useScene((state) => state.nodes);
  
  // Extract only the walls
  const walls = Object.values(nodes).filter((n) => n.type === 'wall') as WallNode[];

  // --- NEW: 2D Drafting State ---
  const [draftStart, setDraftStart] = useState<{x: number, y: number} | null>(null);
  const [draftEnd, setDraftEnd] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    setTimeout(updateSize, 100); 
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Helper: Convert screen pixels into Pascal's Metric Scene coordinates
  const getSceneCoordinates = (stage: any) => {
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    return {
      x: ((pointer.x - pan.x) / zoom) / PIXELS_PER_METER,
      y: ((pointer.y - pan.y) / zoom) / PIXELS_PER_METER,
    };
  };

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    if (!stage) return;
    const oldScale = zoom;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = { x: (pointer.x - pan.x) / oldScale, y: (pointer.y - pan.y) / oldScale };
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    if (newScale < 0.1 || newScale > 10) return;
    setZoom(newScale);
    setPan({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    if (e.evt.button === 1) { // Middle click to pan
      isPanning.current = true;
      if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
      return;
    }

    if (e.evt.button === 0) { // Left click to start drawing wall
      const coords = getSceneCoordinates(stage);
      if (coords) {
        setDraftStart(coords);
        setDraftEnd(coords);
      }
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (isPanning.current) {
      setPan((prev) => ({ x: prev.x + e.evt.movementX, y: prev.y + e.evt.movementY }));
      return;
    }

    const stage = e.target.getStage();
    if (draftStart && stage) {
      const coords = getSceneCoordinates(stage);
      if (coords) setDraftEnd(coords);
    }
  };

  const handleMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    isPanning.current = false;
    if (containerRef.current) containerRef.current.style.cursor = 'crosshair';

    // Commit Wall to Pascal Database
    if (draftStart && draftEnd) {
      const distance = Math.hypot(draftEnd.x - draftStart.x, draftEnd.y - draftStart.y);
      
      // Prevent saving microscopic walls (e.g., accidental clicks)
      if (distance > 0.1) { // > 10cm long
        
        // 1. Find the active Pascal Level to attach the wall to
        const levelId = Object.values(useScene.getState().nodes).find(n => n.type === 'level')?.id;

        // 2. Inject into Pascal's Core Store
        useScene.getState().createNode({
          object: 'node',
          id: crypto.randomUUID(), // Standard browser UUID
          type: 'wall',
          parentId: levelId, // Required for Pascal hierarchy
          start: [draftStart.x, draftStart.y],
          end: [draftEnd.x, draftEnd.y],
          thickness: 0.15, // 15cm thick
          height: 2.8,     // 2.8m high (kept for schema validity)
          frontSide: 'unknown',
          backSide: 'unknown',
          children: []
        });
      }
      setDraftStart(null);
      setDraftEnd(null);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden cursor-crosshair">
      {dimensions.width > 0 && (
        <Stage
          width={dimensions.width}
          height={dimensions.height}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          x={pan.x}
          y={pan.y}
          scaleX={zoom}
          scaleY={zoom}
        >
          <Layer>
            <InfiniteGrid width={dimensions.width} height={dimensions.height} />
          </Layer>

          {/* Pascal Wall Render Layer */}
          <Layer>
            {/* 1. Outline Pass */}
            {walls.map(w => <WallNode2D key={`out-${w.id}`} wall={w} pass="outline" />)}
            {draftStart && draftEnd && (
              <Line 
                points={[draftStart.x * PIXELS_PER_METER, draftStart.y * PIXELS_PER_METER, draftEnd.x * PIXELS_PER_METER, draftEnd.y * PIXELS_PER_METER]}
                stroke="#3b82f6" strokeWidth={0.15 * PIXELS_PER_METER} lineCap="round"
              />
            )}

            {/* 2. Core Pass */}
            {walls.map(w => <WallNode2D key={`core-${w.id}`} wall={w} pass="core" />)}
            {draftStart && draftEnd && (
              <Line 
                points={[draftStart.x * PIXELS_PER_METER, draftStart.y * PIXELS_PER_METER, draftEnd.x * PIXELS_PER_METER, draftEnd.y * PIXELS_PER_METER]}
                stroke="rgba(59, 130, 246, 0.5)" strokeWidth={(0.15 * PIXELS_PER_METER) - 4} lineCap="round"
              />
            )}
          </Layer>
        </Stage>
      )}
    </div>
  );
}