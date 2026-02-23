import { useState, useEffect } from 'react'
import { Node, NodeData } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import useDocumentStore from '@/stores/useDocumentStore'
import useResourceStore from '@/stores/useResourceStore'

type NodeSettingsModalProps = {
  node: Node | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, updates: Partial<NodeData>) => void
}

export function NodeSettingsModal({
  node,
  isOpen,
  onClose,
  onSave,
}: NodeSettingsModalProps) {
  const [description, setDescription] = useState('')
  const [isTaskMode, setIsTaskMode] = useState(false)
  const [docs] = useDocumentStore()
  const [resources] = useResourceStore()
  const [linkedDocs, setLinkedDocs] = useState<string[]>([])
  const [linkedAssets, setLinkedAssets] = useState<string[]>([])

  useEffect(() => {
    if (isOpen && node) {
      setDescription(node.data.description || '')
      setIsTaskMode(node.data.isTaskMode || false)
      setLinkedDocs(node.data.linkedDocumentIds || [])
      setLinkedAssets(node.data.linkedAssetIds || [])
    }
  }, [isOpen, node])

  const handleSave = () => {
    if (node) {
      onSave(node.id, {
        description,
        isTaskMode,
        linkedDocumentIds: linkedDocs,
        linkedAssetIds: linkedAssets,
      })
    }
  }

  if (!node) return null

  const availableDocs = docs.filter((d) => !linkedDocs.includes(d.id))
  const availableAssets = resources.filter((a) => !linkedAssets.includes(a.id))

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-8 gap-0">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
            Advanced Settings
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
            Configure underlying logic for this node.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-2">
          <div className="space-y-2.5">
            <Label
              htmlFor="description"
              className="text-sm font-semibold text-slate-700"
            >
              Technical Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[110px] rounded-xl shadow-sm bg-white border-slate-200 focus-visible:ring-[#f95015] focus-visible:border-[#f95015] text-sm"
              placeholder="Internal notes or technical details..."
            />
          </div>

          <div className="space-y-6 pt-2">
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-slate-700">
                Link Documents
              </Label>
              <Select
                onValueChange={(val) => setLinkedDocs([...linkedDocs, val])}
              >
                <SelectTrigger className="bg-white rounded-xl border-slate-200 shadow-sm text-slate-500 h-11">
                  <SelectValue placeholder="Search and select a document..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {availableDocs.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.title}
                    </SelectItem>
                  ))}
                  {availableDocs.length === 0 && (
                    <div className="p-3 text-sm text-muted-foreground text-center">
                      No documents available
                    </div>
                  )}
                </SelectContent>
              </Select>
              {linkedDocs.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {linkedDocs.map((id) => {
                    const d = docs.find((doc) => doc.id === id)
                    if (!d) return null
                    return (
                      <Badge
                        key={id}
                        variant="outline"
                        className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-white border-slate-200 shadow-sm rounded-full text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        {d.title}
                        <button
                          onClick={() =>
                            setLinkedDocs(linkedDocs.filter((l) => l !== id))
                          }
                          className="text-slate-400 hover:text-slate-600 rounded-full transition-colors outline-none"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-slate-700">
                Link Assets
              </Label>
              <Select
                onValueChange={(val) => setLinkedAssets([...linkedAssets, val])}
              >
                <SelectTrigger className="bg-white rounded-xl border-slate-200 shadow-sm text-slate-500 h-11">
                  <SelectValue placeholder="Search and select an asset..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {availableAssets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.title}
                    </SelectItem>
                  ))}
                  {availableAssets.length === 0 && (
                    <div className="p-3 text-sm text-muted-foreground text-center">
                      No assets available
                    </div>
                  )}
                </SelectContent>
              </Select>
              {linkedAssets.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {linkedAssets.map((id) => {
                    const a = resources.find((asset) => asset.id === id)
                    if (!a) return null
                    return (
                      <Badge
                        key={id}
                        variant="outline"
                        className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-white border-slate-200 shadow-sm rounded-full text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        {a.title}
                        <button
                          onClick={() =>
                            setLinkedAssets(
                              linkedAssets.filter((l) => l !== id),
                            )
                          }
                          className="text-slate-400 hover:text-slate-600 rounded-full transition-colors outline-none"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-row items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mt-2">
            <div className="space-y-1">
              <Label className="text-[15px] font-bold text-slate-800">
                Task Mode
              </Label>
              <p className="text-[13.5px] text-slate-500 font-medium">
                Enable checklist functionality on canvas.
              </p>
            </div>
            <Switch
              checked={isTaskMode}
              onCheckedChange={setIsTaskMode}
              className="data-[state=checked]:bg-[#f95015] shadow-sm"
            />
          </div>
        </div>

        <DialogFooter className="mt-8 sm:justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-full px-6 font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-full px-6 font-semibold bg-[#f95015] hover:bg-[#e04812] text-white shadow-sm border-none"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
