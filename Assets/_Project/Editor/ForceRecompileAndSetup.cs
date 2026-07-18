// Purpose: After scripts compile, ensure Prototype scene exists and is in Build Settings.

using System.IO;
using UnityEditor;
using UnityEditor.Callbacks;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace CruzaRD.EditorTools
{
    public static class ForceRecompileAndSetup
    {
        private const string ScenePath = "Assets/_Project/Scenes/Prototype.unity";
        private const string PrefKey = "CruzaRD_AutoSetupDone_v1";

        [DidReloadScripts]
        private static void OnScriptsReloaded()
        {
            if (EditorApplication.isPlayingOrWillChangePlaymode)
                return;

            // One-shot auto setup the first time compile succeeds
            if (SessionState.GetBool(PrefKey, false))
                return;

            EditorApplication.delayCall += () =>
            {
                if (EditorApplication.isCompiling || EditorApplication.isPlayingOrWillChangePlaymode)
                    return;

                try
                {
                    if (!File.Exists(ScenePath))
                    {
                        CruzaRDEditorMenus.SetupPrototypeScene();
                        Debug.Log("[CruzaRD] Prototype.unity creado automáticamente. Abre esa escena y pulsa ▶ Play.");
                    }
                    else
                    {
                        // Ensure it's open / in build settings
                        var scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
                        EditorBuildSettings.scenes = scenes;
                    }

                    SessionState.SetBool(PrefKey, true);
                }
                catch (System.Exception ex)
                {
                    Debug.LogWarning($"[CruzaRD] Auto-setup deferred: {ex.Message}");
                }
            };
        }

        [MenuItem("Cruza RD/▶ ABRIR Y JUGAR PROTOTIPO", priority = 0)]
        public static void OpenAndFocusPlay()
        {
            if (!File.Exists(ScenePath))
                CruzaRDEditorMenus.SetupPrototypeScene();

            EditorSceneManager.OpenScene(ScenePath);
            EditorApplication.isPlaying = true;
        }
    }
}
