import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * Keeps the shell alive if WebGL/R3F throws (broken workers, lost context, etc.).
 * Without this, Suspense fallback={null} leaves a blank navy void that looks "broken".
 */
export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[RunnerScene]', error.message, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        this.props.fallback ?? (
          <div className="scene-layer scene-fallback" aria-hidden="true" />
        )
      );
    }
    return this.props.children;
  }
}
