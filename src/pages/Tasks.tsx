import { useState } from 'react'
import useTaskStore from '@/stores/useTaskStore'
import useQuickActionStore from '@/stores/useQuickActionStore'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, LayoutGrid, LayoutList, List } from 'lucide-react'
import TasksBoard from '@/components/tasks/TasksBoard'
import TasksOverview from '@/components/tasks/TasksOverview'
import TasksList from '@/components/tasks/TasksList'
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
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Tarefas
        </h1>
        <div className="flex items-center gap-3">
          <Button onClick={() => setAction({ type: 'task', mode: 'create' })}>
            <Plus size={16} className="mr-2" /> Nova Tarefa
          </Button>
        </div>
      </div>

      <Tabs defaultValue="board" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-card gap-2 p-1.5 rounded-full flex flex-wrap shrink-0 justify-start border border-border inline-flex h-auto w-fit mb-6">
          <TabsTrigger
            value="overview"
            className="rounded-full px-5 py-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-muted-foreground hover:text-foreground font-medium transition-all text-md"
          >
            <LayoutList className="w-4 h-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger
            value="board"
            className="rounded-full px-5 py-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-muted-foreground hover:text-foreground font-medium transition-all text-md"
          >
            <LayoutGrid className="w-4 h-4 mr-2" /> Quadro
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="rounded-full px-5 py-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-muted-foreground hover:text-foreground font-medium transition-all text-md"
          >
            <List className="w-4 h-4 mr-2" /> Lista
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
          <TabsContent
            value="list"
            className="mt-0 h-full border-none outline-none"
          >
            <TasksList tasks={tasks} onRowClick={setSelectedTask} />
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
