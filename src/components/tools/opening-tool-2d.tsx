'use client'

import { useEffect, useRef } from 'react'
import {
  type AnyNodeId,
  DoorNode,
  WindowNode,
  emitter,
  useScene,
  type WallEvent,
} from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import useEditor from '../../store/use-editor'
import { sfxEmitter } from '../../lib/sfx-bus'
import {
  calculateItemRotation,
  getSideFromNormal,
  isValidWallSideFace,
  snapToHalf,
} from './item/placement-math'
import { clampToWall } from './door/door-math'

export function OpeningTool2D() {
  const tool = useEditor((s) => s.tool)
  const mode = useEditor((s) => s.mode)
  const draftRef = useRef<any>(null)

  useEffect(() => {
    // Only run if we are actively building a door or window
    if (mode !== 'build' || (tool !== 'door' && tool !== 'window')) {
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

    const onWallEnter = (event: WallEvent) => {
      if (!isValidWallSideFace(event.normal)) return
      if (event.node.parentId !== getLevelId()) return

      destroyDraft()

      const side = getSideFromNormal(event.normal)
      const itemRotation = calculateItemRotation(event.normal)
      const localX = snapToHalf(event.localPosition[0])
      
      const width = tool === 'door' ? 0.9 : 1.2
      const height = tool === 'door' ? 2.1 : 1.2
      const { clampedX, clampedY } = clampToWall(event.node, localX, width, height)
      
      // Windows sit higher up on the wall than doors
      const yPos = tool === 'door' ? clampedY : 1.2 

      const NodeClass = tool === 'door' ? DoorNode : WindowNode
      const node = NodeClass.parse({
        position: [clampedX, yPos, 0],
        rotation: [0, itemRotation, 0],
        side,
        wallId: event.node.id,
        parentId: event.node.id,
        metadata: { isTransient: true }, // Tells Floorplan to draw it semi-transparently
      })

      useScene.getState().createNode(node, event.node.id as AnyNodeId)
      draftRef.current = node
    }

    const onWallMove = (event: WallEvent) => {
      if (!isValidWallSideFace(event.normal)) return
      if (!draftRef.current) return

      const side = getSideFromNormal(event.normal)
      const itemRotation = calculateItemRotation(event.normal)
      const localX = snapToHalf(event.localPosition[0])
      
      const { clampedX, clampedY } = clampToWall(event.node, localX, draftRef.current.width, draftRef.current.height)
      const yPos = tool === 'door' ? clampedY : 1.2 

      useScene.getState().updateNode(draftRef.current.id, {
        position: [clampedX, yPos, 0],
        rotation: [0, itemRotation, 0],
        side,
        parentId: event.node.id,
        wallId: event.node.id,
      })
    }

    const onWallClick = (event: WallEvent) => {
      if (!draftRef.current) return
      if (!isValidWallSideFace(event.normal)) return

      const draft = draftRef.current
      draftRef.current = null
      useScene.getState().deleteNode(draft.id)
      
      // Read the draft's actual last known position from the wall:move event
      const finalX = draft.position[0]
      const finalY = draft.position[1]

      const NodeClass = tool === 'door' ? DoorNode : WindowNode
      const node = NodeClass.parse({
        ...draft,
        position: [finalX, finalY, 0],
        metadata: {},
        name: tool === 'door' ? 'Door' : 'Window',
      })

      useScene.getState().createNode(node, event.node.id as AnyNodeId)
      useViewer.getState().setSelection({ selectedIds: [node.id] })
      sfxEmitter.emit('sfx:item-place')
    }

    // Attach listeners
    emitter.on('wall:enter', onWallEnter)
    emitter.on('wall:move', onWallMove)
    emitter.on('wall:click', onWallClick)
    emitter.on('wall:leave', destroyDraft)
    emitter.on('tool:cancel', destroyDraft)

    return () => {
      destroyDraft()
      emitter.off('wall:enter', onWallEnter)
      emitter.off('wall:move', onWallMove)
      emitter.off('wall:click', onWallClick)
      emitter.off('wall:leave', destroyDraft)
      emitter.off('tool:cancel', destroyDraft)
    }
  }, [tool, mode])

  return null
}