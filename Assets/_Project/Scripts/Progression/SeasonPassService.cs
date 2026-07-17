// Purpose: Dual-track season pass (free/premium) — XP from runs, Remote Config ready.

using CruzaRD.Economy;
using CruzaRD.Services;
using UnityEngine;

namespace CruzaRD.Progression
{
    public sealed class SeasonPassService
    {
        public const int XpPerLevel = 100;
        public const int MaxLevel = 50;

        private readonly ISaveService _save;

        public SeasonPassService(ISaveService save) => _save = save;

        public int CurrentLevel => Mathf.Clamp(_save.Data.SeasonXp / XpPerLevel, 0, MaxLevel);
        public int XpIntoLevel => _save.Data.SeasonXp % XpPerLevel;
        public bool HasPremium => _save.Data.SeasonPremium;

        public void AddRunXp(int distanceMeters, int score)
        {
            var xp = Mathf.Clamp(distanceMeters / 5 + score / 100, 1, 80);
            _save.Data.SeasonXp += xp;
            _save.Save();
        }

        public void UnlockPremiumAfterValidatedPurchase(string receipt, IEconomyService economy)
        {
            // Premium is convenience/cosmetics track — never gameplay power.
            if (economy != null && economy.ValidateIapReceiptStub("season_pass_premium", receipt))
            {
                _save.Data.SeasonPremium = true;
                _save.Save();
            }
        }
    }
}
