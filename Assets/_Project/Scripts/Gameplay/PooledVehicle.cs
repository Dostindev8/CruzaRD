// Purpose: Trigger-based lethal traffic entity returned to pool off-screen.

using CruzaRD.Core;
using UnityEngine;

namespace CruzaRD.Gameplay
{
    [RequireComponent(typeof(Collider))]
    public sealed class PooledVehicle : MonoBehaviour
    {
        private ObjectPool _pool;
        private Vector3 _dir;
        private float _speed;
        private float _despawnDistance;
        private Vector3 _origin;

        public void Init(ObjectPool pool, Vector3 direction, float speed, float despawnDistance)
        {
            _pool = pool;
            _dir = direction.normalized;
            _speed = speed;
            _despawnDistance = despawnDistance;
            _origin = transform.position;

            var col = GetComponent<Collider>();
            col.isTrigger = true;

            if (!CompareTag("Hazard"))
                gameObject.tag = "Hazard";
        }

        private void Update()
        {
            if (GameManager.Instance != null && GameManager.Instance.State != GameState.Playing)
                return;

            transform.position += _dir * (_speed * Time.deltaTime);
            if (Vector3.Distance(_origin, transform.position) >= _despawnDistance)
                _pool?.Return(gameObject);
        }
    }
}
