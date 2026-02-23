import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useProjectStore from '@/stores/useProjectStore'
import useFolderStore from '@/stores/useFolderStore'
import useTaskStore from '@/stores/useTaskStore'
import useFunnelStore from '@/stores/useFunnelStore'
import useDocumentStore from '@/stores/useDocumentStore'
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
import { Plus, Search, Folder as FolderIcon, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { generateId } from '@/lib/generateId'
import { ConfirmDialog } from '@/components/ConfirmDialog'
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
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

  const [tasks, setTasks] = useTaskStore()
  const [funnels, setFunnels] = useFunnelStore()
  const [docs, setDocs] = useDocumentStore()

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
        id: generateId('f'),
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
      id: generateId('p'),
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

  const handleDeleteProject = () => {
    if (!projectToDelete) return
    const id = projectToDelete

    setTasks(tasks.filter((t) => t.projectId !== id))
    setFunnels(funnels.filter((f) => f.projectId !== id))
    setDocs(docs.filter((d) => d.projectId !== id))

    setProjects(projects.filter((p) => p.id !== id))

    setProjectToDelete(null)
    toast({ title: 'Projeto e itens vinculados excluídos!' })
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] w-full mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Projetos
          </h1>
          <FolderBreadcrumbs
            currentFolderId={currentFolderId}
            folders={moduleFolders}
            onNavigate={setCurrentFolderId}
            rootName="Projetos"
          />
        </div>
        <div className="flex items-center gap-3">
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
              <form onSubmit={handleCreateProject} className="space-y-4 pt-6">
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
          className="pl-10 bg-card"
        />
      </div>

      {currentFolders.length === 0 && filteredProjects.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center bg-card rounded-xl border border-dashed border-border shadow-sm">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <FolderIcon size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Vazio</h3>
          <p className="text-base text-muted-foreground mt-2 mb-6">
            Crie um projeto ou uma pasta para começar.
          </p>
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} className="mr-2" /> Criar Primeiro Projeto
          </Button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {currentFolders.map((f) => (
            <Card
              key={f.id}
              onClick={() => setCurrentFolderId(f.id)}
              className="hover:shadow-md transition-all cursor-pointer h-full group flex items-center p-6 gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-primary shrink-0">
                <FolderIcon size={24} className="fill-current opacity-20" />
              </div>
              <span className="font-semibold text-lg group-hover:text-primary transition-colors">
                {f.name}
              </span>
            </Card>
          ))}
          {filteredProjects.map((p) => (
            <Card
              key={p.id}
              onClick={() => navigate(`/projetos/${p.id}`)}
              className="hover:shadow-md transition-all cursor-pointer h-full group flex flex-col"
            >
              <CardHeader className="pb-4 flex-1">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">
                    {p.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={
                        p.status === 'Ativo'
                          ? 'bg-success-bg text-success-foreground border-none'
                          : 'bg-muted text-muted-foreground border-none'
                      }
                    >
                      {p.status}
                    </Badge>
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      className="flex items-center gap-1"
                    >
                      <MoveDialog
                        folders={moduleFolders}
                        currentFolderId={p.folderId}
                        onMove={(id) => updateProjectFolder(p.id, id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => setProjectToDelete(p.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground line-clamp-2">
                  {p.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
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
                  <TableCell className="font-medium flex items-center gap-3 py-4 text-base">
                    <FolderIcon
                      className="text-primary fill-primary/20 group-hover:text-primary transition-colors"
                      size={20}
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
                  className="cursor-pointer text-base"
                >
                  <TableCell className="font-medium py-4">{p.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        p.status === 'Ativo'
                          ? 'bg-success-bg text-success-foreground border-none'
                          : 'bg-muted text-muted-foreground border-none'
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
                      className="flex items-center gap-1"
                    >
                      <MoveDialog
                        folders={moduleFolders}
                        currentFolderId={p.folderId}
                        onMove={(id) => updateProjectFolder(p.id, id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => setProjectToDelete(p.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
        title="Excluir Projeto?"
        description="Esta ação é irreversível. O projeto e todos os funis, tarefas e documentos vinculados a ele serão excluídos permanentemente."
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDeleteProject}
      />
    </div>
  )
}
