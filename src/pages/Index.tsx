import { Link } from 'react-router-dom'
import useProjectStore from '@/stores/useProjectStore'
import useTaskStore from '@/stores/useTaskStore'
import useFunnelStore from '@/stores/useFunnelStore'
import useInsightStore from '@/stores/useInsightStore'
import useQuickActionStore from '@/stores/useQuickActionStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CheckCircle2,
  Clock,
  Target,
  CheckSquare,
  Layers,
  Plus,
} from 'lucide-react'

export default function Index() {
  const [projects] = useProjectStore()
  const [tasks] = useTaskStore()
  const [funnels] = useFunnelStore()
  const [insights] = useInsightStore()
  const [, setAction] = useQuickActionStore()

  const activeProjects = projects.filter((p) => p.status === 'Ativo').length
  const pendingTasks = tasks.filter((t) => t.status !== 'Concluído')
  const completedToday = tasks.filter((t) => t.status === 'Concluído').length
  const activeFunnels = funnels.filter(
    (f) => f.status === 'Ativo' || f.status === 'Em Progresso',
  ).length
  const recentInsights = insights.slice(0, 3)

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Bom dia, João</h1>
          <p className="text-muted-foreground capitalize">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="rounded-xl shadow-md hover:shadow-lg transition-all">
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
            <DropdownMenuItem
              onClick={() => setAction({ type: 'asset', mode: 'create' })}
            >
              Novo Asset
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setAction({ type: 'insight', mode: 'create' })}
            >
              Novo Insight
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setAction({ type: 'swipe', mode: 'create' })}
            >
              Nova Inspiração
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projetos Ativos
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Funis em Progresso
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFunnels}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasks Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingTasks.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasks Concluídas
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedToday}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={18} className="text-primary" /> Próximas Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {pendingTasks.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm">{t.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(t.deadline), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      t.priority === 'Alta' ? 'text-red-600 border-red-200' : ''
                    }
                  >
                    {t.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-primary" /> Insights
              Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {recentInsights.map((i) => (
                <div
                  key={i.id}
                  className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm text-foreground">
                      {i.title}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {i.type}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {i.content}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Projetos Recentes
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {projects.slice(0, 3).map((p) => (
            <Link to={`/projetos/${p.id}`} key={p.id}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full group border-muted">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {p.name}
                    </CardTitle>
                    <Badge
                      variant={p.status === 'Ativo' ? 'default' : 'secondary'}
                      className={
                        p.status === 'Ativo'
                          ? 'bg-green-500 hover:bg-green-600'
                          : ''
                      }
                    >
                      {p.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {p.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
