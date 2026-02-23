import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'

interface Props {
    children?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Um erro inesperado ocorreu:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-6">
                    <div className="max-w-md w-full bg-card shadow-sm border rounded-2xl p-8 flex flex-col items-center text-center space-y-6">
                        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
                            <AlertCircle size={32} />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-foreground">
                                Oops! Algo deu errado.
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Desculpe por isso. Ocorreu um erro inesperado no aplicativo.
                            </p>
                        </div>

                        <div className="w-full p-4 bg-muted/50 rounded-lg text-left overflow-auto border border-border/50">
                            <p className="text-xs font-mono text-muted-foreground break-words">
                                {this.state.error?.message || 'Erro desconhecido'}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCcw size={16} className="mr-2" />
                                Atualizar
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => window.location.href = '/'}
                            >
                                <Home size={16} className="mr-2" />
                                Início
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
