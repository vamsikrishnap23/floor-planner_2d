'use client'

import { useViewer } from '@pascal-app/viewer'
import { Square, AppWindow, DoorClosed, Type } from 'lucide-react'
import { ActionButton, ActionGroup } from '../controls/action-button'
import useEditor from '../../../store/use-editor'
import { TooltipProvider } from '../primitives/tooltip'
import { useCatalog } from '../../../store/use-catalog'

export const tools = [
  { id: 'wall', value: 'wall', label: 'Wall', icon: <Square className="h-4 w-4" />, tooltip: 'Wall (W)' },
  { id: 'window', value: 'window', label: 'Window', icon: <AppWindow className="h-4 w-4" />, tooltip: 'Window (W)' },
  { id: 'door', value: 'door', label: 'Door', icon: <DoorClosed className="h-4 w-4" />, tooltip: 'Door (D)' },
]

export function StructureTools() {
  const tool = useEditor((state) => state.tool)
  const setTool = useEditor((state) => state.setTool)
  const setMode = useEditor((state) => state.setMode)
  const selectedLevelId = useViewer((state) => state.selection.levelId)
  
  // 1. Import our custom catalog store
  const setActiveItem = useCatalog((state) => state.setActiveItem)
  const activeItem = useCatalog((state) => state.activeItem)

  const handleTextClick = () => {
    // 2. Pass a fake CAD block with an isText flag!
    setActiveItem({
      id: 'text-annotation',
      name: 'Annotation',
      width: 0.5,
      depth: 0.2,
      isText: true // Custom flag
    } as any)
    
    // 3. Trigger the standard item placement engine
    setMode('build')
    setTool('item')
  }

  return (
    <TooltipProvider>
      <ActionGroup>
        {tools.map((t) => (
          <ActionButton
            key={t.id}
            active={tool === t.id ? true : undefined}
            disabled={!selectedLevelId}
            icon={t.icon}
            onClick={() => {
              setActiveItem(null) // Clear text mode if switching to walls
              setMode('build')
              setTool(t.id as any)
            }}
            tooltip={t.tooltip}
          />
        ))}

        {/* 4. The Dedicated Text Button */}
        <ActionButton
          active={tool === 'item' && (activeItem as any)?.isText ? true : undefined}
          disabled={!selectedLevelId}
          icon={<Type className="h-4 w-4" />}
          onClick={handleTextClick}
          tooltip="Annotate (T)"
        />
      </ActionGroup>
    </TooltipProvider>
  )
}