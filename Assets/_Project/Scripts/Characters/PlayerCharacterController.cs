// Purpose: Character facade — animation hooks + grid movement bridge.
// Original characters only (GDD §4.1) — no real public figures.

using CruzaRD.Core;
using CruzaRD.Gameplay;
using UnityEngine;

namespace CruzaRD.Characters
{
    [RequireComponent(typeof(GridMovementController))]
    [RequireComponent(typeof(PlayerCollisionHandler))]
    public sealed class PlayerCharacterController : MonoBehaviour
    {
        [SerializeField] private Animator _animator;
        [SerializeField] private string _idleParam = "Idle";
        [SerializeField] private string _runParam = "Run";
        [SerializeField] private string _hopParam = "Hop";
        [SerializeField] private string _dieParam = "Die";

        private GridMovementController _movement;
        private static readonly int IdleHash = Animator.StringToHash("Idle");
        private static readonly int RunHash = Animator.StringToHash("Run");
        private static readonly int HopHash = Animator.StringToHash("Hop");
        private static readonly int DieHash = Animator.StringToHash("Die");

        private void Awake()
        {
            _movement = GetComponent<GridMovementController>();
            if (_animator == null)
                _animator = GetComponentInChildren<Animator>();
        }

        private void OnEnable()
        {
            EventBus.Subscribe<GameOverEvent>(OnGameOver);
            EventBus.Subscribe<GameStartedEvent>(OnStarted);
        }

        private void OnDisable()
        {
            EventBus.Unsubscribe<GameOverEvent>(OnGameOver);
            EventBus.Unsubscribe<GameStartedEvent>(OnStarted);
        }

        private void Update()
        {
            if (_animator == null || GameManager.Instance == null)
                return;

            if (GameManager.Instance.State != GameState.Playing)
                return;

            if (_movement.IsMoving)
                SafeSetTrigger(HopHash);
            else
                SafeSetBool(RunHash, true);
        }

        /// <summary>Animation event hook for footstep SFX.</summary>
        public void AnimEvent_Footstep()
        {
            if (Audio.AudioManager.Instance != null)
                Audio.AudioManager.Instance.PlaySfx("footstep");
        }

        private void OnGameOver(GameOverEvent _)
        {
            SafeSetTrigger(DieHash);
        }

        private void OnStarted(GameStartedEvent _)
        {
            SafeSetBool(IdleHash, true);
        }

        private void SafeSetTrigger(int hash)
        {
            if (_animator == null) return;
            _animator.SetTrigger(hash);
        }

        private void SafeSetBool(int hash, bool value)
        {
            if (_animator == null) return;
            _animator.SetBool(hash, value);
        }
    }
}
