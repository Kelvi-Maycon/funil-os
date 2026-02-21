import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Task, Subtask } from '@/types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Plus,
  Trash2,
  CalendarIcon,
  User,
  AlignLeft,
  CheckSquare,
  MessageSquare,
  Folder,
} from 'lucide-react'
import { format } from 'date-fns'
import useProjectStore from '@/stores/useProjectStore'

export default function TaskDetailSheet({
  task,
  onClose,
  onUpdate,
}: {
  task: Task | null
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Task>) => void
}) {
  const [localTask, setLocalTask] = useState<Task | null>(null)
  const [projects] = useProjectStore()

  useEffect(() => {
    if (task) setLocalTask(task)
  }, [task])

  if (!localTask)
    return (
      <Sheet open={!!task} onOpenChange={() => onClose()}>
        <SheetContent className="w-full sm:max-w-xl p-0">
          <div />
        </SheetContent>
      </Sheet>
    )

  const handleUpdate = (updates: Partial<Task>) => {
    const updated = { ...localTask, ...updates }
    setLocalTask(updated)
    onUpdate(localTask.id, updates)
  }

  const addSubtask = () => {
    const newSt: Subtask = {
      id: Date.now().toString(),
      title: '',
      isCompleted: false,
    }
    handleUpdate({ subtasks: [...(localTask.subtasks || []), newSt] })
  }

  const toggleSubtask = (id: string) => {
    handleUpdate({
      subtasks: localTask.subtasks?.map((st) =>
        st.id === id ? { ...st, isCompleted: !st.isCompleted } : st,
      ),
    })
  }

  const updateSubtaskTitle = (id: string, title: string) => {
    handleUpdate({
      subtasks: localTask.subtasks?.map((st) =>
        st.id === id ? { ...st, title } : st,
      ),
    })
  }

  const removeSubtask = (id: string) => {
    handleUpdate({
      subtasks: localTask.subtasks?.filter((st) => st.id !== id),
    })
  }

  return (
    <Sheet open={!!task} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col gap-0 border-l">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="sr-only">Task Details</SheetTitle>
          <Input
            value={localTask.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            className="text-xl font-bold border-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none -ml-2"
          />
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <User size={14} /> Assignee
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={localTask.avatar} />
                  <AvatarFallback>
                    {localTask.assignee?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Input
                  value={localTask.assignee || ''}
                  onChange={(e) => handleUpdate({ assignee: e.target.value })}
                  placeholder="Assign someone"
                  className="h-8 border-transparent px-1 focus-visible:ring-1"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <CalendarIcon size={14} /> Deadline
              </label>
              <Input
                type="date"
                value={
                  localTask.deadline
                    ? format(new Date(localTask.deadline), 'yyyy-MM-dd')
                    : ''
                }
                onChange={(e) =>
                  handleUpdate({
                    deadline: new Date(e.target.value).toISOString(),
                  })
                }
                className="h-8 border-transparent px-1 focus-visible:ring-1"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <Select
                value={localTask.status}
                onValueChange={(val: any) => handleUpdate({ status: val })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A Fazer">To Do</SelectItem>
                  <SelectItem value="Em Progresso">In Progress</SelectItem>
                  <SelectItem value="Em Revisão">In Review</SelectItem>
                  <SelectItem value="Concluído">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Priority
              </label>
              <Select
                value={localTask.priority}
                onValueChange={(val: any) => handleUpdate({ priority: val })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Low</SelectItem>
                  <SelectItem value="Média">Medium</SelectItem>
                  <SelectItem value="Alta">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 col-span-2 mt-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Folder size={14} /> Project
              </label>
              <Select
                value={localTask.projectId || 'none'}
                onValueChange={(val: any) =>
                  handleUpdate({ projectId: val === 'none' ? null : val })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Assign to Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Draft)</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <AlignLeft size={16} /> Description
            </h4>
            <Textarea
              value={localTask.description || ''}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              placeholder="Add a more detailed description..."
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <CheckSquare size={16} /> Subtasks
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={addSubtask}
                className="h-8 text-muted-foreground"
              >
                <Plus size={14} className="mr-1" /> Add
              </Button>
            </div>

            <div className="space-y-2">
              {localTask.subtasks?.map((st) => (
                <div key={st.id} className="flex items-start gap-3 group">
                  <Checkbox
                    checked={st.isCompleted}
                    onCheckedChange={() => toggleSubtask(st.id)}
                    className="mt-1.5"
                  />
                  <Input
                    value={st.title}
                    onChange={(e) => updateSubtaskTitle(st.id, e.target.value)}
                    placeholder="Subtask title"
                    className={`h-8 border-transparent focus-visible:ring-1 ${st.isCompleted ? 'line-through text-muted-foreground' : ''}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 shrink-0 text-destructive"
                    onClick={() => removeSubtask(st.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              {(!localTask.subtasks || localTask.subtasks.length === 0) && (
                <div className="text-sm text-muted-foreground italic">
                  No subtasks added yet.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare size={16} /> Activity
            </h4>
            <div className="space-y-4">
              {localTask.comments?.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={c.avatar} />
                    <AvatarFallback>{c.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{c.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(c.createdAt), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <div className="text-sm bg-muted/50 p-3 rounded-xl rounded-tl-none">
                      {c.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback>Me</AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Write a comment..."
                  className="min-h-[80px] resize-none pb-12"
                />
                <Button size="sm" className="absolute bottom-2 right-2 h-8">
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
