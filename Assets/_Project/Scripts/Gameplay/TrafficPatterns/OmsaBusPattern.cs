// Purpose: Guagua OMSA — fixed lane, constant speed (generic "Guagua Metro" if unlicensed).

namespace CruzaRD.Gameplay.TrafficPatterns
{
    public sealed class OmsaBusPattern : TrafficPatternBase
    {
        protected override void TickPattern()
        {
            // Constant velocity — no lane changes. Intentionally simple for readability.
            Speed = UnityEngine.Mathf.Max(2f, Speed);
        }
    }
}
