// Purpose: Spawns grey-box prototype scene (player, camera, lanes, UI) in one click.

using CruzaRD.Characters;
using CruzaRD.Gameplay;
using CruzaRD.UI;
using UnityEngine;

namespace CruzaRD.Core
{
    public sealed class PrototypeSceneBootstrap : MonoBehaviour
    {
        [SerializeField] private DifficultyCurve _difficulty;
        [SerializeField] private bool _autoStartMenu = true;

        private void Awake()
        {
            if (FindFirstObjectByType<GameBootstrap>() == null)
            {
                var boot = new GameObject("GameBootstrap");
                boot.AddComponent<GameBootstrap>();
            }

            BuildWorld();
            BuildUi();
        }

        private void Start()
        {
            if (_autoStartMenu)
                GameManager.Instance?.GoToMenu();
        }

        private void BuildWorld()
        {
            // Light
            if (FindFirstObjectByType<Light>() == null)
            {
                var lightGo = new GameObject("Directional Light");
                var light = lightGo.AddComponent<Light>();
                light.type = LightType.Directional;
                light.color = new Color(1f, 0.95f, 0.85f);
                light.intensity = 1.1f;
                lightGo.transform.rotation = Quaternion.Euler(50f, -30f, 0f);
            }

            // Player capsule
            var player = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            player.name = "Player";
            player.tag = "Player";
            player.transform.position = new Vector3(0f, 1f, 0f);
            var rend = player.GetComponent<Renderer>();
            rend.sharedMaterial = new Material(Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard"))
            {
                color = new Color(0.95f, 0.95f, 0.98f)
            };

            var rbCol = player.GetComponent<Collider>();
            rbCol.isTrigger = true;

            player.AddComponent<GridMovementController>();
            player.AddComponent<PlayerCollisionHandler>();
            player.AddComponent<PlayerCharacterController>();

            // v3: capa de animación (gameplay nunca toca el Animator) + detector de near-miss
            player.AddComponent<AnimationService>();
            NearMissDetector.AttachTo(player);

            // Camera
            Camera cam;
            if (Camera.main != null)
            {
                cam = Camera.main;
            }
            else
            {
                var camGo = new GameObject("Main Camera");
                camGo.tag = "MainCamera";
                cam = camGo.AddComponent<Camera>();
                camGo.AddComponent<AudioListener>();
            }

            var follow = cam.GetComponent<CameraFollowController>() ?? cam.gameObject.AddComponent<CameraFollowController>();
            follow.SetTarget(player.transform);
            cam.transform.position = new Vector3(0f, 8f, -7f);

            // Spawner
            var spawnerGo = new GameObject("LaneSpawner");
            var spawner = spawnerGo.AddComponent<LaneSpawner>();
            // Assign via serialized fields using SerializedObject would need editor;
            // LaneSpawner creates placeholders if null — inject player via reflection-free public API:
            Inject(spawner, "_player", player.transform);
            if (_difficulty != null)
                Inject(spawner, "_difficulty", _difficulty);

            spawnerGo.AddComponent<WeatherModifier>();
        }

        private void BuildUi()
        {
            if (FindFirstObjectByType<RuntimeUIBuilder>() == null)
            {
                var ui = new GameObject("RuntimeUIBuilder");
                ui.AddComponent<RuntimeUIBuilder>();
            }
        }

        private static void Inject(Object target, string fieldName, object value)
        {
            var field = target.GetType().GetField(fieldName,
                System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic);
            field?.SetValue(target, value);
        }
    }
}
