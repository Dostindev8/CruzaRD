// Purpose (GDD v3 §5/§12): ÚNICA capa que traduce eventos de gameplay a triggers de Animator.
// Ningún script de gameplay llama directo al Animator. Cubre el set de 9 estados:
// idle · run · lane switch · jump/dodge · near-miss · collect · collect power-up · death · victoria.
// Root Motion queda desactivado: la posición la controla el grid, la animación es visual.

using CruzaRD.Core;
using UnityEngine;

namespace CruzaRD.Characters
{
    public sealed class AnimationService : MonoBehaviour
    {
        [SerializeField] private Animator _animator;

        // Hashes del set obligatorio (GDD v3 §5.1)
        public static readonly int IdleHash = Animator.StringToHash("Idle");
        public static readonly int RunHash = Animator.StringToHash("Run");
        public static readonly int LaneSwitchHash = Animator.StringToHash("LaneSwitch");
        public static readonly int JumpDodgeHash = Animator.StringToHash("JumpDodge");
        public static readonly int NearMissHash = Animator.StringToHash("NearMiss");
        public static readonly int CollectHash = Animator.StringToHash("Collect");
        public static readonly int CollectPowerHash = Animator.StringToHash("CollectPowerUp");
        public static readonly int DeathHash = Animator.StringToHash("Death");
        public static readonly int VictoryHash = Animator.StringToHash("Victory");

        private Transform _visual;
        private Vector3 _visualBaseScale = Vector3.one;
        private float _squashT = 1f;

        private void Awake()
        {
            if (_animator == null)
                _animator = GetComponentInChildren<Animator>();

            if (_animator != null)
                _animator.applyRootMotion = false;

            _visual = _animator != null ? _animator.transform : transform;
            _visualBaseScale = _visual.localScale;
        }

        private void OnEnable()
        {
            EventBus.Subscribe<GameStartedEvent>(OnGameStarted);
            EventBus.Subscribe<PlayerMoveEvent>(OnPlayerMove);
            EventBus.Subscribe<NearMissEvent>(OnNearMiss);
            EventBus.Subscribe<ItemCollectedEvent>(OnCollect);
            EventBus.Subscribe<PowerUpActivatedEvent>(OnPowerUp);
            EventBus.Subscribe<PlayerImpactEvent>(OnImpact);
        }

        private void OnDisable()
        {
            EventBus.Unsubscribe<GameStartedEvent>(OnGameStarted);
            EventBus.Unsubscribe<PlayerMoveEvent>(OnPlayerMove);
            EventBus.Unsubscribe<NearMissEvent>(OnNearMiss);
            EventBus.Unsubscribe<ItemCollectedEvent>(OnCollect);
            EventBus.Unsubscribe<PowerUpActivatedEvent>(OnPowerUp);
            EventBus.Unsubscribe<PlayerImpactEvent>(OnImpact);
        }

        private void Update()
        {
            // Squash & stretch procedural mientras no exista rig final (GDD v3 §5.2).
            if (_squashT < 1f)
            {
                _squashT = Mathf.Min(1f, _squashT + Time.deltaTime * 6f);
                float squash = Mathf.Sin(_squashT * Mathf.PI);
                _visual.localScale = new Vector3(
                    _visualBaseScale.x * (1f + 0.12f * squash),
                    _visualBaseScale.y * (1f - 0.15f * squash),
                    _visualBaseScale.z * (1f + 0.12f * squash));
            }
        }

        public void PlaySquashStretch() => _squashT = 0f;

        private void OnGameStarted(GameStartedEvent _)
        {
            _visual.localScale = _visualBaseScale;
            _squashT = 1f;
            SetTrigger(RunHash);
        }

        private void OnPlayerMove(PlayerMoveEvent e)
        {
            if (!e.Started)
            {
                PlaySquashStretch(); // aterrizaje (stretch)
                return;
            }

            SetTrigger(e.IsForward ? JumpDodgeHash : LaneSwitchHash);
        }

        private void OnNearMiss(NearMissEvent _) => SetTrigger(NearMissHash);

        private void OnCollect(ItemCollectedEvent e)
        {
            PlaySquashStretch();
            SetTrigger(CollectHash);
        }

        private void OnPowerUp(PowerUpActivatedEvent _)
        {
            PlaySquashStretch();
            SetTrigger(CollectPowerHash);
        }

        private void OnImpact(PlayerImpactEvent _) => SetTrigger(DeathHash);

        public void PlayVictory() => SetTrigger(VictoryHash);

        private void SetTrigger(int hash)
        {
            if (_animator == null || _animator.runtimeAnimatorController == null)
                return;

            _animator.SetTrigger(hash);
        }
    }
}
