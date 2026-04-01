'use client'

import { emitter, useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import { TreeView, VisualJson } from '@visual-json/react'
import { Camera, Download, Save, Trash2, Upload, Printer, LogOut } from 'lucide-react'
import {
  type KeyboardEvent,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Button } from './../../../../../components/ui/primitives/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from './../../../../../components/ui/primitives/dialog'
import { Switch } from './../../../../../components/ui/primitives/switch'
import useEditor from './../../../../../store/use-editor'
import { AudioSettingsDialog } from './audio-settings-dialog'
import { KeyboardShortcutsDialog } from './keyboard-shortcuts-dialog'

// --- Types (Keep existing) ---
type SceneNode = Record<string, unknown> & { id?: unknown; type?: unknown; name?: unknown; parentId?: unknown; children?: unknown }
type SceneGraphNode = { id: string; type: string; name: string | null; parentId: string | null; children: SceneGraphNode[]; missing?: true; cycle?: true }
type SceneGraphValue = { roots: SceneGraphNode[]; detachedNodes?: SceneGraphNode[] }

const isSceneNode = (value: unknown): value is SceneNode => typeof value === 'object' && value !== null && 'id' in value && typeof (value as { id: unknown }).id === 'string'

const getChildIdsFromNode = (node: SceneNode): string[] => {
  if (!Array.isArray(node.children)) return []
  const childIds = new Set<string>()
  for (const child of node.children) {
    if (typeof child === 'string') { childIds.add(child); continue }
    if (isSceneNode(child)) { childIds.add(child.id as string) }
  }
  return Array.from(childIds)
}

const buildSceneGraphValue = (nodes: Record<string, SceneNode>, rootNodeIds: string[]): SceneGraphValue => {
  const childIdsByParent = new Map<string, Set<string>>()
  for (const [id, node] of Object.entries(nodes)) {
    const childIds = getChildIdsFromNode(node)
    if (childIds.length > 0) childIdsByParent.set(id, new Set(childIds))
  }
  for (const [id, node] of Object.entries(nodes)) {
    if (typeof node.parentId !== 'string') continue
    const siblings = childIdsByParent.get(node.parentId) ?? new Set<string>()
    siblings.add(id)
    childIdsByParent.set(node.parentId, siblings)
  }
  const visited = new Set<string>()
  const buildNode = (id: string, path: Set<string>): SceneGraphNode => {
    const node = nodes[id]
    if (!node) return { id, type: 'missing', name: null, parentId: null, missing: true, children: [] }
    const nodeType = typeof node.type === 'string' ? node.type : 'unknown'
    const nodeName = typeof node.name === 'string' ? node.name : null
    const parentId = typeof node.parentId === 'string' ? node.parentId : null
    if (path.has(id)) return { id, type: nodeType, name: nodeName, parentId, cycle: true, children: [] }
    visited.add(id)
    const nextPath = new Set(path); nextPath.add(id)
    const childIds = Array.from(childIdsByParent.get(id) ?? [])
    return { id, type: nodeType, name: nodeName, parentId, children: childIds.map((childId) => buildNode(childId, nextPath)) }
  }
  const roots = rootNodeIds.map((id) => buildNode(id, new Set()))
  const detachedNodeIds = Object.keys(nodes).filter((id) => !visited.has(id))
  return detachedNodeIds.length === 0 ? { roots } : { roots, detachedNodes: detachedNodeIds.map((id) => buildNode(id, new Set())) }
}

export interface SettingsPanelProps {
  projectId?: string
  projectVisibility?: { isPrivate: boolean; showScansPublic: boolean; showGuidesPublic: boolean }
  onVisibilityChange?: (field: 'isPrivate' | 'showScansPublic' | 'showGuidesPublic', value: boolean) => Promise<void>
  // 1. ADD THESE CUSTOM PROPS
  onExportClick?: () => void
  onExitClick?: () => void
}

export function SettingsPanel({
  projectId,
  projectVisibility,
  onVisibilityChange,
  onExportClick,
  onExitClick
}: SettingsPanelProps = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nodes = useScene((state) => state.nodes)
  const rootNodeIds = useScene((state) => state.rootNodeIds)
  const setScene = useScene((state) => state.setScene)
  const clearScene = useScene((state) => state.clearScene)
  const resetSelection = useViewer((state) => state.resetSelection)
  const exportScene = useViewer((state) => state.exportScene)
  const showGrid = useViewer((state) => state.showGrid)
  const setPhase = useEditor((state) => state.setPhase)
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false)

  const sceneGraphValue = useMemo(() => buildSceneGraphValue(nodes as Record<string, SceneNode>, rootNodeIds), [nodes, rootNodeIds])
  
  const blockSceneGraphMutations = useCallback((event: SyntheticEvent) => { event.preventDefault(); event.stopPropagation() }, [])
  const blockSceneGraphDeletion = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); event.stopPropagation() }
  }, [])

  const handleExport = async (format: 'glb' | 'stl' | 'obj' = 'glb') => { if (exportScene) await exportScene(format) }

  const handleSaveBuild = () => {
    const sceneData = { nodes, rootNodeIds }
    const json = JSON.stringify(sceneData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const date = new Date().toISOString().split('T')[0]
    link.download = `layout_${date}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data.nodes && data.rootNodeIds) {
          setScene(data.nodes, data.rootNodeIds)
          resetSelection()
          setPhase('site')
        }
      } catch (err) { console.error('Failed to load build:', err) }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-6 p-3">
      {/* 3D Export Section */}
      <div className="space-y-2">
        <label className="font-medium text-muted-foreground text-[10px] uppercase tracking-wider">3D Assets</label>
        <Button className="w-full justify-start gap-2" onClick={() => handleExport('glb')} variant="outline">
          <Download className="size-4" /> Export as GLB
        </Button>
      </div>

      {/* 2. ENHANCED SAVE & EXPORT SECTION */}
      <div className="space-y-2">
        <label className="font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Project Output</label>

        <Button className="w-full justify-start gap-2" onClick={handleSaveBuild} variant="outline">
          <Save className="size-4" /> Save Build (.json)
        </Button>

        <Button className="w-full justify-start gap-2" onClick={() => fileInputRef.current?.click()} variant="outline">
          <Upload className="size-4" /> Load Build (.json)
        </Button>

        {/* 3. INTEGRATED PDF EXPORT BUTTON */}
        <Button className="w-full justify-start gap-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all" onClick={onExportClick} variant="outline">
          <Printer className="size-4" /> Print PDF Layout
        </Button>

        <input accept="application/json" className="hidden" onChange={handleFileLoad} ref={fileInputRef} type="file" />
      </div>

      {/* Visibility & Audio (Keep existing) */}
      <div className="space-y-2">
         <label className="font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Settings</label>
         <AudioSettingsDialog />
         <KeyboardShortcutsDialog />
      </div>

      {/* 4. DANGER ZONE: MODIFIED EXIT */}
      <div className="space-y-2 border-t border-border/20 pt-4">
        <label className="font-medium text-destructive text-[10px] uppercase tracking-wider">Danger Zone</label>

        <Button
          className="w-full justify-start gap-2 opacity-70 hover:opacity-100"
          onClick={() => {
            if(confirm("Exit to dashboard? Ensure you have saved your work.")) {
                onExitClick?.()
            }
          }}
          variant="destructive"
        >
          <LogOut className="size-4" /> Exit to Dashboard
        </Button>

        <Button
          className="w-full justify-start gap-2 opacity-50 hover:opacity-100"
          onClick={() => {
            if(confirm("This will PERMANENTLY clear the current drawing. Continue?")) {
                clearScene(); 
                resetSelection(); 
                setPhase('site');
            }
          }}
          variant="ghost"
        >
          <Trash2 className="size-4" /> Clear Canvas
        </Button>
      </div>
    </div>
  )
}