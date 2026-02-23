import { useState, useEffect } from 'react'
import useQuickActionStore from '@/stores/useQuickActionStore'
import useProjectStore from '@/stores/useProjectStore'
import useTaskStore from '@/stores/useTaskStore'
import useFunnelStore from '@/stores/useFunnelStore'
import useDocumentStore from '@/stores/useDocumentStore'
import { generateId } from '@/lib/generateId'
import { Task, Funnel, Document } from '@/types'

export type QuickActionFormData = {
  id?: string
  projectId?: string | null
  title?: string
  name?: string
  description?: string
  content?: string
  url?: string
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'

export default function QuickActionModal() {
  const [state, setState] = useQuickActionStore()
  const [projects] = useProjectStore()
  const [tasks, setTasks] = useTaskStore()
  const [funnels, setFunnels] = useFunnelStore()
  const [docs, setDocs] = useDocumentStore()

  const { toast } = useToast()
  const navigate = useNavigate()

  const [formData, setFormData] = useState<QuickActionFormData>({ projectId: 'none' })

  useEffect(() => {
    if (!state) return
    if (state.mode === 'edit' && state.itemId) {
      let item: any = null
      if (state.type === 'canvas')
        item = funnels.find((f) => f.id === state.itemId)
      if (state.type === 'document')
        item = docs.find((d) => d.id === state.itemId)

      if (item) {
        setFormData({ ...item, projectId: item.projectId || 'none' })
      }
    } else {
      setFormData({ projectId: state.defaultProjectId || 'none' })
    }
  }, [state, funnels, tasks, docs])

  if (!state) return null

  const handleClose = () => setState(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const projectId = formData.projectId === 'none' ? null : formData.projectId
    const data = { ...formData, projectId }
    delete data.id

    if (state.mode === 'create') {
      const id = generateId(state.type.charAt(0))
      if (state.type === 'task') {
        setTasks([
          ...tasks,
          {
            ...(data as Partial<Task>),
            id,
            title: data.title || 'Nova Tarefa',
            priority: 'Média',
            status: 'A Fazer',
            deadline: new Date().toISOString(),
          } as Task,
        ])
      } else if (state.type === 'canvas') {
        const newFunnel: Funnel = {
          ...(data as Partial<Funnel>),
          id,
          name: data.name || 'Novo Funil',
          status: 'Rascunho',
          createdAt: new Date().toISOString(),
          nodes: [],
          edges: [],
        }
        setFunnels([...funnels, newFunnel])
        if (!state.defaultProjectId) navigate(`/canvas/${id}`)
      } else if (state.type === 'document') {
        const newDoc: Document = {
          ...(data as Partial<Document>),
          id,
          title: data.title || 'Novo Documento',
          content: data.content || '',
          updatedAt: new Date().toISOString(),
        }
        setDocs([...docs, newDoc])
        if (!state.defaultProjectId) navigate(`/documentos`)
      }
      toast({ title: 'Criado com sucesso!' })
    } else {
      const id = state.itemId!
      if (state.type === 'canvas')
        setFunnels(funnels.map((f) => (f.id === id ? ({ ...f, ...data } as Funnel) : f)))
      else if (state.type === 'task')
        setTasks(tasks.map((t) => (t.id === id ? ({ ...t, ...data } as Task) : t)))
      else if (state.type === 'document')
        setDocs(docs.map((d) => (d.id === id ? ({ ...d, ...data } as Document) : d)))
      toast({ title: 'Atualizado com sucesso!' })
    }

    handleClose()
  }

  const titleMap = {
    task: 'Tarefa',
    canvas: 'Canvas (Funil)',
    document: 'Documento',
  }

  return (
    <Dialog open={!!state} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {state.mode === 'create' ? 'Criar' : 'Editar'}{' '}
            {titleMap[state.type]}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-6">
          {['task', 'document'].includes(state.type) && (
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                required
                value={formData.title || ''}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                autoFocus
              />
            </div>
          )}

          {['canvas'].includes(state.type) && (
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                required
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                autoFocus
              />
            </div>
          )}

          {['task'].includes(state.type) && (
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                className="resize-none h-24"
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          )}

          {['document'].includes(state.type) && (
            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea
                className="resize-none h-32"
                value={formData.content || ''}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
              />
            </div>
          )}



          <div className="space-y-2">
            <Label>Projeto</Label>
            <Select
              disabled={!!state.defaultProjectId}
              value={formData.projectId || 'none'}
              onValueChange={(val) =>
                setFormData({ ...formData, projectId: val })
              }
            >
              <SelectTrigger
                className={state.defaultProjectId ? 'opacity-50' : ''}
              >
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum Projeto (Rascunho)</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!!state.defaultProjectId && (
              <p className="text-sm text-muted-foreground mt-2">
                Vinculado automaticamente ao projeto atual.
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
