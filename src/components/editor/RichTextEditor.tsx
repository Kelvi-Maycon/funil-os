import { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Document, Funnel } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  Quote,
  SeparatorHorizontal,
  Image as ImageIcon,
  Network,
  X,
  GripVertical,
  PanelLeftClose,
  PanelLeft,
  Table,
  Plus,
  Trash2,
  ArrowRightFromLine,
  ArrowLeftFromLine,
  ArrowDownFromLine,
  ArrowUpFromLine,
  ExternalLink,
  Download,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useFunnelStore from '@/stores/useFunnelStore'
import useProjectStore from '@/stores/useProjectStore'
import CanvasBoard from '@/components/canvas/CanvasBoard'
import { cn } from '@/lib/utils'

const getCanvasPreviewInnerHtml = (canvas: Funnel) => {
  const nodes = canvas.nodes
  const edges = canvas.edges

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity
  nodes.forEach((n) => {
    if (n.x < minX) minX = n.x
    if (n.x + 280 > maxX) maxX = n.x + 280
    if (n.y < minY) minY = n.y
    if (n.y + 74 > maxY) maxY = n.y + 74
  })

  const containerWidth = 600
  const containerHeight = 240

  if (nodes.length === 0) {
    minX = 0
    maxX = containerWidth
    minY = 0
    maxY = containerHeight
  }

  const padding = 24
  const contentWidth = maxX - minX || containerWidth
  const contentHeight = maxY - minY || containerHeight

  const scale = Math.min(
    (containerWidth - padding * 2) / contentWidth,
    (containerHeight - padding * 2) / contentHeight,
    1,
  )

  const xOffset = (containerWidth - contentWidth * scale) / 2 - minX * scale
  const yOffset = (containerHeight - contentHeight * scale) / 2 - minY * scale

  const nodesHtml = nodes
    .map((n) => {
      const left = n.x * scale + xOffset
      const top = n.y * scale + yOffset
      const width = 280 * scale
      const height = 74 * scale
      return `<div style="position: absolute; left: ${left}px; top: ${top}px; width: ${width}px; height: ${height}px; background: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: ${8 * scale}px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); display: flex; align-items: center; padding: ${8 * scale}px; box-sizing: border-box; overflow: hidden; pointer-events: none;">
      <div style="flex-shrink: 0; width: ${24 * scale}px; height: ${24 * scale}px; background: hsl(var(--muted)); border-radius: ${6 * scale}px; margin-right: ${10 * scale}px; border: 1px solid hsl(var(--border)); display: flex; align-items: center; justify-content: center; color: hsl(var(--muted-foreground));">
        <svg xmlns="http://www.w3.org/2000/svg" width="${14 * scale}" height="${14 * scale}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>
      </div>
      <div style="min-width: 0; flex: 1;">
         <div style="font-size: ${12 * scale}px; font-weight: 600; color: hsl(var(--foreground)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;">${n.data.name}</div>
         <div style="font-size: ${10 * scale}px; color: hsl(var(--muted-foreground)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: ${2 * scale}px;">${n.data.subtitle || 'Configure this step'}</div>
      </div>
    </div>`
    })
    .join('')

  const edgesHtml = edges
    .map((e) => {
      const sourceNode = nodes.find((n) => n.id === e.source)
      const targetNode = nodes.find((n) => n.id === e.target)
      if (!sourceNode || !targetNode) return ''

      const startX = (sourceNode.x + 280) * scale + xOffset
      const startY = (sourceNode.y + 37) * scale + yOffset
      const endX = targetNode.x * scale + xOffset
      const endY = (targetNode.y + 37) * scale + yOffset

      const d = `M ${startX} ${startY} C ${startX + 30 * scale} ${startY}, ${endX - 30 * scale} ${endY}, ${endX} ${endY}`

      return `<path d="${d}" stroke="hsl(var(--border))" stroke-width="${2 * scale}" fill="none" pointer-events="none" />`
    })
    .join('')

  const isEmpty = nodes.length === 0
  const emptyStateHtml = isEmpty
    ? `
    <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: hsl(var(--muted-foreground)); pointer-events: none;">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 8px; opacity: 0.5;"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 17V7h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2z"/></svg>
      <span style="font-size: 13px; font-weight: 500;">Canvas vazio</span>
    </div>
  `
    : ''

  return `
    <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: hsl(var(--foreground)); font-family: inherit; line-height: 1; pointer-events: none;">${canvas.name}</h4>
    <div class="border border-border bg-muted/20 rounded-xl overflow-hidden shadow-sm cursor-pointer transition-all hover:border-primary/40 hover:shadow-md ring-offset-background hover:ring-1 hover:ring-primary/20" style="width: 100%; max-width: 600px; height: ${containerHeight}px; position: relative;">
      <div style="position: absolute; inset: 0; background-image: radial-gradient(hsl(var(--border)) 1px, transparent 0); background-size: 16px 16px; opacity: 0.4; pointer-events: none;"></div>
      ${emptyStateHtml}
      <svg style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;">
        ${edgesHtml}
      </svg>
      ${nodesHtml}
      <div class="absolute inset-0 flex items-center justify-center gap-3 bg-background/60 backdrop-blur-[2px] opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
         <div data-action="preview" class="bg-card px-4 py-2 rounded-xl shadow-lg text-sm font-semibold text-foreground flex items-center gap-2 transform translate-y-2 transition-all hover:bg-muted border border-border cursor-pointer pointer-events-auto group-hover:translate-y-0">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
           Visualizar Lateral
         </div>
         <div data-action="navigate" class="bg-primary px-4 py-2 rounded-xl shadow-lg text-sm font-semibold text-primary-foreground flex items-center gap-2 transform translate-y-2 transition-all hover:brightness-110 border border-primary cursor-pointer pointer-events-auto group-hover:translate-y-0">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/><path d="m21 3-9 9"/><path d="M15 3h6v6"/></svg>
           Ir até o Canvas
         </div>
      </div>
    </div>
  `
}

