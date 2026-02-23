import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import useProjectStore from '@/stores/useProjectStore'
import useFunnelStore from '@/stores/useFunnelStore'
import useTaskStore from '@/stores/useTaskStore'
import useDocumentStore from '@/stores/useDocumentStore'
import useQuickActionStore from '@/stores/useQuickActionStore'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

import {
  Network,
  FileText,
  CheckSquare,
  Plus,
  Pencil,
  Check,
  X,
} from 'lucide-react'
import { format } from 'date-fns'

import TasksBoard from '@/components/tasks/TasksBoard'
import TaskDetailSheet from '@/components/tasks/TaskDetailSheet'
import CanvasBoard from '@/components/canvas/CanvasBoard'
import { Task, Funnel } from '@/types'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [projects, setProjects] = useProjectStore()
  const [funnels, setFunnels] = useFunnelStore()
  const [tasks, setTasks] = useTaskStore()
  const [docs] = useDocumentStore()
  const [, setAction] = useQuickActionStore()

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')

  const project = projects.find((p) => p.id === id)

  const projectFunnels = useMemo(
    () => funnels.filter((f) => f.projectId === id),
    [funnels, id],
  )
  const projectTasks = useMemo(
    () => tasks.filter((t) => t.projectId === id),
    [tasks, id],
  )
  const projectDocs = useMemo(
    () => docs.filter((d) => d.projectId === id),
    [docs, id],
  )

  if (!project) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Projeto não encontrado
      </div>
    )
  }

  const completedTasks = projectTasks.filter(
    (t) => t.status === 'Concluído',
  ).length
  const totalTasks = projectTasks.length

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)))
  }

  const updateFunnel = (updated: Funnel) => {
    setFunnels(funnels.map((f) => (f.id === updated.id ? updated : f)))
  }

  const startEditName = () => {
    setEditName(project.name)
    setIsEditingName(true)
  }

  const saveName = () => {
    if (editName.trim()) {
      setProjects(projects.map((p) => p.id === id ? { ...p, name: editName.trim() } : p))
    }
    setIsEditingName(false)
  }

  const cancelEditName = () => {
    setIsEditingName(false)
  }

  return (
    <Tabs defaultValue="funnels" className="flex flex-col h-full bg-background overflow-hidden animate-fade-in">
      <div className="flex flex-col gap-6 p-6 md:p-8 bg-card border-b border-border z-10 relative shrink-0">
        <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/projetos" className="text-md">
                      Projetos
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isEditingName ? (
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-7 w-48 text-sm font-semibold"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveName()
                          if (e.key === 'Escape') cancelEditName()
                        }}
                      />
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveName}>
                        <Check size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEditName}>
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <BreadcrumbPage className="font-semibold text-md group cursor-pointer flex items-center gap-1.5" onClick={startEditName}>
                      {project.name}
                      <Pencil size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
            <TabsList className="bg-background gap-2 p-1.5 rounded-full flex flex-wrap justify-start border border-border inline-flex h-auto">
              <TabsTrigger
                value="funnels"
                className="rounded-full px-5 py-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-muted-foreground hover:text-foreground font-medium transition-all text-md"
              >
                <Network size={16} className="mr-2" /> Funnels
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="rounded-full px-5 py-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-muted-foreground hover:text-foreground font-medium transition-all text-md"
              >
                <CheckSquare size={16} className="mr-2" /> Tasks
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="rounded-full px-5 py-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-muted-foreground hover:text-foreground font-medium transition-all text-md"
              >
                <FileText size={16} className="mr-2" /> Documents
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-6 bg-background p-4 rounded-2xl border border-border">
              <div className="flex flex-col px-4 border-r border-border last:border-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Funis
                </span>
                <span className="text-2xl font-bold text-foreground leading-none">
                  {projectFunnels.length}
                </span>
              </div>
              <div className="flex flex-col px-4 border-r border-border last:border-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Tasks
                </span>
                <span className="text-2xl font-bold text-foreground leading-none">
                  {completedTasks}/{totalTasks}
                </span>
              </div>
              <div className="flex flex-col px-4 border-r border-border last:border-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Docs
                </span>
                <span className="text-2xl font-bold text-foreground leading-none">
                  {projectDocs.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 bg-background relative flex flex-col min-h-0">
        <TabsContent
          value="funnels"
          className="flex-1 m-0 data-[state=active]:flex flex-col border-none outline-none"
        >
          {!selectedFunnelId ? (
            <div className="flex flex-col flex-1 max-w-[1600px] mx-auto w-full">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-2xl font-bold text-foreground">
                  Funis do Projeto
                </h3>
                <Button
                  onClick={() =>
                    setAction({
                      type: 'canvas',
                      mode: 'create',
                      defaultProjectId: id,
                    })
                  }
                >
                  <Plus size={16} className="mr-2" /> Novo Funil
                </Button>
              </div>
              {projectFunnels.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {projectFunnels.map((f) => (
                    <Card
                      key={f.id}
                      className="cursor-pointer hover:shadow-md transition-shadow group overflow-hidden flex flex-col"
                      onClick={() => setSelectedFunnelId(f.id)}
                    >
                      <div
                        className="h-36 bg-card border-b border-border relative shrink-0"
                        style={{
                          backgroundImage:
                            'radial-gradient(hsl(var(--border)) 1px, transparent 0)',
                          backgroundSize: '16px 16px',
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-[2px] z-10">
                          <Button
                            variant="dark"
                            className="pointer-events-none"
                          >
                            Abrir Canvas
                          </Button>
                        </div>
                        {f.nodes.length > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-30 scale-75">
                            <Network
                              size={64}
                              className="text-muted-foreground"
                            />
                          </div>
                        )}
                      </div>
                      <CardHeader className="p-6 pb-2">
                        <CardTitle className="line-clamp-1 text-xl">
                          {f.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 pt-2 flex justify-between items-center flex-1">
                        <span className="text-base text-muted-foreground">
                          {f.nodes.length} blocos
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-muted text-muted-foreground border-none font-medium"
                        >
                          {f.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-card p-12 min-h-[400px]">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4 text-primary">
                    <Network size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Nenhum funil encontrado
                  </h3>
                  <p className="text-muted-foreground mt-2 mb-6 text-center max-w-sm text-base">
                    Comece mapeando a jornada do seu cliente. Crie o primeiro
                    funil para este projeto.
                  </p>
                  <Button
                    onClick={() =>
                      setAction({
                        type: 'canvas',
                        mode: 'create',
                        defaultProjectId: id,
                      })
                    }
                  >
                    <Plus size={16} className="mr-2" /> Novo Funil
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 relative rounded-xl border border-border overflow-hidden bg-background shadow-sm flex flex-col min-h-[600px] -mx-2 sm:mx-0 max-w-[1600px] mx-auto w-full">
              <CanvasBoard
                funnel={
                  projectFunnels.find((f) => f.id === selectedFunnelId)!
                }
                onChange={updateFunnel}
                hideHeader
                onBack={() => setSelectedFunnelId(null)}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="tasks"
          className="flex-1 m-0 data-[state=active]:flex flex-col border-none outline-none"
        >
          <div className="flex flex-col flex-1 max-w-[1600px] mx-auto w-full">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="text-2xl font-bold text-foreground">Tarefas</h3>
              <Button
                onClick={() =>
                  setAction({
                    type: 'task',
                    mode: 'create',
                    defaultProjectId: id,
                  })
                }
              >
                <Plus size={16} className="mr-2" /> Nova Tarefa
              </Button>
            </div>
            {projectTasks.length > 0 ? (
              <div className="flex-1 overflow-hidden min-h-[500px] -mx-4 px-4 sm:mx-0 sm:px-0">
                <TasksBoard
                  tasks={projectTasks}
                  updateTask={updateTask}
                  onCardClick={setSelectedTask}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-card p-12 min-h-[400px]">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4 text-primary">
                  <CheckSquare size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Nenhuma tarefa
                </h3>
                <p className="text-muted-foreground mt-2 mb-6 text-center max-w-sm text-base">
                  Organize as entregas do projeto criando tarefas para sua
                  equipe.
                </p>
                <Button
                  onClick={() =>
                    setAction({
                      type: 'task',
                      mode: 'create',
                      defaultProjectId: id,
                    })
                  }
                >
                  <Plus size={16} className="mr-2" /> Nova Tarefa
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="documents"
          className="flex-1 m-0 data-[state=active]:flex flex-col border-none outline-none"
        >
          <div className="flex flex-col flex-1 max-w-[1600px] mx-auto w-full">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="text-2xl font-bold text-foreground">
                Documentos
              </h3>
              <Button
                onClick={() =>
                  setAction({
                    type: 'document',
                    mode: 'create',
                    defaultProjectId: id,
                  })
                }
              >
                <Plus size={16} className="mr-2" /> Novo Documento
              </Button>
            </div>
            {projectDocs.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projectDocs.map((d) => (
                  <Card
                    key={d.id}
                    className="cursor-pointer hover:shadow-md transition-shadow group flex flex-col"
                    onClick={() => navigate('/documentos')}
                  >
                    <CardHeader className="p-6 pb-4 flex flex-row items-start justify-between space-y-0 shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-info-bg flex items-center justify-center text-info mb-2 group-hover:scale-105 transition-transform">
                        <FileText size={24} />
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">
                        {format(new Date(d.updatedAt), 'dd/MM/yyyy')}
                      </span>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 flex-1 flex flex-col">
                      <CardTitle className="text-xl line-clamp-1 mb-2">
                        {d.title}
                      </CardTitle>
                      <p className="text-base text-muted-foreground line-clamp-2">
                        {d.content.replace(/<[^>]*>?/gm, '') ||
                          'Documento vazio'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-card p-12 min-h-[400px]">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4 text-primary">
                  <FileText size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Nenhum documento
                </h3>
                <p className="text-muted-foreground mt-2 mb-6 text-center max-w-sm text-base">
                  Crie briefings, roteiros e textos centralizados neste
                  projeto.
                </p>
                <Button
                  onClick={() =>
                    setAction({
                      type: 'document',
                      mode: 'create',
                      defaultProjectId: id,
                    })
                  }
                >
                  <Plus size={16} className="mr-2" /> Novo Documento
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </div>

      <TaskDetailSheet
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={updateTask}
      />
    </Tabs>
  )
}
