import { useState, useMemo } from 'react'
import { Folder } from '@/types'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FolderPlus, LayoutGrid, List, Move } from 'lucide-react'

export function ViewToggle({
  view,
  onChange,
}: {
  view: 'grid' | 'list'
  onChange: (v: 'grid' | 'list') => void
}) {
  return (
    <ToggleGroup
      type="single"
      value={view}
      onValueChange={(v) => v && onChange(v as 'grid' | 'list')}
      className="bg-white border rounded-md"
    >
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <LayoutGrid size={16} />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <List size={16} />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

export function FolderBreadcrumbs({
  currentFolderId,
  folders,
  onNavigate,
  rootName,
}: {
  currentFolderId: string | null
  folders: Folder[]
  onNavigate: (id: string | null) => void
  rootName: string
}) {
  const path = useMemo(() => {
    const result: Folder[] = []
    let current = folders.find((f) => f.id === currentFolderId)
    while (current) {
      result.unshift(current)
      current = folders.find((f) => f.id === current?.parentId)
    }
    return result
  }, [currentFolderId, folders])

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {currentFolderId === null ? (
            <BreadcrumbPage className="font-medium text-muted-foreground">
              {rootName}
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <button
                onClick={() => onNavigate(null)}
                className="font-medium cursor-pointer text-muted-foreground"
              >
                {rootName}
              </button>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {path.map((folder, index) => {
          const isLast = index === path.length - 1
          return (
            <div key={folder.id} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{folder.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <button
                      onClick={() => onNavigate(folder.id)}
                      className="cursor-pointer"
                    >
                      {folder.name}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function CreateFolderDialog({
  onConfirm,
}: {
  onConfirm: (name: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onConfirm(name)
      setName('')
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderPlus size={16} className="mr-2" /> Nova Pasta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Pasta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 pt-4">
          <Input
            placeholder="Nome da pasta"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <Button type="submit" className="w-full">
            Criar Pasta
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function MoveDialog({
  folders,
  currentFolderId,
  onMove,
}: {
  folders: Folder[]
  currentFolderId?: string | null
  onMove: (folderId: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string>(currentFolderId || 'root')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 hover:bg-secondary/80"
          onClick={(e) => e.stopPropagation()}
        >
          <Move size={14} className="text-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Mover Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o destino" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="root">Raiz</SelectItem>
              {folders.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              onMove(selected === 'root' ? null : selected)
              setOpen(false)
            }}
            className="w-full"
          >
            Confirmar Movimentação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
