import { useState, useEffect } from 'react'
import useQuickActionStore from '@/stores/useQuickActionStore'
import useProjectStore from '@/stores/useProjectStore'
import useTaskStore from '@/stores/useTaskStore'
import useFunnelStore from '@/stores/useFunnelStore'
import useDocumentStore from '@/stores/useDocumentStore'
import useAssetStore from '@/stores/useAssetStore'
import useInsightStore from '@/stores/useInsightStore'
import useSwipeStore from '@/stores/useSwipeStore'

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
  const [assets, setAssets] = useAssetStore()
  const [insights, setInsights] = useInsightStore()
  const [swipes, setSwipes] = useSwipeStore()

  const { toast } = useToast()
  const navigate = useNavigate()

  const [formData, setFormData] = useState<any>({ projectId: 'none' })

  useEffect(() => {
    if (!state) return
    if (state.mode === 'edit' && state.itemId) {
      let item: any = null
      if (state.type === 'canvas')
        item = funnels.find((f) => f.id === state.itemId)
      if (state.type === 'asset')
        item = assets.find((a) => a.id === state.itemId)
      if (state.type === 'insight')
        item = insights.find((i) => i.id === state.itemId)
      if (state.type === 'swipe')
        item = swipes.find((s) => s.id === state.itemId)
      if (state.type === 'task') item = tasks.find((t) => t.id === state.itemId)
      if (state.type === 'document')
        item = docs.find((d) => d.id === state.itemId)

      if (item) {
        setFormData({ ...item, projectId: item.projectId || 'none' })
      }
    } else {
      setFormData({ projectId: state.defaultProjectId || 'none' })
    }
  }, [state, funnels, assets, insights, swipes, tasks, docs])

  if (!state) return null

  const handleClose = () => setState(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const projectId = formData.projectId === 'none' ? null : formData.projectId
    const data = { ...formData, projectId }
    delete data.id

    if (state.mode === 'create') {
      const id = `${state.type.charAt(0)}_${Date.now()}`
      if (state.type === 'task') {
        setTasks([
          ...tasks,
          {
            ...data,
            id,
            title: data.title || 'Nova Tarefa',
            priority: 'Média',
            status: 'A Fazer',
            deadline: new Date().toISOString(),
          },
        ])
      } else if (state.type === 'canvas') {
        const newFunnel = {
          ...data,
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
        const newDoc = {
          ...data,
          id,
          title: data.title || 'Novo Documento',
          content: data.content || '',
          updatedAt: new Date().toISOString(),
        }
        setDocs([...docs, newDoc])
        if (!state.defaultProjectId) navigate(`/documentos`)
      } else if (state.type === 'asset') {
        setAssets([
          ...assets,
          {
            ...data,
            id,
            name: data.name || 'Novo Asset',
            type: 'image',
            tags: [],
          },
        ])
      } else if (state.type === 'insight') {
        setInsights([
          ...insights,
          {
            ...data,
            id,
            title: data.title || 'Novo Insight',
            status: 'Rascunho',
            createdAt: new Date().toISOString(),
            isPinned: false,
          },
        ])
      } else if (state.type === 'swipe') {
        setSwipes([
          ...swipes,
          {
            ...data,
            id,
            title: data.title || 'Nova Inspiração',
            isFavorite: false,
          },
        ])
      }
      toast({ title: 'Criado com sucesso!' })
    } else {
      const id = state.itemId!
      if (state.type === 'canvas')
        setFunnels(funnels.map((f) => (f.id === id ? { ...f, ...data } : f)))
      else if (state.type === 'asset')
        setAssets(assets.map((a) => (a.id === id ? { ...a, ...data } : a)))
      else if (state.type === 'insight')
        setInsights(insights.map((i) => (i.id === id ? { ...i, ...data } : i)))
      else if (state.type === 'swipe')
        setSwipes(swipes.map((s) => (s.id === id ? { ...s, ...data } : s)))
      else if (state.type === 'task')
        setTasks(tasks.map((t) => (t.id === id ? { ...t, ...data } : t)))
      else if (state.type === 'document')
        setDocs(docs.map((d) => (d.id === id ? { ...d, ...data } : d)))
      toast({ title: 'Atualizado com sucesso!' })
    }

    handleClose()
  }

  const titleMap = {
    task: 'Tarefa',
    canvas: 'Canvas (Funil)',
    document: 'Documento',
    asset: 'Asset',
    insight: 'Insight',
    swipe: 'Inspiração (Swipe)',
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
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {['task', 'document', 'insight', 'swipe'].includes(state.type) && (
            <div className="space-y-1.5">
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

          {['canvas', 'asset'].includes(state.type) && (
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          )}

          {['document'].includes(state.type) && (
            <div className="space-y-1.5">
              <Label>Conteúdo</Label>
              <Textarea
                value={formData.content || ''}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
              />
            </div>
          )}

          {['asset', 'swipe'].includes(state.type) && (
            <div className="space-y-1.5">
              <Label>URL da Imagem/Link</Label>
              <Input
                required
                value={formData.url || formData.imageUrl || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [state.type === 'asset' ? 'url' : 'imageUrl']:
                      e.target.value,
                  })
                }
              />
            </div>
          )}

          {['asset', 'swipe'].includes(state.type) && (
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Input
                required
                value={formData.category || ''}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>
          )}

          {state.type === 'insight' && (
            <>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select
                  value={formData.type || 'Observação'}
                  onValueChange={(val) =>
                    setFormData({ ...formData, type: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Observação">Observação</SelectItem>
                    <SelectItem value="Ideia">Ideia</SelectItem>
                    <SelectItem value="Hipótese">Hipótese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Conteúdo</Label>
                <Textarea
                  required
                  value={formData.content || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
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
              <p className="text-[11px] text-muted-foreground mt-1">
                Vinculado automaticamente ao projeto atual.
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
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
