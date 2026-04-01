'use client'

import { type AnyNode, type AnyNodeId, type MaterialSchema, useScene, type WallNode } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MaterialPicker } from '../controls/material-picker'
import { PanelSection } from '../controls/panel-section'
import { PanelWrapper } from './panel-wrapper'
import { cn } from '../../../lib/utils'

// --- 1. Imperial Math Helpers ---
const M_TO_IN = 39.3701;

function formatFtIn(meters: number) {
  const totalInches = Math.round(meters * M_TO_IN);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}' ${inches}"`;
}

function parseFtIn(input: string, fallbackMeters: number): number {
  // Look for numbers followed by ' or " symbols
  const ftMatch = input.match(/(\d+(?:\.\d+)?)\s*'/);
  const inMatch = input.match(/(\d+(?:\.\d+)?)\s*"/);

  if (!ftMatch && !inMatch) {
    // Fallback: If user types "10.5" without symbols, assume decimal feet
    const num = Number.parseFloat(input);
    if (!Number.isNaN(num)) return num / 3.28084; 
    return fallbackMeters;
  }

  let totalInches = 0;
  if (ftMatch) totalInches += Number.parseFloat(ftMatch[1]) * 12;
  if (inMatch) totalInches += Number.parseFloat(inMatch[1]);

  return totalInches / M_TO_IN; // Convert back to meters for Pascal store
}

// --- 2. Custom Imperial Slider Component ---
interface ImperialControlProps {
  label: string
  value: number // Raw meters from Pascal Store
  onChange: (value: number) => void
  min?: number
  max?: number
}

function ImperialControl({ label, value, onChange, min = 0, max = 100 }: ImperialControlProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [inputValue, setInputValue] = useState(formatFtIn(value))

  const dragRef = useRef<{ startX: number; startValue: number } | null>(null)
  const valueRef = useRef(value)
  valueRef.current = value

  const clamp = useCallback((val: number) => Math.min(Math.max(val, min), max), [min, max])

  // Sync display if value changes externally
  useEffect(() => {
    if (!isEditing) setInputValue(formatFtIn(value))
  }, [value, isEditing])

  // Start Scrubbing
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isEditing) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startValue: valueRef.current }
    setIsDragging(true)
    useScene.temporal.getState().pause() // Pause undo/redo history during drag
  }, [isEditing])

  // Drag Math
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    const { startX, startValue } = dragRef.current
    const dx = e.clientX - startX

    // 1 pixel mouse drag = 0.5 inches change (0.0127 meters)
    let step = 0.0127 
    if (e.shiftKey) step *= 12 // Hold shift to jump 6 inches per pixel

    const newValue = clamp(startValue + (dx * step))
    onChange(newValue)
  }, [clamp, onChange])

  // End Scrubbing
  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    const { startValue } = dragRef.current
    const finalVal = valueRef.current
    dragRef.current = null
    setIsDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)

    if (startValue !== finalVal) {
      onChange(startValue)
      useScene.temporal.getState().resume() // Resume undo/redo history
      onChange(finalVal)
    } else {
      useScene.temporal.getState().resume()
    }
  }, [onChange])

  // Handle Text Input Submission
  const submitValue = useCallback(() => {
    onChange(clamp(parseFtIn(inputValue, value)))
    setIsEditing(false)
  }, [inputValue, onChange, clamp, value])

  return (
    <div className={cn('group flex h-7 w-full select-none items-center rounded-lg px-2 transition-colors', isDragging ? 'bg-white/5' : 'hover:bg-white/5')}>
      
      {/* Label & Drag Area */}
      <div
        className={cn('flex shrink-0 cursor-ew-resize items-center gap-1.5 text-xs transition-colors', isDragging ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80')}
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
      >
        <div className={cn('grid grid-cols-2 gap-[2.5px] transition-opacity', isDragging ? 'opacity-70' : 'opacity-25 group-hover:opacity-50')}>
          {[...Array(6)].map((_, i) => <div className="h-[2px] w-[2px] rounded-full bg-current" key={i} />)}
        </div>
        <span className="font-medium">{label}</span>
      </div>

      <div className="flex-1" />

      {/* Value Display / Text Input */}
      <div className="flex items-center text-xs">
        {isEditing ? (
          <input
            autoFocus
            className="w-24 bg-transparent p-0 text-right font-mono text-foreground outline-none selection:bg-primary/30"
            onBlur={submitValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitValue()
              if (e.key === 'Escape') { setInputValue(formatFtIn(value)); setIsEditing(false) }
            }}
            type="text"
            value={inputValue}
          />
        ) : (
          <div className="flex cursor-text items-center text-foreground/60 transition-colors hover:text-foreground" onClick={() => { setIsEditing(true); setInputValue(formatFtIn(value)); }}>
            <span className="font-mono tabular-nums tracking-tight">{formatFtIn(value)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// --- 3. Main Wall Panel ---
export function WallPanel() {
  const selectedIds = useViewer((s) => s.selection.selectedIds)
  const setSelection = useViewer((s) => s.setSelection)
  const nodes = useScene((s) => s.nodes)
  const updateNode = useScene((s) => s.updateNode)

  const selectedId = selectedIds[0]
  const node = selectedId ? (nodes[selectedId as AnyNode['id']] as WallNode | undefined) : undefined

  const handleUpdate = useCallback((updates: Partial<WallNode>) => {
    if (!selectedId) return
    updateNode(selectedId as AnyNode['id'], updates)
    useScene.getState().dirtyNodes.add(selectedId as AnyNodeId)
  }, [selectedId, updateNode])

  const handleUpdateLength = useCallback((newLength: number) => {
    if (!node || newLength <= 0) return

    const dx = node.end[0] - node.start[0]
    const dz = node.end[1] - node.start[1]
    const currentLength = Math.sqrt(dx * dx + dz * dz)

    if (currentLength === 0) return

    const dirX = dx / currentLength
    const dirZ = dz / currentLength

    const newEnd: [number, number] = [
      node.start[0] + dirX * newLength,
      node.start[1] + dirZ * newLength
    ]

    handleUpdate({ end: newEnd })
  }, [node, handleUpdate])

  const handleMaterialChange = useCallback((material: MaterialSchema) => {
    handleUpdate({ material })
  }, [handleUpdate])

  const handleClose = useCallback(() => {
    setSelection({ selectedIds: [] })
  }, [setSelection])

  if (!node || node.type !== 'wall' || selectedIds.length !== 1) return null

  const dx = node.end[0] - node.start[0]
  const dz = node.end[1] - node.start[1]
  const length = Math.sqrt(dx * dx + dz * dz)

  const height = node.height ?? 2.5
  const thickness = node.thickness ?? 0.1

  return (
    <PanelWrapper icon="/icons/wall.png" onClose={handleClose} title={node.name || 'Wall'} width={280}>
      
      {/* 4. Implement Imperial Controls */}
      <PanelSection title="Dimensions">
        <ImperialControl label="Length" max={30} min={0.1} onChange={handleUpdateLength} value={length} />
        <ImperialControl label="Height" max={6} min={0.1} onChange={(v) => handleUpdate({ height: Math.max(0.1, v) })} value={height} />
        <ImperialControl label="Thickness" max={1} min={0.05} onChange={(v) => handleUpdate({ thickness: Math.max(0.05, v) })} value={thickness} />
      </PanelSection>

      <PanelSection title="Material">
        <MaterialPicker onChange={handleMaterialChange} value={node.material} />
      </PanelSection>
      
    </PanelWrapper>
  )
}