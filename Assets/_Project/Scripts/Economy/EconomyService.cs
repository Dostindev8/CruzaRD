// Purpose: Central currency authority — UI never mutates balances directly.
// Server-side IAP validation hook before granting hard currency.

using System;
using CruzaRD.Core;
using CruzaRD.Services;
using UnityEngine;

namespace CruzaRD.Economy
{
    public static class CurrencyIds
    {
        public const string Papeletas = "papeletas";
        public const string Trofeos = "trofeos";
    }

    public interface IEconomyService
    {
        int GetBalance(string currencyId);
        bool TrySpend(string currencyId, int amount, string reason);
        void Grant(string currencyId, int amount, string reason, bool requireServerValidation = false);
        bool ValidateIapReceiptStub(string productId, string receipt);
    }

    public sealed class EconomyService : IEconomyService
    {
        private readonly ISaveService _save;

        public EconomyService(ISaveService save)
        {
            _save = save ?? throw new ArgumentNullException(nameof(save));
        }

        public int GetBalance(string currencyId)
        {
            return currencyId switch
            {
                CurrencyIds.Papeletas => _save.Data.Papeletas,
                CurrencyIds.Trofeos => _save.Data.Trofeos,
                _ => 0
            };
        }

        public bool TrySpend(string currencyId, int amount, string reason)
        {
            if (amount <= 0) return false;
            var balance = GetBalance(currencyId);
            if (balance < amount) return false;

            SetBalance(currencyId, balance - amount);
            _save.Save();
            EventBus.Publish(new CurrencyChangedEvent(currencyId, GetBalance(currencyId)));
            Debug.Log($"[Economy] Spend {amount} {currencyId} ({reason})");
            return true;
        }

        public void Grant(string currencyId, int amount, string reason, bool requireServerValidation = false)
        {
            if (amount <= 0) return;

            if (requireServerValidation && currencyId == CurrencyIds.Trofeos)
            {
                Debug.LogWarning("[Economy] Hard currency grant blocked — server validation required.");
                return;
            }

            // Soft anti-cheat: clamp runaway grants per call
            amount = Mathf.Clamp(amount, 0, currencyId == CurrencyIds.Trofeos ? 50 : 5000);
            SetBalance(currencyId, GetBalance(currencyId) + amount);
            _save.Save();
            EventBus.Publish(new CurrencyChangedEvent(currencyId, GetBalance(currencyId)));
        }

        public bool ValidateIapReceiptStub(string productId, string receipt)
        {
            // Production: send receipt to ASP.NET / Firebase Function before Grant().
            if (string.IsNullOrEmpty(productId) || string.IsNullOrEmpty(receipt))
                return false;

            if (receipt.Contains("fake", StringComparison.OrdinalIgnoreCase) && !Debug.isDebugBuild)
                return false;

            return receipt.Length > 8;
        }

        private void SetBalance(string currencyId, int value)
        {
            value = Mathf.Max(0, value);
            switch (currencyId)
            {
                case CurrencyIds.Papeletas:
                    _save.Data.Papeletas = value;
                    break;
                case CurrencyIds.Trofeos:
                    _save.Data.Trofeos = value;
                    break;
            }
        }
    }
}
