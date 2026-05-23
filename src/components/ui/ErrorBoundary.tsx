import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Zap } from 'lucide-react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-4 text-center">
          <Zap className="size-12 text-coral mb-6" strokeWidth={1.5} />
          <h1 className="font-display text-2xl font-bold text-text mb-2">Something went wrong</h1>
          <p className="text-text-muted text-sm mb-6 max-w-sm">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
            className="px-4 py-2 bg-cyan text-bg text-sm font-semibold rounded hover:opacity-90 transition-opacity"
          >
            Reload page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
