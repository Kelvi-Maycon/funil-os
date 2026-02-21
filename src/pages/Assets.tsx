import { useState, useEffect } from 'react'
import useAssetStore from '@/stores/useAssetStore'
import useFolderStore from '@/stores/useFolderStore'
import useQuickActionStore from '@/stores/useQuickActionStore'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
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
  UploadCloud,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { Asset } from '@/types'
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
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [inspectAsset, setInspectAsset] = useState<Asset | null>(null)
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

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const newAsset: Asset = {
            id: `a_${Date.now()}_${Math.random()}`,
            projectId: 'p1',
            name: 'Pasted Image ' + format(new Date(), 'HH:mm:ss'),
            url: 'https://img.usecurling.com/p/800/600?q=wireframe&color=gray',
            type: 'image',
            category: 'Upload',
            tags: ['pasted'],
            folderId: currentFolderId,
          }
          setAssets((prev) => [newAsset, ...prev])
          toast({ title: 'Imagem colada da área de transferência!' })
        }
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [setAssets, toast, currentFolderId])

  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const newAssets = files.map((f, i) => ({
        id: `a_${Date.now()}_${i}`,
        projectId: 'p1',
        name: f.name,
        url: 'https://img.usecurling.com/p/800/600?q=document&color=blue',
        type: 'image' as const,
        category: 'Upload',
        tags: ['uploaded'],
        folderId: currentFolderId,
      }))
      setAssets((prev) => [...newAssets, ...prev])
      toast({ title: `${files.length} arquivo(s) enviado(s)!` })
    }
  }

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
    <div
      className="relative flex flex-col h-full min-h-screen animate-fade-in"
      onDragOver={(e) => {
        e.preventDefault()
        setIsDraggingOver(true)
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleGlobalDrop}
    >
      {isDraggingOver && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] z-50 flex items-center justify-center border-4 border-dashed border-primary/50 m-4 rounded-3xl pointer-events-none transition-all">
          <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4 animate-in zoom-in-95">
            <UploadCloud size={64} className="text-primary" />
            <h2 className="text-2xl font-bold text-slate-800">
              Solte seus arquivos aqui
            </h2>
            <p className="text-slate-500 font-medium">
              Os assets serão enviados para esta pasta automaticamente.
            </p>
          </div>
        </div>
      )}

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Assets
            </h1>
            <FolderBreadcrumbs
              currentFolderId={currentFolderId}
              folders={moduleFolders}
              onNavigate={setCurrentFolderId}
              rootName="Assets"
            />
          </div>
          <div className="flex items-center gap-3">
            <ViewToggle view={view} onChange={setView} />
            <CreateFolderDialog onConfirm={handleCreateFolder} />
            <Button
              onClick={() => setAction({ type: 'asset', mode: 'create' })}
            >
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
            className="pl-10 bg-card"
            placeholder="Buscar assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {currentFolders.length === 0 && filteredAssets.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center bg-card rounded-xl border border-dashed border-border shadow-sm">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <UploadCloud size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground">Vazio</h3>
            <p className="text-base text-muted-foreground mb-6 mt-2 max-w-sm">
              Arraste arquivos para cá, cole com Ctrl+V ou faça upload de um
              asset.
            </p>
            <Button
              onClick={() => setAction({ type: 'asset', mode: 'create' })}
            >
              <Plus className="mr-2" size={16} /> Novo Asset
            </Button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            {currentFolders.map((f) => (
              <Card
                key={f.id}
                onClick={() => setCurrentFolderId(f.id)}
                className="col-span-1 hover:shadow-md transition-all cursor-pointer h-full group flex flex-col items-center justify-center p-6 gap-4 min-h-[160px]"
              >
                <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center text-primary shrink-0">
                  <FolderIcon size={32} className="fill-current opacity-20" />
                </div>
                <span className="font-semibold text-center group-hover:text-primary transition-colors text-lg">
                  {f.name}
                </span>
              </Card>
            ))}
            {filteredAssets.map((asset) => (
              <Card
                key={asset.id}
                className="overflow-hidden hover:shadow-md transition-all group relative cursor-pointer"
                onClick={() => setInspectAsset(asset)}
              >
                <div className="aspect-square bg-muted relative">
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-secondary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] gap-3">
                    <Button
                      variant="secondary"
                      className="shadow-md pointer-events-none"
                    >
                      Inspecionar
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
                <CardContent className="p-4 bg-card border-t border-border relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 text-slate-400 hover:text-slate-800"
                    onClick={(e) => {
                      e.stopPropagation()
                      setAction({
                        type: 'asset',
                        mode: 'edit',
                        itemId: asset.id,
                      })
                    }}
                  >
                    <Pencil size={14} />
                  </Button>
                  <h3 className="font-semibold text-base truncate pr-8 text-foreground">
                    {asset.name}
                  </h3>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className="bg-muted text-muted-foreground border-none font-medium"
                    >
                      {asset.category}
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
                    className="cursor-pointer group text-base"
                  >
                    <TableCell className="w-20">
                      <div className="w-12 h-12 flex items-center justify-center bg-accent rounded-lg text-primary">
                        <FolderIcon
                          className="fill-current opacity-20 group-hover:opacity-40 transition-opacity"
                          size={24}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{f.name}</TableCell>
                    <TableCell className="text-muted-foreground">-</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
                {filteredAssets.map((a) => (
                  <TableRow
                    key={a.id}
                    className="cursor-pointer text-base"
                    onClick={() => setInspectAsset(a)}
                  >
                    <TableCell className="w-20">
                      <img
                        src={a.url}
                        alt={a.name}
                        className="w-12 h-12 object-cover rounded-lg border border-border"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-muted text-muted-foreground border-none"
                      >
                        {a.category}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
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
                          <Pencil size={16} className="text-muted-foreground" />
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

      <Dialog
        open={!!inspectAsset}
        onOpenChange={(open) => !open && setInspectAsset(null)}
      >
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none shadow-2xl flex flex-col overflow-hidden rounded-none sm:rounded-none">
          <DialogTitle className="sr-only">Inspeção de Asset</DialogTitle>
          <div className="absolute top-6 left-6 text-white font-bold text-xl z-10 drop-shadow-md">
            {inspectAsset?.name}
          </div>
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <img
              src={inspectAsset?.url}
              alt={inspectAsset?.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
