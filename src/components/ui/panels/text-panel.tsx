'use client'

import { type AnyNode, type AnyNodeId, useScene, ItemNode } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import { Copy, Move, Trash2, RotateCw } from 'lucide-react'
import { useCallback } from 'react'
import { sfxEmitter } from '../../../lib/sfx-bus'
import useEditor from '../../../store/use-editor'
import { ActionButton, ActionGroup } from '../controls/action-button'
import { PanelSection } from '../controls/panel-section'
import { SliderControl } from '../controls/slider-control'
import { PanelWrapper } from './panel-wrapper'

export function TextPanel() {
  const selectedIds = useViewer((s) => s.selection.selectedIds)
  const setSelection = useViewer((s) => s.setSelection)
  const nodes = useScene((s) => s.nodes)
  const updateNode = useScene((s) => s.updateNode)
  const deleteNode = useScene((s) => s.deleteNode)
  const setMovingNode = useEditor((s) => s.setMovingNode)

  const selectedId = selectedIds[0]
  const node = selectedId ? (nodes[selectedId as AnyNode['id']] as ItemNode | undefined) : undefined

  // Ensure this panel only renders for text nodes
  if (!node || !node.metadata?.isText) return null

  const handleUpdateMeta = useCallback((key: string, value: any) => {
    if (!selectedId) return
    const newMeta = { ...(node.metadata || {}), [key]: value }
    updateNode(selectedId as AnyNode['id'], { metadata: newMeta })
    useScene.getState().dirtyNodes.add(selectedId as AnyNodeId)
  }, [selectedId, node, updateNode])

  const handleClose = useCallback(() => setSelection({ selectedIds: [] }), [setSelection])
  
  const handleMove = useCallback(() => {
    sfxEmitter.emit('sfx:item-pick')
    setMovingNode(node)
    setSelection({ selectedIds: [] })
  }, [node, setMovingNode, setSelection])

  const handleDuplicate = useCallback(() => {
    sfxEmitter.emit('sfx:item-pick')
    const cloned = ItemNode.parse({ ...node, id: crypto.randomUUID() })
    useScene.getState().createNode(cloned, node.parentId as AnyNodeId)
    setMovingNode(cloned)
    setSelection({ selectedIds: [] })
  }, [node, setMovingNode, setSelection])

  const handleDelete = useCallback(() => {
    sfxEmitter.emit('sfx:item-delete')
    deleteNode(selectedId as AnyNode['id'])
    setSelection({ selectedIds: [] })
  }, [selectedId, deleteNode, setSelection])

  const handleRotate = useCallback(() => {
    // Rotates the text 45 degrees
    const currentRot = node.rotation[1]
    updateNode(selectedId as AnyNode['id'], { rotation: [0, currentRot + (Math.PI / 4), 0] })
  }, [selectedId, node, updateNode])

  return (
    <PanelWrapper icon="/icons/text.png" onClose={handleClose} title="Annotation" width={280}>
      
      <PanelSection title="Text Content">
        <div className="px-2 pb-2">
          <input
            autoFocus
            type="text"
            value={(node.metadata.text as string) || ''}
            onChange={(e) => handleUpdateMeta('text', e.target.value)}
            className="w-full rounded-md border border-border/50 bg-neutral-800 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            placeholder="Enter text..."
          />
        </div>
      </PanelSection>

      <PanelSection title="Styling">
        <SliderControl 
          label="Font Size" 
          min={8} max={72} step={1} 
          value={(node.metadata.fontSize as number) || 16} 
          onChange={(v) => handleUpdateMeta('fontSize', v)} 
        />
        
        {/* Simple Color Picker */}
        <div className="flex items-center justify-between px-2 pt-3 pb-1">
          <span className="text-xs font-medium text-muted-foreground">Color</span>
          <input 
            type="color" 
            value={(node.metadata.color as string) || '#171717'}
            onChange={(e) => handleUpdateMeta('color', e.target.value)}
            className="h-6 w-12 cursor-pointer rounded-sm bg-transparent"
          />
        </div>
      </PanelSection>

      <PanelSection title="Actions">
        <ActionGroup>
          <ActionButton icon={<Move className="h-3.5 w-3.5" />} label="Move" onClick={handleMove} />
          <ActionButton icon={<RotateCw className="h-3.5 w-3.5" />} label="Rotate" onClick={handleRotate} />
          <ActionButton icon={<Copy className="h-3.5 w-3.5" />} label="Copy" onClick={handleDuplicate} />
          <ActionButton className="hover:bg-red-500/20" icon={<Trash2 className="h-3.5 w-3.5 text-red-400" />} label="Delete" onClick={handleDelete} />
        </ActionGroup>
      </PanelSection>

    </PanelWrapper>
  )
}