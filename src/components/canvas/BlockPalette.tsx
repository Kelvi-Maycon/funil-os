import { useState } from 'react'
import {
  Megaphone,
  LayoutTemplate,
  MessageCircle,
  Mail,
  DollarSign,
  HandHeart,
  CheckCircle,
  FileText,
  MessageSquare,
  Clock,
  CheckSquare,
  Image as ImageIcon,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useDocumentStore from '@/stores/useDocumentStore'
import useTaskStore from '@/stores/useTaskStore'
import useAssetStore from '@/stores/useAssetStore'
import { Funnel } from '@/types'

const blockGroups = [
  {
    title: 'MESSAGES',
    items: [
      { type: 'Email', label: 'Email', icon: Mail },
      { type: 'Slack', label: 'Slack', icon: MessageSquare },
      { type: 'SMS', label: 'SMS', icon: MessageCircle },
      { type: 'WATI', label: 'WATI (WhatsApp)', icon: MessageCircle },
      { type: 'ManyChat', label: 'ManyChat (WhatsApp)', icon: MessageCircle },
    ],
  },
  {
    title: 'DELAYS',
    items: [{ type: 'WaitUntil', label: 'Wait Until', icon: Clock }],
  },
  {
    title: 'PAGES',
    items: [
      { type: 'LandingPage', label: 'Landing Page', icon: LayoutTemplate },
      { type: 'Checkout', label: 'Checkout', icon: DollarSign },
      { type: 'Upsell', label: 'Upsell', icon: HandHeart },
      { type: 'Obrigado', label: 'Thank You', icon: CheckCircle },
      { type: 'Form', label: 'Form', icon: FileText },
      { type: 'Ad', label: 'Ad Campaign', icon: Megaphone },
    ],
  },
]

export default function BlockPalette({ funnel }: { funnel?: Funnel }) {
  const [tab, setTab] = useState<'blocks' | 'resources'>('blocks')
  const [tasks] = useTaskStore()
  const [docs] = useDocumentStore()
  const [assets] = useAssetStore()

  const projTasks = funnel
    ? tasks.filter((t) => t.projectId === funnel.projectId)
    : []
  const projDocs = funnel
    ? docs.filter((d) => d.projectId === funnel.projectId)
    : []
  const projAssets = funnel
    ? assets.filter((a) => a.projectId === funnel.projectId)
    : []

  return (
    <div className="w-[300px] bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col shrink-0 z-10 h-full overflow-hidden">
      <div className="p-4 pb-2 pt-6">
        <Tabs
          value={tab}
          onValueChange={(v: any) => setTab(v)}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-2 bg-slate-50 p-1 rounded-xl">
            <TabsTrigger value="blocks" className="rounded-lg text-xs">
              Blocos
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="rounded-lg text-xs"
              disabled={!funnel}
            >
              Recursos
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 mt-2">
        {tab === 'blocks' ? (
          <div className="space-y-8">
            {blockGroups.map((g) => (
              <div key={g.title} className="space-y-3">
                <div className="flex items-center gap-2 px-2">
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                    {g.title}
                  </span>
                  <div className="w-[5px] h-[5px] rotate-45 bg-purple-500 rounded-[1px]" />
                </div>
                <div className="space-y-1">
                  {g.items.map((b) => (
                    <div
                      key={b.type}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData('blockType', b.type)
                      }
                      className="flex items-center gap-3.5 p-3 px-4 rounded-2xl cursor-grab hover:bg-slate-50 transition-colors text-slate-700 active:cursor-grabbing border border-transparent hover:border-slate-100"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                        <b.icon
                          size={16}
                          className="text-slate-600"
                          strokeWidth={1.5}
                        />
                      </div>
                      <span className="text-sm font-medium">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 block mb-3">
                Documentos
              </span>
              {projDocs.map((d) => (
                <div
                  key={d.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('resourceType', 'document')
                    e.dataTransfer.setData('resourceId', d.id)
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl cursor-grab hover:bg-slate-50 border border-transparent hover:border-slate-100 active:cursor-grabbing transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText size={14} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {d.title}
                  </span>
                </div>
              ))}
              {projDocs.length === 0 && (
                <div className="text-xs text-slate-400 px-2">
                  Nenhum documento
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 block mb-3">
                Tarefas
              </span>
              {projTasks.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('resourceType', 'task')
                    e.dataTransfer.setData('resourceId', t.id)
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl cursor-grab hover:bg-slate-50 border border-transparent hover:border-slate-100 active:cursor-grabbing transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckSquare size={14} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {t.title}
                  </span>
                </div>
              ))}
              {projTasks.length === 0 && (
                <div className="text-xs text-slate-400 px-2">
                  Nenhuma tarefa
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 block mb-3">
                Assets
              </span>
              {projAssets.map((a) => (
                <div
                  key={a.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('resourceType', 'asset')
                    e.dataTransfer.setData('resourceId', a.id)
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl cursor-grab hover:bg-slate-50 border border-transparent hover:border-slate-100 active:cursor-grabbing transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <ImageIcon size={14} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {a.name}
                  </span>
                </div>
              ))}
              {projAssets.length === 0 && (
                <div className="text-xs text-slate-400 px-2">Nenhum asset</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
