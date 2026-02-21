import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import useProjectStore from '@/stores/useProjectStore'
import useFunnelStore from '@/stores/useFunnelStore'
import useTaskStore from '@/stores/useTaskStore'
import useDocumentStore from '@/stores/useDocumentStore'
import useAssetStore from '@/stores/useAssetStore'
import useSwipeStore from '@/stores/useSwipeStore'
import useInsightStore from '@/stores/useInsightStore'
import useQuickActionStore from '@/stores/useQuickActionStore'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Image as ImageIcon,
  Plus,
  Bookmark,
  Lightbulb,
} from 'lucide-react'
import { format } from 'date-fns'

import TasksBoard from '@/components/tasks/TasksBoard'
import TaskDetailSheet from '@/components/tasks/TaskDetailSheet'
import CanvasBoard from '@/components/canvas/CanvasBoard'
import { Task, Funnel } from '@/types'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [projects] = useProjectStore()
  const [funnels, setFunnels] = useFunnelStore()
  const [tasks, setTasks] = useTaskStore()
  const [docs] = useDocumentStore()
  const [assets] = useAssetStore()
  const [swipes] = useSwipeStore()
  const [insights] = useInsightStore()
  const [, setAction] = useQuickActionStore()

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null)

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
  const projectAssets = useMemo(
    () => assets.filter((a) => a.projectId === id),
    [assets, id],
  )
  const projectSwipes = useMemo(
    () => swipes.filter((s) => s.projectId === id),
    [swipes, id],
  )
  const projectInsights = useMemo(
    () => insights.filter((i) => i.projectId === id),
    [insights, id],
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

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden animate-fade-in">
      <div className="flex flex-col gap-6 p-6 md:p-8 bg-white border-b border-border z-10 relative shadow-sm shrink-0">
        <div className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/projetos">Projetos</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{project.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setAction({
                  type: 'task',
                  mode: 'create',
                  defaultProjectId: id,
                })
              }
            >
              <CheckSquare size={14} className="mr-1.5" /> Tarefa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setAction({
                  type: 'document',
                  mode: 'create',
                  defaultProjectId: id,
                })
              }
            >
              <FileText size={14} className="mr-1.5" /> Doc
            </Button>
            <Button
              size="sm"
              onClick={() =>
                setAction({
                  type: 'canvas',
                  mode: 'create',
                  defaultProjectId: id,
                })
              }
            >
              <Plus size={14} className="mr-1.5" /> Funil
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {project.name}
              </h1>
              <Badge
                variant={project.status === 'Ativo' ? 'default' : 'secondary'}
                className={
                  project.status === 'Ativo'
                    ? 'bg-green-500 hover:bg-green-600'
                    : ''
                }
              >
                {project.status}
              </Badge>
            </div>
            <p className="text-slate-500 text-sm">{project.description}</p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex flex-col px-4 border-r border-slate-200 last:border-0">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Funis
              </span>
              <span className="text-lg font-bold text-slate-800 leading-none">
                {projectFunnels.length}
              </span>
            </div>
            <div className="flex flex-col px-4 border-r border-slate-200 last:border-0">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Tasks
              </span>
              <span className="text-lg font-bold text-slate-800 leading-none">
                {completedTasks}/{totalTasks}
              </span>
            </div>
            <div className="flex flex-col px-4 border-r border-slate-200 last:border-0">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Docs
              </span>
              <span className="text-lg font-bold text-slate-800 leading-none">
                {projectDocs.length}
              </span>
            </div>
            <div className="flex flex-col px-4 border-r border-slate-200 last:border-0">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Assets
              </span>
              <span className="text-lg font-bold text-slate-800 leading-none">
                {projectAssets.length + projectSwipes.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="funnels" className="flex-1 flex flex-col min-h-0">
        <div className="px-6 md:px-8 bg-white border-b border-border shrink-0 z-0">
          <TabsList className="bg-transparent gap-6 h-auto p-0 flex-wrap justify-start border-none">
            <TabsTrigger
              value="funnels"
              className="rounded-none px-0 py-3.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium"
            >
              <Network size={16} className="mr-2" /> Funnels
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="rounded-none px-0 py-3.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium"
            >
              <CheckSquare size={16} className="mr-2" /> Tasks
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="rounded-none px-0 py-3.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium"
            >
              <FileText size={16} className="mr-2" /> Documents
            </TabsTrigger>
            <TabsTrigger
              value="assets"
              className="rounded-none px-0 py-3.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium"
            >
              <ImageIcon size={16} className="mr-2" /> Assets & Swipe
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="rounded-none px-0 py-3.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium"
            >
              <Lightbulb size={16} className="mr-2" /> Insights
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 bg-[#f8fafc] relative flex flex-col">
          <TabsContent
            value="funnels"
            className="flex-1 m-0 data-[state=active]:flex flex-col border-none outline-none"
          >
            {!selectedFunnelId ? (
              <div className="flex flex-col flex-1 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <h3 className="text-lg font-semibold text-slate-800">
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
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projectFunnels.map((f) => (
                      <Card
                        key={f.id}
                        className="cursor-pointer hover:shadow-md transition-shadow group border-border hover:border-primary/30 overflow-hidden flex flex-col rounded-xl"
                        onClick={() => setSelectedFunnelId(f.id)}
                      >
                        <div
                          className="h-32 bg-slate-50 border-b border-border relative shrink-0"
                          style={{
                            backgroundImage:
                              'radial-gradient(hsl(var(--border)) 1px, transparent 0)',
                            backgroundSize: '16px 16px',
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-[2px] z-10">
                            <Button
                              variant="secondary"
                              className="bg-white shadow-sm hover:bg-slate-50 text-primary rounded-xl pointer-events-none"
                            >
                              Abrir Canvas
                            </Button>
                          </div>
                          {f.nodes.length > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-30 scale-75">
                              <Network size={64} className="text-slate-500" />
                            </div>
                          )}
                        </div>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base font-semibold text-slate-800 line-clamp-1">
                            {f.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex justify-between items-center flex-1">
                          <span className="text-xs text-slate-500">
                            {f.nodes.length} blocos
                          </span>
                          <Badge
                            variant="outline"
                            className="bg-slate-50 text-slate-600 border-slate-200 font-normal"
                          >
                            {f.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-12 min-h-[400px]">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                      <Network size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">
                      Nenhum funil encontrado
                    </h3>
                    <p className="text-slate-500 mt-1 mb-6 text-center max-w-sm">
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
              <div className="flex-1 relative rounded-xl border border-border overflow-hidden bg-[#f8fafc] shadow-sm flex flex-col min-h-[600px] -mx-2 sm:mx-0">
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
            <div className="flex flex-col flex-1 max-w-7xl mx-auto w-full">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-lg font-semibold text-slate-800">
                  Tarefas
                </h3>
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
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-12 min-h-[400px]">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                    <CheckSquare size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">
                    Nenhuma tarefa
                  </h3>
                  <p className="text-slate-500 mt-1 mb-6 text-center max-w-sm">
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
            <div className="flex flex-col flex-1 max-w-7xl mx-auto w-full">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-lg font-semibold text-slate-800">
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {projectDocs.map((d) => (
                    <Card
                      key={d.id}
                      className="cursor-pointer hover:shadow-md transition-shadow group border-border hover:border-primary/40 flex flex-col rounded-xl"
                      onClick={() => navigate('/documentos')}
                    >
                      <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between space-y-0 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-50 mb-2 group-hover:scale-110 transition-transform">
                          <FileText size={20} className="text-blue-500" />
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {format(new Date(d.updatedAt), 'dd/MM/yyyy')}
                        </span>
                      </CardHeader>
                      <CardContent className="p-5 pt-0 flex-1 flex flex-col">
                        <CardTitle className="text-base font-semibold text-slate-800 line-clamp-1 mb-2">
                          {d.title}
                        </CardTitle>
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {d.content.replace(/<[^>]*>?/gm, '') ||
                            'Documento vazio'}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-12 min-h-[400px]">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                    <FileText size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">
                    Nenhum documento
                  </h3>
                  <p className="text-slate-500 mt-1 mb-6 text-center max-w-sm">
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

          <TabsContent
            value="assets"
            className="flex-1 m-0 data-[state=active]:flex flex-col border-none outline-none"
          >
            <div className="flex flex-col flex-1 max-w-7xl mx-auto w-full">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-lg font-semibold text-slate-800">
                  Assets & Swipe
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setAction({
                        type: 'swipe',
                        mode: 'create',
                        defaultProjectId: id,
                      })
                    }
                  >
                    <Bookmark size={16} className="mr-2" /> Salvar Inspiração
                  </Button>
                  <Button
                    onClick={() =>
                      setAction({
                        type: 'asset',
                        mode: 'create',
                        defaultProjectId: id,
                      })
                    }
                  >
                    <Plus size={16} className="mr-2" /> Novo Asset
                  </Button>
                </div>
              </div>
              {projectAssets.length > 0 || projectSwipes.length > 0 ? (
                <div className="space-y-8">
                  {projectAssets.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <ImageIcon size={16} /> Assets do Projeto
                      </h4>
                      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {projectAssets.map((asset) => (
                          <Card
                            key={asset.id}
                            className="overflow-hidden hover:shadow-md transition-all group border-border cursor-pointer rounded-xl"
                            onClick={() =>
                              setAction({
                                type: 'asset',
                                mode: 'edit',
                                itemId: asset.id,
                              })
                            }
                          >
                            <div className="aspect-square bg-slate-100 relative">
                              <img
                                src={asset.url}
                                alt={asset.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="bg-white/90 hover:bg-white text-slate-900 pointer-events-none"
                                >
                                  Editar
                                </Button>
                              </div>
                            </div>
                            <CardContent className="p-3 bg-white border-t border-border">
                              <h3 className="font-medium text-sm truncate text-slate-800">
                                {asset.name}
                              </h3>
                              <div className="flex gap-1 mt-1.5 flex-wrap">
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 font-normal"
                                >
                                  {asset.category}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {projectSwipes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Bookmark size={16} /> Swipe File
                      </h4>
                      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {projectSwipes.map((s) => (
                          <div
                            key={s.id}
                            className="relative group rounded-xl overflow-hidden shadow-sm border border-border bg-card cursor-pointer hover:shadow-md transition-all"
                            onClick={() =>
                              setAction({
                                type: 'swipe',
                                mode: 'edit',
                                itemId: s.id,
                              })
                            }
                          >
                            <img
                              src={s.imageUrl}
                              alt={s.title}
                              className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end pointer-events-none">
                              <h3 className="text-white font-medium text-sm line-clamp-1">
                                {s.title}
                              </h3>
                              <p className="text-white/80 text-xs">
                                {s.category}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-12 min-h-[400px]">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                    <ImageIcon size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">
                    Sem assets ou inspirações
                  </h3>
                  <p className="text-slate-500 mt-1 mb-6 text-center max-w-sm">
                    Faça upload de criativos, referências visuais e assets para
                    usar no projeto.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setAction({
                          type: 'swipe',
                          mode: 'create',
                          defaultProjectId: id,
                        })
                      }
                    >
                      <Bookmark size={16} className="mr-2" /> Salvar Inspiração
                    </Button>
                    <Button
                      onClick={() =>
                        setAction({
                          type: 'asset',
                          mode: 'create',
                          defaultProjectId: id,
                        })
                      }
                    >
                      <Plus size={16} className="mr-2" /> Novo Asset
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="insights"
            className="flex-1 m-0 data-[state=active]:flex flex-col border-none outline-none"
          >
            <div className="flex flex-col flex-1 max-w-7xl mx-auto w-full">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-lg font-semibold text-slate-800">
                  Insights
                </h3>
                <Button
                  onClick={() =>
                    setAction({
                      type: 'insight',
                      mode: 'create',
                      defaultProjectId: id,
                    })
                  }
                >
                  <Plus size={16} className="mr-2" /> Novo Insight
                </Button>
              </div>
              {projectInsights.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {projectInsights.map((i) => (
                    <Card
                      key={i.id}
                      className="relative hover:shadow-md transition-shadow group border-border hover:border-primary/40 flex flex-col cursor-pointer rounded-xl"
                      onClick={() =>
                        setAction({
                          type: 'insight',
                          mode: 'edit',
                          itemId: i.id,
                        })
                      }
                    >
                      <CardHeader className="pb-2 shrink-0">
                        <div className="flex justify-between items-start mb-2">
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary border-none"
                          >
                            {i.type}
                          </Badge>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {format(new Date(i.createdAt), 'dd/MM/yyyy')}
                          </span>
                        </div>
                        <CardTitle className="text-base leading-snug">
                          {i.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed flex-1">
                          {i.content}
                        </p>
                        <div className="mt-4 pt-4 border-t border-border flex justify-end">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-normal text-slate-500"
                          >
                            {i.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-12 min-h-[400px]">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                    <Lightbulb size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">
                    Nenhum insight documentado
                  </h3>
                  <p className="text-slate-500 mt-1 mb-6 text-center max-w-sm">
                    Registre ideias, hipóteses de teste e aprendizados sobre
                    este projeto.
                  </p>
                  <Button
                    onClick={() =>
                      setAction({
                        type: 'insight',
                        mode: 'create',
                        defaultProjectId: id,
                      })
                    }
                  >
                    <Plus size={16} className="mr-2" /> Novo Insight
                  </Button>
                </div>
              )}
            </div>
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
