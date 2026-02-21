import { useState } from 'react'
import useDocumentStore from '@/stores/useDocumentStore'
import useFolderStore from '@/stores/useFolderStore'
import useQuickActionStore from '@/stores/useQuickActionStore'
import RichTextEditor from '@/components/editor/RichTextEditor'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Plus,
  Folder as FolderIcon,
  ChevronRight,
  ChevronDown,
  FolderPlus,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export default function Documents() {
  const [docs, setDocs] = useDocumentStore()
  const [folders, setFolders] = useFolderStore()
  const [, setAction] = useQuickActionStore()
  const [activeId, setActiveId] = useState(docs[0]?.id)
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const activeDoc = docs.find((d) => d.id === activeId)

  const createDoc = () => {
    setAction({ type: 'document', mode: 'create' })
  }

  const createFolder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return
    const newFolder = {
      id: `f_${Date.now()}`,
      projectId: 'p1',
      module: 'project' as const,
      name: newFolderName,
      parentId: null,
      createdAt: new Date().toISOString(),
      isExpanded: true,
    }
    setFolders([...folders, newFolder])
    setNewFolderName('')
    setNewFolderOpen(false)
  }

  const toggleFolder = (id: string) => {
    setFolders(
      folders.map((f) =>
        f.id === id ? { ...f, isExpanded: !f.isExpanded } : f,
      ),
    )
  }

  const onDragStart = (e: React.DragEvent, type: string, id: string) => {
    e.dataTransfer.setData('type', type)
    e.dataTransfer.setData('id', id)
  }

  const onDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault()
    e.stopPropagation()
    const type = e.dataTransfer.getData('type')
    const id = e.dataTransfer.getData('id')

    if (type === 'document') {
      setDocs(
        docs.map((d) => (d.id === id ? { ...d, folderId: targetFolderId } : d)),
      )
    } else if (type === 'folder') {
      if (id === targetFolderId) return
      let currentParent = targetFolderId
      let isDescendant = false
      while (currentParent) {
        if (currentParent === id) {
          isDescendant = true
          break
        }
        const parentFolder = folders.find((f) => f.id === currentParent)
        currentParent = parentFolder ? parentFolder.parentId : null
      }
      if (!isDescendant) {
        setFolders(
          folders.map((f) =>
            f.id === id ? { ...f, parentId: targetFolderId } : f,
          ),
        )
      }
    }
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const renderTree = (parentId: string | null, level = 0) => {
    const childFolders = folders.filter((f) => f.parentId === parentId)
    const childDocs = docs.filter((d) => d.folderId === parentId)

    return (
      <div className="flex flex-col gap-0.5 mt-0.5">
        {childFolders.map((folder) => (
          <div key={folder.id} className="flex flex-col">
            <div
              draggable
              onDragStart={(e) => onDragStart(e, 'folder', folder.id)}
              onDrop={(e) => onDrop(e, folder.id)}
              onDragOver={onDragOver}
              className="group flex items-center gap-1.5 py-1.5 pr-2 rounded-md text-sm transition-colors cursor-pointer hover:bg-accent text-foreground select-none"
              style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFolder(folder.id)
                }}
                className="p-0.5 hover:bg-muted rounded text-muted-foreground shrink-0 transition-colors"
              >
                {folder.isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
              <FolderIcon
                size={14}
                className="text-muted-foreground fill-muted-foreground/20 shrink-0"
              />
              <span className="truncate flex-1 font-medium">{folder.name}</span>
            </div>
            {folder.isExpanded && renderTree(folder.id, level + 1)}
          </div>
        ))}
        {childDocs.map((doc) => (
          <button
            key={doc.id}
            draggable
            onDragStart={(e) => onDragStart(e, 'document', doc.id)}
            onClick={() => setActiveId(doc.id)}
            className={`flex items-center gap-2 py-1.5 pr-2 rounded-md text-sm transition-colors w-full text-left cursor-grab active:cursor-grabbing select-none ${activeId === doc.id ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-accent'}`}
            style={{
              paddingLeft: `${level * 16 + (parentId === null ? 8 : 30)}px`,
            }}
          >
            <FileText
              size={14}
              className={`shrink-0 ${activeId === doc.id ? 'text-primary' : 'text-muted-foreground'}`}
            />
            <span className="truncate flex-1">{doc.title}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full bg-background overflow-hidden animate-fade-in">
      <div className="w-64 border-r bg-card flex flex-col shrink-0 z-10 shadow-sm">
        <div className="p-4 border-b flex flex-col gap-2">
          <Button className="w-full justify-start" onClick={createDoc}>
            <Plus size={16} className="mr-2" /> Novo Documento
          </Button>
          <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <FolderPlus size={16} className="mr-2" /> Nova Pasta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Pasta</DialogTitle>
              </DialogHeader>
              <form onSubmit={createFolder} className="space-y-4 pt-4">
                <Input
                  placeholder="Nome da Pasta"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                />
                <Button type="submit" className="w-full">
                  Criar Pasta
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea
          className="flex-1"
          onDrop={(e) => onDrop(e, null)}
          onDragOver={onDragOver}
        >
          <div className="p-2 min-h-full">{renderTree(null)}</div>
        </ScrollArea>
      </div>
      <div className="flex-1 overflow-auto bg-card">
        {activeDoc ? (
          <RichTextEditor
            doc={activeDoc}
            onTitleChange={(title) =>
              setDocs(
                docs.map((d) => (d.id === activeDoc.id ? { ...d, title } : d)),
              )
            }
            onProjectChange={(projectId) =>
              setDocs(
                docs.map((d) =>
                  d.id === activeDoc.id ? { ...d, projectId } : d,
                ),
              )
            }
            onChange={(content) =>
              setDocs(
                docs.map((d) =>
                  d.id === activeDoc.id ? { ...d, content } : d,
                ),
              )
            }
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground flex-col gap-4">
            <FileText size={48} className="text-muted/50" />
            <span>Selecione um documento ou crie um novo.</span>
          </div>
        )}
      </div>
    </div>
  )
}
