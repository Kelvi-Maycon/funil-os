import { useParams } from 'react-router-dom'
import useFunnelStore from '@/stores/useFunnelStore'
import CanvasBoard from '@/components/canvas/CanvasBoard'

export default function Canvas() {
  const { id } = useParams()
  const [funnels, setFunnels] = useFunnelStore()

  const funnel = funnels.find((f) => f.id === id)

  if (!funnel)
    return (
      <div className="p-8 text-center text-slate-500">
        Funil não encontrado.
      </div>
    )

  const updateFunnel = (updated: any) => {
    setFunnels((prev) => prev.map((f) => (f.id === id ? updated : f)))
  }

  return (
    <div className="h-full flex flex-col overflow-hidden animate-fade-in bg-[#f8fafc] relative">
      <div className="flex-1 relative flex overflow-hidden">
        <CanvasBoard funnel={funnel} onChange={updateFunnel} />
      </div>
    </div>
  )
}
