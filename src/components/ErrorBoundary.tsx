import React, { Component, ErrorInfo, ReactNode } from 'react'

type Props = {
    children: ReactNode
    fallback?: ReactNode
}

type State = {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo)
    }

    handleReload = () => {
        window.location.reload()
    }

    handleClearData = () => {
        if (window.confirm('Isso irá limpar todos os dados salvos. Tem certeza?')) {
            localStorage.clear()
            window.location.reload()
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Algo deu errado</h2>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Um erro inesperado ocorreu na aplicação. Tente recarregar a página.
                            </p>
                        </div>
                        {this.state.error && (
                            <div className="bg-red-50 rounded-xl p-4 text-left">
                                <p className="text-xs font-mono text-red-600 break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="px-6 py-2.5 bg-primary text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
                            >
                                Recarregar
                            </button>
                            <button
                                onClick={this.handleClearData}
                                className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-full font-semibold text-sm hover:bg-slate-200 transition-colors"
                            >
                                Limpar Dados
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
