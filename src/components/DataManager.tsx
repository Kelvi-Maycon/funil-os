import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Upload, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

export function DataManager() {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)

    const handleExport = () => {
        const data: Record<string, any> = {}
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('funilos_')) {
                const value = localStorage.getItem(key)
                if (value) {
                    try {
                        data[key] = JSON.parse(value)
                    } catch (e) {
                        data[key] = value
                    }
                }
            }
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `funilos_backup_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({ title: 'Dados exportados com sucesso!' })
    }

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string
                const data = JSON.parse(content)

                // Validate basic structure
                const keys = Object.keys(data)
                if (!keys.some((k) => k.startsWith('funilos_'))) {
                    throw new Error('Arquivo de backup inválido')
                }

                // Clear existing and set new
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i)
                    if (key && key.startsWith('funilos_')) {
                        localStorage.removeItem(key)
                    }
                }

                for (const [key, value] of Object.entries(data)) {
                    localStorage.setItem(key, JSON.stringify(value))
                }

                toast({ title: 'Dados importados com sucesso. Recarregando...' })
                setTimeout(() => {
                    window.location.reload()
                }, 1500)
            } catch (error) {
                toast({
                    title: 'Erro ao importar',
                    description: 'O arquivo não é um backup válido do Funil OS.',
                    variant: 'destructive',
                })
            }
        }
        reader.readAsText(file)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground w-8 h-8 rounded-full shrink-0" title="Gerenciar Dados">
                    <Upload className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Gerenciar Dados</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Gerenciar Dados</DialogTitle>
                    <DialogDescription>
                        Exporte seus dados para backup ou importe um arquivo JSON anterior.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                        <div className="mt-1 bg-primary/10 p-2 rounded-full text-primary">
                            <Download size={18} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm">Exportar Backup</h4>
                            <p className="text-xs text-muted-foreground mb-3">
                                Baixe todos os seus projetos, funis, tarefas e configurações.
                            </p>
                            <Button onClick={handleExport} size="sm">
                                Baixar arquivo .json
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="mt-1 bg-destructive/20 p-2 rounded-full text-destructive">
                            <AlertTriangle size={18} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm text-destructive">
                                Importar Dados
                            </h4>
                            <p className="text-xs text-destructive/80 mb-3">
                                Aviso: Isso irá substituir <strong>TODOS</strong> os seus dados atuais.
                            </p>
                            <div className="relative">
                                <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                                    <Upload className="mr-2 h-4 w-4" /> Selecionar arquivo
                                </Button>
                                <input
                                    type="file"
                                    accept=".json"
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                    onChange={handleImport}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
