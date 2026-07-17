// Purpose: Grid-snapped movement with cubic easing (0.12–0.18s) + 150ms input buffer.
// Swipe thresholds scale by screen size (not fixed pixels) for full responsive feel.

using CruzaRD.Core;
using UnityEngine;
using UnityEngine.InputSystem;

namespace CruzaRD.Gameplay
{
    public enum MoveDirection
    {
        None,
        Forward,
        Backward,
        Left,
        Right
    }

    public sealed class GridMovementController : MonoBehaviour
    {
        [Header("Grid")]
        [SerializeField] private float _cellSize = 1f;
        [SerializeField] private int _minLaneX = -2;
        [SerializeField] private int _maxLaneX = 2;

        [Header("Timing")]
        [SerializeField, Range(0.12f, 0.18f)] private float _moveDuration = 0.15f;
        [SerializeField] private float _inputBufferSeconds = 0.15f;

        [Header("Swipe (screen-relative)")]
        [SerializeField, Range(0.04f, 0.2f)] private float _swipeThresholdFraction = 0.08f;
        [SerializeField] private float _maxSwipeTime = 0.45f;

        [Header("Traction")]
        [SerializeField] private float _tractionMultiplier = 1f;

        private Vector2Int _gridPos;
        private Vector3 _startWorld;
        private Vector3 _targetWorld;
        private float _moveT;
        private bool _isMoving;
        private MoveDirection _bufferedDir = MoveDirection.None;
        private float _bufferExpiry = -1f;

        private Vector2 _pointerStart;
        private float _pointerStartTime;
        private bool _pointerDown;

        public Vector2Int GridPosition => _gridPos;
        public bool IsMoving => _isMoving;
        public float TractionMultiplier
        {
            get => _tractionMultiplier;
            set => _tractionMultiplier = Mathf.Clamp(value, 0.35f, 1f);
        }

        private void Awake()
        {
            _gridPos = WorldToGrid(transform.position);
            SnapToGridImmediate();
        }

        private void OnEnable()
        {
            EventBus.Subscribe<GameStartedEvent>(OnGameStarted);
            EventBus.Subscribe<GameRestartedEvent>(OnRestart);
        }

        private void OnDisable()
        {
            EventBus.Unsubscribe<GameStartedEvent>(OnGameStarted);
            EventBus.Unsubscribe<GameRestartedEvent>(OnRestart);
        }

        private void Update()
        {
            if (GameManager.Instance != null && GameManager.Instance.State != GameState.Playing)
                return;

            ReadInput();
            TickMovement();
        }

        public void RequestMove(MoveDirection dir)
        {
            if (dir == MoveDirection.None)
                return;

            if (!_isMoving)
            {
                TryBeginMove(dir);
                return;
            }

            _bufferedDir = dir;
            _bufferExpiry = Time.unscaledTime + _inputBufferSeconds;
        }

        private void ReadInput()
        {
            // Keyboard fallback for Editor playtests
            var keyboard = Keyboard.current;
            if (keyboard != null)
            {
                if (keyboard.wKey.wasPressedThisFrame || keyboard.upArrowKey.wasPressedThisFrame)
                    RequestMove(MoveDirection.Forward);
                if (keyboard.sKey.wasPressedThisFrame || keyboard.downArrowKey.wasPressedThisFrame)
                    RequestMove(MoveDirection.Backward);
                if (keyboard.aKey.wasPressedThisFrame || keyboard.leftArrowKey.wasPressedThisFrame)
                    RequestMove(MoveDirection.Left);
                if (keyboard.dKey.wasPressedThisFrame || keyboard.rightArrowKey.wasPressedThisFrame)
                    RequestMove(MoveDirection.Right);
            }

            var touch = Touchscreen.current;
            var mouse = Mouse.current;

            if (touch != null && touch.primaryTouch.press.isPressed)
            {
                HandlePointer(touch.primaryTouch.position.ReadValue(), touch.primaryTouch.press.wasPressedThisFrame,
                    touch.primaryTouch.press.wasReleasedThisFrame);
            }
            else if (mouse != null)
            {
                HandlePointer(mouse.position.ReadValue(), mouse.leftButton.wasPressedThisFrame,
                    mouse.leftButton.wasReleasedThisFrame);
            }
        }

