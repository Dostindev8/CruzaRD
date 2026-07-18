// Purpose: If the open scene is empty (Untitled), spawn the prototype automatically on Play.
// So the user never stares at a blank skybox wondering where the game is.

using UnityEngine;

namespace CruzaRD.Core
{
    public static class PlayModeAutoBoot
    {
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void BootIfNeeded()
        {
            if (!Application.isPlaying)
                return;

            if (Object.FindFirstObjectByType<PrototypeSceneBootstrap>() != null)
                return;

            if (Object.FindFirstObjectByType<GameManager>() != null)
                return;

            var go = new GameObject("PrototypeBootstrap_Auto");
            go.AddComponent<PrototypeSceneBootstrap>();
            Debug.Log("[CruzaRD] Escena vacía detectada → prototipo generado automáticamente. Pulsa JUGAR.");
        }
    }
}
