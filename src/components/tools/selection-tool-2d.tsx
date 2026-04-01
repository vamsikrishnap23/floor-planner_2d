'use client'

import { useEffect } from 'react'
import { emitter, useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import useEditor from '../../store/use-editor'
import { sfxEmitter } from '../../lib/sfx-bus'

export function SelectionTool2D() {
  const mode = useEditor((s) => s.mode)

  useEffect(() => {
    // If we switch to a drawing tool, clear the selection
    if (mode !== 'select' && mode !== 'delete') {
      useViewer.getState().setSelection({ selectedIds: [] })
      return
    }

    const onClick = (event: any) => {
      const node = event.node
      
      // Handle the "Sledgehammer" delete tool
      if (mode === 'delete') {
        sfxEmitter.emit('sfx:item-delete')
        useScene.getState().deleteNode(node.id)
        return
      }

      // Handle standard selection
      useViewer.getState().setSelection({ selectedIds: [node.id] })
    }

    // Clicking the empty canvas clears the selection
    const onGridClick = () => {
      if (mode === 'select') {
        useViewer.getState().setSelection({ selectedIds: [] })
      }
    }

    // Attach listeners to every structural type
    const types = ['wall', 'item', 'window', 'door', 'slab', 'zone']
    types.forEach((type) => emitter.on(`${type}:click` as any, onClick))
    emitter.on('grid:click', onGridClick)

    return () => {
      types.forEach((type) => emitter.off(`${type}:click` as any, onClick))
      emitter.off('grid:click', onGridClick)
    }
  }, [mode])

  return null
}