import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useProjectStore from '@/stores/useProjectStore'
import useFolderStore from '@/stores/useFolderStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Folder as FolderIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  ViewToggle,
  FolderBreadcrumbs,
  CreateFolderDialog,
  MoveDialog,
} from '@/components/folders/FolderComponents'

export default function Projects() {
  const [projects, setProjects] = useProjectStore()
  const [allFolders, setFolders] = useFolderStore()
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const { toast } = useToast()
  const navigate = useNavigate()

  const moduleFolders = allFolders.filter((f) => f.module === 'project')

  const currentFolders = moduleFolders.filter((f) => {
    if (search) return f.name.toLowerCase().includes(search.toLowerCase())
    return f.parentId === currentFolderId
  })

  const filteredProjects = projects.filter((p) => {
    if (search) return p.name.toLowerCase().includes(search.toLowerCase())
    return (p.folderId || null) === currentFolderId
  })

  const handleCreateFolder = (name: string) => {
    setFolders([
      ...allFolders,
      {
        id: `f_${Date.now()}`,
        module: 'project',
        name,
        parentId: currentFolderId,
        createdAt: new Date().toISOString(),
      },
    ])
    toast({ title: 'Pasta criada com sucesso!' })
  }

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    const newProject = {
      id: `p_${Date.now()}`,
      name: newName,
      description: 'Sem descrição',
      status: 'Ativo' as const,
      createdAt: new Date().toISOString(),
      folderId: currentFolderId,
    }
    setProjects([...projects, newProject])
    setNewName('')
    setOpen(false)
    toast({ title: 'Projeto criado com sucesso!' })
  }

  const updateProjectFolder = (id: string, folderId: string | null) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, folderId } : p)))
    toast({ title: 'Projeto movido com sucesso!' })
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
          <FolderBreadcrumbs
            currentFolderId={currentFolderId}
            folders={moduleFolders}
            onNavigate={setCurrentFolderId}
            rootName="Projetos"
          />
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onChange={setView} />
          <CreateFolderDialog onConfirm={handleCreateFolder} />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" /> Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Projeto</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4 pt-4">
                <Input
                  placeholder="Nome do Projeto"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
                <Button type="submit" className="w-full">
                  Criar Projeto
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <Input
          placeholder="Buscar projetos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {currentFolders.length === 0 && filteredProjects.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <FolderIcon size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Vazio</h3>
          <p className="text-muted-foreground mb-4">
            Crie um projeto ou uma pasta para começar.
          </p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentFolders.map((f) => (
            <Card
              key={f.id}
              onClick={() => setCurrentFolderId(f.id)}
              className="hover:shadow-md transition-all cursor-pointer h-full group border-border hover:border-primary/50 flex items-center p-4 gap-3"
            >
              <FolderIcon className="text-primary fill-primary/20" size={24} />
              <span className="font-semibold group-hover:text-primary transition-colors">
                {f.name}
              </span>
            </Card>
          ))}
          {filteredProjects.map((p) => (
            <Card
              key={p.id}
              onClick={() => navigate(`/projetos/${p.id}`)}
              className="hover:shadow-md transition-all cursor-pointer h-full group border-border hover:border-primary/50 flex flex-col"
            >
              <CardHeader className="pb-3 flex-1">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
                    {p.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={p.status === 'Ativo' ? 'default' : 'secondary'}
                      className={
                        p.status === 'Ativo'
                          ? 'bg-green-500 hover:bg-green-600'
                          : ''
                      }
                    >
                      {p.status}
                    </Badge>
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      <MoveDialog
                        folders={moduleFolders}
                        currentFolderId={p.folderId}
                        onMove={(id) => updateProjectFolder(p.id, id)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {p.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell className="font-medium flex items-center gap-2 py-4">
                    <FolderIcon
                      className="text-primary fill-primary/20 group-hover:text-primary transition-colors"
                      size={16}
                    />
                    {f.name}
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))}
              {filteredProjects.map((p) => (
                <TableRow
                  key={p.id}
                  onClick={() => navigate(`/projetos/${p.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium py-4">{p.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={p.status === 'Ativo' ? 'default' : 'secondary'}
                      className={
                        p.status === 'Ativo'
                          ? 'bg-green-500 hover:bg-green-600'
                          : ''
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      <MoveDialog
                        folders={moduleFolders}
                        currentFolderId={p.folderId}
                        onMove={(id) => updateProjectFolder(p.id, id)}
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
