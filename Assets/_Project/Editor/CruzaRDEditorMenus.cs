// Purpose: Editor menus — create DifficultyCurve SO, prototype scene, validate responsive checklist.

using System.IO;
using CruzaRD.Gameplay;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace CruzaRD.EditorTools
{
    public static class CruzaRDEditorMenus
    {
        private const string ScenePath = "Assets/_Project/Scenes/Prototype.unity";
        private const string CurvePath = "Assets/_Project/ScriptableObjects/DifficultyCurves/DefaultDifficulty.asset";

        [MenuItem("Cruza RD/Create Default Difficulty Curve")]
        public static void CreateDifficultyCurve()
        {
            Directory.CreateDirectory(Path.GetDirectoryName(CurvePath) ?? "Assets");
            var asset = ScriptableObject.CreateInstance<DifficultyCurve>();
            AssetDatabase.CreateAsset(asset, CurvePath);
            AssetDatabase.SaveAssets();
            EditorUtility.FocusProjectWindow();
            Selection.activeObject = asset;
            Debug.Log($"[CruzaRD] Created {CurvePath}");
        }

        [MenuItem("Cruza RD/Setup Prototype Scene")]
        public static void SetupPrototypeScene()
        {
            Directory.CreateDirectory("Assets/_Project/Scenes");
            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);

            var bootstrap = new GameObject("PrototypeBootstrap");
            bootstrap.AddComponent<CruzaRD.Core.PrototypeSceneBootstrap>();

            if (!File.Exists(CurvePath))
                CreateDifficultyCurve();

            var curve = AssetDatabase.LoadAssetAtPath<DifficultyCurve>(CurvePath);
            if (curve != null)
            {
                var so = new SerializedObject(bootstrap.GetComponent<CruzaRD.Core.PrototypeSceneBootstrap>());
                so.FindProperty("_difficulty").objectReferenceValue = curve;
                so.ApplyModifiedPropertiesWithoutUndo();
            }

            EditorSceneManager.SaveScene(scene, ScenePath);
            var scenes = new EditorBuildSettingsScene[]
            {
                new EditorBuildSettingsScene(ScenePath, true)
            };
            EditorBuildSettings.scenes = scenes;
            Debug.Log($"[CruzaRD] Prototype scene ready: {ScenePath}. Press Play.");
        }

        [MenuItem("Cruza RD/Validate Project Structure")]
        public static void ValidateStructure()
        {
            string[] required =
            {
                "Assets/_Project/Scripts/Core",
                "Assets/_Project/Scripts/Gameplay",
                "Assets/_Project/Scripts/UI",
                "Assets/_Project/Scripts/Services",
                "Assets/_Project/STATUS.md",
                "Assets/_Project/DESIGN_REFERENCE.md"
            };

            var ok = true;
            foreach (var path in required)
            {
                if (!Directory.Exists(path) && !File.Exists(path))
                {
                    Debug.LogError($"[CruzaRD] Missing: {path}");
                    ok = false;
                }
            }

            Debug.Log(ok
                ? "[CruzaRD] Structure validation PASSED"
                : "[CruzaRD] Structure validation FAILED");
        }
    }
}
