import { useState } from 'react';
import { useI18n } from '../i18n';
import { useAppStore } from '../state/appStore';
import { GameButton } from '../ui/GameButton';
import { HudPanel } from '../ui/HudPanel';
import { IconCoin } from '../ui/IconLibrary';

const REVIVE_COST = 50;

export function ReviveModal() {
  const t = useI18n();
  const { player, setPlayer, setOverlay, setScreen, showToast } = useAppStore();
  const [busy, setBusy] = useState(false);

  const closeNo = () => {
    setOverlay(null);
    setScreen('gameover');
  };

  const reviveOk = () => {
    useAppStore.getState().requestRevive();
    setOverlay(null);
    setScreen('runner');
    showToast('✓');
  };

  const adRevive = () => {
    if (busy) return;
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      reviveOk();
    }, 800);
  };

  const coinRevive = () => {
    if (!player || busy) return;
    if (player.coins < REVIVE_COST) {
      showToast(`${t.coins}: ${player.coins}`);
      setOverlay(null);
      setScreen('shop');
      return;
    }
    setPlayer({ ...player, coins: player.coins - REVIVE_COST });
    reviveOk();
  };

  return (
    <div className="overlay-dim" role="dialog" aria-modal="true">
      <HudPanel className="modal-card">
        <h2 className="modal-title" style={{ fontSize: '1.25rem' }}>
          {t.reviveAd}
        </h2>
        <div className="stack-gap">
          <GameButton variant="blue" disabled={busy} onClick={adRevive}>
            {busy ? '…' : t.reviveAd}
          </GameButton>
          <GameButton
            variant="red"
            disabled={busy}
            icon={<IconCoin />}
            onClick={coinRevive}
          >
            {t.reviveCoins}
          </GameButton>
          <GameButton variant="navy" disabled={busy} onClick={closeNo}>
            {t.noThanks}
          </GameButton>
        </div>
      </HudPanel>
    </div>
  );
}
