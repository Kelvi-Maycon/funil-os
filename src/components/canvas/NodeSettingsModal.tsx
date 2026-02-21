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

  useEffect(() => {
    if (isOpen && node) {
      setDescription(node.data.description || '')
      setIsTaskMode(node.data.isTaskMode || false)
    }
  }, [isOpen, node])

  const handleSave = () => {
    if (node) {
      onSave(node.id, { description, isTaskMode })
    }
  }

  if (!node) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
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
              className="min-h-[140px] rounded-2xl shadow-sm bg-slate-50/50"
              placeholder="Internal notes or technical details..."
            />
          </div>
          <div className="flex flex-row items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
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
