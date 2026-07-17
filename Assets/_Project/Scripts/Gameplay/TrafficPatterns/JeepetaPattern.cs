// Purpose: Jeepeta — high speed, prefers central lanes.

using UnityEngine;

namespace CruzaRD.Gameplay.TrafficPatterns
{
    public sealed class JeepetaPattern : TrafficPatternBase
    {
        [SerializeField] private float _speedMultiplier = 1.35f;

        public override void Configure(float speed, Vector3 direction)
        {
            base.Configure(speed * _speedMultiplier, direction);
            // Snap toward center lanes
            var pos = transform.position;
            pos.x = Mathf.Clamp(pos.x, -1f * LaneWidth, 1f * LaneWidth);
            transform.position = pos;
        }

        protected override void TickPattern()
        {
            // Maintain central bias
            var pos = transform.position;
            pos.x = Mathf.MoveTowards(pos.x, 0f, 0.5f * Time.deltaTime);
            transform.position = pos;
        }
    }
}
