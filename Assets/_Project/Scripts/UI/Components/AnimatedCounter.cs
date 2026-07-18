// Purpose (GDD v3 §11.2): contadores numéricos con animación de conteo rápido —
// nunca salto instantáneo de número. Usa tiempo sin escalar (cuenta incluso en pausa/muerte).

using TMPro;
using UnityEngine;

namespace CruzaRD.UI.Components
{
    public sealed class AnimatedCounter : MonoBehaviour
    {
        [SerializeField] private TextMeshProUGUI _label;
        [SerializeField] private float _countDuration = 0.35f;
        [SerializeField] private string _format = "N0";
        [SerializeField] private string _suffix = "";

        private float _displayed;
        private int _target;

        private void Awake()
        {
            if (_label == null)
                _label = GetComponent<TextMeshProUGUI>();
        }

        public void Bind(TextMeshProUGUI label, string format = "N0", string suffix = "")
        {
            _label = label;
            _format = format;
            _suffix = suffix;
        }

        /// <summary>Fija el objetivo y anima el conteo hasta él.</summary>
        public void SetValue(int value)
        {
            _target = value;
            enabled = true;
        }

        /// <summary>Fija el valor sin animación (reset de partida).</summary>
        public void SetImmediate(int value)
        {
            _target = value;
            _displayed = value;
            Render();
        }

        private void Update()
        {
            if (Mathf.Approximately(_displayed, _target))
                return;

            var speed = Mathf.Max(1f, Mathf.Abs(_target - _displayed)) / Mathf.Max(0.05f, _countDuration);
            _displayed = Mathf.MoveTowards(_displayed, _target, speed * Time.unscaledDeltaTime);
            Render();
        }

        private void Render()
        {
            if (_label != null)
                _label.text = Mathf.RoundToInt(_displayed).ToString(_format) + _suffix;
        }
    }
}
