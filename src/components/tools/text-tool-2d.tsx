'use client'

import { useEffect, useRef } from 'react'
import { AnyNodeId, ItemNode, emitter, useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import useEditor from '../../store/use-editor'
import { sfxEmitter } from '../../lib/sfx-bus'

export function TextTool2D() {
  const tool = useEditor((s) => s.tool)
  const mode = useEditor((s) => s.mode)
  const setTool = useEditor((s) => s.setTool)
  const setMode = useEditor((s) => s.setMode)
  
  const draftRef = useRef<any>(null)

  useEffect(() => {
    if (mode !== 'build' || tool !== 'text') {
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
          const node = ItemNode.parse({
            id: crypto.randomUUID(),
            type: 'item',
            position: pos,
            rotation: [0, 0, 0],
            // 1. INCREASED SIZE: Make the bounding box visible!
            width: 0.5,
            depth: 0.2,
            height: 0.1,
            parentId: levelId,
            name: 'Annotation',
            metadata: { 
              isTransient: true, 
              isText: true, 
              text: 'New Text', 
              fontSize: 16, 
              color: '#171717' 
            },
          })
          useScene.getState().createNode(node, levelId as AnyNodeId)
          draftRef.current = node
        } catch (error) {
          console.error("Draft generation failed", error)
        }
      } else {
        useScene.getState().updateNode(draftRef.current.id, { position: pos })
      }
    }

    const onClick = (event: any) => {
      if (!draftRef.current) return

      const draft = draftRef.current
      draftRef.current = null
      useScene.getState().deleteNode(draft.id) 

      const levelId = getLevelId()
      const pos = event.position || event.point || draft.position

      try {
        // 2. FRESH PARSE: Generate a clean permanent node
        const node = ItemNode.parse({
          id: crypto.randomUUID(),
          type: 'item',
          position: pos,
          rotation: [0, 0, 0],
          width: 0.5,
          depth: 0.2,
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
        sfxEmitter.emit('sfx:item-place')
        
        // 3. DEFER STATE CHANGES: Wait 50ms so the Selection Tool ignores this click!
        setTimeout(() => {
          useViewer.getState().setSelection({ selectedIds: [node.id] })
          setTool('select')
          setMode('select')
        }, 50)

      } catch (error) {
        console.error("Text Placement Failed:", error)
      }
    }

    emitter.on('grid:move', onPointerMove)
    emitter.on('wall:move', onPointerMove)
    emitter.on('grid:click', onClick)
    emitter.on('wall:click', onClick)
    emitter.on('tool:cancel', destroyDraft)
    
    return () => {
      destroyDraft()
      emitter.off('grid:move', onPointerMove)
      emitter.off('wall:move', onPointerMove)
      emitter.off('grid:click', onClick)
      emitter.off('wall:click', onClick)
      emitter.off('tool:cancel', destroyDraft)
    }
  }, [tool, mode, setTool, setMode])

  return null
}