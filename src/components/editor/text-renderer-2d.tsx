'use client'

import { useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'

const PIXELS_PER_METER = 50

export function TextRenderer2D() {
  const nodes = useScene((s) => s.nodes)
  const selectedIds = useViewer((s) => s.selection.selectedIds)
  
  // 1. Filter the database for ONLY text annotations
  const textNodes = Object.values(nodes).filter(
    (node) => node.type === 'item' && node.metadata?.isText
  )

  if (textNodes.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-hidden">
      {textNodes.map((node: any) => {
        // For SVG-based 2D canvas with pan/zoom, we need to render inside the canvas coordinate system.
        // Since we're overlaying on canvas, use percentages relative to canvas viewport.
        // This component will be rendered INSIDE the canvas layer with SVG positioning.
        // For now, render at absolute position in viewport and let canvas styling handle it.
        const xPos = node.position[0] * PIXELS_PER_METER + 500 // canvas origin offset
        const yPos = node.position[2] * PIXELS_PER_METER + 500 // canvas origin offset
        const isSelected = selectedIds.includes(node.id)
        const rotationDegrees = (node.rotation[1] * 180) / Math.PI

        return (
          <div
            key={node.id}
            className={`absolute flex items-center justify-center whitespace-nowrap px-2 py-1 transition-all pointer-events-auto ${
              isSelected ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''
            }`}
            style={{
              left: `${xPos}px`,
              top: `${yPos}px`,
              transform: `translate(-50%, -50%) rotate(${rotationDegrees}deg)`,
              color: node.metadata.color || '#171717',
              fontSize: `${node.metadata.fontSize || 16}px`,
              fontWeight: 600,
            }}
          >
            {node.metadata.text || 'Empty Text'}
          </div>
        )
      })}
    </div>
  )
}