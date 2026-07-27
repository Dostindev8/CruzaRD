import { Component, type ErrorInfo, type ReactNode } from 'react';
import { GameButton } from './GameButton';
import { HudPanel } from './HudPanel';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[CruzaRD]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', background: '#061225' }}>
          <HudPanel style={{ width: 'min(92%, 360px)', textAlign: 'center' }}>
            <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>
              Algo salió mal
            </h2>
            <p style={{ fontSize: '0.8rem', opacity: 0.85, wordBreak: 'break-word' }}>
              {this.state.error.message}
            </p>
            <GameButton
              variant="red"
              onClick={() => {
                this.setState({ error: null });
                window.location.hash = '';
                window.location.reload();
              }}
            >
              REINICIAR APP
            </GameButton>
          </HudPanel>
        </div>
      );
    }
    return this.props.children;
  }
}
