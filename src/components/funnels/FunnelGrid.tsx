import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function FunnelGrid({
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
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {folders.map((f) => (
        <Card
          key={f.id}
          className="relative hover:border-primary/50 cursor-pointer transition-colors"
          onClick={() => onOpenFolder(f.id)}
        >
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600 shrink-0">
              <FolderIcon size={20} className="fill-current opacity-20" />
            </div>
            <CardTitle className="text-base font-medium truncate flex-1 pr-6">
              {f.name}
            </CardTitle>
          </CardHeader>
          <div className="absolute top-3 right-2 z-20">
            <ActionMenu item={f} type="folder" />
          </div>
        </Card>
      ))}
      {funnels.map((f) => (
        <Card
          key={f.id}
          className="relative hover:border-primary/50 transition-colors flex flex-col cursor-pointer"
          onClick={() => navigate(`/canvas/${f.id}`)}
        >
          <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4 pb-2 z-10">
            <div className="w-10 h-10 rounded-lg bg-purple-100/50 flex items-center justify-center text-purple-600 shrink-0">
              <Network size={20} />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden pr-6">
              <CardTitle className="text-base font-medium truncate">
                {f.name}
              </CardTitle>
              <span className="text-xs text-muted-foreground truncate">
                {getProjectName(f.projectId)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2 z-10 flex justify-between items-center mt-auto">
            <Badge variant="outline" className="bg-background">
              {f.status}
            </Badge>
          </CardContent>
          <div className="absolute top-3 right-2 z-20">
            <ActionMenu item={f} type="funnel" />
          </div>
        </Card>
      ))}
    </div>
  )
}
