import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Folder as FolderIcon, Network, MoreVertical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Funnel, FunnelFolder } from '@/types'
import useProjectStore from '@/stores/useProjectStore'

interface Props {
  folders: FunnelFolder[]
  funnels: Funnel[]
  onOpenFolder: (id: string) => void
  onRename: (item: {
    id: string
    type: 'folder' | 'funnel'
    name: string
  }) => void
  onMove: (item: { id: string; type: 'folder' | 'funnel' }) => void
  onDelete: (id: string, type: 'folder' | 'funnel') => void
}

export default function FunnelList({
  folders,
  funnels,
  onOpenFolder,
  onRename,
  onMove,
  onDelete,
}: Props) {
  const [projects] = useProjectStore()
  const navigate = useNavigate()
  const getProjectName = (id?: string | null) =>
    projects.find((p) => p.id === id)?.name || 'Nenhum Projeto'

  if (folders.length === 0 && funnels.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg bg-card">
        Esta pasta está vazia
      </div>
    )
  }

  const ActionMenu = ({
    item,
    type,
  }: {
    item: Funnel | FunnelFolder
    type: 'folder' | 'funnel'
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onRename({ id: item.id, type, name: item.name })
          }}
        >
          {type === 'folder' ? 'Renomear' : 'Editar'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onMove({ id: item.id, type })
          }}
        >
          Mover
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item.id, type)
          }}
        >
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="rounded-md border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Projeto</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {folders.map((f) => (
            <TableRow
              key={f.id}
              className="hover:bg-muted/30 cursor-pointer"
              onClick={() => onOpenFolder(f.id)}
            >
              <TableCell className="font-medium flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-100/50 flex items-center justify-center text-blue-600 shrink-0">
                  <FolderIcon size={16} className="fill-current opacity-20" />
                </div>
                {f.name}
              </TableCell>
              <TableCell className="text-muted-foreground">--</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className="bg-blue-100/50 text-blue-700 hover:bg-blue-100/50 border-none"
                >
                  Pasta
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <ActionMenu item={f} type="folder" />
              </TableCell>
            </TableRow>
          ))}
          {funnels.map((f) => (
            <TableRow
              key={f.id}
              className="hover:bg-muted/30 cursor-pointer"
              onClick={() => navigate(`/canvas/${f.id}`)}
            >
              <TableCell className="font-medium flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-purple-100/50 flex items-center justify-center text-purple-600 shrink-0">
                  <Network size={16} />
                </div>
                {f.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {getProjectName(f.projectId)}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{f.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <ActionMenu item={f} type="funnel" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
