'use client'

import { Plus, Upload, FileJson } from 'lucide-react'

interface DashboardProps {
  onStartNew: () => void
  onOpenJson: (sceneData: any) => void
}

export function Dashboard({ onStartNew, onOpenJson }: DashboardProps) {
  
  // 1. Native HTML File Reader for JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        onOpenJson(json)
      } catch (error) {
        alert("Invalid Floorplan File! Please select a valid JSON.")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#121212] font-sans text-white">
      <div className="mb-12 flex flex-col items-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20">
          <FileJson className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-widest text-white">CAD STUDIO</h1>
        <p className="text-sm text-gray-400">Professional 2D Floorplan Editor</p>
      </div>

      <div className="flex gap-6">
        {/* NEW PROJECT BUTTON */}
        <button 
          onClick={onStartNew}
          className="group flex h-48 w-48 flex-col items-center justify-center gap-4 rounded-xl border-2 border-border/20 bg-[#1c1c1e] transition-all hover:border-blue-500 hover:bg-[#252528] hover:-translate-y-1 shadow-xl"
        >
          <div className="rounded-full bg-blue-500/10 p-4 group-hover:bg-blue-500/20">
            <Plus className="h-8 w-8 text-blue-400" />
          </div>
          <span className="font-semibold tracking-wide">New Floorplan</span>
        </button>

        {/* OPEN JSON FILE BUTTON */}
        <label className="group flex h-48 w-48 cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-border/20 bg-[#1c1c1e] transition-all hover:border-green-500 hover:bg-[#252528] hover:-translate-y-1 shadow-xl">
          <div className="rounded-full bg-green-500/10 p-4 group-hover:bg-green-500/20">
            <Upload className="h-8 w-8 text-green-400" />
          </div>
          <span className="font-semibold tracking-wide">Open .JSON</span>
          
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            onChange={handleFileUpload} 
          />
        </label>
      </div>
    </div>
  )
}