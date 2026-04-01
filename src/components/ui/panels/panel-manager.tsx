'use client'

import { useScene, AnyNode } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import { DoorPanel } from './door-panel'
import { ItemPanel } from './item-panel'
import { WallPanel } from './wall-panel'
import { WindowPanel } from './window-panel'
import { TextPanel } from './text-panel'


export function PanelManager() {
  const selectedIds = useViewer((state) => state.selection.selectedIds)
  const nodes = useScene((state) => state.nodes)

  // If exactly one item is selected, render its corresponding property panel
  if (selectedIds.length === 1) {
    const selectedId = selectedIds[0]!
    const node = nodes[selectedId as AnyNode['id']]

    if (!node) return null

    switch (node.type) {
      case 'wall':
        return <WallPanel />
      case 'door':
        return <DoorPanel />
      case 'window':
        return <WindowPanel />
      case 'item':
        if (node.metadata?.isText) return <TextPanel />
        return <ItemPanel />
      default:
        // Automatically ignore 3D-only items like 'roof', 'slab', 'zone', etc.
        return null
    }
  }

  return null
}