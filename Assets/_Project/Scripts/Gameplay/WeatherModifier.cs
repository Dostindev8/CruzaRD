// Purpose: Temporary aguacero — reduces traction without breaking input buffer.

using CruzaRD.Core;
using UnityEngine;

namespace CruzaRD.Gameplay
{
    public sealed class WeatherModifier : MonoBehaviour
    {
        [SerializeField] private float _rainTraction = 0.7f;
        [SerializeField] private float _minInterval = 25f;
        [SerializeField] private float _maxInterval = 45f;
        [SerializeField] private float _rainDuration = 6f;

        private GridMovementController _player;
        private float _nextRainAt;
        private float _rainEndsAt;
        private bool _raining;

        private void Awake()
        {
            _player = FindFirstObjectByType<GridMovementController>();
            ScheduleNext();
        }

        private void Update()
        {
            if (GameManager.Instance == null || GameManager.Instance.State != GameState.Playing)
                return;

            if (_raining)
            {
                if (Time.time >= _rainEndsAt)
                {
                    _raining = false;
                    if (_player != null) _player.TractionMultiplier = 1f;
                    ScheduleNext();
                }
                return;
            }

            if (Time.time >= _nextRainAt)
            {
                _raining = true;
                _rainEndsAt = Time.time + _rainDuration;
                if (_player != null) _player.TractionMultiplier = _rainTraction;
            }
        }

        private void ScheduleNext()
        {
            _nextRainAt = Time.time + Random.Range(_minInterval, _maxInterval);
        }
    }
}
