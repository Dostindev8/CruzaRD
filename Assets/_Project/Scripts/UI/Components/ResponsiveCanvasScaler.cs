// Purpose: Scale With Screen Size + dynamic match by aspect (GDD §9.1).

using UnityEngine;
using UnityEngine.UI;

namespace CruzaRD.UI.Components
{
    [RequireComponent(typeof(CanvasScaler))]
    public sealed class ResponsiveCanvasScaler : MonoBehaviour
    {
        [SerializeField] private Vector2 _referenceResolution = new Vector2(1080f, 1920f);
        [SerializeField] private float _wideMatch = 0f;   // width-driven for wide
        [SerializeField] private float _tallMatch = 1f;   // height-driven for tall 20:9

        private CanvasScaler _scaler;

        private void Awake()
        {
            _scaler = GetComponent<CanvasScaler>();
            _scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            _scaler.referenceResolution = _referenceResolution;
            _scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            Refresh();
        }

        private void Update() => Refresh();

        public void Refresh()
        {
            if (_scaler == null) return;

            float aspect = (float)Screen.width / Mathf.Max(1, Screen.height);
            // Portrait tall phones (~0.45–0.5) → match height; closer to square → blend to width
            float t = Mathf.InverseLerp(0.45f, 0.75f, aspect);
            _scaler.matchWidthOrHeight = Mathf.Lerp(_tallMatch, _wideMatch, t);
        }
    }
}
