// Purpose: Respect notch / Dynamic Island / gesture bar insets on every edge-anchored UI.

using UnityEngine;

namespace CruzaRD.UI.Components
{
    [RequireComponent(typeof(RectTransform))]
    public sealed class SafeAreaHandler : MonoBehaviour
    {
        [SerializeField] private bool _applyTop = true;
        [SerializeField] private bool _applyBottom = true;
        [SerializeField] private bool _applyLeft = true;
        [SerializeField] private bool _applyRight = true;

        private RectTransform _rect;
        private Rect _lastSafe;
        private Vector2Int _lastScreen;

        private void Awake()
        {
            _rect = GetComponent<RectTransform>();
            Apply();
        }

        private void Update()
        {
            if (_lastSafe != Screen.safeArea || _lastScreen.x != Screen.width || _lastScreen.y != Screen.height)
                Apply();
        }

        public void Apply()
        {
            if (_rect == null)
                _rect = GetComponent<RectTransform>();

            var safe = Screen.safeArea;
            _lastSafe = safe;
            _lastScreen = new Vector2Int(Screen.width, Screen.height);

            var anchorMin = safe.position;
            var anchorMax = safe.position + safe.size;
            anchorMin.x /= Screen.width;
            anchorMin.y /= Screen.height;
            anchorMax.x /= Screen.width;
            anchorMax.y /= Screen.height;

            if (!_applyLeft) anchorMin.x = 0f;
            if (!_applyBottom) anchorMin.y = 0f;
            if (!_applyRight) anchorMax.x = 1f;
            if (!_applyTop) anchorMax.y = 1f;

            _rect.anchorMin = anchorMin;
            _rect.anchorMax = anchorMax;
            _rect.offsetMin = Vector2.zero;
            _rect.offsetMax = Vector2.zero;
        }
    }
}
