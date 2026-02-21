import { Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { format, isPast, isToday } from 'date-fns'
import {
  CheckCircle2,
  Clock,
  ListTodo,
  AlertCircle,
  Activity,
  MessageSquare,
  Paperclip,
  ArrowRightCircle,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const recentActivities = [
  {
    id: 1,
    user: 'Jane Smith',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=2',
    action: 'commented on',
    target: '',
    task: 'Refactor Auth',
    time: '2 hours ago',
    icon: MessageSquare,
    iconColor: 'text-amber-500',
  },
  {
    id: 2,
    user: 'John Doe',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
    action: 'changed status of',
    target: 'In Progress',
    task: 'Design Home',
    time: '4 hours ago',
    icon: ArrowRightCircle,
    iconColor: 'text-blue-500',
  },
  {
    id: 3,
    user: 'Charlie',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=4',
    action: 'attached 2 files to',
    target: '',
    task: 'Setup CI/CD',
    time: 'Yesterday',
    icon: Paperclip,
    iconColor: 'text-slate-500',
  },
  {
    id: 4,
    user: 'Dave',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=5',
    action: 'changed priority of',
    target: 'High',
    task: 'Fix Navigation Bug',
    time: 'Yesterday',
    icon: AlertCircle,
    iconColor: 'text-red-500',
  },
]

export default function TasksOverview({ tasks }: { tasks: Task[] }) {
  const total = tasks.length
  const inProgress = tasks.filter((t) => t.status === 'Em Progresso').length
  const completed = tasks.filter((t) => t.status === 'Concluído').length
  const overdue = tasks.filter(
    (t) =>
      t.status !== 'Concluído' &&
      isPast(new Date(t.deadline)) &&
      !isToday(new Date(t.deadline)),
  ).length

  const priorityCount = tasks.reduce(
    (acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const priorityData = Object.keys(priorityCount).map((k) => ({
    name: k,
    total: priorityCount[k],
  }))

  const upcomingTasks = tasks
    .filter((t) => t.status !== 'Concluído')
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    )
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/50 border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">
              In Progress
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {inProgress}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{completed}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50 border-red-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-700">
              Overdue
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{overdue}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ChartContainer
              config={{
                total: { label: 'Total', color: 'hsl(var(--primary))' },
              }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={priorityData}
                  margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, index) => {
                      const color =
                        entry.name === 'Alta'
                          ? '#ef4444'
                          : entry.name === 'Média'
                            ? '#6366f1'
                            : '#cbd5e1'
                      return <Cell key={`cell-${index}`} fill={color} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm">{t.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(t.deadline), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      t.priority === 'Alta'
                        ? 'text-red-600 bg-red-50 border-red-200'
                        : t.priority === 'Média'
                          ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
                          : 'text-slate-600 bg-slate-50 border-slate-200'
                    }
                  >
                    {t.priority}
                  </Badge>
                </div>
              ))}
              {upcomingTasks.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No upcoming deadlines
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-muted-foreground" />
              Recent Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6">
              {recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex gap-4">
                    <div className="relative mt-1 shrink-0">
                      <Avatar className="w-8 h-8 ring-2 ring-background">
                        <AvatarImage src={activity.avatar} />
                        <AvatarFallback>{activity.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm">
                        <Icon className={`w-3 h-3 ${activity.iconColor}`} />
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 gap-0.5">
                      <div className="text-sm leading-snug text-slate-600">
                        <span className="font-semibold text-slate-800">
                          {activity.user}
                        </span>{' '}
                        {activity.action}{' '}
                        <span className="font-medium text-slate-800">
                          {activity.task}
                        </span>
                        {activity.target && (
                          <>
                            {' '}
                            to{' '}
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 h-4"
                            >
                              {activity.target}
                            </Badge>
                          </>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
