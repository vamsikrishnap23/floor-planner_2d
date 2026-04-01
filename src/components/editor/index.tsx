'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { Printer, Download, ArrowLeft } from 'lucide-react'
import { ExportPage } from './export-page'
import { Dashboard } from './dashboard'
import { initSpaceDetectionSync, initSpatialGridSync, useScene } from '@pascal-app/core'
import { type PresetsAdapter, PresetsProvider } from '../../contexts/presets-context'
import { type SaveStatus, useAutoSave } from '../../hooks/use-auto-save'
import { useKeyboard } from '../../hooks/use-keyboard'
import { applySceneGraphToEditor, type SceneGraph } from '../../lib/scene'
import { initSFXBus } from '../../lib/sfx-bus'
import useEditor from '../../store/use-editor'
import { ActionMenu } from '../ui/action-menu'
import { PanelManager } from '../ui/panels/panel-manager'
import { ErrorBoundary } from '../ui/primitives/error-boundary'
import { SidebarProvider } from '../ui/primitives/sidebar'
import { SceneLoader } from '../ui/scene-loader'
import { AppSidebar } from '../ui/sidebar/app-sidebar'
import type { SettingsPanelProps } from '../ui/sidebar/panels/settings-panel'
import type { SitePanelProps } from '../ui/sidebar/panels/site-panel'
import { FloorplanPanel } from './floorplan-panel'
import { OpeningTool2D } from '../tools/opening-tool-2d'
import { SelectionTool2D } from '../tools/selection-tool-2d'
import { MoveOpeningTool2D } from '../tools/move-opening-tool-2d'
import { ItemTool2D } from '../tools/item-tool-2d'
import { TextRenderer2D } from './text-renderer-2d'

let hasInitializedEditorRuntime = false

function initializeEditorRuntime() {
  if (hasInitializedEditorRuntime) return
  initSpatialGridSync()
  initSpaceDetectionSync(useScene, useEditor)
  initSFXBus()
  hasInitializedEditorRuntime = true
}

export interface EditorProps {
  appMenuButton?: ReactNode
  sidebarTop?: ReactNode
  projectId?: string | null
  onLoad?: () => Promise<SceneGraph | null>
  onSave?: (scene: SceneGraph) => Promise<void>
  onDirty?: () => void
  onSaveStatusChange?: (status: SaveStatus) => void
  previewScene?: SceneGraph
  isVersionPreviewMode?: boolean
  isLoading?: boolean
  onThumbnailCapture?: (blob: Blob) => void
  settingsPanelProps?: SettingsPanelProps
  sitePanelProps?: SitePanelProps
  presetsAdapter?: PresetsAdapter
}

function EditorSceneCrashFallback() {
  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-background/95 p-4 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-background p-6 shadow-xl">
        <h2 className="font-semibold text-lg">The editor scene failed to render</h2>
        <button className="mt-4 rounded-md border border-border bg-accent px-3 py-2 font-medium text-sm" onClick={() => window.location.reload()}>Reload editor</button>
      </div>
    </div>
  )
}

export default function Editor({
  appMenuButton, sidebarTop, projectId, onLoad, onSave, onDirty,
  onSaveStatusChange, previewScene, isVersionPreviewMode = false,
  isLoading = false, settingsPanelProps, sitePanelProps, presetsAdapter,
}: EditorProps) {
  
  useKeyboard()
  const [showExportPage, setShowExportPage] = useState(false)
  const { isLoadingSceneRef } = useAutoSave({ onSave, onDirty, onSaveStatusChange, isVersionPreviewMode })
  const [isSceneLoading, setIsSceneLoading] = useState(false)
  
  // 1. FILE SYSTEM STATE
  const [appState, setAppState] = useState<'dashboard' | 'editor'>('dashboard')
  const [pendingScene, setPendingScene] = useState<any>(null)

  useEffect(() => { initializeEditorRuntime() }, [])

  // 2. THE NATIVE LOADER: Only triggers when transitioning from Dashboard to Editor
  useEffect(() => {
    if (appState !== 'editor') return

    let cancelled = false
    async function load() {
      isLoadingSceneRef.current = true
      setIsSceneLoading(true)
      try {
        // If pendingScene is an empty object {}, Pascal clears the board for a fresh start!
        const sceneGraph = pendingScene || { nodes: {} }
        if (!cancelled) applySceneGraphToEditor(sceneGraph)
      } catch (e) {
        console.error("Failed to apply scene graph:", e)
        if (!cancelled) applySceneGraphToEditor(null)
      } finally {
        if (!cancelled) {
          setIsSceneLoading(false)
          requestAnimationFrame(() => { isLoadingSceneRef.current = false })
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [appState, pendingScene, isLoadingSceneRef])

  // 3. THE NATIVE JSON EXPORTER
  const handleDownloadJson = () => {
    // Grab the exact state of the CAD engine
    const currentNodes = useScene.getState().nodes
    const sceneData = { nodes: currentNodes } // Format as a standard Pascal SceneGraph
    
    // Trigger Browser Download
    const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Floorplan_${new Date().getTime()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const showLoader = isLoading || isSceneLoading

  // --- ROUTER: Dashboard View ---
  if (appState === 'dashboard') {
    return (
      <Dashboard 
        onStartNew={() => {
          setPendingScene({ nodes: {} }) // Force Pascal to clear the engine
          setAppState('editor')
        }}
        onOpenJson={(json) => {
          setPendingScene(json) // Pass the uploaded file directly to Pascal
          setAppState('editor')
        }}
      />
    )
  }

  // --- ROUTER: Editor View ---
  return (
    <PresetsProvider adapter={presetsAdapter}>
      <div className="dark flex h-screen w-screen flex-col overflow-hidden bg-neutral-900 text-foreground">
        
        

        {/* MAIN WORKSPACE */}
        <div className="relative flex flex-1 overflow-hidden">
          {showLoader && <div className="fixed inset-0 z-60"><SceneLoader /></div>}

          {!showLoader && (
            <>
              <ActionMenu />
              <PanelManager />
              
              
              
              <SidebarProvider className="absolute z-20">
                <AppSidebar appMenuButton={appMenuButton} settingsPanelProps={settingsPanelProps} sidebarTop={sidebarTop} sitePanelProps={sitePanelProps} />
              </SidebarProvider>
            </>
          )}

          <ErrorBoundary fallback={<EditorSceneCrashFallback />}>
            <main className="relative ml-[60px] flex flex-1 flex-col items-center justify-center bg-[#f5f5f5]">
              <FloorplanPanel />
              <OpeningTool2D /> 
              <SelectionTool2D />
              <MoveOpeningTool2D />
              <ItemTool2D />
              <TextRenderer2D />
            </main>
          </ErrorBoundary>
        </div>

        {showExportPage && <ExportPage onClose={() => setShowExportPage(false)} />}  
      </div>
    </PresetsProvider>
  )
}