import React, { useState, useMemo } from 'react'
import useFunnelStore from '@/stores/useFunnelStore'
import useFunnelFolderStore from '@/stores/useFunnelFolderStore'
import useProjectStore from '@/stores/useProjectStore'
import useQuickActionStore from '@/stores/useQuickActionStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Plus, LayoutGrid, List, FolderPlus, Home } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import FunnelGrid from '@/components/funnels/FunnelGrid'
import FunnelList from '@/components/funnels/FunnelList'

export default function Funnels() {
  const [funnels, setFunnels] = useFunnelStore()
  const [folders, setFolders] = useFunnelFolderStore()
  const [projects] = useProjectStore()
  const [, setAction] = useQuickActionStore()
  const { toast } = useToast()

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const [renameItem, setRenameItem] = useState<{
    id: string
    type: 'folder' | 'funnel'
    name: string
  } | null>(null)
  const [moveItem, setMoveItem] = useState<{
    id: string
    type: 'folder' | 'funnel'
  } | null>(null)
  const [targetFolderId, setTargetFolderId] = useState<string | null>('root')

  const currentFolders = useMemo(
    () => folders.filter((f) => f.parentId === currentFolderId),
    [folders, currentFolderId],
  )
  const currentFunnels = useMemo(
    () => funnels.filter((f) => (f.folderId || null) === currentFolderId),
    [funnels, currentFolderId],
  )

  const breadcrumbs = useMemo(() => {
    const crumbs = []
    let curr = currentFolderId
    while (curr) {
      const f = folders.find((folder) => folder.id === curr)
      if (f) {
        crumbs.unshift(f)
        curr = f.parentId
      } else {
        break
      }
    }
    return crumbs
  }, [currentFolderId, folders])

  const handleCreateFunnel = () => {
    setAction({ type: 'canvas', mode: 'create' })
  }

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return
    const newFolder = {
      id: `ff_${Date.now()}`,
      name: newFolderName,
      parentId: currentFolderId,
      createdAt: new Date().toISOString(),
    }
    setFolders([...folders, newFolder])
    setNewFolderName('')
    setIsCreateFolderOpen(false)
    toast({ title: 'Pasta criada!' })
  }

  const handleEditItem = (item: {
    id: string
    type: 'folder' | 'funnel'
    name: string
  }) => {
    if (item.type === 'folder') {
      setRenameItem(item)
    } else {
      setAction({ type: 'canvas', mode: 'edit', itemId: item.id })
    }
  }

  const handleRenameFolder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!renameItem || !renameItem.name.trim() || renameItem.type !== 'folder')
      return
    setFolders(
      folders.map((f) =>
        f.id === renameItem.id ? { ...f, name: renameItem.name } : f,
      ),
    )
    setRenameItem(null)
    toast({ title: 'Renomeado com sucesso!' })
  }

  const handleDelete = (id: string, type: 'folder' | 'funnel') => {
    if (type === 'folder') {
      const getChildrenIds = (parentId: string): string[] => {
        const children = folders
          .filter((f) => f.parentId === parentId)
          .map((f) => f.id)
        return children.reduce(
          (acc, childId) => [...acc, ...getChildrenIds(childId)],
          children,
        )
      }
      const idsToDelete = [id, ...getChildrenIds(id)]
      setFolders(folders.filter((f) => !idsToDelete.includes(f.id)))
      setFunnels(
        funnels.map((f) =>
          idsToDelete.includes(f.folderId || '') ? { ...f, folderId: null } : f,
        ),
      )
    } else {
      setFunnels(funnels.filter((f) => f.id !== id))
    }
    toast({ title: 'Excluído com sucesso!' })
  }

  const handleOpenMove = (item: { id: string; type: 'folder' | 'funnel' }) => {
    setMoveItem(item)
    let currentParent: string | null = null
    if (item.type === 'folder') {
      const f = folders.find((f) => f.id === item.id)
      if (f && f.parentId) currentParent = f.parentId
    } else {
      const f = funnels.find((f) => f.id === item.id)
      if (f && f.folderId) currentParent = f.folderId
    }
    setTargetFolderId(currentParent || 'root')
  }

  const handleMove = (e: React.FormEvent) => {
    e.preventDefault()
    if (!moveItem) return
    const finalTarget = targetFolderId === 'root' ? null : targetFolderId
    if (moveItem.type === 'folder') {
      setFolders(
        folders.map((f) =>
          f.id === moveItem.id ? { ...f, parentId: finalTarget } : f,
        ),
      )
    } else {
      setFunnels(
        funnels.map((f) =>
          f.id === moveItem.id ? { ...f, folderId: finalTarget } : f,
        ),
      )
    }
    setMoveItem(null)
    setTargetFolderId('root')
    toast({ title: 'Movido com sucesso!' })
  }

  const moveOptions = useMemo(() => {
    if (!moveItem) return []
    const getDescendants = (id: string): string[] => {
      const children = folders.filter((f) => f.parentId === id).map((f) => f.id)
      return children.reduce(
        (acc, childId) => [...acc, ...getDescendants(childId)],
        children,
      )
    }
    const invalidIds =
      moveItem.type === 'folder'
        ? [moveItem.id, ...getDescendants(moveItem.id)]
        : []
    return folders.filter((f) => !invalidIds.includes(f.id))
  }, [moveItem, folders])

  const getFolderPath = (folderId: string | null) => {
    if (!folderId) return 'Home'
    const path = []
    let curr: string | null = folderId
    while (curr) {
      const f = folders.find((f) => f.id === curr)
      if (f) {
        path.unshift(f.name)
        curr = f.parentId
      } else {
        break
      }
    }
    return `Home > ${path.join(' > ')}`
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Canvas de Funis</h1>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as 'grid' | 'list')}
            className="bg-card border rounded-md p-0.5 shadow-sm"
          >
            <ToggleGroupItem
              value="grid"
              aria-label="Visualização em Grade"
              className="data-[state=on]:bg-muted"
            >
              <LayoutGrid size={16} />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="list"
              aria-label="Visualização em Lista"
              className="data-[state=on]:bg-muted"
            >
              <List size={16} />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button variant="outline" onClick={() => setIsCreateFolderOpen(true)}>
            <FolderPlus size={16} className="mr-2" /> Nova Pasta
          </Button>
          <Button onClick={handleCreateFunnel}>
            <Plus size={16} className="mr-2" /> Novo Funil
          </Button>
        </div>
      </div>

      <Breadcrumb className="bg-card px-4 py-2 border rounded-md shadow-sm">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button
                onClick={() => setCurrentFolderId(null)}
                className="flex items-center gap-1 cursor-pointer"
              >
                <Home size={14} /> Home
              </button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {idx === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <button
                      onClick={() => setCurrentFolderId(crumb.id)}
                      className="cursor-pointer"
                    >
                      {crumb.name}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {viewMode === 'grid' ? (
        <FunnelGrid
          folders={currentFolders}
          funnels={currentFunnels}
          onOpenFolder={setCurrentFolderId}
          onRename={handleEditItem}
          onMove={handleOpenMove}
          onDelete={handleDelete}
        />
      ) : (
        <FunnelList
          folders={currentFolders}
          funnels={currentFunnels}
          onOpenFolder={setCurrentFolderId}
          onRename={handleEditItem}
          onMove={handleOpenMove}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Pasta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4 pt-4">
            <Input
              placeholder="Nome da pasta"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              autoFocus
            />
            <Button type="submit" className="w-full">
              Criar Pasta
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!renameItem}
        onOpenChange={(open) => !open && setRenameItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Pasta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRenameFolder} className="space-y-4 pt-4">
            <Input
              placeholder="Novo nome"
              value={renameItem?.name || ''}
              onChange={(e) =>
                renameItem &&
                setRenameItem({ ...renameItem, name: e.target.value })
              }
              autoFocus
            />
            <Button type="submit" className="w-full">
              Salvar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!moveItem}
        onOpenChange={(open) => !open && setMoveItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Mover {moveItem?.type === 'folder' ? 'Pasta' : 'Funil'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMove} className="space-y-4 pt-4">
            <Select
              value={targetFolderId || 'root'}
              onValueChange={setTargetFolderId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o destino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">Home (Raiz)</SelectItem>
                {moveOptions.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {getFolderPath(f.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full">
              Mover
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
