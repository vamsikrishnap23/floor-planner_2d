'use client'

import { useState, useRef } from 'react'
import { Printer, X, RotateCcw, RotateCw, Type, Trash2 } from 'lucide-react'
import { FloorplanPanel } from './floorplan-panel'

// --- 1. UPGRADED: Multiline & Customizable Paper-Space Text ---
function DraggableLabel({ text, x, y, fontSize = 24, color = '#000000', onUpdate, onRemove }: any) {
  const [pos, setPos] = useState({ x, y })
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Prevent dragging if the user is clicking the text box or the toolbar inputs!
    if (['TEXTAREA', 'INPUT', 'BUTTON'].includes((e.target as HTMLElement).tagName)) return;
    
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, initX: pos.x, initY: pos.y }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setPos({ x: dragRef.current.initX + dx, y: dragRef.current.initY + dy })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      onUpdate({ x: pos.x, y: pos.y })
      dragRef.current = null
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  // Calculate how many rows the textarea needs based on line breaks
  const lineCount = text.split('\n').length || 1

  return (
    <div
      className="absolute z-[60] flex flex-col group"
      style={{ left: pos.x, top: pos.y }}
    >
      {/* The Floating Toolbar (Visible only on hover, Hidden on Print) */}
      <div className="absolute -top-10 left-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1c1c1e] p-1.5 rounded shadow-lg border border-border/50 print:hidden z-50">
        <input 
          type="color" 
          value={color} 
          onChange={e => onUpdate({ color: e.target.value })} 
          className="h-6 w-6 cursor-pointer rounded bg-transparent border-none p-0"
          title="Text Color"
        />
        <input 
          type="number" 
          value={fontSize} 
          onChange={e => onUpdate({ fontSize: Number(e.target.value) })} 
          className="h-6 w-12 bg-black/40 text-white text-xs text-center border border-border/50 rounded outline-none"
          min="8" max="120"
          title="Font Size"
        />
        <button onClick={onRemove} className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1 rounded transition-colors" title="Delete">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* The Draggable Wrapper & Multiline Input */}
      <div 
        className="cursor-move p-1 border border-transparent hover:border-blue-500/30 rounded transition-colors"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <textarea
          value={text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          rows={lineCount}
          className="bg-transparent font-bold outline-none placeholder:text-black/30 resize-none overflow-hidden whitespace-pre-wrap leading-tight"
          style={{ fontSize: `${fontSize}px`, color: color }}
          placeholder="Room Name"
        />
      </div>
    </div>
  )
}

// --- 2. Main Export Page ---
interface ExportPageProps { onClose: () => void }

