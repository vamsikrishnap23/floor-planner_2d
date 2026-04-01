'use client'

import { useEffect } from 'react'
import { AnyNodeId, ItemNode, emitter, useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import useEditor from '../../store/use-editor'
import { sfxEmitter } from '../../lib/sfx-bus'

export function TextTool2D() {
  const tool = useEditor((s) => s.tool)
  const mode = useEditor((s) => s.mode)
  const setTool = useEditor((s) => s.setTool)
  const setMode = useEditor((s) => s.setMode)

  useEffect(() => {
    // Tool is now guaranteed to activate!
    if (mode !== 'build' || tool !== 'text') return

    const onClick = (event: any) => {
      const levelId = useViewer.getState().selection.levelId
      if (!levelId) return

      const pos = event.position || event.point || [0, 0, 0]

      try {
        const node = ItemNode.parse({
          id: crypto.randomUUID(),
          type: 'item',
          position: pos,
          rotation: [0, 0, 0],
          width: 0.1,
          depth: 0.1,
          height: 0.1,
          parentId: levelId,
          name: 'Annotation',
          metadata: { 
            isText: true, 
            text: 'New Text', 
            fontSize: 16, 
            color: '#171717' 
          },
        })

        useScene.getState().createNode(node, levelId as AnyNodeId)
        useViewer.getState().setSelection({ selectedIds: [node.id] })
        sfxEmitter.emit('sfx:item-place')
        
        // Auto-revert back to Select Mode so you can type your text immediately!
        setTool('select')
        setMode('select')
      } catch (error) {
        console.error("Text Placement Failed:", error)
      }
    }

    // Listen to BOTH the floor and the walls
    emitter.on('grid:click', onClick)
    emitter.on('wall:click', onClick)
    
    return () => {
      emitter.off('grid:click', onClick)
      emitter.off('wall:click', onClick)
    }
  }, [tool, mode, setTool, setMode])

  return null
}