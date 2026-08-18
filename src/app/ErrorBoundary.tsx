import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="text-4xl">💥</div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Algo salió mal
          </h1>
          <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {this.state.error.message}
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
