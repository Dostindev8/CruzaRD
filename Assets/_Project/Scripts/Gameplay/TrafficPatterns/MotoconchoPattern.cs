// Purpose: Motoconcho — erratic occasional lane change.

using UnityEngine;

namespace CruzaRD.Gameplay.TrafficPatterns
{
    public sealed class MotoconchoPattern : TrafficPatternBase
    {
        [SerializeField] private float _laneChangeChancePerSecond = 0.35f;
        [SerializeField] private int _minLane = -2;
        [SerializeField] private int _maxLane = 2;

        private float _targetX;
        private bool _changing;

        protected override void TickPattern()
        {
            if (!_changing && Random.value < _laneChangeChancePerSecond * Time.deltaTime)
            {
                var lane = Random.Range(_minLane, _maxLane + 1);
                _targetX = lane * LaneWidth;
                _changing = true;
            }

            if (!_changing)
                return;

            var pos = transform.position;
            pos.x = Mathf.MoveTowards(pos.x, _targetX, Speed * 0.8f * Time.deltaTime);
            transform.position = pos;
            if (Mathf.Abs(pos.x - _targetX) < 0.02f)
                _changing = false;
        }
    }
}
