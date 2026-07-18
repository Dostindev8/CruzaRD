// Purpose: Typed event hub (pure C#) to decouple Gameplay from UI/Services.
// No UnityEngine.UI dependency. Subscribe/unsubscribe in OnEnable/OnDisable.

using System;
using System.Collections.Generic;

namespace CruzaRD.Core
{
    public static class EventBus
    {
        private static readonly Dictionary<Type, List<Delegate>> _handlers = new();

        public static void Subscribe<T>(Action<T> handler) where T : struct
        {
            var type = typeof(T);
            if (!_handlers.TryGetValue(type, out var list))
            {
                list = new List<Delegate>(4);
                _handlers[type] = list;
            }

            if (!list.Contains(handler))
                list.Add(handler);
        }

        public static void Unsubscribe<T>(Action<T> handler) where T : struct
        {
            if (_handlers.TryGetValue(typeof(T), out var list))
                list.Remove(handler);
        }

        public static void Publish<T>(T evt) where T : struct
        {
            if (!_handlers.TryGetValue(typeof(T), out var list))
                return;

            // Snapshot to allow unsubscribe during invoke
            for (int i = list.Count - 1; i >= 0; i--)
            {
                if (list[i] is Action<T> action)
                    action.Invoke(evt);
            }
        }

        public static void Clear()
        {
            _handlers.Clear();
        }
    }

    // ── Game lifecycle events ──────────────────────────────────────────────
    public readonly struct GameStartedEvent
    {
        public readonly int RunId;
        public GameStartedEvent(int runId) => RunId = runId;
    }

    public readonly struct GamePausedEvent
    {
        public readonly bool IsPaused;
        public GamePausedEvent(bool isPaused) => IsPaused = isPaused;
    }

    public readonly struct GameOverEvent
    {
        public readonly int Score;
        public readonly int DistanceMeters;
        public readonly int PapeletasCollected;
        public readonly int ComboMax;
        public GameOverEvent(int score, int distanceMeters, int papeletas, int comboMax)
        {
            Score = score;
            DistanceMeters = distanceMeters;
            PapeletasCollected = papeletas;
            ComboMax = comboMax;
        }
    }

    public readonly struct GameRestartedEvent { }

    // ── Score / collectibles ───────────────────────────────────────────────
    public readonly struct ScoreChangedEvent
    {
        public readonly int Score;
        public readonly int Multiplier;
        public ScoreChangedEvent(int score, int multiplier)
        {
            Score = score;
            Multiplier = multiplier;
        }
    }

    public readonly struct DistanceChangedEvent
    {
        public readonly int DistanceMeters;
        public DistanceChangedEvent(int distanceMeters) => DistanceMeters = distanceMeters;
    }

    public readonly struct ItemCollectedEvent
    {
        public readonly string ItemId;
        public readonly int Amount;
        public ItemCollectedEvent(string itemId, int amount)
        {
            ItemId = itemId;
            Amount = amount;
        }
    }

    public readonly struct ComboChangedEvent
    {
        public readonly int Combo;
        public readonly int Multiplier;
        public ComboChangedEvent(int combo, int multiplier)
        {
            Combo = combo;
            Multiplier = multiplier;
        }
    }

    // ── Economy (UI must never mutate currency directly) ───────────────────
    public readonly struct CurrencyChangedEvent
    {
        public readonly string CurrencyId;
        public readonly int Balance;
        public CurrencyChangedEvent(string currencyId, int balance)
        {
            CurrencyId = currencyId;
            Balance = balance;
        }
    }

    // ── Input / settings ───────────────────────────────────────────────────
    public readonly struct SettingsChangedEvent
    {
        public readonly string Key;
        public SettingsChangedEvent(string key) => Key = key;
    }

    public readonly struct ReviveRequestedEvent { }
    public readonly struct ReviveCompletedEvent
    {
        public readonly bool Success;
        public ReviveCompletedEvent(bool success) => Success = success;
    }

    // ── Game feel / v3.0 (GDD v3 §4–§5) ────────────────────────────────────
    /// <summary>Player dodged a vehicle by a very small margin — bonus + juice.</summary>
    public readonly struct NearMissEvent
    {
        public readonly float MarginMeters;
        public NearMissEvent(float marginMeters) => MarginMeters = marginMeters;
    }

    /// <summary>Fired at the exact impact frame, before GameOverEvent (death-cam window).</summary>
    public readonly struct PlayerImpactEvent
    {
        public readonly UnityEngine.Vector3 ImpactPosition;
        public PlayerImpactEvent(UnityEngine.Vector3 position) => ImpactPosition = position;
    }

    /// <summary>Player started/finished a lane move — AnimationService listens.</summary>
    public readonly struct PlayerMoveEvent
    {
        public readonly bool Started;
        public readonly bool IsForward;
        public PlayerMoveEvent(bool started, bool isForward)
        {
            Started = started;
            IsForward = isForward;
        }
    }

    /// <summary>Power-up activated (distinct from normal collect for anim/feedback).</summary>
    public readonly struct PowerUpActivatedEvent
    {
        public readonly string PowerUpId;
        public PowerUpActivatedEvent(string powerUpId) => PowerUpId = powerUpId;
    }
}
