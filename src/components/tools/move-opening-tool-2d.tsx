'use client'

import { useEffect } from 'react'
import { AnyNodeId, DoorNode, WindowNode, emitter, useScene, type WallEvent } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import useEditor from '../../store/use-editor'
import { sfxEmitter } from '../../lib/sfx-bus'
import { calculateItemRotation, getSideFromNormal, isValidWallSideFace } from './item/placement-math'
import { clampToWall } from './door/door-math'

export function MoveOpeningTool2D() {
  const movingNode = useEditor((s) => s.movingNode)
  const setMovingNode = useEditor((s) => s.setMovingNode)

  useEffect(() => {
    // Only run if we are actively moving/duplicating a door or window
    if (!movingNode || (movingNode.type !== 'door' && movingNode.type !== 'window')) {
      return
    }

    const isDoor = movingNode.type === 'door'
    const NodeClass = isDoor ? DoorNode : WindowNode

    useScene.temporal.getState().pause()

    const meta = typeof movingNode.metadata === 'object' && movingNode.metadata !== null
      ? (movingNode.metadata as Record<string, unknown>) : {}
    const isNew = !!meta.isNew

    const original = {
      position: [...movingNode.position] as [number, number, number],
      rotation: [...movingNode.rotation] as [number, number, number],
      side: movingNode.side,
      parentId: movingNode.parentId,
      wallId: movingNode.wallId,
      metadata: movingNode.metadata,
    }

    if (!isNew) {
      useScene.getState().updateNode(movingNode.id, {
        metadata: { ...meta, isTransient: true },
      })
    }

    let currentWallId: string | null = movingNode.parentId

    const markWallDirty = (wallId: string | null) => {
      if (wallId) useScene.getState().dirtyNodes.add(wallId as AnyNodeId)
    }

    const getLevelId = () => useViewer.getState().selection.levelId

    const onWallEnterMove = (event: WallEvent) => {
      if (!isValidWallSideFace(event.normal)) return
      if (event.node.parentId !== getLevelId()) return

      const side = getSideFromNormal(event.normal)
      const itemRotation = calculateItemRotation(event.normal)
      
      // Use raw mouse position (no snapToHalf)
      const localX = event.localPosition[0] 
      
      const width = (movingNode as any).width || (isDoor ? 0.9 : 1.2)
      const height = (movingNode as any).height || (isDoor ? 2.1 : 1.2)
      
      const { clampedX, clampedY } = clampToWall(event.node, localX, width, height)
      const yPos = isDoor ? clampedY : ((movingNode as any).position[1] || 1.2)

      const prevWallId = currentWallId
      currentWallId = event.node.id

      useScene.getState().updateNode(movingNode.id, {
        position: [clampedX, yPos, 0],
        rotation: [0, itemRotation, 0],
        side,
        parentId: event.node.id,
        wallId: event.node.id,
      })

      if (prevWallId && prevWallId !== event.node.id) markWallDirty(prevWallId)
      markWallDirty(event.node.id)
    }

    const onWallClick = (event: WallEvent) => {
      if (!isValidWallSideFace(event.normal)) return
      if (event.node.parentId !== getLevelId()) return

      const side = getSideFromNormal(event.normal)
      const itemRotation = calculateItemRotation(event.normal)
      const localX = event.localPosition[0] 
      
      const width = (movingNode as any).width || (isDoor ? 0.9 : 1.2)
      const height = (movingNode as any).height || (isDoor ? 2.1 : 1.2)
      
      const { clampedX, clampedY } = clampToWall(event.node, localX, width, height)
      const yPos = isDoor ? clampedY : ((movingNode as any).position[1] || 1.2)

      let placedId: string

      if (isNew) {
        useScene.getState().deleteNode(movingNode.id)
        useScene.temporal.getState().resume()

        const cloned = structuredClone(movingNode) as any
        delete cloned.id
        const node = NodeClass.parse({
          ...cloned,
          position: [clampedX, yPos, 0],
          rotation: [0, itemRotation, 0],
          side,
          wallId: event.node.id,
          parentId: event.node.id,
          metadata: {}, 
        })
        useScene.getState().createNode(node, event.node.id as AnyNodeId)
        placedId = node.id
      } else {
        useScene.getState().updateNode(movingNode.id, {
          position: original.position,
          rotation: original.rotation,
          side: original.side,
          parentId: original.parentId,
          wallId: original.wallId,
          metadata: original.metadata,
        })
        useScene.temporal.getState().resume()

        useScene.getState().updateNode(movingNode.id, {
          position: [clampedX, yPos, 0],
          rotation: [0, itemRotation, 0],
          side,
          parentId: event.node.id,
          wallId: event.node.id,
          metadata: {},
        })

        if (original.parentId && original.parentId !== event.node.id) {
          markWallDirty(original.parentId)
        }
        placedId = movingNode.id
      }

      markWallDirty(event.node.id)
      useScene.temporal.getState().pause()

      sfxEmitter.emit('sfx:item-place')
      useViewer.getState().setSelection({ selectedIds: [placedId] })
      setMovingNode(null)
      event.stopPropagation()
    }

    const onCancel = () => {
      if (isNew) {
        useScene.getState().deleteNode(movingNode.id)
        if (currentWallId) markWallDirty(currentWallId)
      } else {
        useScene.getState().updateNode(movingNode.id, {
          position: original.position,
          rotation: original.rotation,
          side: original.side,
          parentId: original.parentId,
          wallId: original.wallId,
          metadata: original.metadata,
        })
        if (original.parentId) markWallDirty(original.parentId)
      }
      useScene.temporal.getState().resume()
      setMovingNode(null)
    }

    emitter.on('wall:enter', onWallEnterMove)
    emitter.on('wall:move', onWallEnterMove)
    emitter.on('wall:click', onWallClick)
    emitter.on('tool:cancel', onCancel)
    emitter.on('grid:click', onCancel) 

    return () => {
      const current = useScene.getState().nodes[movingNode.id as AnyNodeId]
      if (current?.metadata?.isTransient) {
        if (isNew) {
          useScene.getState().deleteNode(movingNode.id)
        } else {
          useScene.getState().updateNode(movingNode.id, { ...original })
        }
      }
      useScene.temporal.getState().resume()
      emitter.off('wall:enter', onWallEnterMove)
      emitter.off('wall:move', onWallEnterMove)
      emitter.off('wall:click', onWallClick)
      emitter.off('tool:cancel', onCancel)
      emitter.off('grid:click', onCancel)
    }
  }, [movingNode, setMovingNode])

  return null
}