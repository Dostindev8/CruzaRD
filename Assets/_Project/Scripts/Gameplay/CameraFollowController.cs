// Purpose: Follow with look-ahead + dynamic FOV by aspect ratio (never fixed FOV).

using UnityEngine;

namespace CruzaRD.Gameplay
{
    public sealed class CameraFollowController : MonoBehaviour
    {
        [SerializeField] private Transform _target;
        [SerializeField] private Vector3 _offset = new Vector3(0f, 8f, -7f);
        [SerializeField] private float _followSmooth = 8f;
        [SerializeField] private float _lookAheadDistance = 2.5f;
        [SerializeField] private float _baseFovPortrait = 55f;
        [SerializeField] private float _baseFovLandscape = 60f;

        private Camera _cam;
        private Vector3 _velocity;

        private void Awake()
        {
            _cam = GetComponent<Camera>();
            if (_cam == null)
                _cam = gameObject.AddComponent<Camera>();
        }

        private void LateUpdate()
        {
            if (_target == null)
                return;

            ApplyDynamicFov();

            var lookAhead = Vector3.forward * _lookAheadDistance;
            var desired = _target.position + _offset + lookAhead;
            transform.position = Vector3.SmoothDamp(transform.position, desired, ref _velocity, 1f / _followSmooth);
            transform.LookAt(_target.position + Vector3.up * 0.5f + lookAhead * 0.35f);
        }

        public void SetTarget(Transform target) => _target = target;

        private void ApplyDynamicFov()
        {
            if (_cam == null)
                return;

            float aspect = (float)Screen.width / Mathf.Max(1, Screen.height);
            // Portrait phones ~0.45–0.56; tablets closer to 0.75; landscape > 1
            float t;
            if (aspect < 1f)
            {
                // taller screens get slightly wider FOV so lanes stay visible
                t = Mathf.InverseLerp(0.45f, 0.75f, aspect);
                _cam.fieldOfView = Mathf.Lerp(_baseFovPortrait + 6f, _baseFovPortrait, t);
            }
            else
            {
                t = Mathf.InverseLerp(1f, 1.8f, aspect);
                _cam.fieldOfView = Mathf.Lerp(_baseFovLandscape, _baseFovLandscape + 8f, t);
            }
        }
    }
}
