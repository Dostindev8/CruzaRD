// Purpose (GDD v3 §11.2): ningún botón "muerto" — micro-animación de escala 0.95x al
// presionar con retorno por easing. Independiente de Time.timeScale (funciona en pausa).

using UnityEngine;
using UnityEngine.EventSystems;

namespace CruzaRD.UI.Components
{
    public sealed class UIButtonJuice : MonoBehaviour, IPointerDownHandler, IPointerUpHandler, IPointerExitHandler
    {
        [SerializeField] private float _pressedScale = 0.95f;
        [SerializeField] private float _speed = 14f;

        private Vector3 _baseScale;
        private float _target = 1f;
        private float _current = 1f;

        private void Awake() => _baseScale = transform.localScale;

        private void OnEnable()
        {
            _target = 1f;
            _current = 1f;
            transform.localScale = _baseScale;
        }

        private void Update()
        {
            if (Mathf.Approximately(_current, _target))
                return;

            _current = Mathf.MoveTowards(_current, _target, Time.unscaledDeltaTime * _speed);
            // Easing suave con leve overshoot al soltar
            var eased = _target > _current ? Mathf.SmoothStep(_current, _target, 0.6f) : _current;
            transform.localScale = _baseScale * eased;
        }

        public void OnPointerDown(PointerEventData _) => _target = _pressedScale;
        public void OnPointerUp(PointerEventData _) => _target = 1f;
        public void OnPointerExit(PointerEventData _) => _target = 1f;
    }
}
