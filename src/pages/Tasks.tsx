import { useState } from 'react'
import useTaskStore from '@/stores/useTaskStore'
import useQuickActionStore from '@/stores/useQuickActionStore'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, LayoutGrid, LayoutList } from 'lucide-react'
import TasksBoard from '@/components/tasks/TasksBoard'
import TasksOverview from '@/components/tasks/TasksOverview'
import TaskDetailSheet from '@/components/tasks/TaskDetailSheet'
import { Task } from '@/types'

export default function Tasks() {
  const [tasks, setTasks] = useTaskStore()
  const [, setAction] = useQuickActionStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)))
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-full flex flex-col animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setAction({ type: 'task', mode: 'create' })}>
            <Plus size={16} className="mr-2" /> Nova Tarefa
          </Button>
        </div>
      </div>

      <Tabs defaultValue="board" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-transparent gap-2 h-auto p-0 mb-6 flex-wrap shrink-0 justify-start">
          <TabsTrigger
            value="overview"
            className="rounded-full px-5 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200 transition-all"
          >
            <LayoutList className="w-4 h-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger
            value="board"
            className="rounded-full px-5 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200 transition-all"
          >
            <LayoutGrid className="w-4 h-4 mr-2" /> Quadro
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto -mx-4 px-4 pb-8">
          <TabsContent
            value="overview"
            className="mt-0 h-full border-none outline-none"
          >
            <TasksOverview tasks={tasks} />
          </TabsContent>
          <TabsContent
            value="board"
            className="mt-0 h-full border-none outline-none"
          >
            <TasksBoard
              tasks={tasks}
              updateTask={updateTask}
              onCardClick={setSelectedTask}
            />
          </TabsContent>
        </div>
      </Tabs>

      <TaskDetailSheet
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={updateTask}
      />
    </div>
  )
}
