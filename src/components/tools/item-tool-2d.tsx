'use client'

import { useEffect, useRef } from 'react'
import { AnyNodeId, ItemNode, emitter, useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import useEditor from '../../store/use-editor'
import { sfxEmitter } from '../../lib/sfx-bus'

export function ItemTool2D() {
  const tool = useEditor((s) => s.tool)
  const mode = useEditor((s) => s.mode)
  const pendingPreset = useEditor((s) => s.pendingPreset)
  const setTool = useEditor((s) => s.setTool)
  const setPendingPreset = useEditor((s) => s.setPendingPreset)
  
  const draftRef = useRef<any>(null)

  useEffect(() => {
    // Only activate if the user clicked an item in the catalog
    if (mode !== 'build' || tool !== 'item') {
      if (draftRef.current) {
        useScene.getState().deleteNode(draftRef.current.id)
        draftRef.current = null
      }
      return
    }

    const getLevelId = () => useViewer.getState().selection.levelId

    const destroyDraft = () => {
      if (!draftRef.current) return
      useScene.getState().deleteNode(draftRef.current.id)
      draftRef.current = null
    }

    const onPointerMove = (event: any) => {
      const levelId = getLevelId()
      if (!levelId) return

      const pos = event.position || event.point || [0, 0, 0]

      if (!draftRef.current) {
        try {
          // Extract basic dimensions and discard all complex 3D mesh data
          const width = pendingPreset?.data?.width ?? 1
          const depth = pendingPreset?.data?.depth ?? 1
          const height = pendingPreset?.data?.height ?? 1

          // Build a clean, Zod-compliant 2D node
          const node = ItemNode.parse({
            id: crypto.randomUUID(),
            type: 'item',
            position: pos,
            rotation: [0, 0, 0],
            width,
            depth,
            height,
            parentId: levelId,
            metadata: { isTransient: true }, // Marks it as a semi-transparent hologram
            name: pendingPreset?.name || 'Furniture',
          })
          
          useScene.getState().createNode(node, levelId as AnyNodeId)
          draftRef.current = node
        } catch (error) {
          console.error("Data Validation Failed: Could not parse 3D preset into 2D item.", error)
        }
      } else {
        // Update hologram position as the mouse moves
        useScene.getState().updateNode(draftRef.current.id, { position: pos })
      }
    }

    const onPointerClick = (event: any) => {
      if (!draftRef.current) return

      const draft = draftRef.current
      draftRef.current = null
      useScene.getState().deleteNode(draft.id)

      const pos = event.position || event.point || draft.position

      try {
        // Finalize the placement into the Zustand Database
        const node = ItemNode.parse({
          ...draft,
          position: pos,
          metadata: {}, // Remove transient tag so it becomes solid black
        })

        useScene.getState().createNode(node, draft.parentId as AnyNodeId)
        useViewer.getState().setSelection({ selectedIds: [node.id] })
        sfxEmitter.emit('sfx:item-place')
        
        // Auto-revert back to Selection Mode after placing the item
        setTool('select')
        setPendingPreset(null)
      } catch (error) {
        console.error("Failed to commit item placement:", error)
      }
    }

    // Listeners for both the grid floor and overlapping walls
    emitter.on('grid:move', onPointerMove)
    emitter.on('wall:move', onPointerMove)
    emitter.on('grid:click', onPointerClick)
    emitter.on('wall:click', onPointerClick)
    emitter.on('tool:cancel', destroyDraft)

    return () => {
      destroyDraft()
      emitter.off('grid:move', onPointerMove)
      emitter.off('wall:move', onPointerMove)
      emitter.off('grid:click', onPointerClick)
      emitter.off('wall:click', onPointerClick)
      emitter.off('tool:cancel', destroyDraft)
    }
  }, [tool, mode, pendingPreset, setTool, setPendingPreset])

  return null
}