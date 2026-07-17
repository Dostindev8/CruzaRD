// Purpose: Base for vehicle AI patterns (OMSA / motoconcho / jeepeta).

using UnityEngine;

namespace CruzaRD.Gameplay.TrafficPatterns
{
    public abstract class TrafficPatternBase : MonoBehaviour
    {
        [SerializeField] protected float Speed = 5f;
        [SerializeField] protected float LaneWidth = 1f;

        protected Vector3 Direction = Vector3.right;

        public virtual void Configure(float speed, Vector3 direction)
        {
            Speed = speed * PowerUpTrigger.Evaluate();
            Direction = direction.normalized;
        }

        protected virtual void Update()
        {
            transform.position += Direction * (Speed * Time.deltaTime);
            TickPattern();
        }

        protected abstract void TickPattern();
    }
}
