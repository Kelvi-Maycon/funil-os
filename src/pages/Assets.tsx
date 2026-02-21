import { useState } from 'react'
import useAssetStore from '@/stores/useAssetStore'
import useFolderStore from '@/stores/useFolderStore'
import useQuickActionStore from '@/stores/useQuickActionStore'
import { Card, CardContent } from '@/components/ui/card'
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
  Search,
  Plus,
  Image as ImageIcon,
  Folder as FolderIcon,
  Pencil,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  ViewToggle,
  FolderBreadcrumbs,
  CreateFolderDialog,
  MoveDialog,
} from '@/components/folders/FolderComponents'

export default function Assets() {
  const [assets, setAssets] = useAssetStore()
  const [allFolders, setFolders] = useFolderStore()
  const [, setAction] = useQuickActionStore()
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const { toast } = useToast()

  const moduleFolders = allFolders.filter((f) => f.module === 'asset')

  const currentFolders = moduleFolders.filter((f) => {
    if (search) return f.name.toLowerCase().includes(search.toLowerCase())
    return f.parentId === currentFolderId
  })

  const filteredAssets = assets.filter((a) => {
    if (search) return a.name.toLowerCase().includes(search.toLowerCase())
    return (a.folderId || null) === currentFolderId
  })

  const handleCreateFolder = (name: string) => {
    setFolders([
      ...allFolders,
      {
        id: `f_${Date.now()}`,
        module: 'asset',
        name,
        parentId: currentFolderId,
        createdAt: new Date().toISOString(),
      },
    ])
    toast({ title: 'Pasta criada com sucesso!' })
  }

  const updateAssetFolder = (id: string, folderId: string | null) => {
    setAssets(assets.map((a) => (a.id === id ? { ...a, folderId } : a)))
    toast({ title: 'Asset movido com sucesso!' })
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
          <FolderBreadcrumbs
            currentFolderId={currentFolderId}
            folders={moduleFolders}
            onNavigate={setCurrentFolderId}
            rootName="Assets"
          />
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onChange={setView} />
          <CreateFolderDialog onConfirm={handleCreateFolder} />
          <Button onClick={() => setAction({ type: 'asset', mode: 'create' })}>
            <Plus className="mr-2" size={16} /> Novo Asset
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
          placeholder="Buscar assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {currentFolders.length === 0 && filteredAssets.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <ImageIcon size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Vazio</h3>
          <p className="text-muted-foreground mb-4">
            Faça upload de um asset ou crie uma pasta.
          </p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {currentFolders.map((f) => (
            <Card
              key={f.id}
              onClick={() => setCurrentFolderId(f.id)}
              className="col-span-1 hover:shadow-md transition-all cursor-pointer h-full group border-border hover:border-primary/50 flex flex-col items-center justify-center p-6 gap-3 min-h-[140px]"
            >
              <FolderIcon className="text-primary fill-primary/20" size={32} />
              <span className="font-semibold text-center group-hover:text-primary transition-colors text-sm">
                {f.name}
              </span>
            </Card>
          ))}
          {filteredAssets.map((asset) => (
            <Card
              key={asset.id}
              className="overflow-hidden hover:shadow-lg transition-all group border-border relative cursor-pointer"
              onClick={() =>
                setAction({ type: 'asset', mode: 'edit', itemId: asset.id })
              }
            >
              <div className="aspect-square bg-muted relative">
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="pointer-events-none"
                  >
                    Editar
                  </Button>
                  <div
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    <MoveDialog
                      folders={moduleFolders}
                      currentFolderId={asset.folderId}
                      onMove={(id) => updateAssetFolder(asset.id, id)}
                    />
                  </div>
                </div>
              </div>
              <CardContent className="p-3 bg-card">
                <h3 className="font-medium text-sm truncate text-card-foreground">
                  {asset.name}
                </h3>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {asset.tags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 font-normal"
                    >
                      {tag}
                    </Badge>
                  ))}
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 font-normal"
                  >
                    {asset.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Nome</TableHead>
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
              {filteredAssets.map((a) => (
                <TableRow
                  key={a.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() =>
                    setAction({ type: 'asset', mode: 'edit', itemId: a.id })
                  }
                >
                  <TableCell className="w-16">
                    <img
                      src={a.url}
                      alt={a.name}
                      className="w-10 h-10 object-cover rounded border"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.category}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setAction({
                            type: 'asset',
                            mode: 'edit',
                            itemId: a.id,
                          })
                        }
                      >
                        <Pencil size={14} />
                      </Button>
                      <MoveDialog
                        folders={moduleFolders}
                        currentFolderId={a.folderId}
                        onMove={(id) => updateAssetFolder(a.id, id)}
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
