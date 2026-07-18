// Purpose (GDD v3 §4): detecta esquives por margen mínimo ("near-miss") y publica
// NearMissEvent → puntos bonus (GameManager) + micro-shake/SFX/animación (Feedback/Animation).
// Vive en un hijo del jugador con SphereCollider trigger más amplio que el collider letal.

using System.Collections.Generic;
using CruzaRD.Core;
using UnityEngine;

namespace CruzaRD.Gameplay
{
    public sealed class NearMissDetector : MonoBehaviour
    {
        [SerializeField] private float _radius = 1.15f;
        [SerializeField] private float _cooldownSeconds = 0.3f;

        private readonly Dictionary<Collider, float> _tracked = new();
        private float _lastNearMissTime = -10f;

        /// <summary>Crea el detector como hijo del jugador (usado por el bootstrap de escena).</summary>
        public static NearMissDetector AttachTo(GameObject player)
        {
            var existing = player.GetComponentInChildren<NearMissDetector>();
            if (existing != null)
                return existing;

            var go = new GameObject("NearMissDetector");
            go.transform.SetParent(player.transform, false);

            var detector = go.AddComponent<NearMissDetector>();
            var sphere = go.AddComponent<SphereCollider>();
            sphere.isTrigger = true;
            sphere.radius = detector._radius;

            var rb = go.AddComponent<Rigidbody>();
            rb.isKinematic = true;
            rb.useGravity = false;

            return detector;
        }

        private void OnTriggerEnter(Collider other)
        {
            if (other.GetComponent<PooledVehicle>() == null)
                return;

            _tracked[other] = float.MaxValue;
        }

        private void OnTriggerStay(Collider other)
        {
            if (!_tracked.TryGetValue(other, out var closest))
                return;

            var dist = Vector3.Distance(transform.position, other.ClosestPoint(transform.position));
            if (dist < closest)
                _tracked[other] = dist;
        }

        private void OnTriggerExit(Collider other)
        {
            if (!_tracked.TryGetValue(other, out var closestApproach))
                return;

            _tracked.Remove(other);

            if (GameManager.Instance == null || GameManager.Instance.State != GameState.Playing)
                return;

            // El vehículo entró al radio de peligro y salió sin matar → near-miss
            if (Time.time - _lastNearMissTime < _cooldownSeconds)
                return;

            _lastNearMissTime = Time.time;
            EventBus.Publish(new NearMissEvent(closestApproach));
        }

        private void OnDisable() => _tracked.Clear();
    }
}
