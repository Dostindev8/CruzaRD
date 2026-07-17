// Purpose: Ads facade — rewarded revive / interstitial frequency gate (max 1 / 3–4 runs).
// Provider choice documented in DESIGN_REFERENCE.md (Unity LevelPlay / AdMob).

using System;
using CruzaRD.Core;
using UnityEngine;

namespace CruzaRD.Services
{
    public interface IAdsService
    {
        void ShowRewarded(string placement, Action<bool> onCompleted);
        void MaybeShowInterstitial(string placement);
        int RunsSinceLastInterstitial { get; }
    }

    public sealed class AdsServiceStub : IAdsService
    {
        private const int InterstitialEveryNRuns = 4;
        public int RunsSinceLastInterstitial { get; private set; }

        public AdsServiceStub()
        {
            EventBus.Subscribe<GameOverEvent>(OnGameOver);
        }

        private void OnGameOver(GameOverEvent _)
        {
            RunsSinceLastInterstitial++;
        }

        public void ShowRewarded(string placement, Action<bool> onCompleted)
        {
            // Stub: simulate success in Editor / debug; production wires real SDK.
            Debug.Log($"[Ads] Rewarded requested: {placement}");
#if UNITY_EDITOR
            onCompleted?.Invoke(true);
#else
            // Until SDK is imported — fail closed (no free revive without ad)
            onCompleted?.Invoke(false);
#endif
        }

        public void MaybeShowInterstitial(string placement)
        {
            if (GameManager.Instance != null && GameManager.Instance.State == GameState.Playing)
                return; // never interrupt an active run

            if (RunsSinceLastInterstitial < InterstitialEveryNRuns)
                return;

            RunsSinceLastInterstitial = 0;
            Debug.Log($"[Ads] Interstitial (stub): {placement}");
        }
    }
}
