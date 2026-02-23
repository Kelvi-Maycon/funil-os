import { useState } from 'react'
import useInsightStore from '@/stores/useInsightStore'
import useFolderStore from '@/stores/useFolderStore'
import useQuickActionStore from '@/stores/useQuickActionStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pin,
  Plus,
  Search,
  Folder as FolderIcon,
  Lightbulb,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { generateId } from '@/lib/generateId'
import { format } from 'date-fns'
import {
  ViewToggle,
  FolderBreadcrumbs,
  CreateFolderDialog,
  MoveDialog,
} from '@/components/folders/FolderComponents'

export default function Insights() {
  const [insights, setInsights] = useInsightStore()
  const [allFolders, setFolders] = useFolderStore()
  const [, setAction] = useQuickActionStore()
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const { toast } = useToast()

  const moduleFolders = allFolders.filter((f) => f.module === 'insight')

  const currentFolders = moduleFolders.filter((f) => {
    if (search) return f.name.toLowerCase().includes(search.toLowerCase())
    return f.parentId === currentFolderId
  })

  const filteredInsights = insights
    .filter((i) => {
      if (search)
        return (
          i.title.toLowerCase().includes(search.toLowerCase()) ||
          i.content.toLowerCase().includes(search.toLowerCase())
        )
      return (i.folderId || null) === currentFolderId
    })
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))

  const handleCreateFolder = (name: string) => {
    setFolders([
      ...allFolders,
      {
        id: generateId('f'),
        module: 'insight',
        name,
        parentId: currentFolderId,
        createdAt: new Date().toISOString(),
      },
    ])
    toast({ title: 'Pasta criada com sucesso!' })
  }

  const updateInsightFolder = (id: string, folderId: string | null) => {
    setInsights(insights.map((i) => (i.id === id ? { ...i, folderId } : i)))
    toast({ title: 'Insight movido com sucesso!' })
  }

  const togglePin = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setInsights(
      insights.map((i) => (i.id === id ? { ...i, isPinned: !i.isPinned } : i)),
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] w-full mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Insights
          </h1>
          <FolderBreadcrumbs
            currentFolderId={currentFolderId}
            folders={moduleFolders}
            onNavigate={setCurrentFolderId}
            rootName="Insights"
          />
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onChange={setView} />
          <CreateFolderDialog onConfirm={handleCreateFolder} />
          <Button
            onClick={() => setAction({ type: 'insight', mode: 'create' })}
          >
            <Plus size={16} className="mr-2" /> Novo Insight
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <Input
          placeholder="Pesquisar insights..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      {currentFolders.length === 0 && filteredInsights.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center bg-card rounded-xl border border-dashed border-border shadow-sm">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
            <Lightbulb size={32} />
          </div>
          <h3 className="text-xl font-bold text-foreground">Vazio</h3>
          <p className="text-base text-muted-foreground mb-6 mt-2">
            Crie um insight ou uma pasta para se organizar.
          </p>
          <Button
            onClick={() => setAction({ type: 'insight', mode: 'create' })}
          >
            <Plus size={16} className="mr-2" /> Novo Insight
          </Button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {currentFolders.map((f) => (
            <Card
              key={f.id}
              onClick={() => setCurrentFolderId(f.id)}
              className="hover:shadow-md transition-all cursor-pointer h-full group flex items-center p-6 gap-4 min-h-[180px]"
            >
              <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center text-primary shrink-0">
                <FolderIcon size={32} className="fill-current opacity-20" />
              </div>
              <span className="font-semibold text-xl group-hover:text-primary transition-colors">
                {f.name}
              </span>
            </Card>
          ))}
          {filteredInsights.map((i) => (
            <Card
              key={i.id}
              className="relative hover:shadow-md transition-shadow group flex flex-col cursor-pointer"
              onClick={() =>
                setAction({ type: 'insight', mode: 'edit', itemId: i.id })
              }
            >
              {i.isPinned && (
                <Pin
                  className="absolute top-6 right-6 text-primary fill-primary z-10 drop-shadow-sm"
                  size={20}
                  onClick={(e) => togglePin(e, i.id)}
                />
              )}
              {!i.isPinned && (
                <Pin
                  className="absolute top-6 right-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  size={20}
                  onClick={(e) => togglePin(e, i.id)}
                />
              )}
              <CardHeader className="pb-2 pr-16 shrink-0">
                <div className="flex flex-col gap-3 items-start">
                  <Badge
                    variant="secondary"
                    className="bg-accent text-accent-foreground border-none"
                  >
                    {i.type}
                  </Badge>
                  <CardTitle className="text-xl leading-snug">
                    {i.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pt-2">
                <p className="text-muted-foreground text-base line-clamp-4 leading-relaxed flex-1">
                  {i.content}
                </p>
                <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {format(new Date(i.createdAt), 'dd MMM yyyy')}
                    </span>
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      <MoveDialog
                        folders={moduleFolders}
                        currentFolderId={i.folderId}
                        onMove={(id) => updateInsightFolder(i.id, id)}
                      />
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-muted text-muted-foreground border-none font-medium"
                  >
                    {i.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentFolders.map((f) => (
                <TableRow
                  key={f.id}
                  onClick={() => setCurrentFolderId(f.id)}
                  className="cursor-pointer group text-base"
                >
                  <TableCell className="font-semibold flex items-center gap-3 py-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-accent rounded-lg text-primary">
                      <FolderIcon
                        className="fill-current opacity-20"
                        size={20}
                      />
                    </div>
                    {f.name}
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))}
              {filteredInsights.map((i) => (
                <TableRow
                  key={i.id}
                  className="cursor-pointer text-base"
                  onClick={() =>
                    setAction({ type: 'insight', mode: 'edit', itemId: i.id })
                  }
                >
                  <TableCell className="font-medium py-4">
                    <div className="flex items-center gap-3">
                      {i.title}
                      {i.isPinned && (
                        <Pin className="text-primary fill-primary" size={16} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-accent text-accent-foreground border-none"
                    >
                      {i.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-muted text-muted-foreground border-none font-medium"
                    >
                      {i.status}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <MoveDialog
                      folders={moduleFolders}
                      currentFolderId={i.folderId}
                      onMove={(id) => updateInsightFolder(i.id, id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
