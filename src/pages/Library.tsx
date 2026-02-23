import { useState, useEffect, useMemo } from 'react'
import useResourceStore from '@/stores/useResourceStore'
import useResourceFolderStore from '@/stores/useResourceFolderStore'
import { Resource, ResourceFolder } from '@/types'
import { generateId } from '@/lib/generateId'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Search,
    Plus,
    Image as ImageIcon,
    Link2,
    StickyNote,
    FileUp,
    Pin,
    PinOff,
    MoreVertical,
    Trash2,
    FolderPlus,
    Folder as FolderIcon,
    ArrowLeft,
    Star,
    ExternalLink,
    Copy,
    Grid3X3,
    List,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

const TYPE_CONFIG = {
    image: { label: 'Imagem', icon: ImageIcon, bg: 'bg-purple-100 text-purple-700' },
    link: { label: 'Link', icon: Link2, bg: 'bg-blue-100 text-blue-700' },
    note: { label: 'Nota', icon: StickyNote, bg: 'bg-amber-100 text-amber-700' },
    file: { label: 'Arquivo', icon: FileUp, bg: 'bg-green-100 text-green-700' },
}

export default function Library() {
    const [resources, setResources] = useResourceStore()
    const [folders, setFolders] = useResourceFolderStore()
    const { toast } = useToast()

    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState<string | null>(null)
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Add modal
    const [addOpen, setAddOpen] = useState(false)
    const [addType, setAddType] = useState<Resource['type']>('note')
    const [addTitle, setAddTitle] = useState('')
    const [addContent, setAddContent] = useState('')
    const [addTags, setAddTags] = useState('')

    // Folder
    const [folderOpen, setFolderOpen] = useState(false)
    const [folderName, setFolderName] = useState('')

    // Global paste handler
    useEffect(() => {
        const handler = (e: ClipboardEvent) => {
            // Don't intercept if user is typing in an input
            const activeEl = document.activeElement
            if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as any).contentEditable === 'true')) return

            const items = e.clipboardData?.items
            if (!items) return

            for (const item of Array.from(items)) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile()
                    if (!file) continue
                    const reader = new FileReader()
                    reader.onloadend = () => {
                        const dataUrl = reader.result as string
                        const newRes: Resource = {
                            id: generateId('res'),
                            type: 'image',
                            title: `Imagem colada ${new Date().toLocaleTimeString('pt-BR')}`,
                            content: dataUrl,
                            tags: ['colado'],
                            folderId: currentFolderId,
                            isPinned: false,
                            createdAt: new Date().toISOString(),
                        }
                        setResources([newRes, ...resources])
                        toast({ title: '📋 Imagem colada com sucesso!' })
                    }
                    reader.readAsDataURL(file)
                    return
                }
            }

            const text = e.clipboardData?.getData('text/plain')
            if (text) {
                try {
                    new URL(text)
                    // It's a URL
                    const newRes: Resource = {
                        id: generateId('res'),
                        type: 'link',
                        title: text.replace(/^https?:\/\//, '').split('/')[0],
                        content: text,
                        tags: ['colado'],
                        folderId: currentFolderId,
                        isPinned: false,
                        createdAt: new Date().toISOString(),
                    }
                    setResources([newRes, ...resources])
                    toast({ title: '🔗 Link colado com sucesso!' })
                } catch {
                    // It's plain text
                    const newRes: Resource = {
                        id: generateId('res'),
                        type: 'note',
                        title: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
                        content: text,
                        tags: ['colado'],
                        folderId: currentFolderId,
                        isPinned: false,
                        createdAt: new Date().toISOString(),
                    }
                    setResources([newRes, ...resources])
                    toast({ title: '📝 Nota colada com sucesso!' })
                }
            }
        }

        window.addEventListener('paste', handler)
        return () => window.removeEventListener('paste', handler)
    }, [resources, currentFolderId])

    // Filtered items
    const currentFolders = useMemo(() => {
        let f = folders.filter((f) => f.parentId === currentFolderId)
        if (search) f = f.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
        return f
    }, [folders, currentFolderId, search])

    const filteredResources = useMemo(() => {
        let list = resources.filter((r) => (r.folderId || null) === currentFolderId)
        if (search) list = list.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()) || r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())))
        if (filterType) list = list.filter((r) => r.type === filterType)
        return list.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1
            if (!a.isPinned && b.isPinned) return 1
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    }, [resources, currentFolderId, search, filterType])

    // Breadcrumbs
    const breadcrumbs = useMemo(() => {
        const crumbs: ResourceFolder[] = []
        let curr = currentFolderId
        while (curr) {
            const f = folders.find((folder) => folder.id === curr)
            if (f) { crumbs.unshift(f); curr = f.parentId } else break
        }
        return crumbs
    }, [currentFolderId, folders])

    const addResource = (e: React.FormEvent) => {
        e.preventDefault()
        if (!addTitle.trim()) return
        const newRes: Resource = {
            id: generateId('res'),
            type: addType,
            title: addTitle.trim(),
            content: addContent.trim(),
            tags: addTags.split(',').map((t) => t.trim()).filter(Boolean),
            folderId: currentFolderId,
            isPinned: false,
            createdAt: new Date().toISOString(),
        }
        setResources([newRes, ...resources])
        setAddTitle('')
        setAddContent('')
        setAddTags('')
        setAddOpen(false)
    }

    const createFolder = (e: React.FormEvent) => {
        e.preventDefault()
        if (!folderName.trim()) return
        setFolders([...folders, {
            id: generateId('rf'),
            name: folderName.trim(),
            parentId: currentFolderId,
            createdAt: new Date().toISOString(),
        }])
        setFolderName('')
        setFolderOpen(false)
    }

    const togglePin = (id: string) => {
        setResources(resources.map((r) => r.id === id ? { ...r, isPinned: !r.isPinned } : r))
    }

    const deleteResource = (id: string) => {
        setResources(resources.filter((r) => r.id !== id))
    }

    const deleteFolder = (id: string) => {
        setFolders(folders.filter((f) => f.id !== id))
        // Move items in folder to parent
        setResources(resources.map((r) => r.folderId === id ? { ...r, folderId: currentFolderId } : r))
    }

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const files = Array.from(e.dataTransfer.files)
        files.forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onloadend = () => {
                    const newRes: Resource = {
                        id: generateId('res'),
                        type: 'image',
                        title: file.name,
                        content: reader.result as string,
                        tags: ['upload'],
                        folderId: currentFolderId,
                        isPinned: false,
                        createdAt: new Date().toISOString(),
                    }
                    setResources((prev) => [newRes, ...prev])
                }
                reader.readAsDataURL(file)
            } else {
                const newRes: Resource = {
                    id: generateId('res'),
                    type: 'file',
                    title: file.name,
                    content: `Arquivo: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
                    tags: ['upload'],
                    folderId: currentFolderId,
                    isPinned: false,
                    createdAt: new Date().toISOString(),
                }
                setResources((prev) => [newRes, ...prev])
            }
        })
        toast({ title: `📁 ${files.length} arquivo(s) adicionado(s)!` })
    }

    const ResourceCard = ({ r }: { r: Resource }) => {
        const cfg = TYPE_CONFIG[r.type]
        const Icon = cfg.icon
        return (
            <Card className={cn(
                'group relative overflow-hidden transition-all hover:shadow-md cursor-default',
                r.isPinned && 'ring-1 ring-amber-300/50',
            )}>
                {r.type === 'image' && (
                    <div className="h-32 bg-muted overflow-hidden">
                        <img src={r.content} alt={r.title} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                )}
                <CardContent className={cn('p-4 space-y-2', r.type === 'image' ? '' : 'pt-4')}>
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Badge variant="outline" className={cn('shrink-0 text-[10px] px-1.5 py-0', cfg.bg)}>
                                <Icon size={10} className="mr-1" />{cfg.label}
                            </Badge>
                            {r.isPinned && <Pin size={12} className="text-amber-500 shrink-0" />}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical size={14} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => togglePin(r.id)}>
                                    {r.isPinned ? <><PinOff size={14} className="mr-2" /> Desafixar</> : <><Pin size={14} className="mr-2" /> Fixar</>}
                                </DropdownMenuItem>
                                {r.type === 'link' && (
                                    <DropdownMenuItem onClick={() => window.open(r.content, '_blank')}>
                                        <ExternalLink size={14} className="mr-2" /> Abrir Link
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(r.content); toast({ title: 'Copiado!' }) }}>
                                    <Copy size={14} className="mr-2" /> Copiar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => deleteResource(r.id)}>
                                    <Trash2 size={14} className="mr-2" /> Excluir
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground truncate">{r.title}</h3>
                    {r.type !== 'image' && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{r.content}</p>
                    )}
                    {r.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                            {r.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{tag}</span>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <div
            className="p-6 md:p-8 max-w-[1600px] w-full mx-auto space-y-6 animate-fade-in"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Biblioteca</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Cole (Ctrl+V) imagens, links ou textos a qualquer momento • Arraste arquivos para cá
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setFolderOpen(true)}>
                        <FolderPlus size={16} className="mr-2" /> Nova Pasta
                    </Button>
                    <Button variant="dark" onClick={() => setAddOpen(true)}>
                        <Plus size={16} className="mr-2" /> Adicionar
                    </Button>
                </div>
            </div>

            {/* Breadcrumb + Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 text-sm shrink-0">
                    <button onClick={() => setCurrentFolderId(null)} className={cn('hover:underline font-medium', !currentFolderId ? 'text-primary' : 'text-muted-foreground')}>
                        Home
                    </button>
                    {breadcrumbs.map((f) => (
                        <span key={f.id} className="flex items-center gap-1">
                            <span className="text-muted-foreground">/</span>
                            <button onClick={() => setCurrentFolderId(f.id)} className="hover:underline text-muted-foreground font-medium">
                                {f.name}
                            </button>
                        </span>
                    ))}
                </div>

                <div className="flex-1" />

                {/* Search */}
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input placeholder="Buscar recursos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card" />
                </div>

                {/* View mode toggle */}
                <div className="flex items-center gap-0.5 border rounded-lg p-0.5">
                    <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setViewMode('grid')}>
                        <Grid3X3 size={14} />
                    </Button>
                    <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setViewMode('list')}>
                        <List size={14} />
                    </Button>
                </div>
            </div>

            {/* Type filter chips */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setFilterType(null)}
                    className={cn('text-xs px-3 py-1.5 rounded-full border transition-colors font-medium', !filterType ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50')}
                >
                    Todos ({resources.filter((r) => (r.folderId || null) === currentFolderId).length})
                </button>
                {(Object.keys(TYPE_CONFIG) as Resource['type'][]).map((type) => {
                    const cfg = TYPE_CONFIG[type]
                    const count = resources.filter((r) => r.type === type && (r.folderId || null) === currentFolderId).length
                    return (
                        <button
                            key={type}
                            onClick={() => setFilterType(filterType === type ? null : type)}
                            className={cn('text-xs px-3 py-1.5 rounded-full border transition-colors font-medium flex items-center gap-1.5', filterType === type ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50')}
                        >
                            <cfg.icon size={12} /> {cfg.label} ({count})
                        </button>
                    )
                })}
            </div>

            {/* Content */}
            <div className={cn(
                viewMode === 'grid'
                    ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    : 'flex flex-col gap-2'
            )}>
                {/* Folders */}
                {currentFolders.map((f) => (
                    <Card key={f.id} className="group relative hover:border-primary/50 cursor-pointer transition-colors" onClick={() => setCurrentFolderId(f.id)}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600 shrink-0">
                                <FolderIcon size={20} className="fill-current opacity-20" />
                            </div>
                            <span className="font-medium text-sm truncate flex-1">{f.name}</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                        <MoreVertical size={14} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuItem className="text-destructive" onClick={() => deleteFolder(f.id)}>
                                        <Trash2 size={14} className="mr-2" /> Excluir pasta
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardContent>
                    </Card>
                ))}

                {/* Resources */}
                {filteredResources.map((r) => <ResourceCard key={r.id} r={r} />)}
            </div>

            {currentFolders.length === 0 && filteredResources.length === 0 && (
                <div className="py-16 text-center border border-dashed rounded-xl bg-card">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-muted-foreground font-medium">Nenhum recurso ainda</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Cole algo (Ctrl+V), arraste um arquivo, ou clique em "Adicionar"
                    </p>
                </div>
            )}

            {/* Add Resource Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Adicionar Recurso</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={addResource} className="space-y-4">
                        <div className="flex gap-2">
                            {(Object.keys(TYPE_CONFIG) as Resource['type'][]).map((type) => {
                                const cfg = TYPE_CONFIG[type]
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setAddType(type)}
                                        className={cn('flex-1 py-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-colors', addType === type ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50')}
                                    >
                                        <cfg.icon size={16} />
                                        {cfg.label}
                                    </button>
                                )
                            })}
                        </div>

                        <Input placeholder="Título" value={addTitle} onChange={(e) => setAddTitle(e.target.value)} required />
                        <Textarea
                            placeholder={
                                addType === 'image' ? 'Cole a URL da imagem...' :
                                    addType === 'link' ? 'https://...' :
                                        addType === 'note' ? 'Escreva sua nota, insight ou swipe...' :
                                            'Descrição do arquivo...'
                            }
                            value={addContent}
                            onChange={(e) => setAddContent(e.target.value)}
                            rows={4}
                        />
                        <Input placeholder="Tags (separadas por vírgula)" value={addTags} onChange={(e) => setAddTags(e.target.value)} />
                        <Button type="submit" className="w-full">Adicionar</Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Create Folder Dialog */}
            <Dialog open={folderOpen} onOpenChange={setFolderOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Nova Pasta</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={createFolder} className="space-y-4">
                        <Input placeholder="Nome da pasta" value={folderName} onChange={(e) => setFolderName(e.target.value)} required autoFocus />
                        <Button type="submit" className="w-full">Criar</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
