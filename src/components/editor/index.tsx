'use client'
import { ExportPage } from './export-page'
import { Printer } from 'lucide-react'
import { initSpaceDetectionSync, initSpatialGridSync, useScene } from '@pascal-app/core'
import { type ReactNode, useEffect, useState } from 'react'
import { type PresetsAdapter, PresetsProvider } from '../../contexts/presets-context'
import { type SaveStatus, useAutoSave } from '../../hooks/use-auto-save'
import { useKeyboard } from '../../hooks/use-keyboard'
import {
  applySceneGraphToEditor,
  loadSceneFromLocalStorage,
  type SceneGraph,
} from '../../lib/scene'
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
import { ItemTool2D } from '../tools/item-tool-2d'
import { TextRenderer2D } from './text-renderer-2d'
import { ExportManager } from './export-manager'
import { MoveOpeningTool2D } from '../tools/move-opening-tool-2d'
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
        <button 
          className="mt-4 rounded-md border border-border bg-accent px-3 py-2 font-medium text-sm" 
          onClick={() => window.location.reload()}
          type="button"
        >
          Reload editor
        </button>
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

  useEffect(() => { initializeEditorRuntime() }, [])

  // Load Scene Logic
  useEffect(() => {
    let cancelled = false
    async function load() {
      isLoadingSceneRef.current = true
      setIsSceneLoading(true)
      try {
        const sceneGraph = onLoad ? await onLoad() : loadSceneFromLocalStorage()
        if (!cancelled) applySceneGraphToEditor(sceneGraph)
      } catch {
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
  }, [onLoad, isLoadingSceneRef])

  const showLoader = isLoading || isSceneLoading

  return (
    <PresetsProvider adapter={presetsAdapter}>
      <div className="dark h-full w-full text-foreground bg-neutral-900 flex overflow-hidden">
        {showLoader && <div className="fixed inset-0 z-60"><SceneLoader /></div>}

        {!showLoader && (
          <>
            <ActionMenu />
            <PanelManager />
            <button 
              onClick={() => setShowExportPage(true)}
              className="fixed right-4 top-4 z-40 flex items-center gap-2 rounded-lg border border-border/50 bg-[#2C2C2E] px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#3e3e3e]"
            >
              <Printer className="h-4 w-4" /> Go to Export Page
            </button>
            <SidebarProvider className="fixed z-20">
              <AppSidebar
                appMenuButton={appMenuButton}
                settingsPanelProps={settingsPanelProps}
                sidebarTop={sidebarTop}
                sitePanelProps={sitePanelProps}
              />
            </SidebarProvider>
          </>
        )}

        <ErrorBoundary fallback={<EditorSceneCrashFallback />}>
          {/* THE 2D WORKSPACE PLACEMENT */}
          <main className="flex-1 relative flex flex-col items-center justify-center bg-[#f5f5f5] ml-[60px]">
            <FloorplanPanel />
            
            {/* ADD THE HEADLESS TOOL HERE */}
            <OpeningTool2D /> 
            <SelectionTool2D />
            <MoveOpeningTool2D />
            <ItemTool2D />
            <TextRenderer2D />
          </main>
        </ErrorBoundary>

        {showExportPage && <ExportPage onClose={() => setShowExportPage(false)} />}   
      </div>
    </PresetsProvider>
  )
}