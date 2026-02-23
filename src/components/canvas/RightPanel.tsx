import { Node, Funnel, Task, Resource } from '@/types'
import { generateId } from '@/lib/generateId'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  X,
  FileText,
  CheckSquare,
  Image as ImageIcon,
  Plus,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useDocumentStore from '@/stores/useDocumentStore'
import useTaskStore from '@/stores/useTaskStore'
import useResourceStore from '@/stores/useResourceStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

export default function RightPanel({
  node,
  funnel,
  defaultTab = 'details',
  onChange,
  onClose,
}: {
  node: Node
  funnel: Funnel
  defaultTab?: string
  onChange: (n: Node) => void
  onClose: () => void
}) {
  const [docs, setDocs] = useDocumentStore()
  const [tasks, setTasks] = useTaskStore()
  const [resources, setResources] = useResourceStore()
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [inspectResource, setInspectResource] = useState<Resource | null>(null)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab, node.id])

  const linkedDocs = docs.filter((d) =>
    node.data.linkedDocumentIds?.includes(d.id),
  )
  const linkedTasks = tasks.filter(
    (t) => t.nodeId === node.id || node.data.linkedTaskIds?.includes(t.id),
  )
  const linkedResources = resources.filter((a) =>
    node.data.linkedAssetIds?.includes(a.id),
  )

  const projDocs = docs.filter(
    (d) =>
      d.projectId === funnel.projectId &&
      !node.data.linkedDocumentIds?.includes(d.id),
  )
  const projTasks = tasks.filter(
    (t) =>
      t.projectId === funnel.projectId &&
      t.nodeId !== node.id &&
      !node.data.linkedTaskIds?.includes(t.id),
  )
  const projResources = resources.filter(
    (a) =>
      a.projectId === funnel.projectId &&
      !node.data.linkedAssetIds?.includes(a.id),
  )

  const linkResource = (type: 'doc' | 'task' | 'asset', id: string) => {
    const key =
      type === 'doc'
        ? 'linkedDocumentIds'
        : type === 'task'
          ? 'linkedTaskIds'
          : 'linkedAssetIds'
    onChange({
      ...node,
      data: {
        ...node.data,
        [key]: [
          ...((node.data[key as keyof typeof node.data] as string[]) || []),
          id,
        ],
      },
    })
    if (type === 'doc')
      setDocs(
        docs.map((d) =>
          d.id === id ? { ...d, funnelId: funnel.id, nodeId: node.id } : d,
        ),
      )
    if (type === 'task')
      setTasks(
        tasks.map((t) =>
          t.id === id ? { ...t, funnelId: funnel.id, nodeId: node.id } : t,
        ),
      )
  }

  const handleCreateTask = () => {
    const newTask: Task = {
      id: generateId('t'),
      title: 'Nova Tarefa do Nó',
      projectId: funnel.projectId,
      funnelId: funnel.id,
      nodeId: node.id,
      priority: 'Média',
      status: 'A Fazer',
      deadline: new Date(Date.now() + 86400000).toISOString(),
    }
    setTasks([...tasks, newTask])
    onChange({
      ...node,
      data: {
        ...node.data,
        linkedTaskIds: [...(node.data.linkedTaskIds || []), newTask.id],
      },
    })
  }

  return (
    <div className="w-[500px] bg-white border-l border-slate-100 h-full flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.05)] z-30 shrink-0 absolute right-0 top-0 bottom-0 rounded-l-[2rem]">
      <div className="px-8 py-5 flex items-center justify-between border-b border-slate-50 shrink-0">
        <input
          className="bg-transparent text-[22px] font-bold tracking-tight text-slate-800 outline-none border-none px-0 focus:ring-0 truncate max-w-[300px]"
          value={node.data.name}
          onChange={(e) =>
            onChange({ ...node, data: { ...node.data, name: e.target.value } })
          }
          placeholder="Node Title"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-slate-400 hover:bg-slate-100"
        >
          <X size={18} />
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <TabsList className="mx-8 mt-4 grid grid-cols-4 bg-slate-50/50 p-1 rounded-xl">
          <TabsTrigger value="details" className="text-xs rounded-lg">
            Detalhes
          </TabsTrigger>
          <TabsTrigger value="content" className="text-xs rounded-lg">
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs rounded-lg">
            Tarefas
          </TabsTrigger>
          <TabsTrigger value="resources" className="text-xs rounded-lg">
            Recursos
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="details"
          className="flex-1 overflow-auto p-8 space-y-6 m-0 border-none outline-none no-scrollbar"
        >
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Subtítulo / Lógica
            </label>
            <input
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
              value={node.data.subtitle || ''}
              onChange={(e) =>
                onChange({
                  ...node,
                  data: { ...node.data, subtitle: e.target.value },
                })
              }
              placeholder="+1 filter"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
              Notas
            </label>
            <Textarea
              value={node.data.notes || ''}
              onChange={(e) =>
                onChange({
                  ...node,
                  data: { ...node.data, notes: e.target.value },
                })
              }
              placeholder="Adicione contexto ou notas lógicas aqui..."
              className="min-h-[240px] bg-slate-50/50 rounded-2xl p-4 resize-none text-sm"
            />
          </div>
        </TabsContent>

        <TabsContent
          value="content"
          className="flex-1 overflow-auto p-8 space-y-6 m-0 border-none outline-none no-scrollbar"
        >
          <div className="flex items-center gap-2">
            <Select onValueChange={(val) => linkResource('doc', val)}>
              <SelectTrigger className="flex-1 bg-white">
                <SelectValue placeholder="Vincular Documento..." />
              </SelectTrigger>
              <SelectContent>
                {projDocs.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    <div className="flex items-center gap-2">
                      <FileText size={14} />
                      {d.title}
                    </div>
                  </SelectItem>
                ))}
                {projDocs.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Nenhum documento
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          {linkedDocs.map((doc) => (
            <div
              key={doc.id}
              className="space-y-3 border rounded-xl p-4 bg-white shadow-sm"
            >
              <div className="font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
                <FileText size={16} className="text-blue-500" /> {doc.title}
              </div>
              <div
                contentEditable
                className="min-h-[150px] outline-none text-sm text-slate-600 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: doc.content }}
                onBlur={(e) =>
                  setDocs(
                    docs.map((d) =>
                      d.id === doc.id
                        ? { ...d, content: e.currentTarget.innerHTML }
                        : d,
                    ),
                  )
                }
              />
            </div>
          ))}
          {linkedDocs.length === 0 && (
            <div className="text-center text-sm text-slate-400 py-8">
              Nenhum documento vinculado.
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="tasks"
          className="flex-1 overflow-auto p-8 space-y-6 m-0 border-none outline-none no-scrollbar"
        >
          <div className="flex items-center gap-2">
            <Select onValueChange={(val) => linkResource('task', val)}>
              <SelectTrigger className="flex-1 bg-white">
                <SelectValue placeholder="Importar Tarefa..." />
              </SelectTrigger>
              <SelectContent>
                {projTasks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex items-center gap-2">
                      <CheckSquare size={14} />
                      {t.title}
                    </div>
                  </SelectItem>
                ))}
                {projTasks.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Nenhuma tarefa disponível
                  </div>
                )}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleCreateTask}>
              <Plus size={16} />
            </Button>
          </div>
          <div className="space-y-3">
            {linkedTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 border rounded-xl bg-white shadow-sm flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm">{t.title}</span>
                  <Badge variant="outline">{t.status}</Badge>
                </div>
                <div className="text-xs text-slate-500">
                  Prioridade: {t.priority}
                </div>
              </div>
            ))}
            {linkedTasks.length === 0 && (
              <div className="text-center text-sm text-slate-400 py-8">
                Nenhuma tarefa vinculada.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="resources"
          className="flex-1 overflow-auto p-8 space-y-6 m-0 border-none outline-none no-scrollbar"
        >
          <div className="flex items-center gap-2">
            <Select onValueChange={(val) => linkResource('asset', val)}>
              <SelectTrigger className="flex-1 bg-white">
                <SelectValue placeholder="Vincular Recurso..." />
              </SelectTrigger>
              <SelectContent>
                {projResources.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    <div className="flex items-center gap-2">
                      <ImageIcon size={14} />
                      {a.title}
                    </div>
                  </SelectItem>
                ))}
                {projResources.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Nenhum recurso disponível
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {linkedResources.map((a) => (
              <div
                key={a.id}
                className="rounded-xl overflow-hidden border bg-white shadow-sm group relative cursor-pointer"
                onClick={() => a.type === 'image' && setInspectResource(a)}
              >
                {a.type === 'image' ? (
                  <img
                    src={a.content}
                    alt={a.title}
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <div className="p-3 text-sm text-muted-foreground line-clamp-3 aspect-video flex items-center">
                    {a.content}
                  </div>
                )}
                <div className="p-2 text-xs font-medium truncate border-t">
                  {a.title}
                </div>
              </div>
            ))}
          </div>
          {linkedResources.length === 0 && (
            <div className="text-center text-sm text-slate-400 py-8">
              Nenhum recurso vinculado.
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!inspectResource}
        onOpenChange={(open) => !open && setInspectResource(null)}
      >
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none shadow-2xl flex flex-col overflow-hidden rounded-none sm:rounded-none">
          <DialogTitle className="sr-only">Inspeção de Recurso</DialogTitle>
          <div className="absolute top-6 left-6 text-white font-bold text-xl z-10 drop-shadow-md">
            {inspectResource?.title}
          </div>
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <img
              src={inspectResource?.content}
              alt={inspectResource?.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
