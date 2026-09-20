import { Component, type ReactNode } from 'react'

interface State { hasError: boolean }

/** Error Boundary global (PRD v3 - Seção 4.1 / 26). */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    // Detalhe técnico só no console; usuário vê mensagem amigável.
    console.error('[ErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
          <h1 className="text-lg font-bold text-hub-primary">Algo não carregou como esperado</h1>
          <p className="max-w-md text-sm text-hub-muted">
            Ocorreu um erro inesperado nesta página. Tente recarregar. Se persistir,
            avise a equipe responsável pela intranet.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-hub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hub-primary-700"
          >
            Recarregar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
