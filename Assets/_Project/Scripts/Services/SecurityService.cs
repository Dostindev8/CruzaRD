// Purpose (GDD v3 §13): SecurityService — validación de integridad local, ofuscación en
// memoria de valores de economía (anti memory-editing), validación de rangos plausibles de
// puntaje/distancia antes de acreditar recompensas, y puente hacia validación server-side.
// ISO 27001 / OWASP MASVS como marco interno; nada sensible en texto plano.

using System;
using CruzaRD.Core;
using UnityEngine;

namespace CruzaRD.Services
{
    public interface ISecurityService
    {
        bool ValidateRunRewards(int score, int distanceMeters, float runDurationSeconds);
        bool IsEnvironmentTrusted();
        void ReportSuspicious(string reason);
    }

    /// <summary>
    /// Entero ofuscado en memoria con XOR + clave aleatoria por instancia.
    /// Dificulta memory-editing (GameGuardian y similares) sobre balances de economía.
    /// </summary>
    [Serializable]
    public struct SecureInt
    {
        private int _obfuscated;
        private int _key;

        public int Value
        {
            get => _obfuscated ^ _key;
            set
            {
                _key = UnityEngine.Random.Range(int.MinValue / 2, int.MaxValue / 2);
                _obfuscated = value ^ _key;
            }
        }

        public static implicit operator int(SecureInt s) => s.Value;
        public static implicit operator SecureInt(int v) => new SecureInt { Value = v };
    }

    public sealed class SecurityService : ISecurityService
    {
        // Rangos plausibles (GDD v3 §13.2): un humano en este juego no supera estos límites.
        private const float MaxMetersPerSecond = 6f;     // grid: ~2.5 m/s promedio real
        private const float MaxScorePerSecond = 400f;    // combo x5 con power-ups incluidos
        private const int MaxScorePerRunAbsolute = 2_000_000;

        private int _suspiciousCount;

        /// <summary>
        /// Valida que las recompensas de una partida estén en rangos humanamente posibles
        /// ANTES de acreditar moneda. En producción esta validación se replica server-side
        /// (ASP.NET Core) — el cliente nunca es la única autoridad.
        /// </summary>
        public bool ValidateRunRewards(int score, int distanceMeters, float runDurationSeconds)
        {
            if (score < 0 || distanceMeters < 0 || runDurationSeconds <= 0f)
            {
                ReportSuspicious("Negative or zero-duration run values");
                return false;
            }

            if (score > MaxScorePerRunAbsolute)
            {
                ReportSuspicious($"Score {score} exceeds absolute cap");
                return false;
            }

            if (distanceMeters / runDurationSeconds > MaxMetersPerSecond)
            {
                ReportSuspicious($"Impossible speed: {distanceMeters}m in {runDurationSeconds:F1}s");
                return false;
            }

            if (score / runDurationSeconds > MaxScorePerSecond)
            {
                ReportSuspicious($"Impossible score rate: {score} in {runDurationSeconds:F1}s");
                return false;
            }

            return true;
        }

        /// <summary>
        /// Anti-tampering básico (GDD v3 §13.1): heurísticas de entorno no confiable antes de
        /// sincronizar economía en la nube. No bloquea el juego offline — solo la sincronía.
        /// </summary>
        public bool IsEnvironmentTrusted()
        {
#if UNITY_EDITOR
            return true; // desarrollo
#else
            if (Debug.isDebugBuild)
                return false;

            // Heurística de root/jailbreak mínima; se amplía con SafetyNet/DeviceCheck en Fase 5.
            if (Application.sandboxType == ApplicationSandboxType.SandboxBroken)
                return false;

            return true;
#endif
        }

        public void ReportSuspicious(string reason)
        {
            _suspiciousCount++;
            // Sin PII: solo el motivo técnico. En producción → Analytics/Crashlytics no-fatal.
            Debug.LogWarning($"[Security] Suspicious activity #{_suspiciousCount}: {reason}");
        }
    }
}
