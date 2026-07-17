// Purpose: Generic object pool — Instantiate/Destroy forbidden in gameplay hot path.

using System.Collections.Generic;
using UnityEngine;

namespace CruzaRD.Gameplay
{
    public sealed class ObjectPool
    {
        private readonly GameObject _prefab;
        private readonly Transform _parent;
        private readonly Queue<GameObject> _available = new();
        private readonly HashSet<GameObject> _active = new();

        public int ActiveCount => _active.Count;
        public int AvailableCount => _available.Count;

        public ObjectPool(GameObject prefab, Transform parent, int prewarm)
        {
            _prefab = prefab;
            _parent = parent;

            for (int i = 0; i < prewarm; i++)
            {
                var go = Object.Instantiate(prefab, parent);
                go.SetActive(false);
                _available.Enqueue(go);
            }
        }

        public GameObject Get(Vector3 position, Quaternion rotation)
        {
            GameObject go;
            if (_available.Count > 0)
            {
                go = _available.Dequeue();
            }
            else
            {
                go = Object.Instantiate(_prefab, _parent);
            }

            go.transform.SetPositionAndRotation(position, rotation);
            go.SetActive(true);
            _active.Add(go);
            return go;
        }

        public void Return(GameObject go)
        {
            if (go == null || !_active.Remove(go))
                return;

            go.SetActive(false);
            go.transform.SetParent(_parent, false);
            _available.Enqueue(go);
        }

        public void ReturnAll()
        {
            var snapshot = new List<GameObject>(_active);
            foreach (var go in snapshot)
                Return(go);
        }
    }
}
