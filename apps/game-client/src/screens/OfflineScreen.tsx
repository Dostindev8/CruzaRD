import { useI18n } from '../i18n';
import { useAppStore } from '../state/appStore';
import { GameButton } from '../ui/GameButton';
import { HudPanel } from '../ui/HudPanel';
import { LogoWordmark } from '../ui/IconLibrary';

export function OfflineScreen() {
  const t = useI18n();
  const { refresh, showToast, setScreen } = useAppStore();

  const retry = async () => {
    await refresh();
    const offline = useAppStore.getState().offline;
    if (!offline) {
      showToast('✓');
      setScreen('home');
    } else {
      showToast(t.noConnection);
    }
  };

  return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <LogoWordmark compact />
      <HudPanel style={{ width: 'min(100%, 340px)', textAlign: 'center' }}>
        <h2 className="modal-title" style={{ fontSize: '1.35rem' }}>
          {t.noConnection}
        </h2>
        <p style={{ fontSize: '0.9rem', opacity: 0.85, margin: '0 0 16px' }}>
          Revisa tu red e inténtalo de nuevo.
        </p>
        <GameButton variant="blue" onClick={() => void retry()}>
          {t.continue}
        </GameButton>
      </HudPanel>
    </div>
  );
}
