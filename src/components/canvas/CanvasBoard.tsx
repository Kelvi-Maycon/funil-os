import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Funnel, Node, Edge, NodeData } from '@/types'
import BlockPalette from './BlockPalette'
import NodeItem from './NodeItem'
import RightPanel from './RightPanel'
import { NodeSettingsModal } from './NodeSettingsModal'
import {
  Plus,
  Minus,
  Maximize,
  Map,
  Grid,
  Edit2,
  Image as ImageIcon,
  FileText,
  MousePointer2,
  Hand,
  Type,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

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
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
  const [notesNodeId, setNotesNodeId] = useState<string | null>(null)
  const [settingsNodeId, setSettingsNodeId] = useState<string | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  const [transform, setTransform] = useState({ x: 400, y: 150, scale: 1 })
  const [isPanning, setIsPanning] = useState(false)
  const [isPanMode, setIsPanMode] = useState(false)
  const [showMinimap, setShowMinimap] = useState(false)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [draggedNode, setDraggedNode] = useState<{
    id: string
    x: number
    y: number
  } | null>(null)
  const [drawingEdge, setDrawingEdge] = useState<{
    source: string
    currentX: number
    currentY: number
  } | null>(null)
  const lastPan = useRef({ x: 0, y: 0 })

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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      )
        return
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedNode) handleDeleteNode(selectedNode)
        else if (selectedEdge) {
          onChange({
            ...funnel,
            edges: funnel.edges.filter((edge) => edge.id !== selectedEdge),
          })
          setSelectedEdge(null)
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedNode, selectedEdge, funnel, onChange])

  const handlePanStart = (e: React.PointerEvent) => {
    if (
      isPanMode ||
      e.button === 1 ||
      e.target === boardRef.current ||
      (e.target as HTMLElement).classList.contains('canvas-container') ||
      (e.target as HTMLElement).tagName === 'svg'
    ) {
      setIsPanning(true)
      lastPan.current = { x: e.clientX, y: e.clientY }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      document.body.style.userSelect = 'none'
    }
  }

  const handlePanMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setTransform((prev) => ({
        ...prev,
        x: prev.x + (e.clientX - lastPan.current.x),
        y: prev.y + (e.clientY - lastPan.current.y),
      }))
      lastPan.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handlePanEnd = (e: React.PointerEvent) => {
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
    if (notesNodeId === id) setNotesNodeId(null)
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
        },
      ],
    })
  }

  const rightOffset = notesNodeId ? 'right-[520px]' : 'right-6'

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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'w-10 h-10 rounded-full transition-all',
                !isPanMode
                  ? 'bg-purple-100 text-purple-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              )}
              onClick={() => setIsPanMode(false)}
            >
              <MousePointer2 size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Select (V)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'w-10 h-10 rounded-full transition-all',
                isPanMode
                  ? 'bg-purple-100 text-purple-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              )}
              onClick={() => setIsPanMode(true)}
            >
              <Hand size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Pan (H)</TooltipContent>
        </Tooltip>
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
          <TooltipContent>Add Text</TooltipContent>
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
          <BlockPalette />
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
                  width: n.type === 'Text' || n.type === 'Image' ? 200 : 260,
                  height: 100,
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

      <div
        ref={boardRef}
        className={cn(
          'flex-1 relative canvas-container overflow-hidden',
          isPanMode ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : '',
        )}
        style={{
          backgroundPosition: `${transform.x}px ${transform.y}px`,
          backgroundSize: `${28 * transform.scale}px ${28 * transform.scale}px`,
        }}
        onPointerDown={handlePanStart}
        onPointerMove={handlePanMove}
        onPointerUp={handlePanEnd}
        onPointerLeave={handlePanEnd}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={(e) => {
          if (
            e.target === boardRef.current ||
            (e.target as HTMLElement).classList.contains('canvas-container') ||
            (e.target as HTMLElement).tagName === 'svg'
          ) {
            setSelectedNode(null)
            setSelectedEdge(null)
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
                (draggedNode?.id === e.source ? draggedNode.x : sourceNode.x) +
                260
              const sY =
                (draggedNode?.id === e.source ? draggedNode.y : sourceNode.y) +
                44
              const tX =
                draggedNode?.id === e.target ? draggedNode.x : targetNode.x
              const tY =
                (draggedNode?.id === e.target ? draggedNode.y : targetNode.y) +
                44
              const d = `M ${sX} ${sY} C ${sX + 50} ${sY}, ${tX - 50} ${tY}, ${tX} ${tY}`
              return (
                <path
                  key={e.id}
                  d={d}
                  stroke={isSelected ? '#a855f7' : '#cbd5e1'}
                  strokeWidth={isSelected ? '3' : '2'}
                  fill="none"
                  className="transition-colors cursor-pointer hover:stroke-slate-400 pointer-events-auto"
                  onClick={(ev) => {
                    ev.stopPropagation()
                    setSelectedEdge(e.id)
                    setSelectedNode(null)
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
                const sX = sNode.x + 260,
                  sY = sNode.y + 44
                return (
                  <path
                    d={`M ${sX} ${sY} C ${sX + 50} ${sY}, ${drawingEdge.currentX - 50} ${drawingEdge.currentY}, ${drawingEdge.currentX} ${drawingEdge.currentY}`}
                    stroke="#a855f7"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                  />
                )
              })()}
          </svg>

          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {funnel.nodes.map((n) => (
              <NodeItem
                key={n.id}
                node={
                  draggedNode?.id === n.id
                    ? { ...n, x: draggedNode.x, y: draggedNode.y }
                    : n
                }
                selected={selectedNode === n.id}
                snapToGrid={snapToGrid}
                isPanMode={isPanMode}
                onSelect={() => {
                  setSelectedNode(n.id)
                  setSelectedEdge(null)
                }}
                onMoveStart={() => setDraggedNode({ id: n.id, x: n.x, y: n.y })}
                onMove={(x, y) => setDraggedNode({ id: n.id, x, y })}
                onMoveEnd={(x, y) => {
                  setDraggedNode(null)
                  onChange({
                    ...funnel,
                    nodes: funnel.nodes.map((node) =>
                      node.id === n.id ? { ...node, x, y } : node,
                    ),
                  })
                }}
                onAddChild={() => handleAddChild(n.id)}
                onDelete={() => handleDeleteNode(n.id)}
                onOpenNotes={() => setNotesNodeId(n.id)}
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
              />
            ))}
          </div>
        </div>
      </div>

      {notesNodeId && funnel.nodes.find((n) => n.id === notesNodeId) && (
        <RightPanel
          node={funnel.nodes.find((n) => n.id === notesNodeId)!}
          onChange={(n) =>
            onChange({
              ...funnel,
              nodes: funnel.nodes.map((node) => (node.id === n.id ? n : node)),
            })
          }
          onClose={() => setNotesNodeId(null)}
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
