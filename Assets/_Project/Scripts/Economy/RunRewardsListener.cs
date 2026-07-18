// Purpose: Converts run results into soft currency via EconomyService only.

using CruzaRD.Core;
using CruzaRD.Progression;
using CruzaRD.Services;
using UnityEngine;

namespace CruzaRD.Economy
{
    public sealed class RunRewardsListener : MonoBehaviour
    {
        private void OnEnable() => EventBus.Subscribe<GameOverEvent>(OnGameOver);
        private void OnDisable() => EventBus.Unsubscribe<GameOverEvent>(OnGameOver);

        private void OnGameOver(GameOverEvent e)
        {
            if (!ServiceLocator.TryGet<IEconomyService>(out var eco))
                return;

            // Anti-cheat v3 (GDD v3 §13.2): recompensa solo si los valores son plausibles.
            if (ServiceLocator.TryGet<ISecurityService>(out var securityService))
            {
                var duration = GameManager.Instance != null ? GameManager.Instance.RunDurationSeconds : 1f;
                if (!securityService.ValidateRunRewards(e.Score, e.DistanceMeters, duration))
                    return;
            }

            var grant = Mathf.Max(1, e.PapeletasCollected + e.DistanceMeters / 10);
            eco.Grant(CurrencyIds.Papeletas, grant, "run_reward");

            if (ServiceLocator.TryGet<ISaveService>(out var save))
            {
                save.Data.TotalDistance += e.DistanceMeters;
                if (e.Score > save.Data.BestScore)
                    save.Data.BestScore = e.Score;
                save.Save();

                new SeasonPassService(save).AddRunXp(e.DistanceMeters, e.Score);
            }

            if (ServiceLocator.TryGet<IAdsService>(out var ads))
                ads.MaybeShowInterstitial("post_run");
        }
    }
}
