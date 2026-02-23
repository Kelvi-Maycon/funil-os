import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import { Search, Folder, CheckSquare, LayoutTemplate, FileText, Image, Lightbulb, Link as LinkIcon } from 'lucide-react'
import useProjectStore from '@/stores/useProjectStore'
import useFunnelStore from '@/stores/useFunnelStore'
import useTaskStore from '@/stores/useTaskStore'
import useDocumentStore from '@/stores/useDocumentStore'

export function GlobalSearch() {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    const [projects] = useProjectStore()
    const [funnels] = useFunnelStore()
    const [tasks] = useTaskStore()
    const [docs] = useDocumentStore()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const runCommand = (command: () => void) => {
        setOpen(false)
        command()
    }

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Buscar em todo o workspace..." />
            <CommandList>
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

                <CommandGroup heading="Módulos Principais">
                    <CommandItem onSelect={() => runCommand(() => navigate('/projetos'))}>
                        <Folder className="mr-2 h-4 w-4" />
                        <span>Projetos</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/canvas'))}>
                        <LayoutTemplate className="mr-2 h-4 w-4" />
                        <span>Funis / Canvas</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/timeline'))}>
                        <CheckSquare className="mr-2 h-4 w-4" />
                        <span>Tarefas / Timeline</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/documentos'))}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Documentos</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                {projects.length > 0 && (
                    <CommandGroup heading="Projetos">
                        {projects.map((p) => (
                            <CommandItem key={p.id} onSelect={() => runCommand(() => navigate(`/projetos/${p.id}`))}>
                                <Folder className="mr-2 h-4 w-4" />
                                <span>{p.name}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {funnels.length > 0 && (
                    <CommandGroup heading="Funis">
                        {funnels.map((f) => (
                            <CommandItem key={f.id} onSelect={() => runCommand(() => navigate(`/canvas/${f.id}`))}>
                                <LayoutTemplate className="mr-2 h-4 w-4" />
                                <span>{f.name}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {tasks.length > 0 && (
                    <CommandGroup heading="Tarefas">
                        {tasks.map((t) => (
                            <CommandItem key={t.id} onSelect={() => runCommand(() => navigate('/timeline'))}>
                                <CheckSquare className="mr-2 h-4 w-4" />
                                <span>{t.title}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {docs.length > 0 && (
                    <CommandGroup heading="Documentos">
                        {docs.map((d) => (
                            <CommandItem key={d.id} onSelect={() => runCommand(() => navigate('/documentos'))}>
                                <FileText className="mr-2 h-4 w-4" />
                                <span>{d.title}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

            </CommandList>
        </CommandDialog>
    )
}
