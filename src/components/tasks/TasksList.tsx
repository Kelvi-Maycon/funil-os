import { Task } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ArrowUpDown } from 'lucide-react'

const statusConfig = {
  'A Fazer': {
    label: 'Todo',
    color: 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200',
  },
  'Em Progresso': {
    label: 'In Progress',
    color: 'bg-amber-100 text-amber-700 border-transparent hover:bg-amber-200',
  },
  'Em Revisão': {
    label: 'In Review',
    color: 'bg-blue-100 text-blue-700 border-transparent hover:bg-blue-200',
  },
  Concluído: {
    label: 'Done',
    color: 'bg-green-100 text-green-700 border-transparent hover:bg-green-200',
  },
}

const priorityConfig = {
  Baixa: {
    label: 'LOW',
    color: 'bg-slate-100 text-slate-700 border-transparent',
  },
  Média: {
    label: 'MEDIUM',
    color: 'bg-indigo-500 text-white border-transparent',
  },
  Alta: { label: 'HIGH', color: 'bg-red-500 text-white border-transparent' },
}

export default function TasksList({
  tasks,
  onRowClick,
}: {
  tasks: Task[]
  onRowClick: (t: Task) => void
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="font-semibold text-foreground">
              Title
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Project
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              <div className="flex items-center gap-2">
                Priority{' '}
                <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
              </div>
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              <div className="flex items-center gap-2">
                Deadline{' '}
                <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
              </div>
            </TableHead>
            <TableHead className="text-right font-semibold text-foreground">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((t) => {
            const sc = statusConfig[t.status]
            const pc = priorityConfig[t.priority]
            return (
              <TableRow
                key={t.id}
                onClick={() => onRowClick(t)}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">{t.title}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="font-normal text-teal-600 border-teal-200 bg-teal-50"
                  >
                    {t.projectId === 'p1'
                      ? 'Backend API'
                      : t.projectId === 'p2'
                        ? 'Marketing'
                        : 'NovaBoard App'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={pc.color}>
                    {pc.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {t.deadline
                    ? format(new Date(t.deadline), 'MMM dd, yyyy')
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className={sc.color}>
                    {sc.label}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
          {tasks.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                No tasks found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
