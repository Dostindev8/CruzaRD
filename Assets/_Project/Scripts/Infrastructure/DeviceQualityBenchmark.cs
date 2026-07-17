// Purpose: Auto-select Low/Medium/High on first launch for 60 FPS floor on mid-tier Android.

using CruzaRD.Core;
using CruzaRD.Services;
using UnityEngine;

namespace CruzaRD.Infrastructure
{
    public static class DeviceQualityBenchmark
    {
        public static void ApplyRecommendedQuality()
        {
            int tier;
            if (ServiceLocator.TryGet<ISaveService>(out var save) && save.Data.Settings.QualityTier >= 0)
            {
                tier = save.Data.Settings.QualityTier;
            }
            else
            {
                tier = Benchmark();
                if (save != null)
                {
                    save.Data.Settings.QualityTier = tier;
                    save.Save();
                }
            }

            QualitySettings.SetQualityLevel(Mathf.Clamp(tier, 0, QualitySettings.names.Length - 1), true);
            Application.targetFrameRate = 60;
            Debug.Log($"[Quality] Applied tier {tier} ({QualitySettings.names[Mathf.Clamp(tier, 0, QualitySettings.names.Length - 1)]})");
        }

        private static int Benchmark()
        {
            // Heuristic: RAM + GPU + processor count
            var ram = SystemInfo.systemMemorySize;
            var gpuMem = SystemInfo.graphicsMemorySize;
            var cores = SystemInfo.processorCount;

            if (ram <= 3072 || gpuMem <= 512 || cores <= 4)
                return 0; // Low
            if (ram <= 6144 || gpuMem <= 2048)
                return 1; // Medium
            return 2; // High
        }
    }
}
