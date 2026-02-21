import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Funnel, Node, Edge, NodeData, Asset } from '@/types'
import BlockPalette from './BlockPalette'
import NodeItem from './NodeItem'
import RightPanel from './RightPanel'
import { NodeSettingsModal } from './NodeSettingsModal'
import {
  Plus,
  Minus,
  Map,
  Grid,
  Edit2,
  Image as ImageIcon,
  MousePointer2,
  Hand,
  Type,
  ArrowLeft,
  Square,
  Diamond,
  Circle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import useTaskStore from '@/stores/useTaskStore'
import useDocumentStore from '@/stores/useDocumentStore'
import useAssetStore from '@/stores/useAssetStore'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

const getRightPortCoords = (node: Node, x: number, y: number) => {
  const w = node.width || 120
  const h = node.height || 120
  if (['Square', 'Diamond', 'Circle'].includes(node.type))
    return { x: x + w, y: y + h / 2 }
  if (node.type === 'FloatingText') return { x: x + w, y: y + h / 2 }
  if (node.type === 'Image') return { x: x + 300, y: y + 100 }
  if (node.type === 'Text') return { x: x + 150, y: y + 30 }
  return { x: x + 260, y: y + 44 }
}

const getLeftPortCoords = (node: Node, x: number, y: number) => {
  const h = node.height || 120
  if (['Square', 'Diamond', 'Circle'].includes(node.type))
    return { x, y: y + h / 2 }
  if (node.type === 'FloatingText') return { x, y: y + h / 2 }
  if (node.type === 'Image') return { x, y: y + 100 }
  if (node.type === 'Text') return { x, y: y + 30 }
  return { x, y: y + 44 }
}

export default function CanvasBoard({
  funnel,
  onChange,
  hideHeader,
  onBack,
}: {
  funnel: Funnel
  onChange: (f: Funnel) => void
  hideHeader?: boolean
  onBack?: () => void
}) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tasks, setTasks] = useTaskStore()
  const [docs, setDocs] = useDocumentStore()
  const [assets, setAssets] = useAssetStore()
  const { toast } = useToast()

  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
  const [rightPanelState, setRightPanelState] = useState<{
    nodeId: string
    tab: string
  } | null>(null)
  const [settingsNodeId, setSettingsNodeId] = useState<string | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  const [transform, setTransform] = useState({ x: 400, y: 150, scale: 1 })
  const [isPanning, setIsPanning] = useState(false)
  const [activeTool, setActiveTool] = useState<
    'Select' | 'Pan' | 'Square' | 'Diamond' | 'Circle'
  >('Select')
  const [showMinimap, setShowMinimap] = useState(false)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [draggedNode, setDraggedNode] = useState<{
    id: string
    x: number
    y: number
    width?: number
    height?: number
  } | null>(null)
  const [drawingEdge, setDrawingEdge] = useState<{
    source: string
    currentX: number
    currentY: number
  } | null>(null)
  const [creatingShape, setCreatingShape] = useState<{
    type: string
    startX: number
    startY: number
    currentX: number
    currentY: number
  } | null>(null)
  const lastPan = useRef({ x: 0, y: 0 })

  const targetNodeId = searchParams.get('nodeId')
  useEffect(() => {
    if (targetNodeId && funnel.nodes.length > 0) {
      const node = funnel.nodes.find((n) => n.id === targetNodeId)
      if (node && boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect()
        setTransform({
          x: rect.width / 2 - node.x * 1.5 - 195,
          y: rect.height / 2 - node.y * 1.5 - 60,
          scale: 1.5,
        })
        setSelectedNode(node.id)
        setRightPanelState({ nodeId: node.id, tab: 'details' })
        searchParams.delete('nodeId')
        setSearchParams(searchParams, { replace: true })
      }
    }
  }, [targetNodeId, funnel.nodes, searchParams, setSearchParams])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      )
        return
      switch (e.key.toLowerCase()) {
        case '1':
        case 'v':
          setActiveTool('Select')
          break
        case '2':
          setActiveTool('Square')
          break
        case '3':
          setActiveTool('Diamond')
          break
        case '4':
          setActiveTool('Circle')
          break
        case 'h':
          setActiveTool('Pan')
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const newAsset: Asset = {
            id: `a_${Date.now()}_${Math.random()}`,
            projectId: funnel.projectId,
            name: 'Pasted Image ' + format(new Date(), 'HH:mm:ss'),
            url: 'https://img.usecurling.com/p/800/600?q=wireframe&color=gray',
            type: 'image',
            category: 'Upload',
            tags: ['pasted', 'canvas'],
            folderId: null,
          }
          setAssets((prev) => [newAsset, ...prev])

          const newNode: Node = {
            id: `n_${Date.now()}`,
            type: 'Image',
            x: -transform.x / transform.scale + 400,
            y: -transform.y / transform.scale + 200,
            data: {
              name: newAsset.url,
              status: '',
              subtitle: '',
              linkedAssetIds: [newAsset.id],
            },
          }
          onChange({ ...funnel, nodes: [...funnel.nodes, newNode] })
          toast({ title: 'Imagem colada no canvas!' })
        }
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [funnel, setAssets, transform, onChange, toast])

  useEffect(() => {
    const el = boardRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        setTransform((prev) => {
          let newScale = prev.scale * Math.exp(e.deltaY * -0.005)
          newScale = Math.min(Math.max(0.1, newScale), 3)
          const rect = el.getBoundingClientRect()
          const mouseX = e.clientX - rect.left,
            mouseY = e.clientY - rect.top
          return {
            x: mouseX - (mouseX - prev.x) * (newScale / prev.scale),
            y: mouseY - (mouseY - prev.y) * (newScale / prev.scale),
            scale: newScale,
          }
        })
      } else {
        setTransform((prev) => ({
          ...prev,
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }))
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const handlePointerDown = (e: React.PointerEvent) => {
    const isCanvasBg =
      e.target === boardRef.current ||
      (e.target as HTMLElement).classList.contains('canvas-container') ||
      (e.target as HTMLElement).tagName === 'svg'

    if (isCanvasBg) {
      if (['Square', 'Diamond', 'Circle'].includes(activeTool)) {
        const rect = boardRef.current?.getBoundingClientRect()
        if (!rect) return
        let x = (e.clientX - rect.left - transform.x) / transform.scale
        let y = (e.clientY - rect.top - transform.y) / transform.scale
        if (snapToGrid) {
          x = Math.round(x / 28) * 28
          y = Math.round(y / 28) * 28
        }
        setCreatingShape({
          type: activeTool,
          startX: x,
          startY: y,
          currentX: x,
          currentY: y,
        })
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        e.stopPropagation()
        return
      }

      if (activeTool === 'Select') {
        setSelectedNode(null)
        setSelectedEdge(null)
      }
    }

    if (activeTool === 'Pan' || e.button === 1) {
      setIsPanning(true)
      lastPan.current = { x: e.clientX, y: e.clientY }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      document.body.style.userSelect = 'none'
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (creatingShape) {
      const rect = boardRef.current?.getBoundingClientRect()
      if (!rect) return
      let x = (e.clientX - rect.left - transform.x) / transform.scale
      let y = (e.clientY - rect.top - transform.y) / transform.scale
      if (snapToGrid) {
        x = Math.round(x / 28) * 28
        y = Math.round(y / 28) * 28
      }
      setCreatingShape((prev) =>
        prev ? { ...prev, currentX: x, currentY: y } : null,
      )
      return
    }

    if (isPanning) {
      setTransform((prev) => ({
        ...prev,
        x: prev.x + (e.clientX - lastPan.current.x),
        y: prev.y + (e.clientY - lastPan.current.y),
      }))
      lastPan.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (creatingShape) {
      const width = Math.abs(creatingShape.currentX - creatingShape.startX)
      const height = Math.abs(creatingShape.currentY - creatingShape.startY)
      const x = Math.min(creatingShape.startX, creatingShape.currentX)
      const y = Math.min(creatingShape.startY, creatingShape.currentY)

      if (width > 10 && height > 10) {
        const newNodeId = `n_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        onChange({
          ...funnel,
          nodes: [
            ...funnel.nodes,
            {
              id: newNodeId,
              type: creatingShape.type,
              x,
              y,
              width,
              height,
              data: { name: '', status: '', subtitle: '' },
              style: { fill: 'transparent', stroke: '#1e293b', strokeWidth: 2 },
            },
          ],
        })
        setSelectedNode(newNodeId)
      }
      setCreatingShape(null)
      setActiveTool('Select')
      try {
        ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      } catch (err) {
        /* ignore */
      }
      return
    }

    if (isPanning) {
      setIsPanning(false)
      try {
        ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      } catch (err) {
        /* ignore */
      }
      document.body.style.userSelect = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('blockType')
    if (!type) return
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) return
    let x = (e.clientX - rect.left - transform.x) / transform.scale - 130
    let y = (e.clientY - rect.top - transform.y) / transform.scale - 40
    if (snapToGrid) {
      x = Math.round(x / 28) * 28
      y = Math.round(y / 28) * 28
    }
    onChange({
      ...funnel,
      nodes: [
        ...funnel.nodes,
        {
          id: `n_${Date.now()}`,
          type,
          x,
          y,
          data: { name: type, status: 'A Fazer', subtitle: '+1 filter' },
        },
      ],
    })
  }

  const handleEdgeDragStart = (nodeId: string, e: React.PointerEvent) => {
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) return
    const getCoords = (cx: number, cy: number) => ({
      x: (cx - rect.left - transform.x) / transform.scale,
      y: (cy - rect.top - transform.y) / transform.scale,
    })
    setDrawingEdge({ source: nodeId, ...getCoords(e.clientX, e.clientY) })

    const onMove = (ev: PointerEvent) => {
      const coords = getCoords(ev.clientX, ev.clientY)
      setDrawingEdge((prev) =>
        prev ? { ...prev, currentX: coords.x, currentY: coords.y } : null,
      )
    }
    const onUp = (ev: PointerEvent) => {
      const targetNodeEl = document
        .elementFromPoint(ev.clientX, ev.clientY)
        ?.closest('[data-node-id]')
      if (targetNodeEl) {
        const targetId = targetNodeEl.getAttribute('data-node-id')
        if (
          targetId &&
          targetId !== nodeId &&
          !funnel.edges.some(
            (edge) => edge.source === nodeId && edge.target === targetId,
          )
        ) {
          onChange({
            ...funnel,
            edges: [
              ...funnel.edges,
              { id: `e_${Date.now()}`, source: nodeId, target: targetId },
            ],
          })
        }
      }
      setDrawingEdge(null)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const handleAddChild = (parentId: string) => {
    const parent = funnel.nodes.find((n) => n.id === parentId)
    if (!parent) return
    const newId = `n_${Date.now()}`
    let newX = parent.x + 350,
      newY = parent.y
    if (snapToGrid) {
      newX = Math.round(newX / 28) * 28
      newY = Math.round(newY / 28) * 28
    }
    onChange({
      ...funnel,
      nodes: [
        ...funnel.nodes,
        {
          id: newId,
          type: 'Default',
          x: newX,
          y: newY,
          data: { name: 'New Step', status: 'A Fazer', subtitle: '+1 filter' },
        },
      ],
      edges: [
        ...funnel.edges,
        { id: `e_${Date.now()}`, source: parentId, target: newId },
      ],
    })
  }

  const handleDeleteNode = (id: string) => {
    onChange({
      ...funnel,
      nodes: funnel.nodes.filter((n) => n.id !== id),
      edges: funnel.edges.filter((e) => e.source !== id && e.target !== id),
    })
    if (rightPanelState?.nodeId === id) setRightPanelState(null)
    if (settingsNodeId === id) setSettingsNodeId(null)
    if (selectedNode === id) setSelectedNode(null)
  }

  const handleAddAnnotation = (type: 'Text' | 'Image', name: string) => {
    onChange({
      ...funnel,
      nodes: [
        ...funnel.nodes,
        {
          id: `n_${Date.now()}`,
          type,
          x: -transform.x / transform.scale + 400,
          y: -transform.y / transform.scale + 200,
          data: { name, status: '', subtitle: '' },
          style: type === 'Text' ? { color: '#1e293b' } : undefined,
        },
      ],
    })
  }

  const handleDropResource = (nodeId: string, type: string, id: string) => {
    const updatedNodes = funnel.nodes.map((n) => {
      if (n.id === nodeId) {
        const key =
          type === 'document'
            ? 'linkedDocumentIds'
            : type === 'task'
              ? 'linkedTaskIds'
              : 'linkedAssetIds'
        const currentIds = (n.data[key as keyof NodeData] as string[]) || []
        if (!currentIds.includes(id))
          return { ...n, data: { ...n.data, [key]: [...currentIds, id] } }
      }
      return n
    })
    onChange({ ...funnel, nodes: updatedNodes })

    if (type === 'document')
      setDocs(
        docs.map((d) =>
          d.id === id ? { ...d, funnelId: funnel.id, nodeId } : d,
        ),
      )
    else if (type === 'task')
      setTasks(
        tasks.map((t) =>
          t.id === id ? { ...t, funnelId: funnel.id, nodeId } : t,
        ),
      )
    else if (type === 'asset')
      setAssets(
        assets.map((a) =>
          a.id === id ? { ...a, funnelId: funnel.id, nodeId } : a,
        ),
      )
  }

  const updateEdgeStyle = (styleUpdates: Partial<Edge['style']>) => {
    if (selectedEdge) {
      onChange({
        ...funnel,
        edges: funnel.edges.map((e) =>
          e.id === selectedEdge
            ? { ...e, style: { ...e.style, ...styleUpdates } }
            : e,
        ),
      })
    }
  }

  const updateNodeStyle = (updates: Partial<Node['style']>) => {
    if (selectedNode) {
      onChange({
        ...funnel,
        nodes: funnel.nodes.map((n) =>
          n.id === selectedNode
            ? { ...n, style: { ...n.style, ...updates } }
            : n,
        ),
      })
    }
  }

  const rightOffset = rightPanelState ? 'right-[540px]' : 'right-6'
  const canvasTools = [
    { id: 'Select', icon: MousePointer2, label: 'Select (1)', key: '1' },
    { id: 'Pan', icon: Hand, label: 'Pan (H)', key: 'H' },
    { id: 'divider' },
    { id: 'Square', icon: Square, label: 'Square (2)', key: '2' },
    { id: 'Diamond', icon: Diamond, label: 'Diamond (3)', key: '3' },
    { id: 'Circle', icon: Circle, label: 'Circle (4)', key: '4' },
  ]

  const selectedNodeObj = funnel.nodes.find((n) => n.id === selectedNode)
  const selectedEdgeObj = funnel.edges.find((e) => e.id === selectedEdge)

  return (
    <div className="flex-1 flex relative overflow-hidden bg-[#f8fafc]">
      {!hideHeader && (
        <div className="absolute top-6 left-[340px] flex items-center gap-3 text-[14px] z-30 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <span
            className="text-slate-500 font-medium cursor-pointer hover:text-slate-800 transition-colors"
            onClick={() => navigate('/canvas')}
          >
            Campaigns
          </span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">{funnel.name}</span>
          <button className="text-slate-400 hover:text-purple-600 transition-colors ml-1">
            <Edit2 size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-6 left-6 z-30 bg-white/90 backdrop-blur-md shadow-sm border border-slate-100 rounded-full px-4 hover:bg-white text-slate-600 hover:text-slate-900"
          onClick={onBack}
        >
          <ArrowLeft size={16} className="mr-2" /> Voltar
        </Button>
      )}

      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center p-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-200 z-30 gap-1">
        {canvasTools.map((t) => {
          if (t.id === 'divider')
            return <div key={t.id} className="w-px h-6 bg-slate-200 mx-1" />
          return (
            <Tooltip key={t.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'w-10 h-10 rounded-full transition-all relative',
                    activeTool === t.id
                      ? 'bg-purple-100 text-purple-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
                  )}
                  onClick={() => setActiveTool(t.id as any)}
                >
                  <t.icon size={18} />
                  {t.key && t.id !== 'Pan' && (
                    <span className="absolute bottom-1 right-1.5 text-[9px] font-bold opacity-60">
                      {t.key}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.label}</TooltipContent>
            </Tooltip>
          )
        })}
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-700"
              onClick={() => handleAddAnnotation('Text', 'Add text here...')}
            >
              <Type size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Note</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-700"
              onClick={() =>
                handleAddAnnotation(
                  'Image',
                  'https://img.usecurling.com/p/400/300?q=marketing',
                )
              }
            >
              <ImageIcon size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Image</TooltipContent>
        </Tooltip>
      </div>

      <div
        className={cn(
          'absolute top-6 flex items-center p-1 bg-white/90 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-200 z-30 gap-1 transition-all duration-300',
          rightOffset,
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          onClick={() =>
            setTransform((p) => ({ ...p, scale: Math.max(0.1, p.scale - 0.1) }))
          }
        >
          <Minus size={16} />
        </Button>
        <button
          onClick={() => setTransform({ x: 400, y: 150, scale: 1 })}
          className="text-[13px] font-semibold text-slate-600 px-3 min-w-[3.5rem] hover:text-purple-600 transition-colors text-center"
        >
          {Math.round(transform.scale * 100)}%
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          onClick={() =>
            setTransform((p) => ({ ...p, scale: Math.min(3, p.scale + 0.1) }))
          }
        >
          <Plus size={16} />
        </Button>
      </div>

      <div
        className={cn(
          'absolute bottom-6 flex items-center gap-2 z-30 transition-all duration-300',
          rightOffset,
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={cn(
                'w-10 h-10 flex items-center justify-center bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-full text-slate-500 hover:text-slate-700 transition-all',
                snapToGrid && 'bg-purple-50 text-purple-600 border-purple-100',
              )}
            >
              <Grid size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Snap to Grid</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setShowMinimap(!showMinimap)}
              className={cn(
                'w-10 h-10 flex items-center justify-center bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-full text-slate-500 hover:text-slate-700 transition-all',
                showMinimap && 'bg-purple-50 text-purple-600 border-purple-100',
              )}
            >
              <Map size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Minimap</TooltipContent>
        </Tooltip>
      </div>

      <div
        className={cn(
          'absolute left-6 z-20 bottom-6 flex pointer-events-none transition-all',
          onBack ? 'top-[72px]' : 'top-6',
        )}
      >
        <div className="pointer-events-auto flex h-full">
          <BlockPalette funnel={funnel} />
        </div>
      </div>

      {showMinimap && (
        <div
          className={cn(
            'absolute bottom-20 transition-all duration-300 w-48 h-32 bg-white/90 backdrop-blur-md border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden z-30',
            rightOffset,
          )}
        >
          <div
            className="w-full h-full relative bg-slate-50/50"
            style={{ transform: 'scale(0.08)', transformOrigin: 'top left' }}
          >
            {funnel.nodes.map((n) => (
              <div
                key={n.id}
                className="absolute bg-slate-300 rounded-xl"
                style={{
                  left: n.x,
                  top: n.y,
                  width:
                    n.width ||
                    (n.type === 'Text' || n.type === 'Image' ? 200 : 260),
                  height: n.height || 100,
                }}
              />
            ))}
            <div
              className="absolute border-4 border-purple-500 bg-purple-500/10 rounded-xl"
              style={{
                left: -transform.x / transform.scale,
                top: -transform.y / transform.scale,
                width:
                  (boardRef.current?.clientWidth || 1000) / transform.scale,
                height:
                  (boardRef.current?.clientHeight || 800) / transform.scale,
              }}
            />
          </div>
        </div>
      )}

      {(selectedNodeObj || selectedEdgeObj) && (
        <div
          className={cn(
            'absolute top-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-200 p-5 w-[280px] flex flex-col gap-6 z-40 transition-all',
            rightPanelState ? 'right-[540px]' : 'right-6',
          )}
        >
          <div className="flex justify-between items-center">
            <h4 className="text-[12px] font-bold text-slate-800 tracking-widest uppercase">
              {selectedNodeObj
                ? selectedNodeObj.type === 'FloatingText'
                  ? 'Text Style'
                  : 'Shape Style'
                : 'Line Style'}
            </h4>
          </div>

          {selectedNodeObj &&
            ['Square', 'Diamond', 'Circle'].includes(selectedNodeObj.type) && (
              <>
                <div className="space-y-3">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Fill Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'transparent',
                      '#f8fafc',
                      '#fce7f3',
                      '#f3e8ff',
                      '#e0e7ff',
                      '#dbeafe',
                      '#d1fae5',
                      '#dcfce7',
                      '#fef9c3',
                      '#fef08a',
                      '#ffedd5',
                      '#fee2e2',
                    ].map((c) => (
                      <button
                        key={c}
                        className={cn(
                          'w-7 h-7 rounded-lg border-2 transition-transform',
                          selectedNodeObj.style?.fill === c ||
                            (c === 'transparent' &&
                              !selectedNodeObj.style?.fill)
                            ? 'border-slate-800 scale-110'
                            : 'border-slate-200 hover:scale-110',
                        )}
                        style={{
                          backgroundColor: c === 'transparent' ? '#fff' : c,
                          backgroundImage:
                            c === 'transparent'
                              ? 'radial-gradient(#e2e8f0 1px, transparent 0)'
                              : 'none',
                          backgroundSize: '4px 4px',
                        }}
                        onClick={() => updateNodeStyle({ fill: c })}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Stroke Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      '#1e293b',
                      '#64748b',
                      '#ef4444',
                      '#f97316',
                      '#f59e0b',
                      '#84cc16',
                      '#10b981',
                      '#06b6d4',
                      '#3b82f6',
                      '#6366f1',
                      '#a855f7',
                      '#ec4899',
                    ].map((c) => (
                      <button
                        key={c}
                        className={cn(
                          'w-7 h-7 rounded-lg border-2 transition-transform',
                          selectedNodeObj.style?.stroke === c ||
                            (c === '#1e293b' && !selectedNodeObj.style?.stroke)
                            ? 'border-slate-800 scale-110'
                            : 'border-transparent hover:scale-110',
                        )}
                        style={{ backgroundColor: c }}
                        onClick={() => updateNodeStyle({ stroke: c })}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Stroke Width
                  </label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="range"
                      min="1"
                      max="8"
                      step="1"
                      className="flex-1 accent-purple-500 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer"
                      value={selectedNodeObj.style?.strokeWidth || 2}
                      onChange={(e) =>
                        updateNodeStyle({
                          strokeWidth: parseInt(e.target.value),
                        })
                      }
                    />
                    <span className="text-[13px] font-medium text-slate-600 w-4 text-center">
                      {selectedNodeObj.style?.strokeWidth || 2}
                    </span>
                  </div>
                </div>
              </>
            )}

          {selectedNodeObj && selectedNodeObj.type === 'FloatingText' && (
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Text Color
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  '#1e293b',
                  '#64748b',
                  '#ef4444',
                  '#f97316',
                  '#f59e0b',
                  '#84cc16',
                  '#10b981',
                  '#06b6d4',
                  '#3b82f6',
                  '#6366f1',
                  '#a855f7',
                  '#ec4899',
                ].map((c) => (
                  <button
                    key={c}
                    className={cn(
                      'w-7 h-7 rounded-lg border-2 transition-transform',
                      selectedNodeObj.style?.color === c ||
                        (c === '#1e293b' && !selectedNodeObj.style?.color)
                        ? 'border-slate-800 scale-110'
                        : 'border-transparent hover:scale-110',
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => updateNodeStyle({ color: c })}
                  />
                ))}
              </div>
            </div>
          )}

          {selectedEdgeObj && (
            <>
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Stroke Style
                </label>
                <div className="flex gap-2">
                  <button
                    className={cn(
                      'flex-1 h-9 rounded-lg border-2 flex items-center justify-center transition-colors',
                      selectedEdgeObj.style?.strokeDasharray === 'none' ||
                        !selectedEdgeObj.style?.strokeDasharray
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-400',
                    )}
                    onClick={() => updateEdgeStyle({ strokeDasharray: 'none' })}
                  >
                    <svg width="24" height="2" className="overflow-visible">
                      <line
                        x1="0"
                        y1="1"
                        x2="24"
                        y2="1"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </button>
                  <button
                    className={cn(
                      'flex-1 h-9 rounded-lg border-2 flex items-center justify-center transition-colors',
                      selectedEdgeObj.style?.strokeDasharray === '8 8'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-400',
                    )}
                    onClick={() => updateEdgeStyle({ strokeDasharray: '8 8' })}
                  >
                    <svg width="24" height="2" className="overflow-visible">
                      <line
                        x1="0"
                        y1="1"
                        x2="24"
                        y2="1"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeDasharray="6 6"
                      />
                    </svg>
                  </button>
                  <button
                    className={cn(
                      'flex-1 h-9 rounded-lg border-2 flex items-center justify-center transition-colors',
                      selectedEdgeObj.style?.strokeDasharray === '4 4'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-400',
                    )}
                    onClick={() => updateEdgeStyle({ strokeDasharray: '4 4' })}
                  >
                    <svg width="24" height="2" className="overflow-visible">
                      <line
                        x1="0"
                        y1="1"
                        x2="24"
                        y2="1"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeDasharray="2 4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Line Thickness
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    className="flex-1 accent-purple-500 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer"
                    value={selectedEdgeObj.style?.strokeWidth || 2}
                    onChange={(e) =>
                      updateEdgeStyle({ strokeWidth: parseInt(e.target.value) })
                    }
                  />
                  <span className="text-[13px] font-medium text-slate-600 w-4 text-center">
                    {selectedEdgeObj.style?.strokeWidth || 2}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    '#cbd5e1',
                    '#a855f7',
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#1e293b',
                  ].map((c) => (
                    <button
                      key={c}
                      className={cn(
                        'w-7 h-7 rounded-lg border-2 transition-transform',
                        selectedEdgeObj.style?.stroke === c ||
                          (c === '#cbd5e1' && !selectedEdgeObj.style?.stroke)
                          ? 'border-slate-800 scale-110'
                          : 'border-transparent hover:scale-110',
                      )}
                      style={{ backgroundColor: c }}
                      onClick={() => updateEdgeStyle({ stroke: c })}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div
        ref={boardRef}
        className={cn(
          'flex-1 relative canvas-container overflow-hidden',
          activeTool === 'Pan'
            ? isPanning
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : activeTool !== 'Select'
              ? 'cursor-crosshair'
              : '',
        )}
        style={{
          backgroundPosition: `${transform.x}px ${transform.y}px`,
          backgroundSize: `${28 * transform.scale}px ${28 * transform.scale}px`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onDoubleClick={(e) => {
          const target = e.target as HTMLElement
          const isBg =
            target === boardRef.current ||
            target.classList.contains('canvas-container') ||
            target.tagName === 'svg'

          if (isBg && activeTool === 'Select') {
            const rect = boardRef.current?.getBoundingClientRect()
            if (!rect) return
            let x = (e.clientX - rect.left - transform.x) / transform.scale - 50
            let y = (e.clientY - rect.top - transform.y) / transform.scale - 15
            if (snapToGrid) {
              x = Math.round(x / 28) * 28
              y = Math.round(y / 28) * 28
            }
            const newNodeId = `n_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            onChange({
              ...funnel,
              nodes: [
                ...funnel.nodes,
                {
                  id: newNodeId,
                  type: 'FloatingText',
                  x,
                  y,
                  data: { name: 'New Text', status: '', subtitle: '' },
                  style: { color: '#1e293b' },
                },
              ],
            })
            setSelectedNode(newNodeId)
          }
        }}
      >
        <div
          style={{
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
            transformOrigin: '0 0',
          }}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <svg className="absolute inset-0 w-full h-full overflow-visible z-0 pointer-events-none">
            {funnel.edges.map((e) => {
              const sourceNode = funnel.nodes.find((n) => n.id === e.source)
              const targetNode = funnel.nodes.find((n) => n.id === e.target)
              if (!sourceNode || !targetNode) return null
              const isSelected = selectedEdge === e.id

              const sX =
                draggedNode?.id === e.source ? draggedNode.x : sourceNode.x
              const sY =
                draggedNode?.id === e.source ? draggedNode.y : sourceNode.y
              const sourceCoords = getRightPortCoords(
                draggedNode?.id === e.source
                  ? {
                      ...sourceNode,
                      width: draggedNode.width ?? sourceNode.width,
                      height: draggedNode.height ?? sourceNode.height,
                    }
                  : sourceNode,
                sX,
                sY,
              )

              const tX =
                draggedNode?.id === e.target ? draggedNode.x : targetNode.x
              const tY =
                draggedNode?.id === e.target ? draggedNode.y : targetNode.y
              const targetCoords = getLeftPortCoords(
                draggedNode?.id === e.target
                  ? {
                      ...targetNode,
                      width: draggedNode.width ?? targetNode.width,
                      height: draggedNode.height ?? targetNode.height,
                    }
                  : targetNode,
                tX,
                tY,
              )

              const d = `M ${sourceCoords.x} ${sourceCoords.y} C ${sourceCoords.x + 50} ${sourceCoords.y}, ${targetCoords.x - 50} ${targetCoords.y}, ${targetCoords.x} ${targetCoords.y}`

              const strokeColor =
                e.style?.stroke || (isSelected ? '#a855f7' : '#cbd5e1')
              const strokeWidth = e.style?.strokeWidth || (isSelected ? 3 : 2)
              const strokeDasharray = e.style?.strokeDasharray || 'none'

              return (
                <path
                  key={e.id}
                  d={d}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  fill="none"
                  className="transition-colors cursor-pointer hover:stroke-slate-400 pointer-events-auto"
                  onClick={(ev) => {
                    ev.stopPropagation()
                    if (activeTool === 'Select') {
                      setSelectedEdge(e.id)
                      setSelectedNode(null)
                    }
                  }}
                />
              )
            })}
            {drawingEdge &&
              (() => {
                const sNode = funnel.nodes.find(
                  (n) => n.id === drawingEdge.source,
                )
                if (!sNode) return null
                const sourceCoords = getRightPortCoords(sNode, sNode.x, sNode.y)
                return (
                  <path
                    d={`M ${sourceCoords.x} ${sourceCoords.y} C ${sourceCoords.x + 50} ${sourceCoords.y}, ${drawingEdge.currentX - 50} ${drawingEdge.currentY}, ${drawingEdge.currentX} ${drawingEdge.currentY}`}
                    stroke="#a855f7"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                  />
                )
              })()}
            {creatingShape &&
              (() => {
                const w = Math.abs(
                  creatingShape.currentX - creatingShape.startX,
                )
                const h = Math.abs(
                  creatingShape.currentY - creatingShape.startY,
                )
                const x = Math.min(creatingShape.startX, creatingShape.currentX)
                const y = Math.min(creatingShape.startY, creatingShape.currentY)

                if (creatingShape.type === 'Square')
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      rx={8}
                      fill="rgba(168, 85, 247, 0.1)"
                      stroke="#a855f7"
                      strokeWidth={2 / transform.scale}
                      strokeDasharray="4 4"
                    />
                  )
                if (creatingShape.type === 'Circle')
                  return (
                    <ellipse
                      cx={x + w / 2}
                      cy={y + h / 2}
                      rx={w / 2}
                      ry={h / 2}
                      fill="rgba(168, 85, 247, 0.1)"
                      stroke="#a855f7"
                      strokeWidth={2 / transform.scale}
                      strokeDasharray="4 4"
                    />
                  )
                if (creatingShape.type === 'Diamond')
                  return (
                    <polygon
                      points={`${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`}
                      fill="rgba(168, 85, 247, 0.1)"
                      stroke="#a855f7"
                      strokeWidth={2 / transform.scale}
                      strokeDasharray="4 4"
                      strokeLinejoin="round"
                    />
                  )
              })()}
          </svg>

          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {funnel.nodes.map((n) => {
              const nodeTasks = tasks.filter((t) =>
                n.data.linkedTaskIds?.includes(t.id),
              )
              let total = 0
              let completed = 0
              nodeTasks.forEach((t) => {
                if (t.subtasks && t.subtasks.length > 0) {
                  total += t.subtasks.length
                  completed += t.subtasks.filter((s) => s.isCompleted).length
                } else {
                  total += 1
                  if (t.status === 'Concluído') completed += 1
                }
              })
              const taskProgress = { total, completed }

              return (
                <NodeItem
                  key={n.id}
                  node={
                    draggedNode?.id === n.id
                      ? {
                          ...n,
                          x: draggedNode.x,
                          y: draggedNode.y,
                          width: draggedNode.width ?? n.width,
                          height: draggedNode.height ?? n.height,
                        }
                      : n
                  }
                  selected={selectedNode === n.id}
                  snapToGrid={snapToGrid}
                  activeTool={activeTool}
                  taskProgress={taskProgress}
                  onSelect={() => {
                    setSelectedNode(n.id)
                    setSelectedEdge(null)
                  }}
                  onMoveStart={() =>
                    setDraggedNode({
                      id: n.id,
                      x: n.x,
                      y: n.y,
                      width: n.width,
                      height: n.height,
                    })
                  }
                  onMove={(x, y) =>
                    setDraggedNode((prev) =>
                      prev
                        ? { ...prev, x, y }
                        : { id: n.id, x, y, width: n.width, height: n.height },
                    )
                  }
                  onMoveEnd={(x, y) => {
                    setDraggedNode(null)
                    onChange({
                      ...funnel,
                      nodes: funnel.nodes.map((node) =>
                        node.id === n.id ? { ...node, x, y } : node,
                      ),
                    })
                  }}
                  onResize={(x, y, w, h) =>
                    setDraggedNode({ id: n.id, x, y, width: w, height: h })
                  }
                  onResizeEnd={(x, y, w, h) => {
                    setDraggedNode(null)
                    onChange({
                      ...funnel,
                      nodes: funnel.nodes.map((node) =>
                        node.id === n.id
                          ? { ...node, x, y, width: w, height: h }
                          : node,
                      ),
                    })
                  }}
                  onAddChild={() => handleAddChild(n.id)}
                  onDelete={() => handleDeleteNode(n.id)}
                  onOpenRightPanel={(tab) =>
                    setRightPanelState({ nodeId: n.id, tab })
                  }
                  onOpenSettings={() => setSettingsNodeId(n.id)}
                  onToggleComplete={() =>
                    onChange({
                      ...funnel,
                      nodes: funnel.nodes.map((node) =>
                        node.id === n.id
                          ? {
                              ...node,
                              data: {
                                ...node.data,
                                isCompleted: !node.data.isCompleted,
                              },
                            }
                          : node,
                      ),
                    })
                  }
                  scale={transform.scale}
                  onTextChange={(text) =>
                    onChange({
                      ...funnel,
                      nodes: funnel.nodes.map((node) =>
                        node.id === n.id
                          ? { ...node, data: { ...node.data, name: text } }
                          : node,
                      ),
                    })
                  }
                  onEdgeDragStart={handleEdgeDragStart}
                  onDropResource={(type, id) =>
                    handleDropResource(n.id, type, id)
                  }
                />
              )
            })}
          </div>
        </div>
      </div>

      {rightPanelState &&
        funnel.nodes.find((n) => n.id === rightPanelState.nodeId) && (
          <RightPanel
            node={funnel.nodes.find((n) => n.id === rightPanelState.nodeId)!}
            funnel={funnel}
            defaultTab={rightPanelState.tab}
            onChange={(n) =>
              onChange({
                ...funnel,
                nodes: funnel.nodes.map((node) =>
                  node.id === n.id ? n : node,
                ),
              })
            }
            onClose={() => setRightPanelState(null)}
          />
        )}
      <NodeSettingsModal
        node={
          settingsNodeId
            ? funnel.nodes.find((n) => n.id === settingsNodeId) || null
            : null
        }
        isOpen={!!settingsNodeId}
        onClose={() => setSettingsNodeId(null)}
        onSave={(id, updates) => {
          onChange({
            ...funnel,
            nodes: funnel.nodes.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, ...updates } } : n,
            ),
          })
          setSettingsNodeId(null)
        }}
      />
    </div>
  )
}
