// Purpose: Live difficulty/economy knobs via Firebase Remote Config (stub until SDK).

using CruzaRD.Gameplay;
using UnityEngine;

namespace CruzaRD.Services
{
    public interface IRemoteConfigService
    {
        void FetchAndApply(DifficultyCurve curve);
        float GetFloat(string key, float fallback);
    }

    public sealed class RemoteConfigServiceStub : IRemoteConfigService
    {
        private readonly System.Collections.Generic.Dictionary<string, float> _values = new()
        {
            { "base_speed", 4f },
            { "speed_per_meter", 0.012f },
            { "max_density", 2.5f }
        };

        public void FetchAndApply(DifficultyCurve curve)
        {
            if (curve == null) return;
            // Production: await FirebaseRemoteConfig.DefaultInstance.FetchAsync
            curve.ApplyRemoteOverrides(
                GetFloat("base_speed", 4f),
                GetFloat("speed_per_meter", 0.012f),
                GetFloat("max_density", 2.5f));
            Debug.Log("[RemoteConfig] Applied difficulty overrides (stub defaults).");
        }

        public float GetFloat(string key, float fallback)
        {
            return _values.TryGetValue(key, out var v) ? v : fallback;
        }
    }
}
