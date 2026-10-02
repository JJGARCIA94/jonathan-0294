import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
    children: ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('Error inesperado en la interfaz', error, info.componentStack)
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback />
        }
        return this.props.children
    }
}

function ErrorFallback() {
    return (
        <main className="min-vh-100 auth-background d-flex align-items-center justify-content-center p-3">
            <section className="card shadow-sm text-center p-4" style={{ maxWidth: 420 }} role="alert">
                <i className="bi bi-exclamation-triangle text-warning display-5" aria-hidden="true" />
                <h1 className="h4 mt-2">Algo salió mal</h1>
                <p className="text-body-secondary">
                    Ocurrió un error inesperado al mostrar esta página. Tus datos están a salvo.
                </p>
                <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
                    Recargar la página
                </button>
            </section>
        </main>
    )
}