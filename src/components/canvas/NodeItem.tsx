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
} from 'lucide-react'

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
  onSelect: () => void
  onMoveStart: () => void
  onMove: (x: number, y: number) => void
  onMoveEnd: (x: number, y: number) => void
  scale: number
  onOpenNotes: () => void
  onOpenSettings: () => void
  onToggleComplete: () => void
  onDelete: () => void
  onAddChild: () => void
  onTextChange: (text: string) => void
  onEdgeDragStart: (nodeId: string, e: React.PointerEvent) => void
}

export default function NodeItem({
  node,
  selected,
  snapToGrid,
  isPanMode,
  onSelect,
  onMoveStart,
  onMove,
  onMoveEnd,
  scale,
  onOpenNotes,
  onOpenSettings,
  onToggleComplete,
  onDelete,
  onAddChild,
  onTextChange,
  onEdgeDragStart,
}: NodeItemProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPanMode || (e.target as HTMLElement).closest('button')) return
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
        <div
          className={cn(
            'absolute -top-3 -right-3 flex items-center gap-1.5 transition-opacity',
            selected || isHovered ? 'opacity-100' : 'opacity-0',
          )}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="w-7 h-7 bg-white border border-slate-100 rounded-full flex items-center justify-center text-red-500 hover:text-red-600 shadow-sm"
          >
            <Trash2 size={12} />
          </button>
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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-node-id={node.id}
      >
        <img
          src={node.data.name}
          alt="Canvas"
          className="w-full h-auto object-cover pointer-events-none select-none"
        />
        <div
          className={cn(
            'absolute top-3 right-3 flex items-center gap-1.5 transition-opacity',
            selected || isHovered ? 'opacity-100' : 'opacity-0',
          )}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-white shadow-sm"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    )
  }

  const Icon = icons[node.type] || icons.Default

  return (
    <div
      className={cn(
        'absolute top-0 left-0 pointer-events-auto w-[260px] bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 p-5 z-10 flex flex-col gap-2 group select-none transition-all',
        (selected || isHovered) &&
          'shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-slate-200 ring-4 ring-slate-50',
        isDragging &&
          'opacity-90 scale-[1.02] z-50 shadow-[0_12px_40px_rgba(0,0,0,0.1)] ring-4 ring-primary/10 border-primary/20',
      )}
      style={{
        transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
        transition: isDragging
          ? 'none'
          : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s, opacity 0.2s',
        cursor: isPanMode ? 'grab' : isDragging ? 'grabbing' : 'pointer',
      }}
      onPointerDown={handlePointerDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-node-id={node.id}
    >
      <div className="flex items-center gap-2 text-slate-500 mb-1">
        <Icon size={16} strokeWidth={1.5} />
        <span className="text-[13px] font-medium tracking-wide">
          {node.type}
        </span>
      </div>
      <div className="flex flex-col">
        <h4 className="font-semibold text-slate-800 text-[15px] truncate">
          {node.data.name}
        </h4>
        <span className="text-[13px] text-slate-400 mt-0.5 truncate">
          {node.data.subtitle || '+1 filter'}
        </span>
      </div>

      <div
        className={cn(
          'absolute -top-3 -right-3 flex items-center gap-1.5 transition-opacity',
          selected || isHovered
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none',
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOpenSettings()
          }}
          className="w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 shadow-sm transition-transform hover:scale-105"
        >
          <Settings size={14} strokeWidth={2} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOpenNotes()
          }}
          className="w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 shadow-sm transition-transform hover:scale-105"
        >
          <FileText size={14} strokeWidth={2} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center text-red-500 hover:text-red-600 shadow-sm transition-transform hover:scale-105"
        >
          <Trash2 size={14} strokeWidth={2} />
        </button>
      </div>

      {node.data.isTaskMode && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete()
          }}
          className={cn(
            'absolute -bottom-3 left-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors z-20 shadow-sm bg-white',
            node.data.isCompleted
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-slate-200 hover:border-slate-300 text-transparent',
          )}
        >
          <Check
            size={12}
            strokeWidth={3}
            className={cn(
              'transition-opacity',
              node.data.isCompleted ? 'opacity-100' : 'opacity-0',
            )}
          />
        </button>
      )}

      {!isPanMode && (
        <div
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair z-20 group/port"
          onPointerDown={(e) => {
            e.stopPropagation()
            onEdgeDragStart(node.id, e)
          }}
        >
          <div className="w-3 h-3 rounded-full bg-white border-[3px] border-slate-300 group-hover/port:border-purple-500 group-hover/port:scale-125 transition-all shadow-sm" />
        </div>
      )}

      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddChild()
          }}
          className="h-8 px-3 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 hover:border-slate-200 transition-all font-medium text-[11px]"
        >
          <ExternalLink size={12} strokeWidth={2} /> Exit
        </button>
      </div>
    </div>
  )
}
