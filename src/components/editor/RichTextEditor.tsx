import { useRef, useEffect, useState, useCallback } from 'react'
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
      <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: hsl(var(--background) / 0.6); backdrop-filter: blur(2px); opacity: 0; transition: all 0.2s ease-in-out; pointer-events: none;" class="group-hover:opacity-100">
         <div style="background: hsl(var(--card)); padding: 8px 16px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-size: 13px; font-weight: 600; color: hsl(var(--primary)); display: flex; align-items: center; gap: 6px; transform: translateY(4px); transition: transform 0.2s ease-in-out; border: 1px solid hsl(var(--border));" class="group-hover:translate-y-0">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
           Editar Canvas
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
  const editorRef = useRef<HTMLDivElement>(null)
  const [funnels, setFunnels] = useFunnelStore()
  const [projects] = useProjectStore()
  const [canvasModalOpen, setCanvasModalOpen] = useState(false)
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [savedRange, setSavedRange] = useState<Range | null>(null)
  const [editingCanvasId, setEditingCanvasId] = useState<string | null>(null)

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
    }
  }, [doc.id])

  const saveSelection = useCallback(() => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      if (
        editorRef.current &&
        editorRef.current.contains(range.commonAncestorContainer)
      ) {
        setSavedRange(range.cloneRange())
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
    const canvasBlock = target.closest('.canvas-preview-block')
    if (canvasBlock) {
      const canvasId = canvasBlock.getAttribute('data-canvas-id')
      if (canvasId) {
        e.preventDefault()
        setEditingCanvasId(canvasId)
      }
    }
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

  const activeCanvas = funnels.find((f) => f.id === editingCanvasId)

  return (
    <div className="flex w-full h-full overflow-hidden bg-background relative">
      <div
        className={cn(
          'flex flex-col h-full overflow-y-auto transition-[width] duration-300 ease-in-out',
          editingCanvasId ? 'w-[50%] border-r' : 'w-full',
        )}
      >
        <div
          className={cn(
            'flex flex-col flex-1 mx-auto w-full transition-all duration-300',
            editingCanvasId ? 'p-6 max-w-3xl' : 'p-8 max-w-4xl',
          )}
        >
          <div className="flex items-center gap-4 mb-6 border-b pb-4 sticky top-0 bg-background/95 backdrop-blur z-10 shrink-0">
            <Input
              value={doc.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-2xl font-bold border-none outline-none focus-visible:ring-0 px-0 h-auto shadow-none bg-transparent"
              placeholder="Título do Documento"
            />
            <div className="ml-auto flex flex-col sm:flex-row items-end sm:items-center gap-2">
              <Select
                value={doc.projectId || 'none'}
                onValueChange={(val) =>
                  onProjectChange(val === 'none' ? null : val)
                }
              >
                <SelectTrigger className="w-[180px] h-8 bg-transparent">
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

          <div className="flex items-center gap-1 mb-6 shrink-0 flex-wrap">
            <Button
              variant="ghost"
              size="icon"
              onMouseDown={handleToolbarMouseDown}
              onClick={() => exec('formatBlock', 'H1')}
              title="Título 1"
            >
              <Heading1 size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onMouseDown={handleToolbarMouseDown}
              onClick={() => exec('formatBlock', 'H2')}
              title="Título 2"
            >
              <Heading2 size={18} />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Button
              variant="ghost"
              size="icon"
              onMouseDown={handleToolbarMouseDown}
              onClick={() => exec('bold')}
              title="Negrito"
            >
              <Bold size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onMouseDown={handleToolbarMouseDown}
              onClick={() => exec('italic')}
              title="Itálico"
            >
              <Italic size={18} />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Button
              variant="ghost"
              size="icon"
              onMouseDown={handleToolbarMouseDown}
              onClick={() => exec('insertUnorderedList')}
              title="Lista"
            >
              <List size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onMouseDown={handleToolbarMouseDown}
              onClick={() => exec('formatBlock', 'BLOCKQUOTE')}
              title="Citação"
            >
              <Quote size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onMouseDown={handleToolbarMouseDown}
              onClick={() => exec('insertHorizontalRule')}
              title="Divisor"
            >
              <SeparatorHorizontal size={18} />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-2" />

            <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onMouseDown={() => saveSelection()}
                  title="Adicionar Imagem"
                >
                  <ImageIcon size={18} />
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
                  className="ml-auto flex items-center bg-primary/5 hover:bg-primary/10 text-primary transition-colors shrink-0"
                  title="Importar Canvas"
                >
                  <Network size={16} className="mr-2" /> Importar Canvas
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Selecionar Canvas</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                  {funnels.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => setSelectedCanvasId(f.id)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${selectedCanvasId === f.id ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:border-primary/50 bg-card'}`}
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
                  Importar
                </Button>
              </DialogContent>
            </Dialog>
          </div>
          <div
            ref={editorRef}
            contentEditable
            className="flex-1 outline-none prose prose-indigo max-w-none focus:outline-none min-h-[500px] pb-32"
            onBlur={(e) => {
              saveSelection()
              onChange(e.currentTarget.innerHTML)
            }}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onInput={(e) => {
              onChange(e.currentTarget.innerHTML)
            }}
            onClick={handleEditorClick}
            style={{ caretColor: 'hsl(var(--primary))' }}
          />
        </div>
      </div>

      {editingCanvasId && activeCanvas && (
        <div className="w-[50%] h-full flex flex-col bg-background shadow-[-10px_0_30px_rgba(0,0,0,0.05)] animate-in slide-in-from-right z-20 shrink-0">
          <div className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0">
            <div className="flex items-center gap-2 text-primary">
              <Network size={18} />
              <h3 className="font-semibold text-sm text-foreground">
                {activeCanvas.name}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingCanvasId(null)}
            >
              <X
                size={18}
                className="text-muted-foreground hover:text-foreground"
              />
            </Button>
          </div>
          <div className="flex-1 relative flex overflow-hidden">
            <CanvasBoard funnel={activeCanvas} onChange={handleCanvasChange} />
          </div>
        </div>
      )}
    </div>
  )
}
