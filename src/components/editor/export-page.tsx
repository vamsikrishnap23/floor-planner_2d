'use client'

import { useState, useEffect, useRef } from 'react'
import { Download, X, Type, MousePointer2 } from 'lucide-react'
import { FloorplanPanel } from './floorplan-panel'
import { useScene, ItemNode, AnyNodeId } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import useEditor from '../../store/use-editor'
import { sfxEmitter } from '../../lib/sfx-bus'

interface ExportPageProps {
  onClose: () => void
}

export function ExportPage({ onClose }: ExportPageProps) {
  const setMode = useEditor((s) => s.setMode)
  const [activeTool, setActiveTool] = useState<'pan' | 'text'>('pan')
  
  const nodes = useScene((s) => s.nodes)
  const textNodes = Object.values(nodes).filter(n => n.type === 'item' && n.metadata?.isText)

  const [company, setCompany] = useState('MY CAD COMPANY')
  const [client, setClient] = useState('Client Name - Project Details')

  const syncGroupRef = useRef<SVGGElement>(null)
  const [cameraMatrix, setCameraMatrix] = useState({ x: 0, y: 0, scale: 1 })

  // 1. Enter strict export mode to prevent accidental wall drawing
  useEffect(() => {
    setMode('export')
    return () => setMode('select')
  }, [setMode])

  // 2. Safely find the Main CAD Canvas (Ignore tiny UI icons like Chevrons!)
  const getMainSvg = () => {
    const svgs = Array.from(document.querySelectorAll('.cad-viewport svg'))
    return svgs.reduce((largest: any, svg: any) => {
      const width = svg.getBoundingClientRect().width
      return width > (largest?.getBoundingClientRect().width || 0) ? svg : largest
    }, svgs[0]) as SVGSVGElement
  }

  // 3. Synchronize our Text Layer with Pascal's Camera
  useEffect(() => {
    let frameId: number
    const syncCamera = () => {
      const mainSvg = getMainSvg()
      const masterGroup = mainSvg?.querySelector('g') as SVGGElement
      
      if (masterGroup && syncGroupRef.current) {
        // Copy the visual transform
        syncGroupRef.current.setAttribute('transform', masterGroup.getAttribute('transform') || '')
        
        // Extract exact math values for our text placement tool
        const ctm = masterGroup.getCTM()
        if (ctm) {
          setCameraMatrix({ x: ctm.e, y: ctm.f, scale: ctm.a })
        }
      }
      frameId = requestAnimationFrame(syncCamera)
    }
    syncCamera()
    return () => cancelAnimationFrame(frameId)
  }, [])

  // 4. Bulletproof Text Placement
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (activeTool !== 'text') return

    const rect = e.currentTarget.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top

    // Reverse Engineer the Camera Transform Math!
    const unpannedX = screenX - cameraMatrix.x
    const unpannedY = screenY - cameraMatrix.y
    const unscaledX = unpannedX / cameraMatrix.scale
    const unscaledY = unpannedY / cameraMatrix.scale
    
    // Convert to CAD Meters (Pascal uses 50px = 1m)
    const cadX = unscaledX / 50
    const cadZ = -unscaledY / 50

    const levelId = useViewer.getState().selection.levelId
    if (!levelId) return

    const node = ItemNode.parse({
      id: crypto.randomUUID(),
      type: 'item',
      position: [cadX, 0, cadZ],
      rotation: [0, 0, 0],
      width: 0.5, depth: 0.2, height: 0.1,
      parentId: levelId,
      name: 'Annotation',
      metadata: { isText: true, text: 'New Room', fontSize: 24, color: '#000000' },
    })

    useScene.getState().createNode(node, levelId as AnyNodeId)
    sfxEmitter.emit('sfx:item-place')
    setActiveTool('pan') // Switch back to pan tool automatically
  }

  // 5. The True Vector Exporter
  const handleVectorExport = () => {
    const mainSvg = getMainSvg()
    if (!mainSvg) return

    const clonedSvg = mainSvg.cloneNode(true) as SVGSVGElement

    // Inject our Text Layer into the cloned file
    if (syncGroupRef.current) {
      const textLayer = syncGroupRef.current.cloneNode(true)
      clonedSvg.appendChild(textLayer)
    }

    // Measure the screen to anchor the Title Block
    const width = mainSvg.getBoundingClientRect().width
    const height = mainSvg.getBoundingClientRect().height
    clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`)

    const titleBlock = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    titleBlock.setAttribute('transform', `translate(${width - 320}, ${height - 120})`)
    titleBlock.innerHTML = `
      <rect width="300" height="100" fill="#ffffff" stroke="#000000" stroke-width="2"/>
      <line x1="0" y1="30" x2="300" y2="30" stroke="#000000" stroke-width="2"/>
      <text x="150" y="20" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#000">${company}</text>
      <text x="10" y="50" font-family="sans-serif" font-size="10" font-weight="bold" fill="#666">CLIENT DETAILS</text>
      <text x="10" y="70" font-family="sans-serif" font-size="12" fill="#000">${client}</text>
    `
    clonedSvg.appendChild(titleBlock)

    // Clean out Pascal UI artifacts
    const serializer = new XMLSerializer()
    let svgString = serializer.serializeToString(clonedSvg)
    svgString = svgString.replace(/<circle[^>]*>/g, '') 

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Floorplan_Export_${new Date().getTime()}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const updateTextNode = (id: string, newText: string) => {
    useScene.getState().updateNode(id as AnyNodeId, { 
      metadata: { ...nodes[id as AnyNodeId].metadata, text: newText } 
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex h-screen w-screen bg-[#121212] font-sans text-foreground">
      
      {/* LEFT SIDEBAR CONTROLS */}
      <div className="w-80 flex-shrink-0 border-r border-border/50 bg-[#1c1c1e] p-6 shadow-xl flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-border/20 pb-4">
          <h2 className="text-lg font-bold text-white">CAD Exporter</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-white/10 text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Model Space Tools</h3>
          <div className="flex gap-2">
            <button onClick={() => setActiveTool('pan')} className={`flex flex-1 items-center justify-center gap-2 rounded py-2 text-xs font-bold transition-colors ${activeTool === 'pan' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              <MousePointer2 className="h-4 w-4" /> Pan / Frame
            </button>
            <button onClick={() => setActiveTool('text')} className={`flex flex-1 items-center justify-center gap-2 rounded py-2 text-xs font-bold transition-colors ${activeTool === 'text' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              <Type className="h-4 w-4" /> Add Text
            </button>
          </div>
          {activeTool === 'text' && <p className="text-[10px] text-blue-400">Click anywhere on the canvas to place text.</p>}
        </div>

        <div className="space-y-4 pt-4 border-t border-border/20">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vector Title Block</h3>
          <label className="flex flex-col gap-1.5"><span className="text-[10px] uppercase text-white/70">Company</span><input value={company} onChange={e => setCompany(e.target.value)} className="rounded border border-border/50 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" /></label>
          <label className="flex flex-col gap-1.5"><span className="text-[10px] uppercase text-white/70">Client</span><input value={client} onChange={e => setClient(e.target.value)} className="rounded border border-border/50 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" /></label>
        </div>

        <div className="mt-auto pt-6">
          <button onClick={handleVectorExport} className="flex w-full items-center justify-center gap-2 rounded bg-green-600 py-3 font-bold text-white shadow-lg hover:bg-green-700">
            <Download className="h-5 w-5" /> Download Vector CAD (.svg)
          </button>
        </div>
      </div>

      {/* RIGHT WORKSPACE: LIVE CAD PREVIEW */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-white">
        
        {/* The Click Interceptor Wrapper */}
        <div 
          className={`cad-viewport absolute inset-0 ${activeTool === 'text' ? 'cursor-crosshair' : 'cursor-default'}`}
          onClick={handleCanvasClick}
        >
          {/* We turn off internal pointer events ONLY when adding text, so you can still right-click pan! */}
          <div className={`w-full h-full ${activeTool === 'text' ? 'pointer-events-none' : 'pointer-events-auto'}`}>
            <FloorplanPanel />
          </div>
        </div>

        {/* Custom Native SVG Overlay */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <g ref={syncGroupRef}>
            {textNodes.map((node: any) => {
              const scale = 50 
              const cx = node.position[0] * scale
              const cy = -(node.position[2] * scale)
              
              return (
                <foreignObject key={node.id} x={cx - 100} y={cy - 20} width="200" height="100" className="pointer-events-auto">
                  <input
                    type="text"
                    value={node.metadata.text}
                    onChange={(e) => updateTextNode(node.id, e.target.value)}
                    className="w-full bg-transparent text-center font-bold outline-none border border-transparent hover:border-blue-400 focus:border-blue-500 rounded text-black transition-colors"
                    style={{ fontSize: `${node.metadata.fontSize}px`, color: node.metadata.color }}
                  />
                </foreignObject>
              )
            })}
          </g>
        </svg>

      </div>

      {/* Hide the UI junk from the Live Preview SAFELY */}
      <style dangerouslySetInnerHTML={{__html: `
        .cad-viewport .bg-background\\/92,
        .cad-viewport .border-b.flex.items-center { 
          display: none !important; 
        }
        .cad-viewport .bg-grid-pattern { 
          background: transparent !important; 
        }
      `}} />
    </div>
  )
}