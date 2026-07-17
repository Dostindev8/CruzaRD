// Purpose: Unit tests for combo multiplier math (critical economy/score logic).

using CruzaRD.Core;
using NUnit.Framework;

namespace CruzaRD.Tests
{
    public sealed class ScoreTrackerTests
    {
        [Test]
        public void Multiplier_Defaults_To_One()
        {
            var tracker = new ScoreTracker();
            Assert.AreEqual(1, tracker.MultiplierFromCombo(0));
            Assert.AreEqual(1, tracker.MultiplierFromCombo(4));
        }

        [Test]
        public void Multiplier_Scales_With_Combo()
        {
            var tracker = new ScoreTracker();
            Assert.AreEqual(2, tracker.MultiplierFromCombo(5));
            Assert.AreEqual(3, tracker.MultiplierFromCombo(10));
            Assert.AreEqual(4, tracker.MultiplierFromCombo(20));
            Assert.AreEqual(5, tracker.MultiplierFromCombo(30));
        }
    }
}
