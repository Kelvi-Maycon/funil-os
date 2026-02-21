import { useState } from 'react'
import useSwipeStore from '@/stores/useSwipeStore'
import useFolderStore from '@/stores/useFolderStore'
import useQuickActionStore from '@/stores/useQuickActionStore'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Swipe File</h1>
          <FolderBreadcrumbs
            currentFolderId={currentFolderId}
            folders={moduleFolders}
            onNavigate={setCurrentFolderId}
            rootName="Swipe File"
          />
        </div>
        <div className="flex items-center gap-2">
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
          className="pl-10 bg-white"
          placeholder="Buscar inspirações..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {currentFolders.length === 0 && filteredSwipes.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <ImageIcon size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Vazio</h3>
          <p className="text-muted-foreground mb-4">
            Adicione uma inspiração ou crie uma pasta.
          </p>
        </div>
      ) : view === 'grid' ? (
        <>
          {currentFolders.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              {currentFolders.map((f) => (
                <Card
                  key={f.id}
                  onClick={() => setCurrentFolderId(f.id)}
                  className="hover:shadow-md transition-all cursor-pointer group border-border hover:border-primary/50 flex items-center p-4 gap-3"
                >
                  <FolderIcon
                    className="text-primary fill-primary/20"
                    size={24}
                  />
                  <span className="font-semibold group-hover:text-primary transition-colors">
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
                className="break-inside-avoid relative group rounded-xl overflow-hidden shadow-sm border border-border bg-card cursor-pointer"
                onClick={() =>
                  setAction({ type: 'swipe', mode: 'edit', itemId: s.id })
                }
              >
                <div
                  className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  className={`absolute top-3 right-3 drop-shadow-md z-10 transition-opacity ${s.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-white/60 opacity-0 group-hover:opacity-100'}`}
                  size={20}
                  onClick={(e) => toggleFavorite(e, s.id)}
                />
                <img
                  src={s.imageUrl}
                  alt={s.title}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end pointer-events-none">
                  <h3 className="text-white font-medium">{s.title}</h3>
                  <p className="text-white/80 text-sm">{s.category}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
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
                  className="cursor-pointer group"
                >
                  <TableCell className="w-16">
                    <div className="w-10 h-10 flex items-center justify-center bg-muted rounded">
                      <FolderIcon
                        className="text-primary fill-primary/20 group-hover:text-primary transition-colors"
                        size={20}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))}
              {filteredSwipes.map((s) => (
                <TableRow
                  key={s.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    setAction({ type: 'swipe', mode: 'edit', itemId: s.id })
                  }
                >
                  <TableCell className="w-16">
                    <img
                      src={s.imageUrl}
                      alt={s.title}
                      className="w-10 h-10 object-cover rounded border"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2 py-2">
                      {s.title}{' '}
                      <Star
                        className={`transition-colors ${s.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                        size={14}
                        onClick={(e) => toggleFavorite(e, s.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>{s.category}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
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
                        <Pencil size={14} />
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
