import { useState } from 'react'
import { Node } from '@/types'
import { cn } from '@/lib/utils'
import {
  Megaphone,
  LayoutTemplate,
  MessageCircle,
  Mail,
  DollarSign,
  HandHeart,
  CheckCircle,
  FileText,
  Settings,
  Trash2,
  Check,
  Zap,
  MessageSquare,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  CheckSquare,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Checkbox } from '@/components/ui/checkbox'

const icons: Record<string, any> = {
  Ad: Megaphone,
  LandingPage: LayoutTemplate,
  Email: Mail,
  Checkout: DollarSign,
  Upsell: HandHeart,
  Obrigado: CheckCircle,
  Form: FileText,
  Slack: MessageSquare,
  SMS: MessageCircle,
  WATI: MessageCircle,
  ManyChat: MessageCircle,
  WaitUntil: Clock,
  Default: Zap,
}

type NodeItemProps = {
  node: Node
  selected: boolean
  snapToGrid?: boolean
  isPanMode: boolean
  taskProgress: { total: number; completed: number }
  onSelect: () => void
  onMoveStart: () => void
  onMove: (x: number, y: number) => void
  onMoveEnd: (x: number, y: number) => void
  scale: number
  onOpenRightPanel: (tab: string) => void
  onOpenSettings: () => void
  onToggleComplete: () => void
  onDelete: () => void
  onAddChild: () => void
  onTextChange: (text: string) => void
  onEdgeDragStart: (nodeId: string, e: React.PointerEvent) => void
  onDropResource: (type: string, id: string) => void
}