export default function RichTextEditor({
  doc,
  onChange,
  onTitleChange,
  onProjectChange,
}: {
  doc: Document
  onChange: (c: string) => void
  onTitleChange: (t: string) => void
  onProjectChange: (p: string | null) => void
}) {
  const navigate = useNavigate()
  const editorRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [funnels, setFunnels] = useFunnelStore()
  const [projects] = useProjectStore()
  const [canvasModalOpen, setCanvasModalOpen] = useState(false)
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [savedRange, setSavedRange] = useState<Range | null>(null)
  const [editingCanvasId, setEditingCanvasId] = useState<string | null>(null)
  const [isOutlineOpen, setIsOutlineOpen] = useState(true)
  const [activeTableNode, setActiveTableNode] = useState<HTMLTableElement | null>(null)
  const [activeTableCell, setActiveTableCell] = useState<HTMLTableCellElement | null>(null)

  // Header outline state
  const [headers, setHeaders] = useState<{ id: string; text: string; level: number }[]>([])

  const extractHeaders = useCallback(() => {
    if (!editorRef.current) return
    const headerElements = editorRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const extracted: { id: string; text: string; level: number }[] = []

    headerElements.forEach((el, index) => {
      // Ensure element has an ID for anchoring
      if (!el.id) {
        el.id = `header-${index}-${Date.now()}`
      }
      extracted.push({
        id: el.id,
        text: el.textContent || 'Sem Título',
        level: parseInt(el.tagName.replace('H', ''), 10)
      })
    })

    setHeaders(extracted)
  }, [])

  const [panelWidth, setPanelWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1280) return 600
      if (window.innerWidth >= 1024) return 500
      return 450
    }
    return 500
  })
  const [isResizing, setIsResizing] = useState(false)
  const isResizingRef = useRef(false)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== doc.content) {
      editorRef.current.innerHTML = doc.content

      let hasChanges = false
      const blocks = editorRef.current.querySelectorAll('.canvas-preview-block')
      blocks.forEach((block) => {
        const canvasId = block.getAttribute('data-canvas-id')
        if (canvasId) {
          const canvas = funnels.find((f) => f.id === canvasId)
          if (canvas) {
            block.setAttribute(
              'style',
              'margin: 32px 0; user-select: none; display: flex; flex-direction: column; align-items: flex-start;',
            )
            const newInnerHtml = getCanvasPreviewInnerHtml(canvas)
            if (block.innerHTML !== newInnerHtml) {
              block.innerHTML = newInnerHtml
              hasChanges = true
            }
          }
        }
      })

      if (hasChanges) {
        onChange(editorRef.current.innerHTML)
      }
      extractHeaders()
    }
  }, [doc.id, doc.content])

  const saveSelection = useCallback(() => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      if (
        editorRef.current &&
        editorRef.current.contains(range.commonAncestorContainer)
      ) {
        setSavedRange(range.cloneRange())

        // Check for active table cell
        let node = range.commonAncestorContainer as Node | null
        if (node?.nodeType === Node.TEXT_NODE) {
          node = node.parentNode
        }

        const cell = (node as Element)?.closest?.('td, th') as HTMLTableCellElement | null
        const table = (node as Element)?.closest?.('table') as HTMLTableElement | null

        setActiveTableCell(cell)
        setActiveTableNode(table)
      } else {
        setActiveTableCell(null)
        setActiveTableNode(null)
      }
    }
  }, [])

  const restoreSelection = useCallback(() => {
    editorRef.current?.focus()
    if (savedRange) {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(savedRange)
      }
    } else {
      if (editorRef.current) {
        const range = document.createRange()
        range.selectNodeContents(editorRef.current)
        range.collapse(false)
        const selection = window.getSelection()
        if (selection) {
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    }
  }, [savedRange])

  const insertHtmlAtSelection = (htmlString: string) => {
    restoreSelection()

    let success = false
    try {
      success = document.execCommand('insertHTML', false, htmlString)
    } catch (e) {
      success = false
    }

    if (!success) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()

        const el = document.createElement('div')
        el.innerHTML = htmlString

        const frag = document.createDocumentFragment()
        let node, lastNode
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node)
        }

        range.insertNode(frag)

        if (lastNode) {
          range.setStartAfter(lastNode)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    }

    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val)
    editorRef.current?.focus()
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const insertImage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrl.trim()) return
    insertHtmlAtSelection(
      `<img src="${imageUrl}" alt="Imagem Inserida" style="max-width: 100%; border-radius: 8px; margin: 16px 0;" /><p><br></p>`,
    )
    setImageUrl('')
    setImageModalOpen(false)
  }

  const insertCanvas = () => {
    if (!selectedCanvasId) return
    const canvas = funnels.find((f) => f.id === selectedCanvasId)
    if (!canvas) return

    const html = `
      <div contenteditable="false" class="canvas-preview-block group" data-canvas-id="${canvas.id}" style="margin: 32px 0; user-select: none; display: flex; flex-direction: column; align-items: flex-start;">
        ${getCanvasPreviewInnerHtml(canvas)}
      </div>
      <p><br></p>
    `

    insertHtmlAtSelection(html)

    setCanvasModalOpen(false)
    setSelectedCanvasId(null)
  }

  const handleToolbarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement

    // Canvas Preview clicks
    const canvasBlock = target.closest('.canvas-preview-block')
    if (canvasBlock) {
      e.preventDefault()
      const canvasId = canvasBlock.getAttribute('data-canvas-id')
      if (canvasId) {
        const actionBtn = target.closest('[data-action]')
        const action = actionBtn?.getAttribute('data-action')

        if (action === 'navigate') {
          navigate(`/canvas/${canvasId}`)
        } else {
          setEditingCanvasId(canvasId)
        }
      }
    }

    // Check table selection immediately on click
    let node = target as Element | null
    const cell = node?.closest?.('td, th') as HTMLTableCellElement | null
    const table = node?.closest?.('table') as HTMLTableElement | null
    setActiveTableCell(cell)
    setActiveTableNode(table)
  }

  // Table Operations
  const insertTable = () => {
    const tableHtml = `
      <table class="w-full border-collapse border border-border my-4 shadow-sm rounded-lg overflow-hidden bg-card text-sm">
        <thead>
          <tr class="bg-muted/50 border-b border-border">
            <th class="border border-border p-3 text-left font-semibold">Cabeçalho 1</th>
            <th class="border border-border p-3 text-left font-semibold">Cabeçalho 2</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-border">
            <td class="border border-border p-3">Linha 1, Col 1</td>
            <td class="border border-border p-3">Linha 1, Col 2</td>
          </tr>
          <tr class="border-b border-border">
            <td class="border border-border p-3">Linha 2, Col 1</td>
            <td class="border border-border p-3">Linha 2, Col 2</td>
          </tr>
        </tbody>
      </table>
      <p><br/></p>
    `
    insertHtmlAtSelection(tableHtml)
  }

  const addRow = (direction: 'above' | 'below') => {
    if (!activeTableCell || !activeTableNode) return
    const tr = activeTableCell.closest('tr')
    if (!tr) return

    const newTr = document.createElement('tr')
    newTr.className = "border-b border-border"
    const cellCount = tr.children.length

    for (let i = 0; i < cellCount; i++) {
      const td = document.createElement('td')
      td.className = "border border-border p-3"
      td.innerHTML = "<br/>"
      newTr.appendChild(td)
    }

    if (direction === 'above') {
      tr.parentNode?.insertBefore(newTr, tr)
    } else {
      tr.parentNode?.insertBefore(newTr, tr.nextSibling)
    }
    onChange(editorRef.current!.innerHTML)
  }

  const addColumn = (direction: 'left' | 'right') => {
    if (!activeTableCell || !activeTableNode) return
    const tr = activeTableCell.closest('tr')
    if (!tr) return

    const cellIndex = Array.from(tr.children).indexOf(activeTableCell)
    const rows = activeTableNode.querySelectorAll('tr')

    rows.forEach(row => {
      const isHeader = row.parentNode?.nodeName.toLowerCase() === 'thead'
      const cell = document.createElement(isHeader ? 'th' : 'td')
      cell.className = isHeader
        ? "border border-border p-3 text-left font-semibold"
        : "border border-border p-3"
      cell.innerHTML = "<br/>"

      const targetCell = row.children[cellIndex]
      if (targetCell) {
        if (direction === 'left') {
          row.insertBefore(cell, targetCell)
        } else {
          row.insertBefore(cell, targetCell.nextSibling)
        }
      }
    })
    onChange(editorRef.current!.innerHTML)
  }

  const deleteRow = () => {
    if (!activeTableCell || !activeTableNode) return
    const tr = activeTableCell.closest('tr')
    if (!tr) return

    if (activeTableNode.querySelectorAll('tr').length <= 2) {
      // Avoid deleting the last row of the body
      return deleteTable()
    }

    tr.remove()
    setActiveTableCell(null)
    onChange(editorRef.current!.innerHTML)
  }

  const deleteColumn = () => {
    if (!activeTableCell || !activeTableNode) return
    const tr = activeTableCell.closest('tr')
    if (!tr) return

    if (tr.children.length <= 1) {
      return deleteTable()
    }

    const cellIndex = Array.from(tr.children).indexOf(activeTableCell)
    const rows = activeTableNode.querySelectorAll('tr')

    rows.forEach(row => {
      const targetCell = row.children[cellIndex]
      if (targetCell) {
        targetCell.remove()
      }
    })
    setActiveTableCell(null)
    onChange(editorRef.current!.innerHTML)
  }

  const deleteTable = () => {
    if (!activeTableNode) return
    activeTableNode.remove()
    setActiveTableNode(null)
    setActiveTableCell(null)
    onChange(editorRef.current!.innerHTML)
  }

  const insertNewGuide = () => {
    const pageBreakHtml = `
      <div contenteditable="false" style="margin: 80px -40px; height: 32px; background: #f8fafc; border-top: 1px dashed #cbd5e1; border-bottom: 1px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; user-select: none;">
         <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; font-weight: 600;">Nova Seção</span>
      </div>
      <h2>Nova Guia</h2>
      <p><br/></p>
    `
    insertHtmlAtSelection(pageBreakHtml)

    setTimeout(() => {
      if (editorRef.current) {
        const h2s = editorRef.current.querySelectorAll('h2')
        const lastH2 = h2s[h2s.length - 1]
        if (lastH2) {
          const selection = window.getSelection()
          const range = document.createRange()
          range.selectNodeContents(lastH2)
          selection?.removeAllRanges()
          selection?.addRange(range)
          lastH2.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }, 50)
  }

  const handleCanvasChange = (updatedFunnel: Funnel) => {
    setFunnels(
      funnels.map((f) => (f.id === updatedFunnel.id ? updatedFunnel : f)),
    )

    if (editorRef.current) {
      let hasChanges = false
      const blocks = editorRef.current.querySelectorAll(
        `.canvas-preview-block[data-canvas-id="${updatedFunnel.id}"]`,
      )
      blocks.forEach((block) => {
        block.setAttribute(
          'style',
          'margin: 32px 0; user-select: none; display: flex; flex-direction: column; align-items: flex-start;',
        )
        block.innerHTML = getCanvasPreviewInnerHtml(updatedFunnel)
        hasChanges = true
      })
      if (hasChanges) {
        onChange(editorRef.current.innerHTML)
      }
    }
  }

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isResizingRef.current = true
    setIsResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isResizingRef.current || !containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = containerRect.right - ev.clientX
      const minW = 450
      const maxW = Math.min(window.innerWidth * 0.8, containerRect.width - 300)

      if (newWidth >= minW && newWidth <= maxW) {
        setPanelWidth(newWidth)
      } else if (newWidth < minW) {
        setPanelWidth(minW)
      } else if (newWidth > maxW) {
        setPanelWidth(maxW)
      }
    }

    const handleMouseUp = () => {
      isResizingRef.current = false
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  const activeCanvas = funnels.find((f) => f.id === editingCanvasId)

  return (
    <div
      ref={containerRef}
      className="flex w-full h-full overflow-hidden bg-transparent relative"
    >
      {/* GUIAS DO DOCUMENTO (OUTLINE) */}
      <div
        className={cn(
          "hidden xl:flex shrink-0 bg-transparent flex-col transition-all duration-300 border-r border-slate-200/50",
          isOutlineOpen ? "w-64" : "w-[60px] items-center"
        )}
      >
        <div className={cn("flex flex-col py-5 w-full", isOutlineOpen ? "px-6" : "px-0 items-center")}>
          <div className={cn("flex items-center w-full", isOutlineOpen ? "justify-between" : "justify-center")}>
            {isOutlineOpen && (
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 whitespace-nowrap overflow-hidden">
                <List size={16} className="text-primary shrink-0" /> Guias no documento
              </h3>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-lg hover:bg-slate-200/50"
              onClick={() => setIsOutlineOpen(!isOutlineOpen)}
              title={isOutlineOpen ? "Ocultar guias" : "Sua estrutura de documento"}
            >
              {isOutlineOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
            </Button>
          </div>

          {isOutlineOpen && (
            <div className="mt-4 flex w-full">
              <Button
                variant="outline"
                size="sm"
                className="h-8 shadow-sm flex-1 font-semibold text-xs border-dashed text-muted-foreground hover:text-foreground hover:border-solid hover:border-primary/50 hover:bg-primary/5"
                onClick={insertNewGuide}
                title="Adicionar novo título"
              >
                <Plus size={14} className="mr-1.5" /> Adicionar Guia
              </Button>
            </div>
          )}
        </div>

        {isOutlineOpen && (
          <div className="flex-1 overflow-y-auto space-y-1 p-6 pt-0 pr-4 no-scrollbar animate-fade-in w-full">
            {headers.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                Adicione títulos (H1, H2, etc.) para criar o sumário do documento.
              </p>
            ) : (
              headers.map((header) => (
                <button
                  key={header.id}
                  onClick={() => {
                    const el = document.getElementById(header.id)
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }}
                  style={{ paddingLeft: `${(header.level - 1) * 12}px` }}
                  className={cn(
                    "w-full text-left text-sm py-1.5 px-2 rounded-md hover:bg-primary/10 transition-colors line-clamp-2",
                    header.level === 1 ? "font-semibold text-foreground mt-2" : "text-muted-foreground"
                  )}
                >
                  {header.text}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div
        className={cn(
          'flex flex-col h-full overflow-y-auto ease-in-out flex-1 min-w-0 px-4 sm:px-6 lg:px-8',
          !isResizing && 'transition-all duration-300',
        )}
      >
        <div
          className={cn(
            'flex flex-col mx-auto w-full bg-white shadow-sm border border-slate-200/60 rounded-xl relative my-4 sm:my-6 lg:my-8',
            !isResizing && 'transition-all duration-300',
            'max-w-[1000px] min-h-[max-content]',
          )}
        >
          <div className="flex flex-col gap-4 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-30 shrink-0 p-6 lg:px-10 lg:pt-10 lg:pb-4 rounded-t-xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Input
                value={doc.title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="text-3xl font-bold border-none outline-none focus-visible:ring-0 px-0 h-auto shadow-none bg-transparent flex-1"
                placeholder="Título do Documento"
              />
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                {doc.funnelId && doc.nodeId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(`/canvas/${doc.funnelId}?nodeId=${doc.nodeId}`)
                    }
                    className="text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100 shrink-0 h-9"
                  >
                    <Network size={14} className="mr-1.5" /> Ver no Canvas
                  </Button>
                )}
                <Select
                  value={doc.projectId || 'none'}
                  onValueChange={(val) =>
                    onProjectChange(val === 'none' ? null : val)
                  }
                >
                  <SelectTrigger className="w-[180px] h-9 bg-muted/30 border-slate-200">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum Projeto</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* TOOLBAR FIXADA NO TOPO */}
            <div className="flex items-center gap-1 shrink-0 flex-wrap mt-2">
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => exec('formatBlock', 'H1')}
                title="Título 1"
                className="rounded-lg h-8 w-8 hover:bg-slate-100"
              >
                <Heading1 size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => exec('formatBlock', 'H2')}
                title="Título 2"
                className="rounded-lg h-8 w-8 hover:bg-slate-100"
              >
                <Heading2 size={16} />
              </Button>
              <Separator orientation="vertical" className="h-4 mx-1" />
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => exec('bold')}
                title="Negrito"
                className="rounded-lg h-8 w-8 hover:bg-slate-100"
              >
                <Bold size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => exec('italic')}
                title="Itálico"
                className="rounded-lg h-8 w-8 hover:bg-slate-100"
              >
                <Italic size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => exec('underline')}
                title="Sublinhado"
                className="rounded-lg h-8 w-8 text-slate-700 font-serif font-bold underline hover:bg-slate-100"
              >
                U
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => exec('strikeThrough')}
                title="Tachado"
                className="rounded-lg h-8 w-8 text-slate-700 font-serif font-bold line-through hover:bg-slate-100"
              >
                S
              </Button>

              <Separator orientation="vertical" className="h-4 mx-1" />

              <Button
                variant="ghost"
                size="icon"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => exec('insertUnorderedList')}
                title="Lista"
                className="rounded-lg h-8 w-8 hover:bg-slate-100"
              >
                <List size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => exec('insertOrderedList')}
                title="Lista Numerada"
                className="rounded-lg h-8 w-8 font-mono text-sm font-bold hover:bg-slate-100"
              >
                1.
              </Button>

              <Separator orientation="vertical" className="h-4 mx-1" />

              <Button
                variant="ghost"
                size="icon"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => exec('justifyLeft')}
                title="Alinhar à Esquerda"
                className="rounded-lg h-8 w-8 flex flex-col items-start gap-0.5 justify-center py-1.5 hover:bg-slate-100"
              >
                <div className="h-0.5 w-4 bg-slate-700 rounded-full" />
                <div className="h-0.5 w-3 bg-slate-700 rounded-full" />
                <div className="h-0.5 w-4 bg-slate-700 rounded-full" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => exec('justifyCenter')}
                title="Centralizar"
                className="rounded-lg h-8 w-8 flex flex-col items-center gap-0.5 justify-center py-1.5 hover:bg-slate-100"
              >
                <div className="h-0.5 w-4 bg-slate-700 rounded-full" />
                <div className="h-0.5 w-3 bg-slate-700 rounded-full" />
                <div className="h-0.5 w-4 bg-slate-700 rounded-full" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => exec('justifyRight')}
                title="Alinhar à Direita"
                className="rounded-lg h-8 w-8 flex flex-col items-end gap-0.5 justify-center py-1.5 hover:bg-slate-100"
              >
                <div className="h-0.5 w-4 bg-slate-700 rounded-full" />
                <div className="h-0.5 w-3 bg-slate-700 rounded-full" />
                <div className="h-0.5 w-4 bg-slate-700 rounded-full" />
              </Button>

              <Separator orientation="vertical" className="h-4 mx-1" />

              <Button
                variant="ghost"
                size="icon"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => exec('formatBlock', 'BLOCKQUOTE')}
                title="Citação"
                className="rounded-lg h-8 w-8 hover:bg-slate-100"
              >
                <Quote size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => exec('insertHorizontalRule')}
                title="Divisor"
                className="rounded-lg h-8 w-8 hover:bg-slate-100"
              >
                <SeparatorHorizontal size={16} />
              </Button>

              <Separator orientation="vertical" className="h-4 mx-1" />

              <Button
                variant="ghost"
                size="icon"
                onMouseDown={handleToolbarMouseDown}
                onClick={insertTable}
                title="Tabela"
                className="rounded-lg h-8 w-8 hover:bg-slate-100"
              >
                <Table size={16} />
              </Button>

              <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onMouseDown={() => saveSelection()}
                    title="Adicionar Imagem"
                    className="rounded-lg h-8 w-8 hover:bg-slate-100"
                  >
                    <ImageIcon size={16} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Imagem</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={insertImage} className="space-y-4 pt-4">
                    <Input
                      placeholder="URL da Imagem (ex: https://...)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      autoFocus
                    />
                    <Button type="submit" className="w-full">
                      Inserir Imagem
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={canvasModalOpen} onOpenChange={setCanvasModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onMouseDown={() => saveSelection()}
                    className="ml-2 flex items-center bg-primary/10 hover:bg-primary/20 text-primary transition-colors shrink-0 rounded-xl font-semibold px-4 h-8"
                    title="Importar Canvas"
                  >
                    <Network size={14} className="mr-2" /> Importar Canvas
                  </Button>
                </DialogTrigger>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors shrink-0 rounded-xl px-3 h-8"
                  title="Exportar como texto"
                  onClick={() => {
                    const text = editorRef.current?.innerText || ''
                    const blob = new Blob([`# ${doc.title}\n\n${text}`], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${doc.title.replace(/\s+/g, '_')}.txt`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  <Download size={14} className="mr-1.5" /> Exportar
                </Button>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Selecionar Canvas</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                    {funnels.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => setSelectedCanvasId(f.id)}
                        className={cn(
                          "border rounded-lg p-4 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2",
                          selectedCanvasId === f.id
                            ? 'border-primary ring-1 ring-primary bg-primary/5'
                            : 'hover:border-primary/50 bg-card'
                        )}
                      >
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-1">
                          <Network
                            size={20}
                            className={
                              selectedCanvasId === f.id
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            }
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{f.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {f.nodes.length} blocos mapeados
                          </p>
                        </div>
                      </div>
                    ))}
                    {funnels.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">
                        Nenhum canvas disponível para importação.
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={insertCanvas}
                    disabled={!selectedCanvasId}
                    className="w-full"
                  >
                    Importar Visualização
                  </Button>
                </DialogContent>
              </Dialog>

              {activeTableNode && (
                <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200 ml-4 py-1 px-2 bg-primary/10 border border-primary/20 rounded-lg shrink-0">
                  <span className="text-xs font-semibold text-primary mr-1 px-1">Tabela</span>
                  <Separator orientation="vertical" className="h-4 mx-1 bg-primary/20" />
                  <Button variant="ghost" size="icon" onMouseDown={handleToolbarMouseDown} onClick={() => addRow('above')} className="h-7 w-7 text-primary hover:bg-primary/20 rounded-md" title="Adicionar Linha Acima">
                    <ArrowUpFromLine size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" onMouseDown={handleToolbarMouseDown} onClick={() => addRow('below')} className="h-7 w-7 text-primary hover:bg-primary/20 rounded-md" title="Adicionar Linha Abaixo">
                    <ArrowDownFromLine size={14} />
                  </Button>
                  <Separator orientation="vertical" className="h-4 mx-1 bg-primary/20" />
                  <Button variant="ghost" size="icon" onMouseDown={handleToolbarMouseDown} onClick={() => addColumn('left')} className="h-7 w-7 text-primary hover:bg-primary/20 rounded-md" title="Adicionar Coluna à Esquerda">
                    <ArrowLeftFromLine size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" onMouseDown={handleToolbarMouseDown} onClick={() => addColumn('right')} className="h-7 w-7 text-primary hover:bg-primary/20 rounded-md" title="Adicionar Coluna à Direita">
                    <ArrowRightFromLine size={14} />
                  </Button>
                  <Separator orientation="vertical" className="h-4 mx-1 bg-primary/20" />
                  <Button variant="ghost" size="icon" onMouseDown={handleToolbarMouseDown} onClick={deleteRow} className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-md" title="Excluir Linha">
                    <Trash2 size={13} className="opacity-80" />
                  </Button>
                  <Button variant="ghost" size="icon" onMouseDown={handleToolbarMouseDown} onClick={deleteTable} className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-md" title="Excluir Tabela Inteira">
                    <Trash2 size={14} />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="mx-6 lg:mx-10 mb-12 mt-8 flex-1 flex flex-col relative w-full">
            <div
              ref={editorRef}
              contentEditable
              className="flex-1 outline-none prose prose-slate max-w-none focus:outline-none min-h-[500px] pb-32 prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-p:text-base prose-p:leading-relaxed"
              onBlur={(e) => {
                saveSelection()
                onChange(e.currentTarget.innerHTML)
                extractHeaders()
              }}
              onKeyUp={() => {
                saveSelection()
                extractHeaders()
              }}
              onMouseUp={saveSelection}
              onInput={(e) => {
                onChange(e.currentTarget.innerHTML)
              }}
              onClick={handleEditorClick}
              style={{ caretColor: 'hsl(var(--primary))' }}
            />
          </div>
        </div>
      </div>

      {editingCanvasId && activeCanvas && (
        <div
          style={{ width: `${panelWidth}px` }}
          className={cn(
            'h-full flex flex-col bg-background shadow-[-10px_0_40px_rgba(0,0,0,0.08)] z-20 shrink-0 border-l border-border relative',
            !isResizing && 'transition-all duration-300',
            'animate-in slide-in-from-right',
          )}
        >
          <div
            className="absolute -left-3 top-0 bottom-0 w-6 cursor-col-resize z-50 group/resizer flex items-center justify-center"
            onMouseDown={startResizing}
          >
            <div className="absolute w-1.5 h-full left-1/2 -translate-x-1/2 opacity-0 group-hover/resizer:opacity-100 bg-primary/20 transition-opacity" />
            <div className="w-[20px] h-[48px] bg-slate-900 rounded-full flex items-center justify-center text-white shadow-md transition-transform group-hover/resizer:scale-105 z-10">
              <GripVertical size={14} className="opacity-80" />
            </div>
          </div>

          <div className="h-16 border-b flex items-center justify-between px-6 bg-card shrink-0 shadow-sm z-10 relative">
            <div className="flex items-center gap-3 text-primary">
              <Network size={20} />
              <h3 className="font-bold text-base text-foreground">
                {activeCanvas.name}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingCanvasId(null)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
            >
              <X size={18} />
            </Button>
          </div>
          <div className="flex-1 relative flex overflow-hidden">
            <CanvasBoard
              funnel={activeCanvas}
              onChange={handleCanvasChange}
              hideHeader
              onBack={() => setEditingCanvasId(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
