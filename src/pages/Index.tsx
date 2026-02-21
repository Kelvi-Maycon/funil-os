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
  TrendingUp,
  TrendingDown,
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
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projetos Ativos
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-4xl font-bold text-foreground">
                {activeProjects}
              </div>
              <Badge
                variant="outline"
                className="bg-success-bg text-success-foreground border-none gap-1 py-0.5"
              >
                <TrendingUp size={12} /> 12%
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Funis em Progresso
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-4xl font-bold text-foreground">
                {activeFunnels}
              </div>
              <Badge
                variant="outline"
                className="bg-success-bg text-success-foreground border-none gap-1 py-0.5"
              >
                <TrendingUp size={12} /> 8%
              </Badge>
            </div>
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
            <div className="flex items-end justify-between">
              <div className="text-4xl font-bold text-warning">
                {pendingTasks.length}
              </div>
              <Badge
                variant="outline"
                className="bg-danger-bg text-danger-foreground border-none gap-1 py-0.5"
              >
                <TrendingDown size={12} /> 4%
              </Badge>
            </div>
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
            <div className="flex items-end justify-between">
              <div className="text-4xl font-bold text-success">
                {completedToday}
              </div>
              <Badge
                variant="outline"
                className="bg-success-bg text-success-foreground border-none gap-1 py-0.5"
              >
                <TrendingUp size={12} /> 24%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CheckCircle2 size={18} className="text-primary" /> Insights
              Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {recentInsights.map((i) => (
                <div
                  key={i.id}
                  className="flex flex-col gap-1 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-base text-foreground">
                      {i.title}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-accent text-accent-foreground text-xs font-semibold"
                    >
                      {i.type}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground line-clamp-1">
                    {i.content}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Projetos Recentes
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {projects.slice(0, 3).map((p) => (
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
                  <p className="text-sm text-muted-foreground line-clamp-2">
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
