'use client'

import { useEffect, useRef } from 'react'
import { AnyNodeId, ItemNode, emitter, useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import useEditor from '../../store/use-editor'
import { useCatalog } from '../../store/use-catalog'
import { sfxEmitter } from '../../lib/sfx-bus'

export function ItemTool2D() {
  const tool = useEditor((s) => s.tool)
  const mode = useEditor((s) => s.mode)
  const setTool = useEditor((s) => s.setTool)
  const setMode = useEditor((s) => s.setMode)
  
  const activeItem = useCatalog((s) => s.activeItem)
  const setActiveItem = useCatalog((s) => s.setActiveItem)
  
  const draftRef = useRef<any>(null)

  useEffect(() => {
    if (mode !== 'build' || tool !== 'item') return

    const getLevelId = () => useViewer.getState().selection.levelId

    const onPointerMove = (event: any) => {
      const levelId = getLevelId()
      if (!levelId) return

      const pos = event.position || event.point || [0, 0, 0]
      const isText = activeItem?.isText

      if (!draftRef.current) {
        // Create Hologram
        const node = ItemNode.parse({
          id: crypto.randomUUID(),
          type: 'item',
          position: pos,
          rotation: [0, 0, 0],
          width: isText ? 0.5 : (activeItem?.width ?? 1),
          depth: isText ? 0.2 : (activeItem?.depth ?? 1),
          height: 0.1,
          parentId: levelId,
          name: activeItem?.name || 'Item',
          metadata: { 
            isTransient: true, 
            isText: isText,
            text: isText ? 'Double Click to Edit' : undefined,
            fontSize: isText ? 16 : undefined,
            color: isText ? '#171717' : undefined
          }, 
        })
        useScene.getState().createNode(node, levelId as AnyNodeId)
        draftRef.current = node
      } else {
        // Move Hologram
        useScene.getState().updateNode(draftRef.current.id, { position: pos })
      }
    }

    const onClick = (event: any) => {
      if (!draftRef.current) return

      const draft = draftRef.current
      const pos = event.position || event.point || draft.position
      const isText = activeItem?.isText

      // 1. Destroy Hologram
      draftRef.current = null
      useScene.getState().deleteNode(draft.id)

      // 2. Stamp Permanent Node
      const node = ItemNode.parse({
        ...draft,
        position: pos,
        metadata: { 
          isText: isText,
          text: isText ? 'New Text' : undefined,
          fontSize: isText ? 16 : undefined,
          color: isText ? '#171717' : undefined
        }, 
      })

      useScene.getState().createNode(node, draft.parentId as AnyNodeId)
      sfxEmitter.emit('sfx:item-place')
      
      // 3. Force UI Update via setTimeout (Prevents Race Conditions)
      setTimeout(() => {
        useViewer.getState().setSelection({ selectedIds: [node.id] })
        setTool('select')
        setMode('select')
        setActiveItem(null)
      }, 50)
    }

    emitter.on('grid:move', onPointerMove)
    emitter.on('wall:move', onPointerMove)
    emitter.on('grid:click', onClick)
    emitter.on('wall:click', onClick)

    return () => {
      emitter.off('grid:move', onPointerMove)
      emitter.off('wall:move', onPointerMove)
      emitter.off('grid:click', onClick)
      emitter.off('wall:click', onClick)
    }
  }, [tool, mode, activeItem, setTool, setMode, setActiveItem])

  return null
}