import { Link } from 'react-router-dom'
import useProjectStore from '@/stores/useProjectStore'
import useTaskStore from '@/stores/useTaskStore'
import useFunnelStore from '@/stores/useFunnelStore'
import useDocumentStore from '@/stores/useDocumentStore'
import useQuickActionStore from '@/stores/useQuickActionStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format, isToday, isPast, isThisWeek, isBefore, startOfToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CheckCircle2,
  Clock,
  Target,
  CheckSquare,
  Layers,
  Plus,
  ArrowRight,
  Network,
  FileText,
  AlertCircle,
  CalendarDays,
  CalendarClock,
} from 'lucide-react'
import { useState } from 'react'

export default function Index() {
  const [projects] = useProjectStore()
  const [tasks] = useTaskStore()
  const [funnels] = useFunnelStore()
  const [docs] = useDocumentStore()
  const [, setAction] = useQuickActionStore()

  const [quickTask, setQuickTask] = useState('')

  const activeProjects = projects.filter((p) => p.status === 'Ativo').length
  const pendingTasks = tasks.filter((t) => t.status !== 'Concluído')
  const completedTasks = tasks.filter((t) => t.status === 'Concluído').length
  const activeFunnels = funnels.filter(
    (f) => f.status === 'Ativo',
  ).length

  const today = startOfToday()
  const overdueTasks = pendingTasks.filter((t) => isBefore(new Date(t.deadline), today))
  const todayTasks = pendingTasks.filter((t) => isToday(new Date(t.deadline)))
  const weekTasks = pendingTasks.filter((t) => {
    const d = new Date(t.deadline)
    return isThisWeek(d) && !isToday(d) && !isBefore(d, today)
  })

  const addQuickTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickTask.trim()) return
    setAction({ type: 'task', mode: 'create' })
    setQuickTask('')
  }

  const getProjectStats = (projectId: string) => {
    const pFunnels = funnels.filter((f) => f.projectId === projectId).length
    const pTasks = tasks.filter((t) => t.projectId === projectId).length
    const pDocs = docs.filter((d) => d.projectId === projectId).length
    return { pFunnels, pTasks, pDocs }
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] w-full mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Bom dia, João
          </h1>
          <p className="text-muted-foreground capitalize text-md">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="dark">
              <Plus className="mr-2" size={16} /> Quick Action
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => setAction({ type: 'canvas', mode: 'create' })}
            >
              Novo Canvas
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setAction({ type: 'task', mode: 'create' })}
            >
              Nova Tarefa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setAction({ type: 'document', mode: 'create' })}
            >
              Novo Documento
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projetos Ativos
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">
              {activeProjects}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{projects.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Funis Ativos
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">
              {activeFunnels}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{funnels.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasks Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-warning">
              {pendingTasks.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{tasks.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasks Concluídas
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-success">
              {completedTasks}
            </div>
            {tasks.length > 0 && (
              <div className="mt-2">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${Math.round((completedTasks / tasks.length) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{Math.round((completedTasks / tasks.length) * 100)}% concluído</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plano de Ação */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Plano de Ação</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Atrasadas */}
          <Card className={overdueTasks.length > 0 ? 'border-red-200 bg-red-50/30' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-1.5">
                <AlertCircle size={14} /> Atrasadas
              </CardTitle>
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">{overdueTasks.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {overdueTasks.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-red-100 last:border-0">
                  <span className="text-sm font-medium text-foreground truncate flex-1 mr-2">{t.title}</span>
                  <span className="text-[10px] text-red-500 font-semibold shrink-0">{format(new Date(t.deadline), 'dd/MM')}</span>
                </div>
              ))}
              {overdueTasks.length === 0 && <p className="text-xs text-muted-foreground py-2">Nenhuma tarefa atrasada 🎉</p>}
            </CardContent>
          </Card>

          {/* Hoje */}
          <Card className={todayTasks.length > 0 ? 'border-amber-200 bg-amber-50/30' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-1.5">
                <CalendarDays size={14} /> Hoje
              </CardTitle>
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">{todayTasks.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayTasks.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-amber-100 last:border-0">
                  <span className="text-sm font-medium text-foreground truncate flex-1 mr-2">{t.title}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{t.priority}</Badge>
                </div>
              ))}
              {todayTasks.length === 0 && <p className="text-xs text-muted-foreground py-2">Nenhuma tarefa para hoje</p>}
            </CardContent>
          </Card>

          {/* Esta Semana */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-1.5">
                <CalendarClock size={14} /> Esta Semana
              </CardTitle>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">{weekTasks.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {weekTasks.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm font-medium text-foreground truncate flex-1 mr-2">{t.title}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold shrink-0">{format(new Date(t.deadline), 'dd/MM')}</span>
                </div>
              ))}
              {weekTasks.length === 0 && <p className="text-xs text-muted-foreground py-2">Nenhuma tarefa esta semana</p>}
            </CardContent>
          </Card>
        </div>

        {/* Quick Add */}
        <form onSubmit={addQuickTask} className="flex items-center gap-2">
          <Input
            placeholder="➕ Adicionar task rápida..."
            value={quickTask}
            onChange={(e) => setQuickTask(e.target.value)}
            className="flex-1 bg-card"
          />
          <Button type="submit" variant="dark" size="sm">Criar</Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:max-w-3xl">
        <Card className="flex flex-col bg-secondary text-secondary-foreground relative overflow-hidden border-none shadow-md">
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full border-[12px] border-white opacity-5 pointer-events-none"></div>
          <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full border-[8px] border-white opacity-5 pointer-events-none"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock size={18} className="text-primary" /> Próximas Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 relative z-10">
            <div className="space-y-4">
              {pendingTasks.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-base text-white">
                      {t.title}
                    </span>
                    <span className="text-xs uppercase font-semibold text-white/60">
                      {format(new Date(t.deadline), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      t.priority === 'Alta'
                        ? 'bg-danger-bg text-danger-foreground border-none'
                        : 'bg-white/10 text-white border-none'
                    }
                  >
                    {t.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Projetos Recentes
          </h2>
          <Link to="/projetos" className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {projects.slice(0, 3).map((p) => {
            const stats = getProjectStats(p.id)
            return (
              <Link to={`/projetos/${p.id}`} key={p.id}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full group">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {p.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          p.status === 'Ativo'
                            ? 'bg-success-bg text-success-foreground border-none'
                            : 'bg-muted text-muted-foreground border-none'
                        }
                      >
                        {p.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {p.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Network size={12} /> {stats.pFunnels} funis
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckSquare size={12} /> {stats.pTasks} tasks
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={12} /> {stats.pDocs} docs
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
