'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useScene } from '@pascal-app/core'
import { cn } from '../../../lib/utils'

const M_TO_IN = 39.3701;

function formatFtIn(meters: number) {
  const isNegative = meters < 0;
  const absMeters = Math.abs(meters);
  const totalInches = Math.round(absMeters * M_TO_IN);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${isNegative ? '-' : ''}${feet}' ${inches}"`;
}

function parseFtIn(input: string, fallbackMeters: number): number {
  const isNegative = input.trim().startsWith('-');
  const str = input.replace('-', '');
  
  const ftMatch = str.match(/(\d+(?:\.\d+)?)\s*'/);
  const inMatch = str.match(/(\d+(?:\.\d+)?)\s*"/);

  if (!ftMatch && !inMatch) {
    const num = Number.parseFloat(input);
    if (!Number.isNaN(num)) return (isNegative ? -num : num) / 3.28084; 
    return fallbackMeters;
  }

  let totalInches = 0;
  if (ftMatch) totalInches += Number.parseFloat(ftMatch[1]) * 12;
  if (inMatch) totalInches += Number.parseFloat(inMatch[1]);

  const meters = totalInches / M_TO_IN;
  return isNegative ? -meters : meters;
}

interface ImperialControlProps {
  label: string | React.ReactNode
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export function ImperialControl({ label, value, onChange, min = -100, max = 100 }: ImperialControlProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [inputValue, setInputValue] = useState(formatFtIn(value))

  const dragRef = useRef<{ startX: number; startValue: number } | null>(null)
  const valueRef = useRef(value)
  valueRef.current = value

  const clamp = useCallback((val: number) => Math.min(Math.max(val, min), max), [min, max])

  useEffect(() => {
    if (!isEditing) setInputValue(formatFtIn(value))
  }, [value, isEditing])

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isEditing) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startValue: valueRef.current }
    setIsDragging(true)
    useScene.temporal.getState().pause()
  }, [isEditing])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    const { startX, startValue } = dragRef.current
    const dx = e.clientX - startX
    let step = 0.0127 
    if (e.shiftKey) step *= 12 
    const newValue = clamp(startValue + (dx * step))
    onChange(newValue)
  }, [clamp, onChange])

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    const { startValue } = dragRef.current
    const finalVal = valueRef.current
    dragRef.current = null
    setIsDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)

    if (startValue !== finalVal) {
      onChange(startValue)
      useScene.temporal.getState().resume()
      onChange(finalVal)
    } else {
      useScene.temporal.getState().resume()
    }
  }, [onChange])

  const submitValue = useCallback(() => {
    onChange(clamp(parseFtIn(inputValue, value)))
    setIsEditing(false)
  }, [inputValue, onChange, clamp, value])

  return (
    <div className={cn('group flex h-7 w-full select-none items-center rounded-lg px-2 transition-colors', isDragging ? 'bg-white/5' : 'hover:bg-white/5')}>
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