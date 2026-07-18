// Purpose: Cultural power-ups — pica pollo / café / mangú / habichuelas (GDD §3.4).

using CruzaRD.Core;
using UnityEngine;

namespace CruzaRD.Gameplay
{
    public enum PowerUpType
    {
        PicaPollo,
        Cafe,
        Mangu,
        Habichuelas
    }

    [RequireComponent(typeof(Collider))]
    public sealed class PowerUpTrigger : MonoBehaviour
    {
        [SerializeField] private PowerUpType _type = PowerUpType.PicaPollo;
        [SerializeField] private float _duration = 3f;

        private bool _used;

        private void Awake()
        {
            GetComponent<Collider>().isTrigger = true;
            gameObject.tag = "PowerUp";
        }

        public void Activate()
        {
            if (_used) return;
            _used = true;

            var id = _type.ToString().ToLowerInvariant();
            EventBus.Publish(new ItemCollectedEvent(id, 1));
            EventBus.Publish(new PowerUpActivatedEvent(id));

            var player = FindFirstObjectByType<GridMovementController>();
            switch (_type)
            {
                case PowerUpType.PicaPollo:
                    // Speed feel via shorter move duration handled externally; traction boost
                    if (player != null) player.TractionMultiplier = 1f;
                    break;
                case PowerUpType.Cafe:
                    TrafficSlowdown.Apply(_duration, 0.55f);
                    break;
                case PowerUpType.Habichuelas:
                    var col = FindFirstObjectByType<PlayerCollisionHandler>();
                    if (col != null)
                    {
                        col.SetInvulnerable(true);
                        col.StartCoroutine(ClearInvuln(col, _duration));
                    }
                    break;
                case PowerUpType.Mangu:
                    // Combo restore via ItemCollectedEvent id "mangu"
                    break;
            }

            gameObject.SetActive(false);
        }

        private static System.Collections.IEnumerator ClearInvuln(PlayerCollisionHandler col, float t)
        {
            yield return new WaitForSeconds(t);
            col.SetInvulnerable(false);
        }
    }

    public static class TrafficSlowdown
    {
        public static float Multiplier { get; private set; } = 1f;
        private static float _until;

        public static void Apply(float duration, float multiplier)
        {
            Multiplier = multiplier;
            _until = Time.time + duration;
        }

        public static float Evaluate()
        {
            if (Time.time >= _until)
                Multiplier = 1f;
            return Multiplier;
        }
    }
}
