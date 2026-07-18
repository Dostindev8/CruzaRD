// Purpose: Optional on-screen D-pad — min 48dp touch targets, toggle from Settings.

using CruzaRD.Gameplay;
using UnityEngine;
using UnityEngine.UI;

namespace CruzaRD.UI.Components
{
    public sealed class OnScreenDpad : MonoBehaviour
    {
        [SerializeField] private GameObject _root;
        [SerializeField] private Button _up;
        [SerializeField] private Button _down;
        [SerializeField] private Button _left;
        [SerializeField] private Button _right;

        private GridMovementController _movement;

        private void Awake()
        {
            if (_root == null) _root = gameObject;
            _movement = FindFirstObjectByType<GridMovementController>();
            Wire(_up, GridMoveDirection.Forward);
            Wire(_down, GridMoveDirection.Backward);
            Wire(_left, GridMoveDirection.Left);
            Wire(_right, GridMoveDirection.Right);
            SetEnabled(false);
        }

        private void Wire(Button btn, GridMoveDirection dir)
        {
            if (btn == null) return;
            btn.onClick.AddListener(() =>
            {
                if (_movement == null)
                    _movement = FindFirstObjectByType<GridMovementController>();
                _movement?.RequestMove(dir);
            });

            var rt = btn.GetComponent<RectTransform>();
            if (rt != null)
            {
                var size = rt.sizeDelta;
                if (size.x < UITheme.MinTouchDp) size.x = UITheme.MinTouchDp;
                if (size.y < UITheme.MinTouchDp) size.y = UITheme.MinTouchDp;
                rt.sizeDelta = size;
            }
        }

        public void SetEnabled(bool enabled)
        {
            if (_root != null) _root.SetActive(enabled);
        }

        public void Bind(GameObject root, Button up, Button down, Button left, Button right)
        {
            _root = root;
            _up = up;
            _down = down;
            _left = left;
            _right = right;
            Wire(_up, GridMoveDirection.Forward);
            Wire(_down, GridMoveDirection.Backward);
            Wire(_left, GridMoveDirection.Left);
            Wire(_right, GridMoveDirection.Right);
        }
    }
}
