'use client'

import { useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'

export function TextRenderer2D() {
  const nodes = useScene((s) => s.nodes)
  const selectedIds = useViewer((s) => s.selection.selectedIds)
  
  const textNodes = Object.values(nodes).filter(
    (node) => node.type === 'item' && node.metadata?.isText
  )

  if (textNodes.length === 0) return null

  return (
    // 1. Anchor to the exact center of the screen (0,0 coordinate in CAD)
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-visible">
      <div className="relative">
        {textNodes.map((node: any) => {
          const scale = 50 
          const xPos = node.position[0] * scale
          const yPos = -(node.position[2] * scale) // Flip Z to Y
          const isSelected = selectedIds.includes(node.id)

          return (
            <div
              key={node.id}
              className={`absolute flex items-center justify-center whitespace-nowrap px-2 py-1 transition-all ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''
              }`}
              style={{
                left: `${xPos}px`,
                top: `${yPos}px`,
                transform: `translate(-50%, -50%) rotate(${node.rotation[1]}rad)`,
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
    </div>
  )
}