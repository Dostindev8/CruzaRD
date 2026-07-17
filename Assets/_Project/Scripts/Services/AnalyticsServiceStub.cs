// Purpose: Analytics facade — no PII in events. Firebase Analytics swap-in later.

using System.Collections.Generic;
using UnityEngine;

namespace CruzaRD.Services
{
    public interface IAnalyticsService
    {
        void LogEvent(string name, Dictionary<string, object> parameters = null);
        void SetUserProperty(string name, string value);
    }

    public sealed class AnalyticsServiceStub : IAnalyticsService
    {
        public void LogEvent(string name, Dictionary<string, object> parameters = null)
        {
            if (string.IsNullOrEmpty(name)) return;
            // Never log emails, names, or device IDs here.
            Debug.Log($"[Analytics] {name}");
        }

        public void SetUserProperty(string name, string value)
        {
            if (string.IsNullOrEmpty(name)) return;
            Debug.Log($"[Analytics] prop {name}={value}");
        }
    }
}
