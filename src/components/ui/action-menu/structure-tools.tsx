'use client'

import { useViewer } from '@pascal-app/viewer'
import { Type } from 'lucide-react'
import { ActionButton, ActionGroup } from '../controls/action-button'
import useEditor from '../../../store/use-editor'
import { TooltipProvider } from '../primitives/tooltip'


export const tools = [
  { id: 'wall', value: 'wall', label: 'Wall', icon: '/icons/wall.png', tooltip: 'Wall (W)' },
  { id: 'window', value: 'window', label: 'Window', icon: '/icons/window.png', tooltip: 'Window (W)' },
  { id: 'door', value: 'door', label: 'Door', icon: '/icons/door.png', tooltip: 'Door (D)' },
  { id: 'text', value: 'text', label: 'Text', icon: <Type className="h-4 w-4" />, tooltip: 'Annotate (T)' },
]

export function StructureTools() {
  const tool = useEditor((state) => state.tool)
  const setTool = useEditor((state) => state.setTool)
  const setMode = useEditor((state) => state.setMode) 
  const selectedLevelId = useViewer((state) => state.selection.levelId)

  return (
    <TooltipProvider>
      <ActionGroup>
        {tools.map((t) => {
          const isImageIcon = typeof t.icon === 'string'
          const icon = isImageIcon ? (
            <img src={t.icon} alt={t.label} className="h-4 w-4" />
          ) : (
            t.icon
          )
          return (
            <ActionButton
              key={t.id}
              active={tool === t.id ? true : undefined} 
              disabled={!selectedLevelId}
              icon={icon}
              onClick={() => {
                setMode('build') 
                setTool(t.id as any)
              }}
              tooltip={t.tooltip}
            />
          )
        })}
      </ActionGroup>
    </TooltipProvider>
  )
}