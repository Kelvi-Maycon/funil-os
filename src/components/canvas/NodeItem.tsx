import { useState, useRef, useEffect } from 'react'
import { Node, Task } from '@/types'
import { cn } from '@/lib/utils'
import useTaskStore from '@/stores/useTaskStore'
import useFunnelStore from '@/stores/useFunnelStore'
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
  Plus,
  X,
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
  activeTool: string
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
  activeTool,
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
  const textRef = useRef<HTMLDivElement>(null)

  const [tasks, setTasks] = useTaskStore()
  const [funnels] = useFunnelStore()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAddingTask, setIsAddingTask] = useState(false)

  const funnel = funnels.find((f) => f.nodes.some((n) => n.id === node.id))
  const linkedTasks = tasks.filter(
    (t) => t.nodeId === node.id || node.data.linkedTaskIds?.includes(t.id),
  )

  const isPanMode = activeTool === 'Pan'

  useEffect(() => {
    if (node.type === 'FloatingText' && node.data.name === 'New Text') {
      if (textRef.current) {
        textRef.current.focus()
        document.execCommand('selectAll', false, null)
      }
    }
  }, [node.type])

  const handleToggleTask = (task: Task) => {
    const newStatus = task.status === 'Concluído' ? 'A Fazer' : 'Concluído'
    setTasks(
      tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
    )
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId))
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      setIsAddingTask(false)
      return
    }

    const newTask: Task = {
      id: `t_${Date.now()}`,
      title: newTaskTitle.trim(),
      projectId: funnel?.projectId || null,
      funnelId: funnel?.id,
      nodeId: node.id,
      priority: 'Média',
      status: 'A Fazer',
      deadline: new Date(Date.now() + 86400000).toISOString(),
    }

    setTasks([...tasks, newTask])
    setNewTaskTitle('')
    setIsAddingTask(false)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement
    if (
      isPanMode ||
      target.closest('button') ||
      target.closest('.interactive-icon') ||
      target.closest('[role="checkbox"]') ||
      target.closest('input')
    )
      return
    e.stopPropagation()
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
      } catch (err) {}
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

  if (node.type === 'FloatingText') {
    return (
      <div
        className={cn(
          'absolute top-0 left-0 pointer-events-auto min-w-[50px] p-2 text-slate-800 z-10 transition-all group outline-none',
          selected && 'ring-2 ring-primary/20 bg-primary/5 rounded-md',
          isDragging
            ? 'opacity-90 scale-[1.02] z-50 cursor-grabbing'
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
          ref={textRef}
          className="font-medium text-[15px] whitespace-pre-wrap outline-none cursor-text min-h-[24px] min-w-[20px]"
          contentEditable
          suppressContentEditableWarning
          onPointerDown={(e) => {
            if (!isPanMode) e.stopPropagation()
          }}
          onBlur={(e) => {
            const val = e.currentTarget.textContent || 'Text'
            onTextChange(val)
          }}
        >
          {node.data.name}
        </div>

        {!isPanMode && (
          <div
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair z-20 group/port interactive-icon opacity-0 group-hover:opacity-100 transition-opacity"
            onPointerDown={(e) => {
              e.stopPropagation()
              onEdgeDragStart(node.id, e)
            }}
          >
            <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-200 group-hover/port:border-purple-500 group-hover/port:scale-125 transition-all shadow-sm" />
          </div>
        )}

        <div
          className={cn(
            'absolute -top-3 -right-3 flex items-center gap-1.5 z-20 transition-opacity',
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
      </div>
    )
  }

  if (['Square', 'Diamond', 'Circle'].includes(node.type)) {
    return (
      <div
        className={cn(
          'absolute top-0 left-0 pointer-events-auto w-[120px] h-[120px] flex items-center justify-center bg-white border-2 border-slate-200 z-10 transition-all group text-slate-700',
          selected && 'border-purple-400 ring-4 ring-purple-100 shadow-md',
          isDragging
            ? 'opacity-90 scale-[1.02] z-50 cursor-grabbing shadow-lg'
            : isPanMode
              ? 'cursor-grab'
              : 'cursor-pointer',
          node.type === 'Circle' && 'rounded-full',
          node.type === 'Square' && 'rounded-2xl',
        )}
        style={{
          transform: `translate3d(${node.x}px, ${node.y}px, 0) ${node.type === 'Diamond' ? 'rotate(45deg)' : ''}`,
        }}
        onPointerDown={handlePointerDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-node-id={node.id}
      >
        <div
          className="absolute -top-3 -right-3 flex items-center gap-1.5 z-20"
          style={{
            transform:
              node.type === 'Diamond'
                ? 'rotate(-45deg) translate(8px, -8px)'
                : 'none',
          }}
        >
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
        </div>

        {!isPanMode && (
          <div
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair z-20 group/port interactive-icon opacity-0 group-hover:opacity-100 transition-opacity"
            onPointerDown={(e) => {
              e.stopPropagation()
              onEdgeDragStart(node.id, e)
            }}
          >
            <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-200 group-hover/port:border-purple-500 group-hover/port:scale-125 transition-all shadow-sm" />
          </div>
        )}
      </div>
    )
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

        {!isPanMode && (
          <div
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair z-20 group/port interactive-icon opacity-0 group-hover:opacity-100 transition-opacity"
            onPointerDown={(e) => {
              e.stopPropagation()
              onEdgeDragStart(node.id, e)
            }}
          >
            <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-200 group-hover/port:border-purple-500 group-hover/port:scale-125 transition-all shadow-sm" />
          </div>
        )}
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

      {node.data.isTaskMode && (
        <div className="mt-2 flex flex-col gap-1.5">
          {linkedTasks.length > 0 && (
            <div className="h-px bg-slate-100 w-full my-1 rounded-full" />
          )}

          {linkedTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-2 group/task relative pr-4"
            >
              <Checkbox
                checked={task.status === 'Concluído'}
                onCheckedChange={() => handleToggleTask(task)}
                className="mt-0.5 w-3.5 h-3.5 rounded-[4px] border-slate-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <span
                className={cn(
                  'text-[12px] leading-tight font-medium flex-1 transition-all break-words',
                  task.status === 'Concluído'
                    ? 'text-slate-400 line-through'
                    : 'text-slate-600 group-hover/task:text-slate-800',
                )}
              >
                {task.title}
              </span>
              <button
                className="absolute right-0 top-0 opacity-0 group-hover/task:opacity-100 text-slate-300 hover:text-red-500 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteTask(task.id)
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {isAddingTask ? (
            <div className="flex items-center gap-1.5 mt-1">
              <input
                autoFocus
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTask()
                  }
                  if (e.key === 'Escape') {
                    setIsAddingTask(false)
                    setNewTaskTitle('')
                  }
                }}
                onBlur={() => {
                  if (newTaskTitle.trim()) {
                    handleAddTask()
                  } else {
                    setIsAddingTask(false)
                  }
                }}
                placeholder="Nome da tarefa..."
                className="flex-1 text-[12px] bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all text-slate-700 w-full"
              />
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsAddingTask(true)
              }}
              className="flex items-center gap-1.5 mt-1 text-[12px] font-medium text-slate-400 hover:text-blue-500 transition-colors w-full text-left py-0.5 rounded-sm interactive-icon"
            >
              <Plus size={12} strokeWidth={2.5} />
              Adicionar tarefa
            </button>
          )}
        </div>
      )}

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
