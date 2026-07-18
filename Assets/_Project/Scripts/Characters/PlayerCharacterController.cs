// Purpose: Character facade — bridges grid movement with the animation layer.
// v3 (GDD v3 §12): NO toca el Animator directamente — todo pasa por AnimationService.
// Original characters only (GDD §4.1) — no real public figures.

using CruzaRD.Gameplay;
using UnityEngine;

namespace CruzaRD.Characters
{
    [RequireComponent(typeof(GridMovementController))]
    [RequireComponent(typeof(PlayerCollisionHandler))]
    public sealed class PlayerCharacterController : MonoBehaviour
    {
        private AnimationService _animation;

        private void Awake()
        {
            _animation = GetComponent<AnimationService>();
            if (_animation == null)
                _animation = gameObject.AddComponent<AnimationService>();
        }

        /// <summary>Animation event hook for footstep SFX (called from animation clips).</summary>
        public void AnimEvent_Footstep()
        {
            if (Audio.AudioManager.Instance != null)
                Audio.AudioManager.Instance.PlaySfx("footstep");
        }

        /// <summary>Victory pose al completar una misión (GDD v3 §5.1).</summary>
        public void PlayVictory() => _animation?.PlayVictory();
    }
}
