import { useState } from 'react'
import useSwipeStore from '@/stores/useSwipeStore'
import useFolderStore from '@/stores/useFolderStore'
import useQuickActionStore from '@/stores/useQuickActionStore'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Star,
  Filter,
  Folder as FolderIcon,
  Search,
  Image as ImageIcon,
  Pencil,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  ViewToggle,
  FolderBreadcrumbs,
  CreateFolderDialog,
  MoveDialog,
} from '@/components/folders/FolderComponents'

export default function SwipeFile() {
  const [swipes, setSwipes] = useSwipeStore()
  const [allFolders, setFolders] = useFolderStore()
  const [, setAction] = useQuickActionStore()
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const { toast } = useToast()

  const moduleFolders = allFolders.filter((f) => f.module === 'swipe')

  const currentFolders = moduleFolders.filter((f) => {
    if (search) return f.name.toLowerCase().includes(search.toLowerCase())
    return f.parentId === currentFolderId
  })

  const filteredSwipes = swipes.filter((s) => {
    if (search) return s.title.toLowerCase().includes(search.toLowerCase())
    return (s.folderId || null) === currentFolderId
  })

  const handleCreateFolder = (name: string) => {
    setFolders([
      ...allFolders,
      {
        id: `f_${Date.now()}`,
        module: 'swipe',
        name,
        parentId: currentFolderId,
        createdAt: new Date().toISOString(),
      },
    ])
    toast({ title: 'Pasta criada com sucesso!' })
  }

  const updateSwipeFolder = (id: string, folderId: string | null) => {
    setSwipes(swipes.map((s) => (s.id === id ? { ...s, folderId } : s)))
    toast({ title: 'Inspiração movida com sucesso!' })
  }

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setSwipes(
      swipes.map((s) =>
        s.id === id ? { ...s, isFavorite: !s.isFavorite } : s,
      ),
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Swipe File
          </h1>
          <FolderBreadcrumbs
            currentFolderId={currentFolderId}
            folders={moduleFolders}
            onNavigate={setCurrentFolderId}
            rootName="Swipe File"
          />
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onChange={setView} />
          <CreateFolderDialog onConfirm={handleCreateFolder} />
          <Button variant="outline">
            <Filter size={16} className="mr-2" /> Filtrar
          </Button>
          <Button onClick={() => setAction({ type: 'swipe', mode: 'create' })}>
            Salvar Inspiração
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <Input
          className="pl-10 bg-card"
          placeholder="Buscar inspirações..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {currentFolders.length === 0 && filteredSwipes.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center bg-card rounded-xl border border-dashed border-border shadow-sm">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
            <ImageIcon size={32} />
          </div>
          <h3 className="text-xl font-bold text-foreground">Vazio</h3>
          <p className="text-base text-muted-foreground mb-6 mt-2">
            Adicione uma inspiração ou crie uma pasta.
          </p>
          <Button onClick={() => setAction({ type: 'swipe', mode: 'create' })}>
            Salvar Inspiração
          </Button>
        </div>
      ) : view === 'grid' ? (
        <>
          {currentFolders.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {currentFolders.map((f) => (
                <Card
                  key={f.id}
                  onClick={() => setCurrentFolderId(f.id)}
                  className="hover:shadow-md transition-all cursor-pointer group flex items-center p-6 gap-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-primary shrink-0">
                    <FolderIcon size={24} className="fill-current opacity-20" />
                  </div>
                  <span className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {f.name}
                  </span>
                </Card>
              ))}
            </div>
          )}
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {filteredSwipes.map((s) => (
              <div
                key={s.id}
                className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-sm border border-border bg-card cursor-pointer"
                onClick={() =>
                  setAction({ type: 'swipe', mode: 'edit', itemId: s.id })
                }
              >
                <div
                  className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-secondary/80 backdrop-blur-sm rounded-lg p-1"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  <MoveDialog
                    folders={moduleFolders}
                    currentFolderId={s.folderId}
                    onMove={(id) => updateSwipeFolder(s.id, id)}
                  />
                </div>
                <Star
                  className={`absolute top-4 right-4 drop-shadow-md z-10 transition-opacity ${s.isFavorite ? 'text-warning fill-warning' : 'text-white/60 opacity-0 group-hover:opacity-100'}`}
                  size={24}
                  onClick={(e) => toggleFavorite(e, s.id)}
                />
                <img
                  src={s.imageUrl}
                  alt={s.title}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end pointer-events-none">
                  <h3 className="text-white font-semibold text-xl line-clamp-2 mb-2">
                    {s.title}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="w-fit bg-white/20 text-white border-none backdrop-blur-sm"
                  >
                    {s.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
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
                  <TableCell className="w-20">
                    <div className="w-12 h-12 flex items-center justify-center bg-accent rounded-lg text-primary">
                      <FolderIcon
                        className="fill-current opacity-20"
                        size={24}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{f.name}</TableCell>
                  <TableCell className="text-muted-foreground">-</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))}
              {filteredSwipes.map((s) => (
                <TableRow
                  key={s.id}
                  className="cursor-pointer text-base"
                  onClick={() =>
                    setAction({ type: 'swipe', mode: 'edit', itemId: s.id })
                  }
                >
                  <TableCell className="w-20">
                    <img
                      src={s.imageUrl}
                      alt={s.title}
                      className="w-12 h-12 object-cover rounded-lg border border-border"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3 py-2">
                      {s.title}{' '}
                      <Star
                        className={`transition-colors cursor-pointer ${s.isFavorite ? 'text-warning fill-warning' : 'text-muted-foreground hover:text-foreground'}`}
                        size={18}
                        onClick={(e) => toggleFavorite(e, s.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-muted text-muted-foreground border-none"
                    >
                      {s.category}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setAction({
                            type: 'swipe',
                            mode: 'edit',
                            itemId: s.id,
                          })
                        }
                      >
                        <Pencil size={16} className="text-muted-foreground" />
                      </Button>
                      <MoveDialog
                        folders={moduleFolders}
                        currentFolderId={s.folderId}
                        onMove={(id) => updateSwipeFolder(s.id, id)}
                      />
                    </div>
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
