// Purpose: Parametric difficulty — speed/density scale by distance (not time).

using UnityEngine;

namespace CruzaRD.Gameplay
{
    [CreateAssetMenu(fileName = "DifficultyCurve", menuName = "CruzaRD/Difficulty Curve")]
    public sealed class DifficultyCurve : ScriptableObject
    {
        [Header("Traffic Speed")]
        [SerializeField] private float _baseSpeed = 4f;
        [SerializeField] private float _speedPerMeter = 0.012f;
        [SerializeField] private float _maxSpeed = 14f;

        [Header("Density")]
        [SerializeField] private float _baseSpawnInterval = 1.4f;
        [SerializeField] private float _minSpawnInterval = 0.35f;
        [SerializeField] private float _intervalReductionPerMeter = 0.0015f;

        [Header("Lane Danger")]
        [SerializeField, Range(0f, 1f)] private float _baseDangerousLaneChance = 0.35f;
        [SerializeField, Range(0f, 1f)] private float _maxDangerousLaneChance = 0.85f;
        [SerializeField] private float _dangerGrowthPerMeter = 0.0008f;

        public float BaseSpeed
        {
            get => _baseSpeed;
            set => _baseSpeed = Mathf.Max(0.1f, value);
        }

        public float SpeedPerMeter
        {
            get => _speedPerMeter;
            set => _speedPerMeter = Mathf.Max(0f, value);
        }

        public float MaxDensityCap => 1f / Mathf.Max(0.05f, _minSpawnInterval);

        public float GetTrafficSpeed(int distanceMeters)
        {
            return Mathf.Min(_maxSpeed, _baseSpeed + distanceMeters * _speedPerMeter);
        }

        public float GetSpawnInterval(int distanceMeters)
        {
            var interval = _baseSpawnInterval - distanceMeters * _intervalReductionPerMeter;
            return Mathf.Max(_minSpawnInterval, interval);
        }

        public float GetDangerousLaneChance(int distanceMeters)
        {
            return Mathf.Clamp01(_baseDangerousLaneChance + distanceMeters * _dangerGrowthPerMeter);
        }

        /// <summary>Remote Config / live-ops override without new build.</summary>
        public void ApplyRemoteOverrides(float baseSpeed, float speedPerMeter, float maxDensity)
        {
            if (baseSpeed > 0f) _baseSpeed = baseSpeed;
            if (speedPerMeter >= 0f) _speedPerMeter = speedPerMeter;
            if (maxDensity > 0f) _minSpawnInterval = 1f / maxDensity;
        }
    }
}
