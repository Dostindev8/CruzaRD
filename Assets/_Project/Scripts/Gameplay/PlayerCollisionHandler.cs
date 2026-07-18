// Purpose: Trigger-only collisions (no full physics) — lethal / collectible / power-up.

using CruzaRD.Core;
using UnityEngine;

namespace CruzaRD.Gameplay
{
    public enum CollisionKind
    {
        Lethal,
        Collectible,
        PowerUp
    }

    [RequireComponent(typeof(Collider))]
    public sealed class PlayerCollisionHandler : MonoBehaviour
    {
        [SerializeField] private bool _invulnerable;

        private void Awake()
        {
            var col = GetComponent<Collider>();
            col.isTrigger = true;
            if (!CompareTag("Player"))
                gameObject.tag = "Player";
        }

        private void OnTriggerEnter(Collider other)
        {
            if (GameManager.Instance == null || GameManager.Instance.State != GameState.Playing)
                return;

            if (other.CompareTag("Hazard") || other.GetComponent<PooledVehicle>() != null)
            {
                if (_invulnerable)
                    return;

                GameManager.Instance.BreakCombo();
                // Death-cam v3: impacto → cámara lenta → GameOver (no corte seco)
                GameManager.Instance.TriggerImpact(transform.position);
                return;
            }

            // Collectibles handle themselves; power-ups may publish ItemCollectedEvent
            var power = other.GetComponent<PowerUpTrigger>();
            if (power != null)
                power.Activate();
        }

        public void SetInvulnerable(bool value) => _invulnerable = value;
    }
}