export function ExportPage({ onClose }: ExportPageProps) {
  const [rotation, setRotation] = useState(0)
  const [company, setCompany] = useState('MY CAD COMPANY')
  const [client, setClient] = useState('Client Name\nProject Location')
  const [notes, setNotes] = useState('Annotations & Notes go here.')
  
  // State to hold our floating room labels
  const [labels, setLabels] = useState<{ id: string; text: string; x: number; y: number; fontSize?: number; color?: string }[]>([])

  const addLabel = () => {
    setLabels([...labels, { 
      id: crypto.randomUUID(), 
      text: 'New Room\n100 sqft', // Multiline example
      x: 200, y: 200, 
      fontSize: 24, color: '#000000' 
    }])
  }

  const updateLabel = (id: string, updates: any) => {
    setLabels(labels.map(lbl => lbl.id === id ? { ...lbl, ...updates } : lbl))
  }

  return (
    <div className="fixed inset-0 z-[100] flex h-screen w-screen bg-neutral-200 font-sans text-foreground">
      
      {/* --- LEFT SIDEBAR --- */}
      <div className="w-80 flex-shrink-0 overflow-y-auto border-r border-border/50 bg-[#1c1c1e] p-6 shadow-xl flex flex-col gap-6 print:hidden custom-scrollbar">
        <div className="flex items-center justify-between border-b border-border/20 pb-4">
          <h2 className="text-lg font-bold text-white">Export Layout</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-white/10 text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewport Controls */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Adjust Viewport</h3>
          <p className="text-xs text-white/60 text-yellow-400 font-medium">
            ⚠️ Rule: Frame and zoom your drawing perfectly BEFORE adding room names!
          </p>
          <div className="flex gap-2">
            <button onClick={() => setRotation(r => r - 90)} className="flex flex-1 items-center justify-center gap-2 rounded bg-white/10 py-2 text-xs text-white hover:bg-white/20">
              <RotateCcw className="h-4 w-4" /> -90°
            </button>
            <button onClick={() => setRotation(r => r + 90)} className="flex flex-1 items-center justify-center gap-2 rounded bg-white/10 py-2 text-xs text-white hover:bg-white/20">
              <RotateCw className="h-4 w-4" /> +90°
            </button>
          </div>
        </div>

        {/* Paper-Space Annotations Tool */}
        <div className="space-y-3 pt-4 border-t border-border/20">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Paper Space</h3>
          <button onClick={addLabel} className="flex w-full items-center justify-center gap-2 rounded border border-white/20 bg-transparent py-2 text-sm text-white hover:bg-white/10 transition-colors">
            <Type className="h-4 w-4" /> Add Room Name
          </button>
        </div>

        {/* Title Block Form */}
        <div className="space-y-4 pt-4 border-t border-border/20">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title Block</h3>
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase text-white/70">Company</span>
            <input value={company} onChange={e => setCompany(e.target.value)} className="rounded border border-border/50 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase text-white/70">Client</span>
            <textarea value={client} onChange={e => setClient(e.target.value)} rows={2} className="resize-none rounded border border-border/50 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase text-white/70">Notes</span>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="resize-none rounded border border-border/50 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" />
          </label>
        </div>

        <div className="mt-auto pt-6">
          <button onClick={() => window.print()} className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 py-3 font-bold text-white shadow-lg hover:bg-blue-700">
            <Printer className="h-5 w-5" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* --- RIGHT WORKSPACE --- */}
      <div className="flex flex-1 items-center justify-center overflow-auto bg-neutral-300 p-8 print:p-0 print:bg-white">
        
        <div className="print-area relative h-[210mm] w-[297mm] overflow-hidden border border-gray-400 bg-white shadow-2xl print:shadow-none print:border-none">
          
          {/* CAD Viewport */}
          <div 
            className="cad-viewport absolute inset-0 origin-center transition-transform duration-300"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <FloorplanPanel />
          </div>

          {/* Render Labels */}
          {labels.map(lbl => (
            <DraggableLabel 
              key={lbl.id} 
              {...lbl} 
              onUpdate={(updates: any) => updateLabel(lbl.id, updates)} 
              onRemove={() => setLabels(labels.filter(l => l.id !== lbl.id))}
            />
          ))}

          {/* Title Block Template */}
          <div className="pointer-events-none absolute bottom-4 right-4 z-[70] w-72 border-2 border-black bg-white text-black">
            <div className="border-b-2 border-black bg-gray-100 p-3 text-center">
              <h1 className="text-base font-black uppercase tracking-widest">{company}</h1>
            </div>
            <div className="border-b-2 border-black p-3">
              <h2 className="mb-1 text-[9px] font-bold uppercase tracking-widest text-gray-500">Client Details</h2>
              <p className="whitespace-pre-wrap text-xs font-semibold">{client}</p>
            </div>
            <div className="min-h-[80px] p-3">
              <h2 className="mb-1 text-[9px] font-bold uppercase tracking-widest text-gray-500">Annotations</h2>
              <p className="whitespace-pre-wrap text-xs">{notes}</p>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .cad-viewport > div > div:first-child { display: none !important; }
        .cad-viewport svg circle { visibility: hidden !important; }
        .cad-viewport .bg-grid-pattern, .cad-viewport .bg-background { background: transparent !important; }

        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute !important; left: 0 !important; top: 0 !important; margin: 0 !important; box-shadow: none !important;
          }
          .print-area textarea, .print-area input {
            border: none !important; background: transparent !important; resize: none !important;
          }
          @page { size: A4 landscape; margin: 0; }
        }
      `}} />
    </div>
  )
}