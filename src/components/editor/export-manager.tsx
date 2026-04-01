'use client'

import { useState } from 'react'
import { Printer, X } from 'lucide-react'

export function ExportManager() {
  const [isExportMode, setIsExportMode] = useState(false)
  
  // State for our architectural Title Block
  const [company, setCompany] = useState('MY COMPANY NAME')
  const [client, setClient] = useState('Client: John Doe\nLocation: 123 Main St')
  const [notes, setNotes] = useState('Annotations:\n- All walls are 0.1m thick\n- Flooring TBA')

  if (!isExportMode) {
    return (
      <button 
        onClick={() => setIsExportMode(true)}
        className="pointer-events-auto fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg bg-[#2C2C2E] border border-border/50 px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#3e3e3e]"
      >
        <Printer className="h-4 w-4" /> Export PDF
      </button>
    )
  }

  return (
    <>
      {/* 1. The Data Entry Form (Hidden during actual printing) */}
      <div className="pointer-events-auto fixed right-4 top-4 z-50 flex w-80 flex-col gap-4 rounded-xl border border-border/50 bg-[#1c1c1e]/95 p-5 shadow-2xl backdrop-blur-md print:hidden">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h3 className="font-semibold text-white">Print Setup</h3>
          <button onClick={() => setIsExportMode(false)} className="text-muted-foreground hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex flex-col gap-3 text-sm">
          <label className="flex flex-col gap-1.5 text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Company Name</span>
            <input value={company} onChange={e => setCompany(e.target.value)} className="rounded-md border border-border/50 bg-black/40 px-3 py-2 text-white outline-none focus:border-blue-500" />
          </label>
          <label className="flex flex-col gap-1.5 text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Client Details</span>
            <textarea value={client} onChange={e => setClient(e.target.value)} rows={2} className="resize-none rounded-md border border-border/50 bg-black/40 px-3 py-2 text-white outline-none focus:border-blue-500" />
          </label>
          <label className="flex flex-col gap-1.5 text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Annotations & Notes</span>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="resize-none rounded-md border border-border/50 bg-black/40 px-3 py-2 text-white outline-none focus:border-blue-500" placeholder="Type instructions or notes here..." />
          </label>
        </div>

        <button onClick={() => window.print()} className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700">
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </button>
      </div>

      {/* 2. The Architectural Title Block (Visible ONLY on the printed PDF) */}
      <div className="hidden print:block fixed bottom-8 right-8 z-50 w-80 border-2 border-black bg-white text-black shadow-none">
        <div className="border-b-2 border-black p-4 text-center bg-gray-100">
          <h1 className="text-lg font-black uppercase tracking-widest">{company}</h1>
        </div>
        <div className="border-b-2 border-black p-4">
          <h2 className="mb-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Client Information</h2>
          <p className="whitespace-pre-wrap text-sm font-semibold">{client}</p>
        </div>
        <div className="p-4 min-h-[100px]">
          <h2 className="mb-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Annotations</h2>
          <p className="whitespace-pre-wrap text-sm">{notes}</p>
        </div>
      </div>
      
      {/* 3. Global Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide all editor menus, sidebars, and dark backgrounds */
          .action-menu, aside, .panel-manager, [role="tooltip"], button, .dark {
            display: none !important;
          }
          /* Force the canvas to take up the full paper, remove margins */
          main {
            margin: 0 !important;
            padding: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            background: white !important;
          }
          /* Set paper to landscape */
          @page { 
            size: landscape; 
            margin: 0mm; 
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}} />
    </>
  )
}