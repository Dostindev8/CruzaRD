// Purpose (GDD v3 §5.2/§12): centraliza screen shake calibrado, háptica corta por tipo de
// evento y partículas de "juice" únicas por categoría de ítem. Consumido SOLO vía EventBus —
// nunca invocado directo desde lógica de colisión. Respeta ajuste "reducir movimiento".

using System.Collections.Generic;
using CruzaRD.Core;
using UnityEngine;

namespace CruzaRD.Services
{
    public sealed class FeedbackService : MonoBehaviour
    {
        public static FeedbackService Instance { get; private set; }

        [Header("Screen shake (calibrado — GDD v3 §5.2)")]
        [SerializeField] private float _nearMissShake = 0.06f;    // sutil
        [SerializeField] private float _powerUpShake = 0.12f;     // moderado
        [SerializeField] private float _impactShake = 0.2f;       // fuerte pero legible
        [SerializeField] private float _shakeDecay = 4.5f;

        private Transform _cameraTransform;
        private Vector3 _shakeOffset;
        private float _shakeAmplitude;
        private bool _reduceMotion;
        private bool _hapticsEnabled = true;

        // Colores de partícula por categoría (papeleta: dorado · picapollo: naranja · café: vapor)
        private static readonly Dictionary<string, Color> ParticleColors = new()
        {
            { "papeleta", new Color(0.96f, 0.65f, 0.14f) },
            { "picapollo", new Color(1f, 0.45f, 0.1f) },
            { "cafe", new Color(0.55f, 0.4f, 0.3f) },
            { "mangu", new Color(0.95f, 0.9f, 0.6f) },
            { "habichuelas", new Color(0.7f, 0.2f, 0.3f) }
        };

        private readonly Dictionary<string, ParticleSystem> _particlePool = new();

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void OnEnable()
        {
            EventBus.Subscribe<NearMissEvent>(OnNearMiss);
            EventBus.Subscribe<ItemCollectedEvent>(OnCollect);
            EventBus.Subscribe<PowerUpActivatedEvent>(OnPowerUp);
            EventBus.Subscribe<PlayerImpactEvent>(OnImpact);
            EventBus.Subscribe<SettingsChangedEvent>(OnSettingsChanged);
        }

        private void OnDisable()
        {
            EventBus.Unsubscribe<NearMissEvent>(OnNearMiss);
            EventBus.Unsubscribe<ItemCollectedEvent>(OnCollect);
            EventBus.Unsubscribe<PowerUpActivatedEvent>(OnPowerUp);
            EventBus.Unsubscribe<PlayerImpactEvent>(OnImpact);
            EventBus.Unsubscribe<SettingsChangedEvent>(OnSettingsChanged);
        }

        private void LateUpdate()
        {
            if (_shakeAmplitude <= 0.001f)
            {
                if (_shakeOffset != Vector3.zero && _cameraTransform != null)
                {
                    _cameraTransform.localPosition -= _shakeOffset;
                    _shakeOffset = Vector3.zero;
                }
                return;
            }

            EnsureCamera();
            if (_cameraTransform == null) return;

            _cameraTransform.localPosition -= _shakeOffset;
            _shakeOffset = Random.insideUnitSphere * _shakeAmplitude;
            _shakeOffset.z = 0f;
            _cameraTransform.localPosition += _shakeOffset;
            _shakeAmplitude = Mathf.MoveTowards(_shakeAmplitude, 0f, Time.unscaledDeltaTime * _shakeDecay * _shakeAmplitude + 0.001f);
        }

        // ── Event handlers ─────────────────────────────────────────────────

        private void OnNearMiss(NearMissEvent _)
        {
            Shake(_nearMissShake);
            Haptic(HapticStrength.Light);
        }

        private void OnCollect(ItemCollectedEvent e)
        {
            EmitParticles(e.ItemId, 8);
            Haptic(HapticStrength.Light);
        }

        private void OnPowerUp(PowerUpActivatedEvent e)
        {
            Shake(_powerUpShake);
            EmitParticles(e.PowerUpId, 20);
            Haptic(HapticStrength.Medium);
        }

        private void OnImpact(PlayerImpactEvent _)
        {
            Shake(_impactShake);
            Haptic(HapticStrength.Heavy);
        }

        private void OnSettingsChanged(SettingsChangedEvent e)
        {
            if (!ServiceLocator.TryGet<ISaveService>(out var save)) return;
            _reduceMotion = save.Data.Settings.ReduceMotion;
            _hapticsEnabled = save.Data.Settings.HapticsEnabled;
        }

        // ── Primitives ─────────────────────────────────────────────────────

        public void Shake(float amplitude)
        {
            if (_reduceMotion) return; // accesibilidad GDD v3 §11.4
            _shakeAmplitude = Mathf.Max(_shakeAmplitude, amplitude);
        }

        private enum HapticStrength { Light, Medium, Heavy }

        private void Haptic(HapticStrength strength)
        {
            if (!_hapticsEnabled) return;
#if UNITY_ANDROID || UNITY_IOS
            // Base API; upgrade path: Unity Haptics / CoreHaptics por intensidad.
            if (strength != HapticStrength.Light)
                Handheld.Vibrate();
#endif
        }

        private void EmitParticles(string itemId, int count)
        {
            var color = ParticleColors.TryGetValue(itemId, out var c) ? c : Color.white;
            var ps = GetOrCreateSystem(itemId, color);
            if (ps == null) return;

            var player = FindFirstObjectByType<Gameplay.GridMovementController>();
            if (player != null)
                ps.transform.position = player.transform.position + Vector3.up * 0.8f;

            ps.Emit(count);
        }

        private ParticleSystem GetOrCreateSystem(string key, Color color)
        {
            if (_particlePool.TryGetValue(key, out var existing) && existing != null)
                return existing;

            var go = new GameObject($"Juice_{key}");
            go.transform.SetParent(transform, false);
            var ps = go.AddComponent<ParticleSystem>();

            var main = ps.main;
            main.startColor = color;
            main.startSize = new ParticleSystem.MinMaxCurve(0.08f, 0.18f);
            main.startSpeed = new ParticleSystem.MinMaxCurve(1.2f, 2.6f);
            main.startLifetime = new ParticleSystem.MinMaxCurve(0.35f, 0.6f);
            main.gravityModifier = key == "cafe" ? -0.35f : 0.6f; // café: vapor ascendente
            main.playOnAwake = false;
            main.maxParticles = 64;
            main.simulationSpace = ParticleSystemSimulationSpace.World;

            var emission = ps.emission;
            emission.enabled = false; // solo Emit() manual

            var shape = ps.shape;
            shape.shapeType = ParticleSystemShapeType.Sphere;
            shape.radius = 0.25f;

            var renderer = ps.GetComponent<ParticleSystemRenderer>();
            renderer.material = new Material(Shader.Find("Universal Render Pipeline/Particles/Unlit")
                                             ?? Shader.Find("Particles/Standard Unlit")
                                             ?? Shader.Find("Sprites/Default"));

            _particlePool[key] = ps;
            return ps;
        }

        private void EnsureCamera()
        {
            if (_cameraTransform == null && Camera.main != null)
                _cameraTransform = Camera.main.transform;
        }
    }
}
