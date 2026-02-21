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
} from 'lucide-react'

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

export default function BlockPalette() {
  return (
    <div className="w-[300px] bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col shrink-0 z-10 h-full overflow-hidden">
      <div className="p-6 pb-4 pt-8">
        <h2 className="text-[22px] font-semibold text-slate-800 tracking-tight">
          Build
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-8">
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
    </div>
  )
}