export default function NodeItem({
  node,
  selected,
  snapToGrid,
  isPanMode,
  taskProgress,
  onSelect,
  onMoveStart,
  onMove,
  onMoveEnd,
  scale,
  onOpenRightPanel,
  onOpenSettings,
  onToggleComplete,
  onDelete,
  onAddChild,
  onTextChange,
  onEdgeDragStart,
  onDropResource,
}: NodeItemProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handlePointerDown = (e: React.PointerEvent) => {
    if (
      isPanMode ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('.interactive-icon') ||
      (e.target as HTMLElement).closest('[role="checkbox"]')
    )
      return
    e.stopPropagation()
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
    setIsDragging(true)
    onSelect()
    onMoveStart()
    document.body.style.userSelect = 'none'

    const startX = e.clientX,
      startY = e.clientY
    const initialX = node.x,
      initialY = node.y

    const handlePointerMove = (moveEv: PointerEvent) => {
      let newX = initialX + (moveEv.clientX - startX) / scale
      let newY = initialY + (moveEv.clientY - startY) / scale
      if (snapToGrid) {
        newX = Math.round(newX / 28) * 28
        newY = Math.round(newY / 28) * 28
      }
      onMove(newX, newY)
    }

    const handlePointerUp = (upEv: PointerEvent) => {
      try {
        target.releasePointerCapture(upEv.pointerId)
      } catch (err) {
        /* ignore */
      }
      setIsDragging(false)
      document.body.style.userSelect = ''
      let finalX = initialX + (upEv.clientX - startX) / scale
      let finalY = initialY + (upEv.clientY - startY) / scale
      if (snapToGrid) {
        finalX = Math.round(finalX / 28) * 28
        finalY = Math.round(finalY / 28) * 28
      }
      onMoveEnd(finalX, finalY)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const resType = e.dataTransfer.getData('resourceType')
    const resId = e.dataTransfer.getData('resourceId')
    if (resType && resId) {
      onDropResource(resType, resId)
    }
  }

  if (node.type === 'Text') {
    return (
      <div
        className={cn(
          'absolute top-0 left-0 pointer-events-auto min-w-[150px] max-w-[400px] p-4 bg-yellow-50/90 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-200 text-slate-800 z-10 transition-all group',
          selected && 'ring-2 ring-yellow-400 shadow-md',
          isDragging
            ? 'opacity-90 scale-[1.02] z-50 cursor-grabbing shadow-lg'
            : isPanMode
              ? 'cursor-grab'
              : 'cursor-pointer',
        )}
        style={{ transform: `translate3d(${node.x}px, ${node.y}px, 0)` }}
        onPointerDown={handlePointerDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-node-id={node.id}
      >
        <div
          className="font-medium text-[15px] whitespace-pre-wrap outline-none cursor-text"
          contentEditable
          suppressContentEditableWarning
          onPointerDown={(e) => {
            if (!isPanMode) e.stopPropagation()
          }}
          onBlur={(e) => onTextChange(e.currentTarget.textContent || 'Text')}
        >
          {node.data.name}
        </div>
      </div>
    )
  }

  if (node.type === 'Image') {
    return (
      <div
        className={cn(
          'absolute top-0 left-0 pointer-events-auto w-[300px] rounded-2xl shadow-sm border border-slate-200 bg-white z-10 transition-all overflow-hidden group',
          selected && 'ring-4 ring-primary/20 border-primary/30 shadow-md',
          isDragging
            ? 'opacity-90 scale-[1.02] z-50 cursor-grabbing shadow-lg'
            : isPanMode
              ? 'cursor-grab'
              : 'cursor-pointer',
        )}
        style={{ transform: `translate3d(${node.x}px, ${node.y}px, 0)` }}
        onPointerDown={handlePointerDown}
        onDoubleClick={(e) => {
          if (!isPanMode) {
            e.stopPropagation()
            onOpenRightPanel('assets')
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-node-id={node.id}
      >
        <img
          src={node.data.name}
          alt="Canvas"
          className="w-full h-auto object-cover pointer-events-none select-none"
        />
      </div>
    )
  }

  const Icon = icons[node.type] || icons.Default
  const circumference = 2 * Math.PI * 6
  const progressPercent =
    taskProgress.total > 0 ? taskProgress.completed / taskProgress.total : 0
  const strokeDashoffset = circumference - progressPercent * circumference
  const showTaskIcon = taskProgress.total > 0 || node.data.isTaskMode

  return (
    <div
      className={cn(
        'absolute top-0 left-0 pointer-events-auto w-[260px] rounded-[1.25rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border p-5 z-10 flex flex-col gap-2 group select-none transition-all',
        (selected || isHovered) &&
          'shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-4 ring-slate-50',
        isDragging &&
          'opacity-90 scale-[1.02] z-50 shadow-[0_12px_40px_rgba(0,0,0,0.1)] ring-4 ring-primary/10 border-primary/20',
        node.data.isTaskMode && node.data.isCompleted
          ? 'bg-[#ecfdf5] border-[#bbf7d0]'
          : 'bg-white border-slate-100',
      )}
      style={{
        transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
        transition: isDragging
          ? 'none'
          : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s, opacity 0.2s, background-color 0.3s',
        cursor: isPanMode ? 'grab' : isDragging ? 'grabbing' : 'pointer',
      }}
      onPointerDown={handlePointerDown}
      onDoubleClick={(e) => {
        if (!isPanMode) {
          e.stopPropagation()
          onOpenRightPanel('details')
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onDrop={handleDrop}
      data-node-id={node.id}
    >
      {/* Top Left Icons */}
      <div className="absolute -top-3.5 left-4 flex items-center gap-1.5 z-20">
        {(node.data.linkedDocumentIds?.length ?? 0) > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="interactive-icon w-7 h-7 rounded-full bg-white border border-slate-100 text-blue-500 flex items-center justify-center shadow-sm cursor-pointer hover:scale-110 transition-transform"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenRightPanel('content')
                }}
              >
                <FileText size={13} strokeWidth={2.5} />
              </div>
            </TooltipTrigger>
            <TooltipContent>Ver Documentos</TooltipContent>
          </Tooltip>
        )}
        {(node.data.linkedAssetIds?.length ?? 0) > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="interactive-icon w-7 h-7 rounded-full bg-white border border-slate-100 text-purple-500 flex items-center justify-center shadow-sm cursor-pointer hover:scale-110 transition-transform"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenRightPanel('assets')
                }}
              >
                <ImageIcon size={13} strokeWidth={2.5} />
              </div>
            </TooltipTrigger>
            <TooltipContent>Ver Assets</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Top Right Icons */}
      <div className="absolute -top-3.5 right-4 flex items-center gap-1.5 z-20">
        <div
          className={cn(
            'flex items-center gap-1.5 transition-opacity',
            selected || isHovered
              ? 'opacity-100'
              : 'opacity-0 pointer-events-none',
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenSettings()
                }}
                className="interactive-icon w-7 h-7 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-sm transition-transform hover:scale-110"
              >
                <Settings size={13} strokeWidth={2.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Configurações</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="interactive-icon w-7 h-7 bg-white border border-slate-100 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 shadow-sm transition-transform hover:scale-110"
              >
                <Trash2 size={13} strokeWidth={2.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Excluir</TooltipContent>
          </Tooltip>
        </div>

        {showTaskIcon && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="interactive-icon w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 cursor-pointer hover:scale-110 transition-transform"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenRightPanel('tasks')
                }}
              >
                {taskProgress.total > 0 ? (
                  <svg width="16" height="16" className="transform -rotate-90">
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="transparent"
                      className="text-slate-100"
                    />
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="text-blue-500 transition-all duration-500"
                    />
                  </svg>
                ) : (
                  <CheckSquare
                    size={13}
                    className="text-slate-400"
                    strokeWidth={2.5}
                  />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>Tarefas</TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="flex items-center gap-2 text-slate-500 mb-0.5 mt-0.5">
        <Icon size={15} strokeWidth={2} className="text-slate-400" />
        <span className="text-[13px] font-semibold tracking-wide text-slate-600">
          {node.type}
        </span>
      </div>

      <div className="flex flex-col">
        <div className="flex items-start gap-2.5">
          {node.data.isTaskMode && (
            <div
              className="mt-0.5"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onToggleComplete()
              }}
            >
              <Checkbox
                checked={node.data.isCompleted}
                className={cn(
                  'rounded-[4px] border-slate-300 w-4 h-4 shadow-none',
                  node.data.isCompleted &&
                    'data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500',
                )}
              />
            </div>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <h4
              className={cn(
                'font-bold text-slate-800 text-[15px] truncate leading-tight',
                node.data.isTaskMode &&
                  node.data.isCompleted &&
                  'text-slate-600 line-through decoration-slate-300',
              )}
            >
              {node.data.name}
            </h4>
            <span className="text-[13px] text-slate-400 mt-1 truncate font-medium">
              {node.data.subtitle || '+1 filter'}
            </span>
          </div>
        </div>
      </div>

      {!isPanMode && (
        <div
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair z-20 group/port interactive-icon"
          onPointerDown={(e) => {
            e.stopPropagation()
            onEdgeDragStart(node.id, e)
          }}
        >
          <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-200 group-hover/port:border-purple-500 group-hover/port:scale-125 transition-all shadow-sm" />
        </div>
      )}

      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddChild()
          }}
          className="interactive-icon h-8 px-4 bg-white border border-slate-100 rounded-full shadow-sm flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 hover:border-slate-200 transition-all font-medium text-[12px]"
        >
          <ExternalLink size={12} strokeWidth={2} /> Exit
        </button>
      </div>
    </div>
  )
}
