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
import useAssetStore from '@/stores/useAssetStore'

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
  const [assets] = useAssetStore()
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
  const availableAssets = assets.filter((a) => !linkedAssets.includes(a.id))

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Advanced Settings</DialogTitle>
          <DialogDescription>
            Configure underlying logic for this node.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          <div className="space-y-3">
            <Label htmlFor="description" className="text-slate-600">
              Technical Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] rounded-2xl shadow-sm bg-slate-50/50"
              placeholder="Internal notes or technical details..."
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="space-y-3">
              <Label className="text-slate-600">Link Documents</Label>
              <Select
                onValueChange={(val) => setLinkedDocs([...linkedDocs, val])}
              >
                <SelectTrigger className="bg-slate-50/50 rounded-xl">
                  <SelectValue placeholder="Search and select a document..." />
                </SelectTrigger>
                <SelectContent>
                  {availableDocs.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.title}
                    </SelectItem>
                  ))}
                  {availableDocs.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No documents available
                    </div>
                  )}
                </SelectContent>
              </Select>
              {linkedDocs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {linkedDocs.map((id) => {
                    const d = docs.find((doc) => doc.id === id)
                    if (!d) return null
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="flex items-center gap-1 pl-3 pr-1 py-1 bg-white border shadow-sm rounded-lg text-sm font-medium"
                      >
                        {d.title}
                        <button
                          onClick={() =>
                            setLinkedDocs(linkedDocs.filter((l) => l !== id))
                          }
                          className="text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 p-0.5 ml-1 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-slate-600">Link Assets</Label>
              <Select
                onValueChange={(val) => setLinkedAssets([...linkedAssets, val])}
              >
                <SelectTrigger className="bg-slate-50/50 rounded-xl">
                  <SelectValue placeholder="Search and select an asset..." />
                </SelectTrigger>
                <SelectContent>
                  {availableAssets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                  {availableAssets.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No assets available
                    </div>
                  )}
                </SelectContent>
              </Select>
              {linkedAssets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {linkedAssets.map((id) => {
                    const a = assets.find((asset) => asset.id === id)
                    if (!a) return null
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="flex items-center gap-1 pl-3 pr-1 py-1 bg-white border shadow-sm rounded-lg text-sm font-medium"
                      >
                        {a.name}
                        <button
                          onClick={() =>
                            setLinkedAssets(
                              linkedAssets.filter((l) => l !== id),
                            )
                          }
                          className="text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 p-0.5 ml-1 transition-colors"
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

          <div className="flex flex-row items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm mt-2">
            <div className="space-y-1">
              <Label className="text-base font-semibold text-slate-800">
                Task Mode
              </Label>
              <p className="text-[13px] text-slate-500">
                Enable checklist functionality on canvas.
              </p>
            </div>
            <Switch checked={isTaskMode} onCheckedChange={setIsTaskMode} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSave} className="rounded-xl px-6">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
