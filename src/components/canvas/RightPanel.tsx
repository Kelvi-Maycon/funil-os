import { Node } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Copy, X, Settings2 } from 'lucide-react'

export default function RightPanel({
  node,
  onChange,
  onClose,
}: {
  node: Node
  onChange: (n: Node) => void
  onClose: () => void
}) {
  return (
    <div className="w-[500px] bg-white border-l border-slate-100 h-full flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.05)] z-30 shrink-0 animate-slide-left absolute right-0 top-0 bottom-0 rounded-l-[2rem]">
      <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50 shrink-0 bg-white/80 backdrop-blur-md rounded-tl-[2rem]">
        <span className="text-[13px] text-slate-400 font-medium flex items-center gap-2">
          <Settings2 size={16} />
          Node Settings
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs font-medium bg-white rounded-xl shadow-sm"
          >
            <Copy size={14} className="mr-1.5" /> Copy ID
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 text-slate-400 hover:text-slate-800 rounded-xl bg-slate-50 hover:bg-slate-100"
          >
            <X size={18} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 space-y-10">
        <div className="space-y-6">
          <input
            className="w-full bg-transparent text-[32px] font-bold tracking-tight text-slate-800 outline-none placeholder:text-slate-300 border-none px-0 focus:ring-0"
            value={node.data.name}
            onChange={(e) =>
              onChange({
                ...node,
                data: { ...node.data, name: e.target.value },
              })
            }
            placeholder="Node Title"
          />
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Subtitle / Logic
            </label>
            <input
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 border-none px-0 focus:ring-0"
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
              Notes
            </label>
            <Textarea
              value={node.data.notes || ''}
              onChange={(e) =>
                onChange({
                  ...node,
                  data: { ...node.data, notes: e.target.value },
                })
              }
              placeholder="Add context or logic notes here..."
              className="min-h-[240px] border-slate-200 bg-white rounded-2xl p-4 shadow-sm focus-visible:ring-primary/20 resize-none text-sm text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
