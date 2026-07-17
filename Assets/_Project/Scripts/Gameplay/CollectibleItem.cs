// Purpose: Trigger collectible (papeleta / power-ups) — returns to pool on pickup.

using CruzaRD.Core;
using UnityEngine;

namespace CruzaRD.Gameplay
{
    [RequireComponent(typeof(Collider))]
    public sealed class CollectibleItem : MonoBehaviour
    {
        [SerializeField] private string _itemId = "papeleta";
        [SerializeField] private int _amount = 1;

        private ObjectPool _pool;
        private bool _collected;

        public void Init(ObjectPool pool, string itemId, int amount)
        {
            _pool = pool;
            _itemId = itemId;
            _amount = amount;
            _collected = false;

            var col = GetComponent<Collider>();
            col.isTrigger = true;
            gameObject.tag = "Collectible";
        }

        private void OnTriggerEnter(Collider other)
        {
            if (_collected)
                return;

            if (!other.CompareTag("Player"))
                return;

            _collected = true;
            EventBus.Publish(new ItemCollectedEvent(_itemId, _amount));
            _pool?.Return(gameObject);
        }
    }
}
