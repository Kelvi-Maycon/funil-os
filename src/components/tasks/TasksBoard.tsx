import { useState } from 'react'
import { Task } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Paperclip, MessageSquare, Plus } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const columnsConfig = [
  { id: 'A Fazer', label: 'To Do', dot: 'bg-pink-500', bg: 'bg-[#fff5f8]' },
  {
    id: 'Em Progresso',
    label: 'In Progress',
    dot: 'bg-amber-500',
    bg: 'bg-[#fffcf0]',
  },
  {
    id: 'Em Revisão',
    label: 'In Review',
    dot: 'bg-blue-500',
    bg: 'bg-[#f4faff]',
  },
  { id: 'Concluído', label: 'Done', dot: 'bg-green-500', bg: 'bg-[#f0fdf4]' },
]

const priorityConfig = {
  Baixa: {
    label: 'Low',
    color: 'bg-slate-100 text-slate-600 border-transparent',
  },
  Média: {
    label: 'Medium',
    color: 'bg-amber-100 text-amber-700 border-transparent',
  },
  Alta: { label: 'High', color: 'bg-red-100 text-red-700 border-transparent' },
}

export default function TasksBoard({
  tasks,
  updateTask,
  onCardClick,
}: {
  tasks: Task[]
  updateTask: (id: string, updates: Partial<Task>) => void
  onCardClick: (t: Task) => void
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('taskId', id)
    e.dataTransfer.effectAllowed = 'move'
    // Defer state update to allow browser to snapshot element with full opacity
    setTimeout(() => setDraggingId(id), 0)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDragOverCol(null)
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('taskId')
    if (id) updateTask(id, { status: status as Task['status'] })
    setDraggingId(null)
    setDragOverCol(null)
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 h-full min-h-[500px] items-start">
      {columnsConfig.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id)
        const isDragOver = dragOverCol === col.id

        return (
          <div
            key={col.id}
            className={cn(
              'w-80 shrink-0 flex flex-col rounded-2xl p-4 transition-all duration-200 relative',
              col.bg,
              isDragOver && 'ring-2 ring-primary/30 shadow-sm bg-opacity-80',
            )}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              if (!isDragOver) setDragOverCol(col.id)
            }}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex justify-between items-center mb-4 px-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                <h3 className="font-bold text-sm text-slate-800">
                  {col.label}
                </h3>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-[100px] pb-4">
              {colTasks.map((t) => {
                const pc = priorityConfig[t.priority]
                const completedSubtasks =
                  t.subtasks?.filter((s) => s.isCompleted).length || 0
                const totalSubtasks = t.subtasks?.length || 0
                const progress =
                  totalSubtasks > 0
                    ? Math.round((completedSubtasks / totalSubtasks) * 100)
                    : 0
                const isDragging = draggingId === t.id

                return (
                  <Card
                    key={t.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, t.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onCardClick(t)}
                    className={cn(
                      'cursor-pointer hover:shadow-md transition-all active:cursor-grabbing border-none shadow-sm rounded-xl bg-card',
                      isDragging
                        ? 'opacity-40 scale-[0.98] shadow-none ring-1 ring-primary/20'
                        : 'opacity-100',
                    )}
                  >
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <Badge
                          variant="outline"
                          className={`font-medium ${pc.color}`}
                        >
                          {pc.label}
                        </Badge>
                        <button className="text-slate-300 hover:text-slate-500">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>

                      <span className="font-bold text-slate-800 text-sm leading-snug">
                        {t.title}
                      </span>

                      <div className="space-y-1.5 mt-2">
                        <div className="flex justify-between text-[11px] font-medium text-slate-400">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress
                          value={progress}
                          className="h-1.5 bg-slate-100"
                        />
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                        <div className="flex -space-x-2">
                          <Avatar className="w-6 h-6 border-2 border-white">
                            <AvatarImage src={t.avatar} />
                            <AvatarFallback className="text-[10px] bg-slate-200 text-slate-600">
                              {t.assignee?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-white flex items-center justify-center text-slate-400 border-dashed">
                            <Plus size={10} />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                          <div className="flex items-center gap-1">
                            <Paperclip size={12} />
                            {t.attachmentCount || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare size={12} />
                            {t.comments?.length || 0}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              {isDragOver &&
                draggingId &&
                !colTasks.find((t) => t.id === draggingId) && (
                  <div className="h-32 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 animate-fade-in transition-all flex items-center justify-center">
                    <span className="text-xs font-medium text-primary/50">
                      Drop task here
                    </span>
                  </div>
                )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