        private void HandlePointer(Vector2 pos, bool pressed, bool released)
        {
            if (pressed)
            {
                _pointerDown = true;
                _pointerStart = pos;
                _pointerStartTime = Time.unscaledTime;
            }

            if (!_pointerDown)
                return;

            if (!released)
                return;

            _pointerDown = false;
            var elapsed = Time.unscaledTime - _pointerStartTime;
            if (elapsed > _maxSwipeTime)
                return;

            var delta = pos - _pointerStart;
            var threshold = Mathf.Min(Screen.width, Screen.height) * _swipeThresholdFraction;
            if (delta.magnitude < threshold)
                return;

            if (Mathf.Abs(delta.x) > Mathf.Abs(delta.y))
                RequestMove(delta.x > 0 ? MoveDirection.Right : MoveDirection.Left);
            else
                RequestMove(delta.y > 0 ? MoveDirection.Forward : MoveDirection.Backward);
        }

        private void TickMovement()
        {
            if (!_isMoving)
            {
                if (_bufferedDir != MoveDirection.None && Time.unscaledTime <= _bufferExpiry)
                {
                    var dir = _bufferedDir;
                    _bufferedDir = MoveDirection.None;
                    TryBeginMove(dir);
                }
                return;
            }

            var duration = _moveDuration / Mathf.Max(0.35f, _tractionMultiplier);
            _moveT += Time.deltaTime / duration;
            var t = Mathf.Clamp01(_moveT);
            // Cubic ease in-out
            var eased = t < 0.5f
                ? 4f * t * t * t
                : 1f - Mathf.Pow(-2f * t + 2f, 3f) / 2f;

            transform.position = Vector3.LerpUnclamped(_startWorld, _targetWorld, eased);

            if (t < 1f)
                return;

            transform.position = _targetWorld;
            _isMoving = false;

            if (_bufferedDir != MoveDirection.None && Time.unscaledTime <= _bufferExpiry)
            {
                var dir = _bufferedDir;
                _bufferedDir = MoveDirection.None;
                TryBeginMove(dir);
            }
        }

        private bool TryBeginMove(MoveDirection dir)
        {
            var next = _gridPos;
            switch (dir)
            {
                case MoveDirection.Forward: next.y += 1; break;
                case MoveDirection.Backward: next.y = Mathf.Max(0, next.y - 1); break;
                case MoveDirection.Left: next.x -= 1; break;
                case MoveDirection.Right: next.x += 1; break;
                default: return false;
            }

            next.x = Mathf.Clamp(next.x, _minLaneX, _maxLaneX);
            if (next == _gridPos)
                return false;

            _gridPos = next;
            _startWorld = transform.position;
            _targetWorld = GridToWorld(_gridPos);
            _moveT = 0f;
            _isMoving = true;

            if (dir == MoveDirection.Forward && GameManager.Instance != null)
                GameManager.Instance.RegisterForwardStep();

            return true;
        }

        private void OnGameStarted(GameStartedEvent _)
        {
            _gridPos = new Vector2Int(0, 0);
            SnapToGridImmediate();
            TractionMultiplier = 1f;
            _bufferedDir = MoveDirection.None;
            _isMoving = false;
        }

        private void OnRestart(GameRestartedEvent _)
        {
            OnGameStarted(default);
        }

        private void SnapToGridImmediate()
        {
            transform.position = GridToWorld(_gridPos);
            _targetWorld = transform.position;
            _isMoving = false;
        }

        private Vector3 GridToWorld(Vector2Int g) =>
            new Vector3(g.x * _cellSize, 0f, g.y * _cellSize);

        private Vector2Int WorldToGrid(Vector3 world) =>
            new Vector2Int(Mathf.RoundToInt(world.x / _cellSize), Mathf.RoundToInt(world.z / _cellSize));
    }
}
