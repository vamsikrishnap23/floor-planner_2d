'use client'

import { useViewer } from '@pascal-app/viewer'
import useEditor from '../../../store/use-editor'
import { useCatalog } from '../../../store/use-catalog'
import Image from 'next/image'

// 1. Your Custom 2D CAD Library
export const furnishTools = [
  // Example using downloaded images:
  // { id: 'sofa', name: 'Modern Sofa', width: 2.2, depth: 0.9, imageSrc: '/assets/sofa-topdown.svg' },
  // { id: 'bed', name: 'Queen Bed', width: 1.6, depth: 2.0, imageSrc: '/assets/bed-topdown.png' },
  
  // Fallbacks until you download your images:
  { id: 'bed', name: 'Double Bed', width: 1.6, depth: 2.0, imageSrc: '/cad/bed.svg' },
  { id: 'sofa', name: '3-Seater Sofa', width: 2.2, depth: 0.9, imageSrc: '/cad/sofa.svg' },
  { id: 'table', name: 'Dining Table', width: 1.8, depth: 0.9, imageSrc: '/cad/table.svg' },
  { id: 'toilet', name: 'Toilet', width: 0.5, depth: 0.7, imageSrc: '/cad/toilet.svg' },
  // Keep fallbacks for items you haven't downloaded SVGs for yet
  { id: 'desk', name: 'Office Desk', width: 1.4, depth: 0.7, icon: '💻' },
]

export function FurnishTools() {
  const setTool = useEditor((s) => s.setTool)
  const setActiveItem = useCatalog((s) => s.setActiveItem) // USING OUR NEW STORE
  const selectedLevelId = useViewer((s) => s.selection.levelId)

  if (!selectedLevelId) return null

  const handleSelect = (item: any) => {
    setActiveItem(item) // Safely store the item
    setTool('item')     // Trigger the placement tool
  }

  return (
    <div className="flex w-full flex-col px-3 py-2">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        2D CAD Blocks
      </div>
      
      <div className="custom-scrollbar flex w-full overflow-x-auto pb-2">
        <div className="flex w-max gap-2 pr-4">
          {furnishTools.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border border-border/50 bg-[#2C2C2E] transition-colors hover:border-border hover:bg-[#3e3e3e]"
              title={item.name}
            >
              {/* Render Image if exists, otherwise Emoji */}
              {item.imageSrc ? (
                <img src={item.imageSrc} alt={item.name} className="w-8 h-8 object-contain mb-1" />
              ) : (
                <span className="mb-1 text-2xl">{item.icon}</span>
              )}
              <span className="w-full truncate px-1 text-center text-[9px] font-medium text-muted-foreground">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}